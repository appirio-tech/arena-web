/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the main controller for active contests.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Added rootScope and update its now field.
 *
 * @author dexy
 * @version 1.1
 */
'use strict';

var tcTimeCtrl = ['$scope', '$rootScope', '$timeout', 'tcTimeService', function ($scope, $rootScope, $timeout, tcTimeService) {
    // update time every second
    $scope.updateTime = function () {
        $scope.serverTime = tcTimeService.getTime();
        $rootScope.now = $scope.serverTime;
        $timeout($scope.updateTime, 1000);
    };
    $scope.updateTime();
}];

module.exports = tcTimeCtrl;