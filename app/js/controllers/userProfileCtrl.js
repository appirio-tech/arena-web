'use strict';

var userProfileCtrl = ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.alerts = [];

    //Pass success and failure functions for the promise
    //sessionHelper here is the service (see factories.js)
    //var userId = sessionHelper.getUserId();
    /* //call your API to get the user!
    //API here is the service called API (see factories.js)
    var user = API.User.get({id: userId},
        function () {
            //can do some validation here
        },
        function () {
            $timeout(function () {
                $scope.clearAlerts();
                $scope.alerts.push({type: "danger", msg: "There was a problem loading the data. Please refresh the page and try again."});
            }, 500);
        });
    $scope.user = user;
    */
    $scope.user = {
        name: 'John Smith',
        gender: 'male',
        nickname: 'johnnie',
        email: 'johnnie@domain.com'
    };

    $scope.updateProfile = function () {
        $scope.clearAlerts();

        //save your user!
        $scope.onSuccess(); //dummy success
        //user.$update({}, $scope.onSuccess, $scope.onFailure);
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.clearAlerts = function () {
        $scope.alerts = [];
    };

    $scope.$on('$viewContentLoaded',
        function () {
            $scope.clearAlerts();

            $timeout(function () {
                angular.element('input').trigger("change");
            }, 1000);
        });

    $scope.onSuccess = function () {
        $scope.alerts.push({type: "success", msg: "Saved Successfully!"});
        $timeout(function () {
            $scope.clearAlerts();
        }, 4000);
    };

    $scope.onFailure = function (data) {
        $scope.alerts.push({type: "danger", msg: data.data.error.details});
    };

    $scope.signTerms = function () {
        $scope.user.signedTerms = new Date();
        $scope.updateProfile();
    };

}];

module.exports = userProfileCtrl;