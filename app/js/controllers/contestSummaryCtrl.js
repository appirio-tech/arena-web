/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles coding editor related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Updated to use real data.
 *
 * @author amethystlei
 * @version 1.1
 */
'use strict';
/*global module, angular*/

/**
 * The main controller for the contest summary page.
 *
 * @type {*[]}
 */
var contestSummaryCtrl = ['$scope', '$state', function ($scope, $state) {
    $scope.viewOn = 'room';
    $scope.setViewOn = function (view) {
        $scope.viewOn = view;
    };
    $scope.getViewOnTitle = function () {
        if ($scope.viewOn === 'room') {return 'Room'; }
        if ($scope.viewOn === 'divOne') {return 'Division I'; }
        if ($scope.viewOn === 'divTwo') {return 'Division II'; }
    };
    $scope.viewDetail = function (contest) {
        $state.go('user.contestSummary', {contestId : contest.roundID, divisionId : $scope.divisionID, viewOn : $scope.viewOn});
    };
}];

module.exports = contestSummaryCtrl;