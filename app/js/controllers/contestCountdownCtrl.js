/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles contest countdown directive logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Updated to use real data.
 *
 * @author TCSASSEMBLER
 * @version 1.1
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
var contestCountdownCtrl = ['$scope', '$rootScope', 'socket', '$timeout', 'tcTimeService', function ($scope, $rootScope, socket, $timeout) {
    /**
     * messages for different phases.
     *
     * @type {string[]}
     * @since 1.1
     */
    var phaseMessages = [
        'The contest is inactive.',
        'Registration Phase will start in:',
        'Registration Phase will end in:',
        'Coding Phase will start in:',
        'Coding Phase will end in:',
        'Challenge Phase will start in:',
        'Challenge Phase will end in:',
        'Waiting for system test to start.',
        'System test is in process: ',
        'Contest is complete.',
        'Voting Phase is started.',
        'Tie Breaking Voting Phase is started.',
        'Moderated Chatting Phase is started.'
    ];

    /**
     * Get phase message.
     *
     * @param contest the contest
     * @returns {string} message
     */
    $scope.getPhaseMessage = function (contest) {
        if (!contest) {
            return '';
        }
        if (!contest.phaseData) {
            return 'Unknown phase';
        }
        var pId = contest.phaseData.phaseType;
        return pId > -1 && pId < phaseMessages.length ? phaseMessages[pId] : 'Unknown phase';
    };

    /**
     * Check whether show timer.
     *
     * @param contest the contest
     * @returns {*|boolean} whether show timer.
     * @since 1.1
     */
    $scope.showTimer = function (contest) {
        return contest && contest.phaseData
            && contest.phaseData.phaseType > 0 && contest.phaseData.phaseType < 7;
    };

    /**
     * Set timer.
     */
    $scope.startTimer = function () {
        var seconds = -1;
        if ($scope.contest && $scope.contest.phaseData && $scope.contest.phaseData.endTime) {
            // how many seconds between now and the phase end time

            // we didn't get time from tcTimeService as it's just a mock implementation currently
            // we will move to use tcTimeService once it's implemented
            // seconds = ($scope.contest.phaseData.endTime - tcTimeService.getTime()) / 1000;
            seconds = ($scope.contest.phaseData.endTime - $rootScope.getCurrentTCTime()) / 1000;
        }
        if (seconds > 0) {
            // set and start the timer, see angular-timer code for implementation details.
            $timeout(function () {
                $scope.$broadcast('timer-set-countdown', seconds - 0.2);
                $scope.$broadcast('timer-start');
            }, 200);
        }
    };

    // handle phase data response
    $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
        if (String(data.phaseData.roundID) === String($scope.roundID)) {
            $scope.startTimer();
        }
    });

    if ($scope.contest) {
        // start counting down
        $scope.startTimer();
    }
}];

module.exports = contestCountdownCtrl;
