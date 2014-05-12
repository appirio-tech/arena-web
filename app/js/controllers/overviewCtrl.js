'use strict';

var overviewCtrl = ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $scope.showSection = "overview";
    $scope.userProfile = {};
    $http.get('data/profile-' + $rootScope.username() + '.json').success(function (data) {
        $scope.userProfile = data;
    });
    $scope.isInt = function (value) {
       return !isNaN(value) && parseInt(value) == value;
    }
    $scope.getUserColor = function () {
        if ($scope.userProfile.isAdmin) {
            return 'orange';
        }
        return $scope.getRatingColor();
    }
    $scope.getRatingColor = function () {
        if (!$scope.isInt($scope.userProfile.rating) || $scope.userProfile.rating <= 0) {
            return 'white';
        }
        if ($scope.userProfile.rating < 900) {
            return 'gray';
        }
        if ($scope.userProfile.rating < 1200) {
            return 'green';
        }
        if ($scope.userProfile.rating < 1500) {
            return 'purple';
        }
        if ($scope.userProfile.rating < 2200) {
            return 'yellow';
        }
        return 'red';
    };
}];

module.exports = overviewCtrl;