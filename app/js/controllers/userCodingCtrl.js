/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles user coding page logic.
 * Currently it can be used for coding and viewing others' code.
 * It is distinguished by states 'user.coding' and 'user.viewCode'.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 1):
 * - Updated to use real data.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI Fix):
 * - Added tcTimeService and updated its usage.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Challenge Phase):
 * - Updated to integrate code viewing logics.
 * - Fixed the angular-timer usage to avoid error messages in console.
 * - Removed unnecessary $state injection as it is exposed by $rootScope. 
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Added the handler for PhaseDataResponse to implement coding time update (add time).
 * - Fixed the issue that changing the testcases in Test Panel will also change
 *   the content in the problem area.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Initialize noCountdown to true, so that user won't see 00:00:01 when page loads
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix 5):
 * - Update goBack() logic.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena Bug Fix 20140909):
 * - Updated the test panel height in expand mode.
 *
 * @author dexy, amethystlei, TCASSEMBLER
 * @version 1.7
 */
'use strict';
/*global module, angular, document, $*/
/*jslint browser:true */

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The main controller.
 *
 * @type {*[]}
 */
var userCodingCtrl = ['$scope', '$stateParams', '$rootScope', 'socket', '$window', '$timeout', 'tcTimeService',
    function ($scope, $stateParams, $rootScope, socket, $window, $timeout, tcTimeService) {
        // shared between children scopes
        $scope.sharedObj = {};
        $scope.topStatus = 'normal';
        $scope.bottomStatus = 'normal';
        $scope.noCountdown = true;

        // problem data
        $scope.problem = {};

        $scope.roundID = Number($stateParams.roundId);
        $scope.problemID = Number($stateParams.problemId);
        $scope.divisionID = Number($stateParams.divisionId);
        $scope.problemLoaded = false;
        $scope.hasExampleTest = false;

        var componentOpened = false, problemRetrieved = false, notified = false, round;

        /**
         * Check whether it is in Challenge Phase.
         *
         * @returns {boolean} is this phase or not.
         */
        $scope.isChallengePhase = function () {
            var roundData = $scope.roundData[$scope.roundID];
            if (!angular.isDefined(roundData) || !angular.isDefined(roundData.phaseData)) {
                return false;
            }
            return roundData.phaseData.phaseType === helper.PHASE_TYPE_ID.ChallengePhase;
        };

        $scope.getTopStatus = function () {
            return $scope.topStatus;
        };

        $scope.getBottomStatus = function () {
            return $scope.bottomStatus;
        };

        $scope.collapseOther = function (target) {
            // origin height of top-content: 169(with 1px padding)
            // origin height of bottom-content: 516
            // origin height of codemirror: 475
            var windowWidth = $window.innerWidth;
            if ((target === 'top-content' && $scope.topStatus === 'expand') ||
                    (target === 'bottom-content' && $scope.bottomStatus === 'expand')) {
                //return to normal status
                $('#top-content').css({
                    height: 169 + 'px'
                });
                if (windowWidth <= 502) {
                    $('#bottom-content').css({
                        height: (516 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#bottom-content').css({
                        height: (516 + 30) + 'px'
                    });
                } else {
                    $('#bottom-content').css({
                        height: 516 + 'px'
                    });
                }
                $('#codeArea').css({
                    height: 475 + 'px'
                });
                $('#testPanelDiv').css({
                    height: 480 + 'px'
                });
                $scope.$broadcast('test-panel-loaded');
                $scope.topStatus = 'normal';
                $scope.bottomStatus = 'normal';
                $scope.cmElem.CodeMirror.refresh();
                $scope.sharedObj.rebuildErrorBar();
            } else if (target === 'top-content') {
                // expand top-content and collapse bottom-content with codemirror
                if (windowWidth <= 502) {
                    $('#top-content').css({
                        height: (685 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#top-content').css({
                        height: (685 + 30) + 'px'
                    });
                } else {
                    $('#top-content').css({
                        height: 685 + 'px'
                    });
                }
                $('#bottom-content').css({
                    height: '0' + 'px'
                });
                $('#codeArea').css({
                    height: '0' + 'px'
                });
                $scope.topStatus = 'expand';
                $scope.bottomStatus = 'normal';
            } else if (target === 'bottom-content') {
                // expand bottom-content and collapse top one
                $('#top-content').css({
                    height: 1 + 'px'
                });
                if (windowWidth <= 502) {
                    $('#bottom-content').css({
                        height: (684 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#bottom-content').css({
                        height: (684 + 30) + 'px'
                    });
                } else {
                    $('#bottom-content').css({
                        height: 684 + 'px'
                    });
                }
                $('#codeArea').css({
                    height: 643 + 'px'
                });
                $('#testPanelDiv').css({
                    height: 653 + 'px'
                });
                $scope.$broadcast('test-panel-loaded');
                $scope.bottomStatus = 'expand';
                $scope.topStatus = 'normal';
                $scope.cmElem.CodeMirror.refresh();
                $scope.sharedObj.rebuildErrorBar();
            }
            $scope.$broadcast('problem-loaded');
        };
        $scope.countdown = 1;

        /**
         * Set and start the timer.
         */
        function startTimer() {
            // start coding/challenge phase count down
            var seconds = -1, phase;
            $scope.noCountdown = false;
            if ($scope.roundData && $scope.roundData[$scope.roundID] && $scope.roundData[$scope.roundID].phaseData) {
                phase = $scope.roundData[$scope.roundID].phaseData;
                if (phase.phaseType === helper.PHASE_TYPE_ID.CodingPhase ||
                        phase.phaseType === helper.PHASE_TYPE_ID.ChallengePhase) {
                    // how many seconds between now and the phase end time
                    seconds = (phase.endTime - tcTimeService.getTime()) / 1000;
                }
            }
            if (seconds > 0) {
                // set and start the timer, see angular-timer code for implementation details.
                $timeout(function () {
                    $scope.$broadcast('timer-set-countdown', seconds - 0.2);
                    $scope.$broadcast('timer-start');
                }, 200);
            } else {
                $scope.noCountdown = true;
            }
        }

        /*jslint unparam: true*/
        // handle phase data response
        $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
            if (String(data.phaseData.roundID) === String($scope.roundID)) {
                startTimer();
            }
        });
        /*jslint unparam: false*/

        /**
         * Send notification when problem data is ready.
         */
        function notifyWhenProblemDataReady() {
            if (!notified) {
                if (componentOpened && problemRetrieved) {
                    notified = true;

                    // copy test to user data
                    $scope.userData.tests = $scope.tests;
                    $scope.examples = [];
                    angular.forEach($scope.userData.tests, function (test) {
                        var copiedTest = {};
                        test.params = [];

                        angular.forEach(test.input, function (input) {
                            test.params.push({
                                value: input
                            });
                        });
                        if (test.example === true) {
                            angular.copy(test, copiedTest);
                            $scope.hasExampleTest = true;
                            $scope.examples.push(copiedTest);
                        }
                    });
                    $scope.problemLoaded = true;
                    // broadcast problem-load message to child states.
                    $scope.$broadcast('problem-loaded');
                    startTimer();
                }
            }
        }

        /**
         * Get argument type string.
         *
         * @param langID the language id
         * @returns {string} the argument type string
         */
        $scope.getArgType = function (langID) {
            var ret = '';

            angular.forEach($scope.problem.allArgTypes, function (type) {
                ret += ', ' + type.typeMapping[langID];
            });
            if (ret.length > 0) {
                ret = ret.substring(2);
            }
            return ret;
        };

        /**
         * Get method signature.
         *
         * @param langID the language id
         * @returns {string} the signature
         */
        $scope.getMethodSignature = function (langID) {
            var ret = '', i;
            if (langID === 1 || langID === 3 || langID === 4) {
                // c style method signature for java, c++, csharp
                ret += $scope.problem.allReturnType.typeMapping[langID];
                ret += ' ';
                ret += $scope.problem.methodName;
                ret += '(';

                for (i = 0; i < $scope.problem.paramNames.length; i += 1) {
                    if (i > 0) {
                        ret += ', ';
                    }
                    ret += $scope.problem.allArgTypes[i].typeMapping[langID];
                    ret += ' ';
                    ret += $scope.problem.paramNames[i];
                }

                ret += ')';
            } else if (langID === 5) {
                // vb style
                ret += 'Public Function ';
                ret += $scope.problem.methodName;
                ret += '(';

                for (i = 0; i < $scope.problem.paramNames.length; i += 1) {
                    if (i > 0) {
                        ret += ', ';
                    }
                    ret += $scope.problem.paramNames[i];
                    ret += ' As ';
                    ret += $scope.problem.allArgTypes[i].typeMapping[langID];
                }

                ret += ')';
                ret += ' As ';
                ret += $scope.problem.allReturnType.typeMapping[langID];
            } else if (langID === 6) {
                // python style
                ret += 'def ';
                ret += $scope.problem.methodName;
                ret += '(self';

                for (i = 0; i < $scope.problem.paramNames.length; i += 1) {
                    ret += ', ';
                    ret += $scope.problem.paramNames[i];
                }

                ret += '):';
            }

            return ret;
        };

        function getHtmlContent(source) {
            if (!source || !source.children) {
                return '';
            }
            var ret = '';
            angular.forEach(source.children, function (child) {
                if (child.editableText) {
                    ret += child.editableText;
                } else {
                    var tmp = $('<' + child.name + '>');
                    angular.forEach(child.attributes, function (v, attr) {
                        tmp.attr(attr, v);
                    });
                    tmp.append(getHtmlContent(child));
                    ret += $('<div>').append(tmp).html();
                }
            });
            return ret;
        }

        // get problem response
        socket.on(helper.EVENT_NAME.GetProblemResponse, function (data) {
            var component = data.problem.problemComponents[0];
            if (component.componentId !== $scope.componentID) {
                return;
            }

            // make visit fields easily
            $scope.problem.component = component;
            $scope.problem.className = component.className;
            $scope.problem.methodName = component.allMethodNames[0];
            $scope.problem.paramNames = component.paramNames;
            $scope.problem.allArgTypes = component.allParamTypes[0];
            $scope.problem.allReturnType = component.allReturnTypes[0];

            // get languages from round data
            // it may be undefined, but assign it anyway
            $scope.problem.supportedLanguages = $scope.roundData[$scope.roundID].customProperties.allowedLanguages;

            // set user data
            $scope.tests = component.testCases;

            // generate html content once
            $scope.problem.intro = getHtmlContent(component.intro);
            $scope.problem.spec = getHtmlContent(component.spec);
            if (component.notes && component.notes.length > 0) {
                $scope.problem.notes = [];
                component.notes.forEach(function (note) {
                    $scope.problem.notes.push(getHtmlContent(note));
                });
            }
            if (component.constraints && component.constraints.length > 0) {
                $scope.problem.constraints = [];
                component.constraints.forEach(function (constraint) {
                    if (constraint && constraint.userConstraint) {
                        $scope.problem.constraints.push(getHtmlContent(constraint.userConstraint));
                    }
                });
            }
            $scope.tests.forEach(function (test) {
                test.annotationHtml = getHtmlContent(test.annotation);
            });
            $scope.problem.argTypeText = '';
            $scope.problem.methodSignature = '';

            problemRetrieved = true;
            notifyWhenProblemDataReady();
        });

        // handle open component response
        socket.on(helper.EVENT_NAME.OpenComponentResponse, function (data) {
            // make sure the response is for the request problem
            if (data.componentID !== $scope.componentID) {
                return;
            }

            $scope.userData = {};
            $scope.userData.code = data.code.replace(/(\r\n|\n|\r)/gm, "\n");
            $scope.languageID = data.languageID;

            // if there is no language id, read it from user preferences
            // the key of LANGUAGE is 0, from ContestConstants.java
            // public final static int LANGUAGE = 0;
            if (!$scope.languageID) {
                var pres = $scope.userPreferences();
                if (pres[0]) {
                    $scope.languageID = Number(pres[0]);
                } else {
                    // default to java
                    $scope.languageID = 1;
                }
            }

            componentOpened = true;
            notifyWhenProblemDataReady();
        });

        /**
         * Go back to the contest page when the user is using the coding editor.
         * Go back to the contest summary page when user is viewing others' code.
         */
        $scope.goBack = function () {
            if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                $scope.$state.go(helper.STATE_NAME.Contest, {
                    contestId: $scope.roundID
                });
            } else {
                $scope.$state.go(helper.STATE_NAME.ContestSummary, {
                    contestId : $scope.roundID,
                    divisionId : $scope.divisionID,
                    viewOn : $rootScope.currentViewOn
                });
            }
        };

        /**
         * Send close problem request when leaving.
         */
        function onLeavingCodingPage() {
            if ($rootScope.currentModal) {
                $rootScope.currentModal.dismiss('cancel');
                $rootScope.currentModal = undefined;
            }
            if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                if ($scope.username()) {
                    socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                        problemID: $scope.componentID,
                        writer: $scope.username()
                    });
                }
            } else {
                socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                    problemID: $scope.componentID,
                    writer: $scope.defendant
                });
            }
        }

        $window.onbeforeunload = onLeavingCodingPage;
        $scope.$on("$destroy", onLeavingCodingPage);

        $scope.$on('editor-loaded', function () {
            $scope.cmElem = document.getElementsByClassName('CodeMirror')[0];
        });

        // load problem depended on states
        if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
            if ($scope.problemID) {
                round = $rootScope.roundData[$scope.roundID];
                if (round) {
                    if (round.problems) {
                        if (angular.isDefined(round.problems[$scope.divisionID])) {
                            angular.forEach(round.problems[$scope.divisionID], function (problem) {
                                if (problem.problemID === $scope.problemID) {
                                    $scope.problem = problem;
                                    $scope.componentID = problem.components[0].componentID;

                                    socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                                        problemID: $scope.componentID
                                    });

                                    $timeout(function () {
                                        socket.emit(helper.EVENT_NAME.OpenComponentForCodingRequest, {
                                            componentID: $scope.componentID,
                                            handle: $scope.username()
                                        });
                                    }, 100);
                                }
                            });
                        }
                    }
                }
            }
        } else if ($scope.currentStateName() === helper.STATE_NAME.ViewCode) {
            // close the previous problem if any
            if (angular.isDefined($scope.defendant) && angular.isDefined($scope.componentID)) {
                socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                    problemID: $scope.componentID,
                    writer: $scope.defendant
                });
            }
            $scope.componentID = Number($stateParams.componentId);
            $scope.defendant = $stateParams.defendant;
            $scope.defendantRoomID = $stateParams.roomId;

            $timeout(function () {
                socket.emit(helper.EVENT_NAME.GetChallengeProblemRequest, {
                    defendant: $scope.defendant,
                    componentID: $scope.componentID,
                    pretty: false,
                    roomID: $stateParams.roomId
                });
            }, 100);
        }
    }];

module.exports = userCodingCtrl;
