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
 * @author amethystlei, dexy
 * @version 1.4
 */
'use strict';
/*global module, angular*/

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
var activeContestsCtrl = ['$scope', '$rootScope', '$state', '$http', 'socket', 'appHelper', function ($scope, $rootScope, $state, $http, socket, appHelper) {
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
        tabNames = ['Contest Summary', 'Contest Schedule', 'My Status'];

    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.currentContest = 0;

    /*jslint unparam:true*/
    $scope.$on(helper.EVENT_NAME.CreateRoomListResponse, function (event, data) {
        updateContest($rootScope.roundData[data.roundID]);
    });
    $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
        updateContest($rootScope.roundData[data.phaseData.roundID]);
    });
    /*jslint unparam:false*/
    angular.forEach($rootScope.roundData, function (contest) {
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

    $scope.isShown = function (contest) {
        if (contest.action !== 'Enter') {
            contest.action = $scope.isRegistrationOpen(contest) ? 'Register' : '';
        }
        return contest.action !== '';
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
                $scope.openModal(data, function () {
                    /*jslint unparam: true*/
                    // Agreed to register, listen to registration results.
                    $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                        // Remove the listener.
                        $scope.$$listeners[helper.EVENT_NAME.PopUpGenericResponse] = [];
                        angular.extend(data, {enableClose: true});
                        $scope.openModal(data);
                        contest.isRegistered = true;
                        $scope.setDetailIndex(contest, 2);
                    });
                    /*jslint unparam: false*/
                    socket.emit(helper.EVENT_NAME.RegisterRequest, {roundID: roundID});
                }, function () {
                    contest.isRegistered = false;
                });
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
                (!$scope.isRegistrationOpen(contest) && index >= 3)) {
            // invalid index for detail tabs
            return;
        }
        if (index === 2 && !contest.myStatus) {
            // if myStatus is not loaded, load it.
            // in the real app, contest id and user id should be sent.
            $http.get('data/my-status.json').success(function (data) {
                contest.myStatus = data;
            });
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
