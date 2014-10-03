/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the main controller for coding time directive.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*global module, require, $*/
/*jslint browser:true */
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

var userCodingTimeCtrl = ['$scope', '$rootScope', '$timeout', '$stateParams', 'tcTimeService', function ($scope, $rootScope, $timeout, $stateParams, tcTimeService) {
    $scope.roundID = undefined;
    $scope.countdown = 1;
    $scope.noCountdown = true;
    /**
     * Loads round id
     */
    function loadRoundId() {
        if ($rootScope.currentStateName() === helper.STATE_NAME.Contest || $rootScope.currentStateName() === helper.STATE_NAME.ContestSummary) {
            $scope.roundID = Number($stateParams.contestId);
            return;
        }
        if ($rootScope.currentStateName() === helper.STATE_NAME.Coding || $rootScope.currentStateName() === helper.STATE_NAME.ViewCode) {
            $scope.roundID = Number($stateParams.roundId);
            return;
        }
        $scope.roundID = undefined;
    }

    /**
     * Set and start the timer.
     */
    function startTimer() {
        loadRoundId();
        // start count down
        var seconds = -1, phase;
        $scope.noCountdown = false;
        if ($scope.roundData && $scope.roundData[$scope.roundID] && $scope.roundData[$scope.roundID].phaseData) {
            phase = $scope.roundData[$scope.roundID].phaseData;
            if (phase.phaseType === helper.PHASE_TYPE_ID.CodingPhase ||
                    phase.phaseType === helper.PHASE_TYPE_ID.ChallengePhase ||
                    phase.phaseType === helper.PHASE_TYPE_ID.IntermissionPhase) {
                // how many seconds between now and the phase end time
                seconds = (phase.endTime - tcTimeService.getTime()) / 1000;
            }
        }
        if (seconds > 0) {
            // set and start the timer, see angular-timer code for implementation details.
            $timeout(function () {
                $rootScope.$broadcast('timer-set-countdown', seconds - 0.2);
                $rootScope.$broadcast('timer-start');
            }, 200);
        } else {
            $scope.noCountdown = true;
        }
    }

    /*jslint unparam: true*/
    // handle phase data response
    $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
        startTimer();
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === helper.STATE_NAME.Contest) {
            startTimer();
        }
    });
    /*jslint unparam: true*/
    // handle phase data response
    $scope.$on('problem-loaded', function () {
        startTimer();
    });
    /**
     * Shows timer if current page is contest or coding page
     * Shows timer if current phase is coding or intermission or challenge or greater than challenge(Match Complete)
     * @returns {boolean}
     */
    $scope.showTimer = function () {
        loadRoundId();
        var phase;
        if ($scope.roundData && $scope.roundData[$scope.roundID] && $scope.roundData[$scope.roundID].phaseData) {
            phase = $scope.roundData[$scope.roundID].phaseData;
            // Check current phase
            if (phase.phaseType === helper.PHASE_TYPE_ID.CodingPhase ||
                    phase.phaseType === helper.PHASE_TYPE_ID.ChallengePhase ||
                    phase.phaseType === helper.PHASE_TYPE_ID.IntermissionPhase ||
                    phase.phaseType > helper.PHASE_TYPE_ID.ChallengePhase) {
                // Check current state
                if ($rootScope.currentStateName() === helper.STATE_NAME.Coding ||
                        $rootScope.currentStateName() === helper.STATE_NAME.ViewCode ||
                        $rootScope.currentStateName() === helper.STATE_NAME.Contest ||
                        $rootScope.currentStateName() === helper.STATE_NAME.ContestSummary) {
                    return true;
                }
            }
        }

        return false;
    };
    /**
     * Returns current phase
     * @returns {string}
     */
    $scope.getPhaseName = function () {
        var phase;
        if ($scope.roundData && $scope.roundData[$scope.roundID] && $scope.roundData[$scope.roundID].phaseData) {
            phase = $scope.roundData[$scope.roundID].phaseData;
            // Check current phase
            if (phase.phaseType === helper.PHASE_TYPE_ID.CodingPhase) {
                return 'Coding: ';
            }
            if (phase.phaseType === helper.PHASE_TYPE_ID.ChallengePhase) {
                return 'Challenge: ';
            }
            if (phase.phaseType === helper.PHASE_TYPE_ID.IntermissionPhase) {
                return 'Intermission: ';
            }
            if (phase.phaseType > helper.PHASE_TYPE_ID.ChallengePhase) {
                return 'Match Complete';
            }
        }
    };

    loadRoundId();
}];

module.exports = userCodingTimeCtrl;