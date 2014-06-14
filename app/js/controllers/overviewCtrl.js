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
 * @author dexy
 * @version 1.1
 */
'use strict';

var overviewCtrl = ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.showSection = "overview";
    $scope.userProfile = $rootScope.userInfo();

    $scope.isInt = function (value) {
        return !isNaN(value) && (parseInt(value, 10) === value);
    };
    $scope.getUserColor = function () {
        if ($scope.userProfile.admin) {
            return 'orange';
        }
        return $scope.getRatingColor();
    };
    $scope.getRatingColor = function () {
        if (!$scope.isInt($scope.userProfile.rating) || $scope.userProfile.rating <= 0) {
            return 'white';
        }
        if ($scope.userProfile.rating < 900) {
            return 'gray';
        }
        if ($scope.userProfile.rating < 1200) {
            return 'green';
        }
        if ($scope.userProfile.rating < 1500) {
            return 'purple';
        }
        if ($scope.userProfile.rating < 2200) {
            return 'yellow';
        }
        return 'red';
    };
}];

module.exports = overviewCtrl;