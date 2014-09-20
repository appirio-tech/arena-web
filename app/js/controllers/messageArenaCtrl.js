/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the message arena controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Notifications):
 * - Added $window and goTo function to the scope to handle going to other page.
 * - Removed previous notification demo code.
 *
 * @author dexy
 * @version 1.1
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global document, angular:false, $:false, module*/
/**
 * The message arena controller.
 *
 * @type {*[]}
 */
var messageArenaCtrl = ['$scope', '$timeout', 'notificationService', '$window', function ($scope, $timeout, notificationService, $window) {
    $scope.$watch('notificationService.getUnRead()', function (newVal, oldVal) {
        $scope.$broadcast('rebuild:messages');
        if (newVal > oldVal) {
            if ($scope.isReading) {
                // clear
                notificationService.clearUnRead();
            } else {
                // animation
                var target = document.getElementById('notiIndicator');
                angular.element(target).addClass('animationaAlert');
                $timeout(function () {
                    angular.element(target).removeClass('animationaAlert');
                }, 1000);

                angular.forEach(notificationService.notifications, function(notification) {
                    if(!notification.displayed) {
                        notification.displayed = true;
                        $('.top-right').notify({
                            message: notification.message,
                            type: "green",
                            fadeOut: {
                                enabled: false
                            }
                        }).show();                        
                    }
                });
            }
        }
        $scope.goTo = function (link) {
            $window.location.href = link;
        };

    });
}];

module.exports = messageArenaCtrl;