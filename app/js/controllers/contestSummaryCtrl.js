'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
var contestSummaryCtrl = ['$scope', '$state', '$http', function ($scope, $state, $http) {
    $scope.viewOn = 'room';
    // load contest data with contest id
    $scope.contest = {};
    $http.get('data/contest-' + $scope.roundID + '.json').
        success(function (data) {
            // set contest data
            $scope.contest = data;
            // broadcast contest-loaded message to child states.
            $scope.$broadcast('contest-loaded');
        });
    $scope.setViewOn = function (view) {
        $scope.viewOn = view;
    };
    $scope.getViewOnTitle = function () {
        if ($scope.viewOn === 'room') {return 'Room'; }
        if ($scope.viewOn === 'divOne') {return 'Division I'; }
        if ($scope.viewOn === 'divTwo') {return 'Division II'; }
    };
    $scope.viewDetail = function (contest) {
        $state.go('user.contestSummary', {contestId : contest.id, divisionId : $scope.divisionID, viewOn : $scope.viewOn});
    };
}];

module.exports = contestSummaryCtrl;