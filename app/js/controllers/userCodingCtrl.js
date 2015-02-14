/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
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
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Updated goBack to support going back to the match summary page.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena - Code With Practice Problem)
 *  - Added logic for practice code state to support practice problem.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the coding editor and the test report.
 *
 * Changes in version 1.11 (Sort is not retained in room summary):
 * - Set isKeepSort to true
 *
 * Changes in version 1.12 (Web Arena Deep Link Assembly v1.0):
 * - Fixed issue while loading practice problem
 *
 * Changes in version 1.13 (Web Arena Plugin API Part 1):
 * - Added plugin logic for coding panel.
 *
 * Changes in version 1.14 (Web Arena Plugin API Part 2):
 * - Added plugin logic for ready.
 *
 * Changes in version 1.15 (Web Arena SRM Problem Deep Link Assembly):
 * - Added logic to handle invalid roundId, problemId and divisionId,
 * which are side-effects of deep linking
 *
 * Changes in version 1.16 (Module Assembly - Web Arena - Add Save Feature to Code Editor):
 * - Cancel the timer for auto save logic while leaving the page.
 *
 * Changes in version 1.17 (Web Arena - Run System Testing Support For Practice Problems):
 * - Added logic to support running practice system test.
 *
 * Changes in version 1.18 (Web Arena - Scrolling Issues Fixes):
 * - Refactored UI resizing logic to use flexbox layout
 *
 * Changes in version 1.19 (Web Arena - Fix Empty Problem Statement Arena Issue)
 * - Added timeout of 10ms to problem-loaded event, so that perfect-scrollbar works perfect
 *
 * Changes in version 1.20 (Web Arena - Show Code Image Instead of Text in Challenge Phase):
 * - Added function to show the generated code image in the challenge phase if the logged user is not writer
 *
 * Changes in version 1.21 (Web Arena - Replace Code Mirror With Ace Editor):
 * - Removed codemirror related logic.
 * - Removed editor-loaded event handler.
 *
 * @author dexy, amethystlei, savon_cn, MonicaMuranyi
 * @version 1.21
 */
/*jshint -W097*/
/*jshint strict:false*/
'use strict';
/*global module, angular, document, $, require, console, startTimer*/
/*jslint browser:true */

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');
var config = require('../config');

/**
 * The main controller.
 *
 * @type {*[]}
 */
var userCodingCtrl = ['$scope', '$stateParams', '$rootScope', 'socket', '$window', '$timeout', '$state', 'tcTimeService', 'keyboardManager', 'appHelper', '$http',
    function ($scope, $stateParams, $rootScope, socket, $window, $timeout, $state, tcTimeService, keyboardManager, appHelper, $http) {
        $rootScope.$broadcast('hideFeedback');
        // shared between children scopes
        $scope.sharedObj = {};
        $scope.noCountdown = true;
        $scope.problemAreaHeightRatio = 0.5;
        // problem data
        $scope.problem = {};
        $scope.countdown = 1;

        $scope.roundID = Number($stateParams.roundId);
        $scope.problemID = Number($stateParams.problemId);
        $scope.divisionID = Number($stateParams.divisionId);
        $scope.problemLoaded = false;
        $scope.hasExampleTest = false;

        $scope.editorialLink = '';
        if ($scope.currentStateName() === 'user.practiceCode') {
            $http.get(config.apiDomain + '/data/srm/problems/' + $scope.problemID + '/rounds').success(function (data) {
                if (data && data.rounds) {
                    angular.forEach(data.rounds, function (round) {
                        if (round && round.editorialLink && round.editorialLink.trim() !== ''
                                && $scope.editorialLink.trim() === '') {
                            $scope.editorialLink = round.editorialLink.trim();
                        }
                    });
                }
            }).error(function () {
                $scope.editorialLink = '';
            });
        }

        $rootScope.previousStateName = $scope.currentStateName();

        var componentOpened = false, problemRetrieved = false, notified = false, round, isValidComponent = false;

        $scope.getFlexProperties = function (flexRatio) {
            var flex = String(flexRatio) + ' ' + String(flexRatio) + ' ' + 100 * flexRatio + '%';

            return {
                '-webkit-box-flex': String(flexRatio),
                '-moz-box-flex': String(flexRatio),
                '-webkit-flex': flex,
                '-ms-flex': flex,
                'flex': flex
            };
        };

        // Rebuild the error bar when problem area height ratio changes
        $scope.$watch('problemAreaHeightRatio', function () {
            $timeout(function () {
                $rootScope.$broadcast('problem-loaded');
                // comment out error part for now
                /*if ($scope.sharedObj.rebuildErrorBar) {
                    $scope.sharedObj.rebuildErrorBar();
                }*/
            });
        });


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
                    $timeout(function () {
                        $rootScope.$broadcast('problem-loaded');
                    }, helper.COMMON_TIMEGAP);
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
            appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemOpened, data);
            var component = data.problem.problemComponents[0];
            if (component.componentId !== $scope.componentID) {
                return;
            }
            $timeout(function () { return; }, 0);
            // make visit fields easily
            $scope.problem.component = component;
            $scope.problem.className = component.className;
            $scope.problem.methodName = component.methodNames ? component.methodNames[0] : component.allMethodNames[0];
            $scope.problem.paramNames = component.allParamNames[0];
            $scope.problem.allArgTypes = component.allParamTypes[0];
            $scope.problem.allReturnType = component.returnTypes ? component.returnTypes[0] : component.allReturnTypes[0];

            // get languages from round data
            // it may be undefined, but assign it anyway
            if ($rootScope.roundData[$scope.roundID]) {
                $scope.problem.supportedLanguages = $rootScope.roundData[$scope.roundID].customProperties.allowedLanguages;
            } else {
                $scope.problem.supportedLanguages = $rootScope.practiceRoundData[$scope.roundID].customProperties.allowedLanguages;
            }

            // set user data
            $scope.tests = component.testCases;

            $rootScope.defaultTestCasesForPlugin = $scope.tests;

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
            // add code image if it is available
            // only show the code image if it is available and current user is not the author
            if (data.codeImage && $rootScope.username() !== data.writerHandle) {
                $scope.codeImage = data.codeImage;
            }
            if (data.lastCompiledTime) {
                $scope.compiledTime = new Date(data.lastCompiledTime);
            }
            if (data.lastSavedTime) {
                $scope.savedTime = new Date(data.lastSavedTime);
            }
            if (data.lastSubmitTime) {
                $scope.submittedTime = new Date(data.lastSubmitTime);
            }

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
            appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.ready, data);
        });

        /**
         * Go back to the contest page when the user is using the coding editor.
         * Go back to the contest summary page when user is viewing others' code.
         */
        $scope.goBack = function () {
            $rootScope.isKeepSort = true;
            if ($stateParams.page && $stateParams.page === 'contest') {
                $scope.$state.go(helper.STATE_NAME.Contest, {
                    contestId : $scope.roundID,
                    viewOn : $rootScope.currentViewOn
                });
            } else {
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
            if ($rootScope.previousStateName === helper.STATE_NAME.Coding) {
                if ($scope.username()) {
                    appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                        problemID: $scope.componentID,
                        writer: $scope.username()
                    });
                    socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                        problemID: $scope.componentID,
                        writer: $scope.username()
                    });
                }
            } else if ($rootScope.previousStateName === helper.STATE_NAME.ViewCode) {
                appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                    problemID: $scope.componentID,
                    writer: $scope.defendant
                });
                socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                    problemID: $scope.componentID,
                    writer: $scope.defendant
                });
            } else if ($rootScope.previousStateName === helper.STATE_NAME.PracticeCode) {
                appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                    problemID: $scope.componentID
                });
                socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                    problemID: $scope.componentID
                });
            }


            // if leaving page, it should cancel the auto saving logic
            if ($rootScope.autoSavingCodePromise) {
                $timeout.cancel($rootScope.autoSavingCodePromise);
            }
        }

        $window.onbeforeunload = onLeavingCodingPage;
        $scope.$on("$destroy", onLeavingCodingPage);

        // load problem depended on states
        if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
            if ($scope.problemID) {
                if ($rootScope.roundData[$scope.roundID]) {
                    round = $rootScope.roundData[$scope.roundID];
                } else {
                    round = $rootScope.practiceRoundData[$scope.roundID];
                }
                if (round) {
                    if (round.problems) {
                        if (angular.isDefined(round.problems[$scope.divisionID])) {
                            angular.forEach(round.problems[$scope.divisionID], function (problem) {
                                if (problem.problemID === $scope.problemID) {
                                    isValidComponent = true;
                                    $scope.problem = problem;
                                    $scope.componentID = problem.components[0].componentID;
                                    appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                                        problemID: $scope.componentID
                                    });
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
            if (!isValidComponent) {
                $state.go(helper.STATE_NAME.Dashboard);
            }
        } else if ($scope.currentStateName() === helper.STATE_NAME.ViewCode) {
            // close the previous problem if any
            if (angular.isDefined($scope.defendant) && angular.isDefined($scope.componentID)) {
                appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                    problemID: $scope.componentID,
                    writer: $scope.defendant
                });
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
        } else if ($scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
            $scope.$on(helper.EVENT_NAME.RoomInfoResponse, function () {
                $scope.componentID = Number($stateParams.componentId);
                appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.problemClosed, {
                    problemID: $scope.componentID
                });
                socket.emit(helper.EVENT_NAME.CloseProblemRequest, {
                    problemID: $scope.componentID
                });
                $timeout(function () {
                    socket.emit(helper.EVENT_NAME.OpenComponentForCodingRequest, {
                        componentID: $scope.componentID,
                        handle: $scope.username()
                    });
                }, 100);
            });
            $scope.practiceRoomId = $stateParams.roomId;
            socket.emit(helper.EVENT_NAME.MoveRequest, { moveType: helper.ROOM_TYPE_ID.PracticeRoom, roomID: $stateParams.roomId });
            socket.emit(helper.EVENT_NAME.EnterRequest, { roomID: -1 });
        }

        // default window status
        $scope.windowStatus = {
            chatArea: 'min',
            leaderboard: 'min'
        };
        // bind keyboard shortcut shift + tab
        keyboardManager.bind(config.keyboardShortcut, function () {
            // actions here
            $('#leaderboardFilter').qtip('api').toggle(false);
            if ($scope.windowStatus.chatArea === 'min' && $scope.windowStatus.leaderboard === 'min') {
                $scope.windowStatus.chatArea = 'normal';
            } else if ($scope.windowStatus.chatArea === 'normal') {
                $scope.windowStatus.chatArea = 'min';
                $scope.windowStatus.leaderboard = 'normal';
            } else if ($scope.windowStatus.leaderboard === 'normal') {
                $scope.windowStatus.leaderboard = 'min';
            }
            $scope.$broadcast('rebuild:chatboard');
        });
        // open the panel
        $scope.openPanel = function (panel) {
            if ($scope.windowStatus[panel] !== 'min') {
                return;
            }
            switch (panel) {
            case 'chatArea':
                $scope.windowStatus.chatArea = 'normal';
                $scope.windowStatus.leaderboard = 'min';
                break;
            case 'leaderboard':
                $scope.windowStatus.chatArea = 'min';
                $scope.windowStatus.leaderboard = 'normal';
                break;
            default:
                return;
            }
            $scope.$broadcast('rebuild:chatboard');
        };
        // close the panel
        $scope.closePanel = function (panel) {
            $timeout(function () {
                $scope.windowStatus[panel] = 'min';
                angular.element('body').removeClass('popupOpen');
                angular.element('.docker-max').removeClass('docker-max');
                angular.element('#chatWidget').removeClass('hide');
                angular.element('#leaderboardWidget').removeClass('hide');
                if (panel === 'chatArea') {
                    // avoid the input overflow
                    angular.element('.chatInput').width(292);
                    angular.element('.chatInputText').width(282);
                } else {
                    $.fn.qtip.zindex = 900;
                }
                $scope.$broadcast('rebuild:chatboard');
            }, 100);
        };
        // back to normal
        $scope.collapsePanel = function (panel) {
            $timeout(function () {
                $scope.windowStatus[panel] = 'normal';
                angular.element('body').removeClass('popupOpen');
                angular.element('.docker-max').removeClass('docker-max');
                angular.element('#chatWidget').removeClass('hide');
                angular.element('#leaderboardWidget').removeClass('hide');
                if (panel === 'chatArea') {
                    // avoid the input overflow
                    angular.element('.chatInput').width(292);
                    angular.element('.chatInputText').width(282);
                } else {
                    $.fn.qtip.zindex = 900;
                }
                $scope.$broadcast('rebuild:chatboard');
            }, 100);
        };
        // set the panel to max
        $scope.expandPanel = function (panel) {
            $timeout(function () {
                $scope.windowStatus[panel] = 'max';
                angular.element('body').addClass('popupOpen');
                angular.element('.docker').addClass('docker-max');
                if (panel === 'chatArea') {
                    angular.element('#leaderboardWidget').addClass('hide');
                    angular.element('#chatWidget').removeClass('hide');
                    if ($window.innerWidth > 758) {
                        if ($scope.methodIdx < 3) {
                            // avoid the input to be too short
                            angular.element('.chatInput').width(464);
                            angular.element('.chatInputText').width(464);
                        } else {
                            // avoid the input to be too short
                            angular.element('.chatInput').width(352);
                            angular.element('.chatInputText').width(352);
                        }
                    } else {
                        angular.element('.chatInput').width(292);
                        angular.element('.chatInputText').width(292);
                    }
                } else {
                    angular.element('#leaderboardWidget').removeClass('hide');
                    angular.element('#chatWidget').addClass('hide');
                    $('#leaderboardFilter').qtip('api').set('show.modal', true);
                    $.fn.qtip.zindex = 900;
                }
                $scope.$broadcast('rebuild:chatboard');
            }, 100);
        };
    }];

module.exports = userCodingCtrl;
