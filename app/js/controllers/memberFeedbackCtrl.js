'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global angular, $, module, console*/
// member feedback widget
var memberFeedbackCtrl = ['$scope', '$timeout', function ($scope, $timeout) {
    // mode of feedback panel: modeFloating, modeDashboard, modeMinimized
    // modeMinimized is default mode.
    $scope.mode = 'modeMinimized';
    var fadeTime = 3000,
        timerForDashboard = function () {
            $timeout(function () {
                if ($scope.mode === 'modeDashboard' && $scope.mouseenter === false) {
                    $scope.mode = 'modeMinimized';
                }
            }, fadeTime);
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
                    timerForDashboard();
                }, 810);
            }
        };
    // click to open/collapse the panel
    $scope.collapse = function () {
        if ($scope.mode === 'modeFloating') {
            addAnimationForBody(false);
        } else if ($scope.mode === 'modeDashboard') {
            //$scope.mode = 'modeFloating';
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
    // watch the button status
    $scope.$watch('mouseenter', function (newValue, oldValue) {
        if (newValue === true) {
            // mouse enter 
            if ($scope.mode === 'modeMinimized') {
                // change mode
                $timeout(function () {
                    $scope.mode = 'modeDashboard';
                    timerForDashboard();
                }, 10);
            }
        }
    });
}];

module.exports = memberFeedbackCtrl;