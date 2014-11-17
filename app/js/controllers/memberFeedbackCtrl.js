/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the member feedback controller.
 *
 * Changes in version 1.1 (Member Feedback Widget Assembly):
 * - Added function submitFeedbackRequest to save feedback.
 *
 * @author shubhendus
 * @version 1.1
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global angular, $, module, console*/
// member feedback widget

var config = require('../config');

var memberFeedbackCtrl = ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {
    var count = 0,
        fadeTime = 3,
        // the dashboard timer for minimizing widget
        dashboardTimer = function () {
            if ($scope.mode === 'modeDashboard') {
                if ($scope.mouseenter) {
                    count = 0;
                    $timeout(dashboardTimer, 1000);
                } else {
                    count += 1;
                    if (count === fadeTime) {
                        $scope.mode = 'modeMinimized';
                        $timeout.cancel();
                        count = 0;
                    } else {
                        $timeout(dashboardTimer, 1000);
                    }
                }
            }
        },
        // add animation classes for widget 
        addAnimationForBody = function (isShow) {
            if (isShow) {
                $scope.mode = 'modeFloating';
                angular.element('.feedbackBody').removeClass('animationSlideDown');
                angular.element('.feedbackBody').addClass('animationSlideUp');
            } else {
                angular.element('.feedbackBody').removeClass('animationSlideUp');
                angular.element('.feedbackBody').addClass('animationSlideDown');
                $timeout(function () {
                    $scope.mode = 'modeDashboard';
                    //timerForDashboard();
                }, 100);
            }
        },

        // save feedback to google docs using jquery
        submitFeedbackRequest = function (handle, text) {
            var data = {
                handle: handle,
                feedback: text
            };
            $.ajax({
                url: config.feedbackSpreadsheetUrl,
                type: 'POST',
                data: data,
                success: function (data) {
                    console.log(data.result);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Error', xhr.status, textStatus, errorThrown);
                }
            });
        };
    // mode of feedback panel: modeFloating, modeDashboard, modeMinimized
    // modeMinimized is default mode.
    $scope.mode = 'modeDashboard';
    // maxlength for feedback text
    $scope.feedbackMaxlength = config.feedbackMaxlength;
    $timeout(dashboardTimer, 1000);
    // click to open/collapse the panel
    $scope.collapse = function () {
        if ($scope.mode === 'modeFloating') {
            addAnimationForBody(false);
        } else if ($scope.mode === 'modeDashboard') {
            addAnimationForBody(true);
        }
    };
    // cancel sending feedback, reset feedback text, disable animation
    $scope.cancel = function () {
        addAnimationForBody(false);
        $scope.feedbackText = '';
    };
    // submit feedback handler, check for text, send feedback and show notifier
    $scope.submit = function () {
        var text = $scope.feedbackText,
            handle = $scope.username(),
            messageSent = 'Thank you for your feedback!';
        $scope.feedbackText = '';
        if (angular.isUndefined(text) || text === '') {
            $scope.showError(true);
        } else {
            addAnimationForBody(false);
            // save message
            submitFeedbackRequest(handle, text);
            // message
            $('.bottom-right').notify({
                message: messageSent,
                type: "blue",
                fadeOut: {
                    enabled: true,
                    delay: 3000
                }
            }).show();
        }
    };
    // error message and border
    $scope.showError = function (hasError) {
        if (hasError) {
            $scope.hasError = true;
            angular.element('.border').addClass('error');
        } else {
            angular.element('.border').removeClass('error');
            $scope.hasError = false;
        }
    };
    // stay mode
    $scope.stayMode = function () {
        if ($scope.mode === 'modeMinimized') {
            // change mode
            $timeout(function () {
                $scope.mode = 'modeDashboard';
            }, 10);
        }
    };
    // watch mode
    /*jslint unparam:false*/
    $scope.$watch('mode', function (newValue, oldValue) {
        /*jslint unparam:true*/
        if (newValue === 'modeDashboard') {
            $timeout(dashboardTimer, 1000);
        }
    });
}];

module.exports = memberFeedbackCtrl;