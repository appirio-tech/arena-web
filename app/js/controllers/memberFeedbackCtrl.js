'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global angular, $, module, console*/
// member feedback widget
var memberFeedbackCtrl = ['$scope', '$timeout', function ($scope, $timeout) {
    // mode of feedback panel: modeFloating, modeDashboard, modeMinimized
    // modeMinimized is default mode.
    $scope.mode = 'modeMinimized';
    var count = 0,
        fadeTime = 3000,
        dashboardTimer = function () {
            console.log($scope.mode);
            if ($scope.mode === 'modeDashboard') {
                if ($scope.mouseenter) {
                    count = 0;
                    $timeout(dashboardTimer, 1000);
                }
                else {
                    count += 1;
                    console.log('count: ' + count);
                    if (count === 3) {
                        console.log('change mode');
                        $scope.mode = 'modeMinimized';
                        $timeout.cancel();
                        count = 0;
                    } else {
                        console.log('******');
                        $timeout(dashboardTimer, 1000);
                    }}
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
            messageSent = 'Feedback sent successfully! ';
        $scope.feedbackText = '';
        if (angular.isUndefined(text) || text === '') {
            $scope.showError(true);
        } else {
            addAnimationForBody(false);
            console.log('Feedback message: ' + text);
            // message
            $('.bottom-right').notify({
                message: messageSent + 'And feedback message: ' + text,
                type: "green",
                fadeOut: {
                    enabled: true,
                    delay: 2500
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
        console.log('stay mode and cancel timer');
        if ($scope.mode === 'modeMinimized') {
            // change mode
            $timeout(function () {
                $scope.mode = 'modeDashboard';
            }, 10);
        }
    };
    // watch mode
    $scope.$watch('mode', function (newValue, oldValue) {
        if (newValue === 'modeDashboard') {
            $timeout(dashboardTimer, 1000);
        }
    });
}];

module.exports = memberFeedbackCtrl;