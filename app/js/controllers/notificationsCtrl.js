/*jshint -W097*/
/*jshint strict:false*/
/*global document, angular:false, $:false, module, require*/
'use strict';
/**
 * The helper.
 *
 * @type {*[]}
 */
var helper = require('../helper');
/**
 * The past notifications controller.
 *
 * @type {*[]}
 */
var notificationsCtrl = ['$scope', '$timeout', '$http', '$filter', '$rootScope', 'notificationService', 'tcTimeService', function ($scope, $timeout, $http, $filter, $rootScope, notificationService, tcTimeService) {
    $scope.viewMoreClicked = false;
    $scope.showLimit = function () {
        return $scope.viewMoreClicked ? notificationService.pastNotifications.length : 10;
    };
    $scope.viewMore = function () {
        $scope.viewMoreClicked = true;
        $scope.$broadcast('rebuild:pastNotifications');
        console.log("clicked   " + $scope.showLimit());
    };
    $scope.viewDefault = function () {
        $scope.viewMoreClicked = false;
        $timeout(function () {
            $scope.$broadcast('reload:pastNotifications');
        }, 50);
    };

    // load mock data when logged in
    /*jslint unparam: false*/
    $scope.$watch('isLoggedIn', function (newVal, oldVal) {
        /*jslint unparam: true*/
        if (newVal === true) {
            $http.get('data/past-notifications.json').success(function (data) {
                angular.forEach(data.preload, function (notification) {
                    notificationService.addPastNotification({
                        message: notification.message,
                        date: $filter('date')(new Date(notification.date), helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone
                    });
                });
                // rebuild scroll bar when content updated
                $scope.$broadcast('rebuild:pastNotifications');
                var i = 0,
                    demoWaitTime = 5000,
                    demoStartTime = 2000,
                    addNewMessage = function () {
                        if (i < data.newMessages.length && $rootScope.isLoggedIn) {
                            // show popup here
                            notificationService.addPastNotification({
                                message: data.newMessages[i].message,
                                date: $filter('date')(new Date(tcTimeService.getTime()), helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone
                            });
                            // if (data.newMessages[i].type === 'gray') {
                            //     $('.bottom-right').notify({
                            //         message: data.newMessages[i].message,
                            //         type: data.newMessages[i].type,
                            //         fadeOut: {
                            //             delay: 3000
                            //         }
                            //     }).show();
                            // } else {
                                $('.top-right').notify({
                                    message: data.newMessages[i].message,
                                    type: data.newMessages[i].type,
                                    fadeOut: {
                                        delay: 3000
                                    }
                                }).show();
                            //}
                            // rebuild scroll bar when content updated
                            $scope.$broadcast('rebuild:pastNotifications');
                            i += 1;
                            $timeout(addNewMessage, demoWaitTime);
                        }
                    };
                $timeout(addNewMessage, demoStartTime);
            });
        }
    });
}];

module.exports = notificationsCtrl;