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
 * Changes in version 1.2 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Added actions to the notification tickers.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena Bug Fix 14.10 - 2):
 * - Fixed the notification url issue.
 *
 * @author dexy, amethystlei, TCASSEMBLER
 * @version 1.3
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
var messageArenaCtrl = ['$scope', '$timeout', 'notificationService', '$window', '$rootScope', function ($scope, $timeout, notificationService, $window, $rootScope) {
    $scope.$watch('notificationService.getUnRead()', function (newVal, oldVal) {
        $scope.$broadcast('rebuild:messages');
        if (newVal > oldVal) {
            if ($scope.isReading) {
                // clear
                notificationService.clearUnRead();
            } else {
                // animation
                var target = document.getElementById('notiIndicator'), message;
                angular.element(target).addClass('animationaAlert');
                $timeout(function () {
                    angular.element(target).removeClass('animationaAlert');
                }, 1000);

                angular.forEach(notificationService.notifications, function (notification) {
                    if (!notification.displayed) {
                        notification.displayed = true;
                        if (angular.isDefined(notification.action)) {
                            // notification has actions
                            message = {
                                html: notification.message + ' <a class="notifAction" href="' + notification.action.target +
                                    '">Yes</a> or <a class="notifAction">No</a>?'
                            };
                        } else {
                            message = notification.message;
                        }
                        $('.top-right').notify({
                            message: message,
                            type: "green",
                            fadeOut: {
                                enabled: true,
                                delay: 60000
                            }
                        }).show();
                    }
                });
            }
        }
        /**
         * Go to the specified url.
         * @param link the url link.
         */
        $scope.goTo = function (link) {
            $rootScope.competingRoomID = -1;
            $window.location.href = link;
        };

    });
}];

module.exports = messageArenaCtrl;