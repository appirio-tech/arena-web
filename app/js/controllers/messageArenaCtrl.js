'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global document, angular:false, $:false, module*/
var messageArenaCtrl = ['$scope', '$timeout', 'notificationService', function ($scope, $timeout, notificationService) {
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
            }
        }
    });

    // load notifications after logged in.
    $scope.$watch('loggedIn()', function (newVal, oldVal) {
        if (newVal) {
            notificationService.startLoadMessages();
        } else {
            notificationService.resetLoadMessages();
        }
    });
}];

module.exports = messageArenaCtrl;