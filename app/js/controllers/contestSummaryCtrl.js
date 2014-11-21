/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles coding editor related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Updated to use real data.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added rooms tab logic.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Phase I Bug Fix 5):
 * - Added isInMyRoom() checking.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Clear the chat history while changing the room.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Added config and $window to the controller.
 * - Updated setViewOn to handle division leaderboard retrieval.
 * - Added getCurrentLeaderboard, getTopCoderCount, viewCode to handle leaderboard table.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena Bug Fix 14.10 - 2):
 * - Populated the component default point value.
 *
 * Changes in version 1.7 (Sort is not retained in room summary):
 * - Reset isKeepSort to false.
 *
 * @author amethystlei, flytoj2ee, dexy, TCASSEMBLER
 * @version 1.7
 */
'use strict';
/*global module, angular*/
/*jslint plusplus: true*/

var helper = require('../helper'),
    config = require('../config');

/**
 * The main controller for the contest summary page.
 *
 * @type {*[]}
 */
var contestSummaryCtrl = ['$scope', '$state', '$rootScope', 'appHelper', '$window', '$stateParams', function ($scope, $state, $rootScope, appHelper, $window, $stateParams) {
    var preserveLastDivSummary = false,
        cleanBeforeUnload = function () {
            if (!preserveLastDivSummary) {
                $rootScope.closeLastDivSummary();
            }
        };

    $scope.viewDivisionID = $scope.divisionID;
    $scope.setViewOn = function (view) {
        $rootScope.currentViewOn = view;
        var divID = helper.VIEW_ID[view];
        $scope.viewOn = view;
        if (view === 'rooms') {
            $scope.$broadcast('rebuild:roomslist');
            $rootScope.closeLastDivSummary();
            $rootScope.leaderboard = [];
            $rootScope.isDivLoading = false;
            $scope.viewDivisionID = $scope.divisionID;
        } else {
            $scope.viewDivisionID = divID;
            $rootScope.getDivSummary($scope.contest.roundID, divID);
        }
    };
    if ($stateParams.viewOn) {
        $scope.setViewOn($stateParams.viewOn);
    } else {
        $scope.setViewOn('room');
    }
    // default to 50
    $scope.pageSize = 50;

    $scope.currentPage = 1;

    /**
     * Moves to room.
     *
     * @param roomId - the room id
     */
    $scope.moveToRoom = function (roomId) {
        $rootScope.competingRoomID = roomId;
        if (roomId !== -1) {
            var str = '';
            $rootScope.chatContent[roomId + str] = [];
        }
        // requests will be sent by the resolvers
        $state.go(helper.STATE_NAME.Contest, {
            contestId: $scope.contest.roundID
        }, { reload: true });
    };

    /**
     * Returns the number of pages.
     *
     * @returns {number} the page number
     */
    $scope.numberOfPages = function () {
        return Math.ceil($scope.roomsList.length / $scope.pageSize);
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

    $scope.roomsList = $scope.contest.coderRooms;

    /**
     * Returns the flag whether shown the rooms tab.
     *
     * @returns {boolean|$rootScope.roundData.coderRooms|*} the flag
     */
    $scope.isShownRooms = function () {
        return angular.isDefined($scope.contest.phaseData)
            && $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase
            && $scope.contest.coderRooms && $scope.contest.coderRooms.length > 0;
    };

    /**
     * Get the selected leader board.
     *
     * @returns {Array} the leader board
     */
    $scope.getCurrentLeaderboard = function () {
        var leaderboard = $rootScope.getCurrentLeaderboard($scope.viewOn, $rootScope.competingRoomID), i, j;

        for (i = 0; i < leaderboard.length; i++) {
            for (j = 0; j < leaderboard[i].components.length; j++) {
                leaderboard[i].components[j].defaultPoint = $scope.getDefaultComponentValue(leaderboard[i].components[j].componentID);
            }
        }

        return leaderboard;
    };

    /**
     * Get default problem component point value by component id.
     * @param componentId - the component id.
     * @returns {number} - the point value.
     */
    $scope.getDefaultComponentValue = function (componentId) {
        var result = 0, j, problems;
        if ($scope.contest) {
            problems = $scope.contest.problems;
            if (problems) {
                for (j = 0; j < problems[$scope.viewDivisionID].length; j++) {
                    if (+componentId === +problems[$scope.viewDivisionID][j].primaryComponent.componentID) {
                        result = problems[$scope.viewDivisionID][j].primaryComponent.pointValue;
                        break;
                    }
                }
            }
        }
        return result;
    };

    $scope.getTopCoderCount = function () {
        return Number(config.summaryTopCoderCount);
    };

    // Closes the opened division summary on page leaving.
    $window.onbeforeunload = cleanBeforeUnload;
    $scope.$on("$destroy", cleanBeforeUnload);

    /**
     * Checks whether the current user is in his/her room.
     * @returns {boolean|*} the checking result.
     */
    $scope.isInMyRoom = function () {
        var isCompetitor = false;
        angular.forEach($rootScope.roomData, function (room) {
            angular.forEach(room.coders, function (coder) {
                if (coder.userName === $rootScope.username()) {
                    isCompetitor = true;
                    return;
                }
            });
        });

        if (!isCompetitor) {
            // hide the button if the user is not competitor
            return true;
        }

        return (($rootScope.currentRoomInfo.roomID === -1)
            || ((angular.isUndefined($rootScope.roomData[$rootScope.currentRoomInfo.roomID]))
            || (appHelper.isCoderAssigned($rootScope.username(), $rootScope.currentRoomInfo.roomID))));
    };

    $scope.getViewOnTitle = function () {
        if ($scope.viewOn === 'room') {return 'Room'; }
        if ($scope.viewOn === 'rooms') {
            return 'Rooms';
        }
        if ($scope.viewOn === 'divOne') {return 'Division I'; }
        if ($scope.viewOn === 'divTwo') {return 'Division II'; }
        return '';
    };
    $scope.viewDetail = function (contest) {
        preserveLastDivSummary = true;
        //should discard the key sort
        $rootScope.isKeepSort = false;
        $state.go('user.contestSummary', {contestId : contest.roundID, divisionId : $scope.divisionID, viewOn : $scope.viewOn});
    };

    /**
     * View the source of the given coder and component.
     *
     * @param {{
     *           userName: string,
     *           userRating: number,
     *           teamName: string,
     *           userID: number,
     *           userType: number,
     *           countryName: string,
     *           components: {
     *              componentID: number,
     *              points: number,
     *              status: number,
     *              language: number
     *           }
     *        }} coder
     * @param {number} componentId
     */
    $scope.viewCode = function (coder, componentId) {
        var roomID = ($scope.viewOn === 'room') ? $rootScope.competingRoomID : coder.roomID;
        preserveLastDivSummary = true;
        $rootScope.viewCode($scope.contest.phaseData.phaseType, $scope.contest.roundID, $scope.divisionID,
                            componentId, roomID, coder.userName, 'contest');
    };
}];

module.exports = contestSummaryCtrl;
