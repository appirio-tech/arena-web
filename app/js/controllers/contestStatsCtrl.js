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
 * @author amethystlei
 * @version 1.2
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
 * The main controller.
 *
 * @type {*[]}
 */
var contestStatsCtrl = ['$scope', 'appHelper', '$state', 'socket', '$timeout', function ($scope, appHelper, $state, socket, $timeout) {
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
        $state.go(helper.STATE_NAME.Coding, {
            problemId: problem.problemID,
            roundId: $scope.roundID,
            divisionId: $scope.divisionID
        });
    };

    // handle register response
    socket.on(helper.EVENT_NAME.RegisteredUsersResponse, function (data) {
        if (String(data.roundID) === String($scope.roundID)) {
            $scope.registrants = data.userListItems.length;
        }
    });

    // request register users
    socket.emit(helper.EVENT_NAME.RegisterUsersRequest, { roundID: $scope.roundID });

    $timeout(function () {
        $scope.$broadcast('rebuild:contestSchedule');
    }, 100);
}];

module.exports = contestStatsCtrl;
