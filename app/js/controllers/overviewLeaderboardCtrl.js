/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles leader board panel related logic.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*global module, angular, require*/
/*jslint plusplus: true*/
/**
 * The leader board controller.
 */
var overviewLeaderboardCtrl = [ '$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.activeRound = "";
    $scope.isLoadingLbData = false;

    /**
     * Get the leader board data.
     * @returns {Array} the leader board data.
     */
    $scope.getLeaderBoardData = function () {
        if ($scope.activeRound === '') {
            return [];
        }

        var tmp = [], i;
        for (i = 0; i < $rootScope.leaderBoardRoundData.length; i++) {
            if ($rootScope.leaderBoardRoundData[i].roundID === (+$scope.activeRound)) {
                tmp = $rootScope.leaderBoardRoundData[i].items;
                break;
            }
        }

        return tmp;
    };
    /**
     * Get the active round.
     * @returns {*} the active round.
     */
    $scope.getActiveRound = function () {
        return $scope.getRoundName($scope.activeRound);
    };

    /**
     * Get round name.
     * @param round the round id
     * @returns {*} the round name.
     */
    $scope.getRoundName = function (round) {
        var result = round;
        if ($rootScope.roundData && $rootScope.roundData[round]) {
            result = $rootScope.roundData[round].contestName + " - " + $rootScope.roundData[round].roundName;
        }
        return result;
    };

    /**
     * Get rounds data.
     * @returns {Array} the round data.
     */
    $scope.getRounds = function () {
        var rounds = [], i;
        if ($rootScope.leaderBoardRoundData) {
            for (i = 0; i < $rootScope.leaderBoardRoundData.length; i++) {
                rounds.push($rootScope.leaderBoardRoundData[i].roundID);
            }
            if (rounds.length > 0 && $scope.activeRound === "") {
                $scope.activeRound = rounds[0];
            }
        }
        return rounds;
    };

    // the sorting flags.
    $scope.sortlb = {
        column: '',
        descending: false
    };
    /**
     * Change the sorting flag.
     * @param column the column value.
     */
    $scope.changeSortingLb = function (column) {
        var sort = $scope.sortlb;
        if (sort.column === column) {
            sort.descending = !sort.descending;
        } else {
            sort.column = column;
            sort.descending = false;
        }
    };

    /**
     * Update round data by given round id
     * @param round - the round id.
     */
    $scope.updateRound = function (round) {
        $scope.activeRound = round;
        $scope.rebuildAll();
    };

    /**
     * Rebuild all scroll bars.
     */
    $scope.rebuildAll = function () {
        $scope.$broadcast('rebuild:leaderBoardMethods');
        $scope.$broadcast('rebuild:leaderBoardLeaders');
    };
}
    ];

module.exports = overviewLeaderboardCtrl;