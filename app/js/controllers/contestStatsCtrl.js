/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles contest stats directive logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Updated to use real data.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated phase messages for System Test.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Added dialog to show registrants.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added rooms checking condition while user opening the problem to code.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Show the problem status in open link.
 *
 * Changes in version 1.6 (Web Arena UI - Registrants Dialog Improvement):
 * - Update viewRegistrants method to improve Registrants dialog
 *
 * @author amethystlei, flytoj2ee, TCASSEMBLER
 * @version 1.6
 */
'use strict';
/*global module, angular*/
/*jslint plusplus: true*/
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
var contestStatsCtrl = ['$scope', 'appHelper', '$state', 'socket', '$timeout', '$rootScope', function ($scope, appHelper, $state, socket, $timeout, $rootScope) {
    /**
     * The status.
     *
     * @type {string[]}
     */
    var status = [
        '', // 0 - inactive
        'Registration Unopened', // 1 - before registration
        'Registration', // 2 - registration
        'Registration Closed', // 3 - after registration, before coding
        'Coding Phase', // 4 - coding
        'Intermission Phase', // 5 - after coding, before challenge
        'Challenge Phase', // 6 - challenge
        'Preparing for System Test Phase', // 7 - after challenge, before sys. test
        'System Test Phase', // 8 - sys. test
        'Contest Complete' // 9 - complete
    ];

    if ($scope.contest) {
        // will fill later
        $scope.organizer = 'N/A';
        $scope.difficulty = 'N/A';
        $scope.languages = 'N/A';
        $scope.registrants = 'LOADING...';
    }

    /**
     * The phase time function.
     *
     * @type {*|$scope.getPhaseTime|getPhaseTime}
     */
    $scope.getPhaseTime = appHelper.getPhaseTime;

    /**
     * Check whether contest started.
     *
     * @param phase the phase.
     * @returns {number} whether started.
     */
    $scope.isContestStarted = function (phase) {
        if (phase === undefined || phase.phaseType === undefined) {
            return -1;
        }
        return phase.phaseType >= helper.PHASE_TYPE_ID.CodingPhase ? 1 : 0;
    };

    /**
     * Check whether is coding phase.
     *
     * @param phase the phase
     * @returns {boolean} is this phase or not.
     */
    $scope.isCodingPhase = function (phase) {
        return phase !== undefined && phase.phaseType === helper.PHASE_TYPE_ID.CodingPhase;
    };

    /**
     * Check whether is intermission  phase.
     *
     * @param phase the phase
     * @returns {boolean} is this phase or not.
     */
    $scope.isIntermissionPhase = function (phase) {
        return phase !== undefined && phase.phaseType === helper.PHASE_TYPE_ID.IntermissionPhase;
    };

    /**
     * Check whether is challenge phase.
     *
     * @param phase the phase
     * @returns {boolean} is this phase or not.
     */
    $scope.isChallengePhase = function (phase) {
        return phase !== undefined && phase.phaseType === helper.PHASE_TYPE_ID.ChallengePhase;
    };

    /**
     * Check whether is system test phase.
     *
     * @param phase the phase
     * @returns {boolean} is this phase or not.
     */
    $scope.isSystemTestPhase = function (phase) {
        return phase !== undefined && phase.phaseType >= helper.PHASE_TYPE_ID.PendingSystemPhase
            && phase.phaseType <= helper.PHASE_TYPE_ID.SystemTestingPhase;
    };

    /**
     * Get the current status.
     *
     * @param phase the phase
     * @returns {string} the status
     */
    $scope.getStatus = function (phase) {
        if (phase === undefined || phase.phaseType < 0 || phase.phaseType >= status.length) {
            return '';
        }
        return status[phase.phaseType];
    };

    /**
     * Open the problem.
     *
     * @param problem the problem
     */
    $scope.openProblem = function (problem) {
        // Check whether user is assigned to this room or not
        if (!appHelper.isCoderAssigned($rootScope.username(), $rootScope.currentRoomInfo.roomID)) {
            $scope.openModal({
                title: helper.POP_UP_TITLES.NotAssigned,
                message: helper.POP_UP_MESSAGES.NotAssigned,
                enableClose: true
            });
        } else {
            $state.go(helper.STATE_NAME.Coding, {
                problemId: problem.problemID,
                roundId: $scope.roundID,
                divisionId: $scope.divisionID
            });
        }
    };

    /**
     * Get the problem open title.
     * @param problem - the problem
     * @returns {string} - the title
     */
    $scope.getOpenTitle = function (problem) {
        var componentId = problem.primaryComponent.componentID,
            coder,
            result = 'Open',
            problemStatus,
            i,
            j;
        if ($rootScope.currentRoomInfo && $rootScope.currentRoomInfo.roomID
                && $rootScope.roomData[$rootScope.currentRoomInfo.roomID]
                && $rootScope.roomData[$rootScope.currentRoomInfo.roomID].coders) {
            for (i = 0; i < $rootScope.roomData[$rootScope.currentRoomInfo.roomID].coders.length; i++) {
                if ($rootScope.roomData[$rootScope.currentRoomInfo.roomID].coders[i].userName === $rootScope.username()) {
                    coder = $rootScope.roomData[$rootScope.currentRoomInfo.roomID].coders[i];
                    break;
                }
            }

            if (coder) {
                for (j = 0; j < coder.components.length; j++) {
                    if (coder.components[j].componentID === componentId) {
                        problemStatus = coder.components[j].status;
                        break;
                    }
                }
            }

            if (problemStatus) {
                result = helper.CODER_PROBLEM_STATUS_NAME[problemStatus];
            }
        }

        return result;
    };

    // handle register response
    socket.on(helper.EVENT_NAME.RegisteredUsersResponse, function (data) {
        if (String(data.roundID) === String($scope.roundID)) {
            $scope.registrants = data.userListItems.length;
            $scope.registrantsList = data.userListItems;
        }
    });
    $scope.registrantsList = [];

    /**
     * Show all registrants.
     */
    $scope.viewRegistrants = function () {
        var coders = $scope.registrantsList,
            msg = "",
            i = 0,
            coder;
        coders.count = {
            div1: 0,
            div2: 0,
            newR: 0,
            total: coders.length
        };
        for (i = 0; i < coders.length; i++) {
            coder = coders[i];
            if (coder.userRating >= 1200) {
                coders.count.div1 += 1;
            } else if (coder.userRating < 1200 && coder.userRating > 0) {
                coders.count.div2 += 1;
            } else {
                coders.count.newR += 1;
            }
        }
        $scope.openModal({
            title: 'Registrants',
            registrants: coders,
            message: msg,
            enableClose: true
        }, null, function () {
            $rootScope.currentModal = undefined;
            $rootScope.currentDetailModal = undefined;
        }, 'partials/user.contest.registrants.html');
    };

    // request register users
    socket.emit(helper.EVENT_NAME.RegisterUsersRequest, { roundID: $scope.roundID });

    $timeout(function () {
        $scope.$broadcast('rebuild:contestSchedule');
    }, 100);
}];

module.exports = contestStatsCtrl;
