'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global angular, $, module, console*/
// member feedback widget

var config = require('../config');

var memberFeedbackCtrl = ['$http', '$scope', '$timeout', function ($http, $scope, $timeout) {
    var count = 0,
        fadeTime = 3,
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
        };
    // mode of feedback panel: modeFloating, modeDashboard, modeMinimized
    // modeMinimized is default mode.
    $scope.mode = 'modeDashboard';
    $timeout(dashboardTimer, 1000);
    // click to open/collapse the panel
    $scope.collapse = function () {
        if ($scope.mode === 'modeFloating') {
            addAnimationForBody(false);
        } else if ($scope.mode === 'modeDashboard') {
            addAnimationForBody(true);
        }
    };
    // cancel
    $scope.cancel = function () {
        addAnimationForBody(false);
        $scope.feedbackText = '';
    };
    // submit
    $scope.submit = function () {
        var text = $scope.feedbackText,
            handle = $scope.username(),
            messageSent = 'Thank you for your feedback!';
        $scope.feedbackText = '';
        if (angular.isUndefined(text) || text === '') {
            $scope.showError(true);
        } else {
            addAnimationForBody(false);
            console.log('Feedback message: ' + text);
            /*jslint unparam: true*/
            $http({
                method: 'POST',
                url: config.feedbackSpreadsheetUrl,
                // turn request into simple request from preflighted request and encode accordingly
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                data: $.param({handle: handle, feedback: text})
            }).
                  success(function (data, status, headers, config) {
                    console.log(data.result); // can be success or error
                }).
                  error(function (data, status, headers, config) {
                    console.log('Error');
                });
            /*jslint unparam: false*/
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