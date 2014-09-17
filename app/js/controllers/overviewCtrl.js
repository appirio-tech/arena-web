/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the overview controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Removed $http and $rootScope, added sessionHelper
 * - Changed userProfile.username to userProfile.handle to display correct information
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Rating Indicator):
 * - Removed the rating class function to use the global one in baseCtrl.js.
 *
 * Changes in version 1.3 (Module Assembly - Dashboard - Active Users and Leaderboard Panel):
 * - Broadcast the rebuild event for active user panel and leader board panel.
 *
 * @author dexy, amethystlei, TCASSEMBLER
 * @version 1.3
 */
'use strict';

var overviewCtrl = ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.showSection = "overview";
    $scope.userProfile = $rootScope.userInfo();

    $scope.isInt = function (value) {
        return !isNaN(value) && (parseInt(value, 10) === value);
    };

    // broadcast the rebuild UI event.
    $scope.$watch('showSection', function () {
        if ($scope.showSection === "users") {
            $scope.$broadcast('rebuild:activeUser');
        } else if ($scope.showSection === 'leaderboard') {
            $scope.$broadcast('rebuild:leaderBoardMethods');
            $scope.$broadcast('rebuild:leaderBoardLeaders');
        }
    });
}];

module.exports = overviewCtrl;