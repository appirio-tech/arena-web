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
 * @author amethystlei, flytoj2ee
 * @version 1.2
 */
'use strict';
/*global module, angular*/

var helper = require('../helper');

/**
 * The main controller for the contest summary page.
 *
 * @type {*[]}
 */
var contestSummaryCtrl = ['$scope', '$state', '$rootScope', function ($scope, $state, $rootScope) {
    $scope.viewOn = 'room';
    $scope.setViewOn = function (view) {
        $scope.viewOn = view;
        if (view === 'rooms') {
            $scope.$broadcast('rebuild:roomslist');
        }
    };

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
        return $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase
            && $scope.contest.coderRooms && $scope.contest.coderRooms.length > 0;
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
        $state.go('user.contestSummary', {contestId : contest.roundID, divisionId : $scope.divisionID, viewOn : $scope.viewOn});
    };
}];

module.exports = contestSummaryCtrl;