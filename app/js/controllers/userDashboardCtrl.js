'use strict';

var userDashboardCtrl = ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $scope.notifications = [];
    $rootScope.notifications = [];
    $http.get('data/notifications.json').success(function (data) {
        $scope.notifications = data;
        $rootScope.notifications = data;
    });
}];

module.exports = userDashboardCtrl;