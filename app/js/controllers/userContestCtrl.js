'use strict';

var userContestCtrl = ['$scope', '$http', '$rootScope', '$stateParams', '$state', 'appHelper',
    function ($scope, $http, $rootScope, $stateParams, $state, appHelper) {
        // load contest data with contest id
        $scope.contest = {};
        $http.get('data/contest-' + $stateParams.contestId + '.json').
            success(function (data) {
                // set contest data
                $scope.contest = data;
                $scope.contest.tcCurrentTime = appHelper.parseDate(data.tcCurrentTime);
                // set page title
                $state.current.data.pageTitle = $scope.contest.name;
                $state.current.data.pageMetaKeywords = $scope.contest.name + ",contest";
                // broadcast contest-loaded message to child states.
                $scope.$broadcast('contest-loaded');
            });
    }];

module.exports = userContestCtrl;