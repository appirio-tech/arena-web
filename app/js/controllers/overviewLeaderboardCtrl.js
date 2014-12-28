/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles leader board panel related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the overview leaderboard.
 *
 * @author amethystlei
 * @version 1.1
 */
'use strict';
/*global module, angular, require*/
/*jslint plusplus: true*/
/*global document, angular:false, $:false, module*/
/**
 * The leader board controller.
 */
var overviewLeaderboardCtrl = [ '$scope', '$rootScope', function ($scope, $rootScope) {
    /**
     * Used in sort function to order rounds dropdown by round names
     * @param roundA Round ID of round to compare
     * @param roundB Round ID of other round to compare with
     * @returns {boolean} Returns 0, 1 or -1 based on comparison
     */
    var compareRoundNames = function (roundA, roundB) {
        return ($scope.getRoundName(roundA) + '').localeCompare($scope.getRoundName(roundB) + '');
    }, customDropdown = $('#customDDToggle');
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
        }
        rounds.sort(compareRoundNames);
        if (rounds.length > 0 && $scope.activeRound === "") {
            $scope.activeRound = rounds[0];
        }
        return rounds;
    };

    // the sorting flags.
    $scope.sortlb = {
        column: 'points',
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
        customDropdown.qtip('api').toggle(false);
    };

    /**
     * Rebuild all scroll bars.
     */
    $scope.rebuildAll = function () {
        $rootScope.$broadcast('rebuild:leaderBoardMethods');
        $scope.$broadcast('rebuild:leaderBoardLeaders');
    };

    /**
     * Handle arrow key presses for the dropdown
     */
    function handleKey(e){
        switch(e.which) {
            case 13: // up
                customDropdown.qtip('api').toggle(false);
            break;

            case 38: // up
                $scope.$apply(function() {
                    var rounds = $scope.getRounds(),
                        idx = rounds.indexOf($scope.activeRound);

                    if(idx > 0) {
                        $scope.activeRound = rounds[idx-1];
                    }
                });
                break;

            case 40: // down
                $scope.$apply(function() {
                    var rounds = $scope.getRounds(),
                        idx = rounds.indexOf($scope.activeRound);

                    if(idx < rounds.length-1 && idx != -1) {
                        $scope.activeRound = rounds[idx+1];
                    }
                });
            break;

            default: return; // exit this handler for other keys
        }

        e.preventDefault();
    }

    // qtip here
    /*jslint unparam:false*/
    customDropdown.qtip({
        content: {
            text: customDropdown.next()
        },
        position: {
            my: 'top center',
            at: 'bottom center',
            target: customDropdown
        },
        show: {
            event: 'click',
            solo: true,
            modal: true
        },
        hide: 'click unfocus',
        style: {
            classes: 'customDropdownPanel'
        },
        events: {
            show: function (event, api) {
                /*jslint unparam:true*/
                $rootScope.$broadcast('rebuild:leaderBoardMethods');

                $(document).keydown(handleKey);
            },
            hide: function(event, api) {

                $(document).off('keydown', handleKey);
            }
        }
    });
    $.fn.qtip.zindex = 1030;

    /**
     * triggle key action.
     */
    $scope.triggerKey = function (event) {
        console.log(event);
    };
}];

module.exports = overviewLeaderboardCtrl;
