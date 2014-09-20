/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles active contests related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Moved socket handler of RoomInfoResponse to resolver.js
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI Fix):
 * - Removed updating $rootScope.now and moved to tcTimeCtrl.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated the contest entering logic, moved handlers to resolvers.
 * - Updated to use scope broadcasting to handle registration responses.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated to use the global popup modal in baseCtrl.js.
 * - Updated the countdown message formats in Active Contest Widget.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Removed mystatus tab related logic
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Hide the register button if user already registered.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added logic for rooms tab.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Show the registered text if user already registered.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Suvery and Questions Support For Contest Registration):
 * - Updated the logic to support registration survey and questions.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena Bug Fix 20140909):
 * - Changed the text in registration error popup.
 *
 * @author amethystlei, dexy, flytoj2ee, TCASSEMBLER
 * @version 1.9
 */
'use strict';
/*global module, angular, require*/
/*jslint plusplus: true*/
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The controller for the active contests widget in the dashboard.
 *
 * @type {*[]}
 */
var activeContestsCtrl = ['$scope', '$rootScope', '$state', 'socket', 'appHelper', '$modal', function ($scope, $rootScope, $state, socket, appHelper, $modal) {
    var getPhase = function (contest, phaseTypeId) {
        var i;
        if (!contest.phases) {
            return null;
        }
        for (i = 0; i < contest.phases.length; i += 1) {
            if (contest.phases[i].phaseType === phaseTypeId) {
                return contest.phases[i];
            }
        }
        return null;
    },
        updateContest = function (contest) {
            contest.detailIndex = 1;
            contest.action = (contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase
                            && contest.coderRooms && contest.coderRooms.length > 0) ? 'Enter' : '';
        },
        // show the active tab name when active contest widget is narrow
        tabNames = ['Contest Summary', 'Contest Schedule', 'My Status', 'Rooms'],
        popupDetailModalCtrl;

    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.currentContest = 0;

    /*jslint unparam:true*/
    $scope.$on(helper.EVENT_NAME.CreateRoomListResponse, function (event, data) {
        updateContest($rootScope.roundData[data.roundID]);
    });
    $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
        var contest = $rootScope.roundData[data.phaseData.roundID];
        setTimeout(function () {
            if ($scope.isRegistrationOpen(contest)) {
                /*jslint unparam: true*/
                $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                    // remove the listener
                    $scope.$$listeners[helper.EVENT_NAME.PopUpGenericResponse] = [];
                    if (data.message.indexOf('You are already registered') === -1) {
                        contest.isRegisterable = true;
                    } else {
                        contest.isRegistered = true;
                    }
                });
                socket.emit(helper.EVENT_NAME.RegisterInfoRequest, {roundID: contest.roundID});
            }
        }, 5100);
        updateContest(contest);
    });

    // Test whether registration phase is open
    $scope.isRegistrationOpen = function (contest) {
        if (!contest) {
            return false;
        }
        var phase = getPhase(contest, helper.PHASE_TYPE_ID.RegistrationPhase);
        if (!phase) {
            return false;
        }
        return phase.startTime <= $rootScope.now && $rootScope.now <= phase.endTime;
    };

    /*jslint unparam:false*/
    angular.forEach($rootScope.roundData, function (contest) {
        if ($scope.isRegistrationOpen(contest)) {
            /*jslint unparam: true*/
            $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                // remove the listener
                $scope.$$listeners[helper.EVENT_NAME.PopUpGenericResponse] = [];
                if (data.message.indexOf('You are already registered') === -1) {
                    contest.isRegisterable = true;
                } else {
                    contest.isRegistered = true;
                }
            });
            socket.emit(helper.EVENT_NAME.RegisterInfoRequest, {roundID: contest.roundID});
        }
        updateContest(contest);
    });

    // handle update round list response
    socket.on(helper.EVENT_NAME.UpdateRoundListResponse, function (data) {
        if (data.action === 1) {
            $rootScope.roundData[data.roundData.roundID] = data.roundData;
            updateContest($rootScope.roundData[data.roundData.roundID]);
        } else if (data.action === 2) {
            delete $rootScope.roundData[data.roundData.roundID];
        }
    });

    // handle round enable response
    socket.on(helper.EVENT_NAME.EnableRoundResponse, function (data) {
        $rootScope.roundData[data.roundID].action = 'Enter';
    });

    $scope.getContests = function () {
        var result = [];
        angular.forEach($rootScope.roundData, function (contest) {
            result.push(contest);
        });
        return result;
    };

    $scope.isShown = function (contest) {
        if (contest.action !== 'Enter') {
            contest.action = ($scope.isRegistrationOpen(contest) && contest.isRegisterable === true) ? 'Register' : '';
        }
        return contest.action !== '';
    };

    /**
     * Returns the shown registered text condition.
     * @param contest - the contest
     * @returns {*|boolean} the result.
     */
    $scope.isShownRegistered = function (contest) {
        return ($scope.isRegistrationOpen(contest) && contest.isRegistered === true);
    };

    /**
     * Returns the flag whether to show the rooms tab.
     *
     * @param contest - the contest
     * @returns {boolean|$rootScope.roundData.coderRooms|*} the flag.
     */
    $scope.isShownRooms = function (contest) {
        return contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase
            && contest.coderRooms && contest.coderRooms.length > 0;
    };

    // sets the current contest for viewing
    $scope.setCurrentContest = function (newContest) {
        $scope.currentContest = newContest;
    };

    // gets the current action available
    $scope.getAction = function (contest) {
        return contest.action;
    };

    socket.on(helper.EVENT_NAME.EnableRoundResponse, function (data) {
        angular.forEach($scope.contests, function (contest) {
            if (data.roundID === contest.id) {
                contest.action = 'Enter';
            }
        });
    });

    // default to 50
    $scope.pageSize = 50;

    $scope.currentPage = 1;

    /**
     * Moves to the room.
     *
     * @param contest - the contest
     * @param roomId - the room id.
     */
    $scope.moveToRoom = function (contest, roomId) {
        $rootScope.competingRoomID = roomId;
        // requests will be sent by the resolvers
        $state.go(helper.STATE_NAME.Contest, {
            contestId: contest.roundID
        }, {reload: true});
    };
    /**
     * Returns the number of pages.
     *
     * @param contest - the contest instance
     * @returns {number} - the page number
     */
    $scope.numberOfPages = function (contest) {
        return Math.ceil($scope.getRoomsList(contest).length / $scope.pageSize);
    };

    /**
     * Moves to next page.
     */
    $scope.nextPage = function () {
        $scope.currentPage = $scope.currentPage + 1;
        $scope.$broadcast('rebuild:roomslist');
    };

    /**
     * Moves to previous page.
     */
    $scope.prevPage = function () {
        $scope.currentPage = $scope.currentPage - 1;
        $scope.$broadcast('rebuild:roomslist');
    };

    /**
     * Returns the rooms list.
     *
     * @param contest - the contest instance.
     * @returns {$rootScope.roundData.coderRooms|*} the room list
     */
    $scope.getRoomsList = function (contest) {
        if (contest) {
            return contest.coderRooms;
        }

        return [];

    };

    popupDetailModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', 'cancel', '$timeout', function ($scope, $modalInstance, data, ok, cancel, $timeout) {
        $scope.title = data.title;
        $scope.message = data.detail;
        $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
        $scope.enableClose = true;

        $timeout(function () {
            $scope.$broadcast('rebuild:inputValidation');
        }, 100);

        /**
         * Close the dialog.
         */
        $scope.ok = function () {
            ok();
            $modalInstance.close();
        };

        /**
         * Cancel handler.
         */
        $scope.cancel = function () {
            cancel();
            $modalInstance.dismiss('cancel');
        };
    }];
    /**
     * Open the registration detail modal.
     * @param data - the data value
     * @param handle - the handle function
     * @param finish - the finish function
     */
    $scope.openDetailModal = function (data, handle, finish) {
        if ($rootScope.currentDetailModal) {
            $rootScope.currentDetailModal.dismiss('cancel');
            $rootScope.currentDetailModal = undefined;
        }

        $rootScope.currentDetailModal = $modal.open({
            templateUrl: 'popupValidationDetail.html',
            controller: popupDetailModalCtrl,
            backdrop: 'static',
            resolve: {
                data: function () {
                    return data;
                },
                ok: function () {
                    return function () {
                        if (angular.isFunction(handle)) {
                            handle();
                        }
                        $rootScope.currentDetailModal = undefined;
                    };
                },
                cancel: function () {
                    return function () {
                        if (angular.isFunction(finish)) {
                            finish();
                        }
                        $rootScope.currentDetailModal = undefined;
                    };
                }
            }
        });
    };

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        var roundID = contest.roundID;
        $scope.okDisabled = true;
        // in the real app, we should perform real actions.
        if (contest.action === 'Enter') {
            $rootScope.competingRoomID = -1;
            // requests will be sent by the resolvers
            $state.go(helper.STATE_NAME.Contest, {
                contestId: contest.roundID
            }).then(function () {
                $scope.okDisabled = false;
            });
        } else {
            /*jslint unparam: true*/
            // define the listener for showing the popup
            $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                // remove the listener
                $scope.$$listeners[helper.EVENT_NAME.PopUpGenericResponse] = [];
                angular.extend(data, {enableClose: true});
                $rootScope.currentDetailModal = undefined;
                $scope.openModal(data, function () {
                    var surveyData = [], i, j, item = {}, flag, validationError = [], detail;
                    for (i = 0; i < $rootScope.eligibilityQuestions.length; i++) {
                        item = {questionID: $rootScope.eligibilityQuestions[i].questionID, eligible: "true", type: $rootScope.eligibilityQuestions[i].questionType,
                            answers: [], choices: []};
                        if ($rootScope.eligibilityQuestions[i].questionType === helper.QUESTION_TYPE.LONG_TEXT ||
                                $rootScope.eligibilityQuestions[i].questionType === helper.QUESTION_TYPE.SHORT_TEXT) {
                            if ($rootScope.eligibilityQuestions[i].answer !== '') {
                                item.answers.push($rootScope.eligibilityQuestions[i].answer);
                            } else {
                                validationError.push($rootScope.eligibilityQuestions[i].questionText);
                            }
                        }

                        if ($rootScope.eligibilityQuestions[i].questionType === helper.QUESTION_TYPE.SINGLE_CHOICE) {
                            if ($rootScope.eligibilityQuestions[i].answer !== '') {
                                item.choices.push({text: $rootScope.eligibilityQuestions[i].answer});
                                item.answers.push($rootScope.eligibilityQuestions[i].answer);
                            } else {
                                validationError.push($rootScope.eligibilityQuestions[i].questionText);
                            }

                        }
                        if ($rootScope.eligibilityQuestions[i].questionType === helper.QUESTION_TYPE.MULTI_CHOICE) {
                            flag = false;
                            for (j = 0; j < $rootScope.eligibilityQuestions[i].answers.length; j++) {
                                if ($rootScope.eligibilityQuestions[i].answers[j] === true) {
                                    item.choices.push({text: $rootScope.eligibilityQuestions[i].answerText[j]});
                                    item.answers.push($rootScope.eligibilityQuestions[i].answerText[j]);
                                    flag = true;
                                }
                            }

                            if (flag === false) {
                                validationError.push($rootScope.eligibilityQuestions[i].questionText);
                            }

                        }
                        surveyData.push(item);
                    }

                    for (i = 0; i < $rootScope.generalQuestions.length; i++) {
                        item = {questionID: $rootScope.generalQuestions[i].questionID, type: $rootScope.generalQuestions[i].questionType,
                            answers: [], choices: []};
                        if ($rootScope.generalQuestions[i].questionType === helper.QUESTION_TYPE.LONG_TEXT ||
                                $rootScope.generalQuestions[i].questionType === helper.QUESTION_TYPE.SHORT_TEXT) {
                            if ($rootScope.generalQuestions[i].answer !== '') {
                                item.answers.push($rootScope.generalQuestions[i].answer);
                            } else {
                                validationError.push($rootScope.generalQuestions[i].questionText);
                            }
                        }

                        if ($rootScope.generalQuestions[i].questionType === helper.QUESTION_TYPE.SINGLE_CHOICE) {
                            if ($rootScope.generalQuestions[i].answer !== '') {
                                item.choices.push({text: $rootScope.generalQuestions[i].answer});
                                item.answers.push($rootScope.generalQuestions[i].answer);
                            } else {
                                validationError.push($rootScope.generalQuestions[i].questionText);
                            }

                        }
                        if ($rootScope.generalQuestions[i].questionType === helper.QUESTION_TYPE.MULTI_CHOICE) {
                            flag = false;
                            for (j = 0; j < $rootScope.generalQuestions[i].answers.length; j++) {
                                if ($rootScope.generalQuestions[i].answers[j] === true) {
                                    item.choices.push({text: $rootScope.generalQuestions[i].answerText[j]});
                                    item.answers.push($rootScope.generalQuestions[i].answerText[j]);
                                    flag = true;
                                }
                            }

                            if (flag === false) {
                                validationError.push($rootScope.generalQuestions[i].questionText);
                            }

                        }
                        surveyData.push(item);
                    }

                    if (validationError.length > 0) {
                        detail = '<p class="textColor">You must answer the following question' + (validationError.length > 1 ? 's' : '') + ':</p>';
                        for (i = 0; i < validationError.length; i++) {
                            detail = detail + '<p> --- ' + validationError[i] + "</p>";
                        }
                        $rootScope.currentDetailModal = undefined;
                        $scope.openDetailModal({'title': 'Error', 'detail': detail});
                    } else {
                        /*jslint unparam: true*/
                        // Agreed to register, listen to registration results.
                        $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                            // Remove the listener.
                            $scope.$$listeners[helper.EVENT_NAME.PopUpGenericResponse] = [];
                            angular.extend(data, {enableClose: true, registrantCallBack: true});
                            $scope.openModal(data);
                            if (data.message.indexOf('You have successfully registered for the match.') !== -1) {
                                contest.isRegisterable = false;
                                contest.isRegistered = true;
                                if ($rootScope.currentModal !== undefined && $rootScope.currentModal !== null) {
                                    $rootScope.currentModal = undefined;
                                }
                                $scope.setDetailIndex(contest, 2);
                            }
                        });

                        /*jslint unparam: false*/
                        socket.emit(helper.EVENT_NAME.RegisterRequest, {"roundID": roundID, "surveyData": surveyData});
                    }
                }, function () {
                    contest.isRegisterable = true;
                    contest.isRegistered = false;
                    $rootScope.currentModal = undefined;
                    $rootScope.currentDetailModal = undefined;
                }, 'partials/user.contest.registration.html');
                $scope.okDisabled = false;
            });
            /*jslint unparam: false*/
            socket.emit(helper.EVENT_NAME.RegisterInfoRequest, {roundID: roundID});
        }
    };

    // sets the tab index to view contest details
    $scope.setDetailIndex = function (contest, index) {
        if (index < 0 ||
                ($scope.isRegistrationOpen(contest) && index >= 2) ||
                (!$scope.isRegistrationOpen(contest) && index >= 4)) {
            // invalid index for detail tabs
            return;
        }

        if (index === 3) {
            $scope.$broadcast('rebuild:roomslist');
        }

        contest.detailIndex = index;
    };

    /**
     * Check if the contest is counting down.
     *
     * @param  {Object}  contest the contest object
     * @return {boolean}         it is counting down or not
     */
    $scope.isCountingDown = function (contest) {
        if (!contest || !contest.phaseData) {
            return false;
        }
        return contest.phaseData.phaseType < helper.PHASE_TYPE_ID.CodingPhase;
    };

    /**
     * Get the prefix of the countdown message based on different phases.
     *
     * @param  {Object} contest the contest object
     * @return {string}         the prefix the countdown message
     */
    $scope.countdownPrefix = function (contest) {
        if (!contest || !contest.phaseData) {
            return '';
        }
        if (contest.phaseData.phaseType < helper.PHASE_TYPE_ID.CodingPhase) {
            return 'will start in';
        }
        if (contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.ContestCompletePhase) {
            return 'is completed.';
        }
        return 'is live!';
    };

    /**
     * Render the contest countdown message.
     *
     * @param  {Object} contest the contest object
     * @return {string}         the countdown message
     */
    $scope.displayCountDown = function (contest) {
        if (!contest) {
            return '';
        }
        var phase, left, hours, minutes, seconds, result = '', LAST_MINUTES = 5,
            displayHour = function (hours) {
                if (hours === 0) {
                    return '';
                }
                // single: 1 hour, plural: 0 hours, 2 hours...
                return hours + ' ' + (hours === 1 ? 'hour' : 'hours');
            },
            displayMinute = function (minutes) {
                return minutes + ' ' + (minutes === 1 ? 'minute' : 'minutes');
            },
            displaySecond = function (seconds) {
                return seconds + ' ' + (seconds === 1 ? 'second' : 'seconds');
            };
        if (!contest.phaseData) {
            return '';
        }
        phase = getPhase(contest, helper.PHASE_TYPE_ID.CodingPhase);
        if (!phase) {
            return '';
        }
        left = contest.phases[1].startTime - $rootScope.now;
        hours = Math.floor(left / 3600000);
        minutes = Math.floor(left % 3600000 / 60000);
        seconds = Math.floor(left % 60000 / 1000);
        if (hours > 0) {
            result += displayHour(hours) + ' ';
        }
        if (hours > 0 || minutes > 0) {
            result += displayMinute(minutes);
        }
        if (hours === 0) {
            if (minutes < LAST_MINUTES && minutes > 0) {
                result += ' and ';
            }
            if (minutes < LAST_MINUTES) {
                result += displaySecond(seconds);
            }
        }
        return result;
    };

    // show the active tab name when active contest widget is narrow
    $scope.getTabName = function (index) {
        return index >= 0 && index < tabNames.length ? tabNames[index] : 'Click to show tabs';
    };
}];

module.exports = activeContestsCtrl;
