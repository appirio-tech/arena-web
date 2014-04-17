'use strict';
/*global module*/
var activeContestsCtrl = ['$scope', '$state', '$http', 'appHelper', function ($scope, $state, $http, appHelper) {
    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.contests = [];
    $scope.currentContest = 0;
    // replace with real URL to retrieve active contests data.
    $http.get('data/active-contests.json').success(function (data) {
        data.forEach(function (contest) {
            contest.detailIndex = 1;
            $scope.contests.push(contest);
        });
    });

    // sets the current contest for viewing
    $scope.setCurrentContest = function (newContest) {
        $scope.currentContest = newContest;
    };

    // gets the current action available
    $scope.getAction = function (contest) {
        return contest.isRegistered ? 'Enter' : 'Register';
    };

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        // in the real app, we should perform real actions.
        if (contest.isRegistered) {
            // the button is 'Enter'
            $state.go('user.contest', {contestId: contest.id});
        } else {
            // the button is 'Register'
            contest.isRegistered = true;
            $scope.setDetailIndex(contest, 2);
        }
    };

    // sets the tab index to view contest details
    $scope.setDetailIndex = function (contest, index) {
        if (index < 0 ||
                (!contest.isRegistered && index >= 2) ||
                (contest.isRegistered && index >= 3)) {
            // invalid index for detail tabs
            return;
        }
        if (index === 2 && !contest.myStatus) {
            // if myStatus is not loaded, load it.
            // in the real app, contest id and user id should be sent.
            $http.get('data/my-status.json').success(function (data) {
                contest.myStatus = data;
            });
        }
        contest.detailIndex = index;
    };

    // Checks if it is counting down
    $scope.isCountingDown = function (contest) {
        return appHelper.isStringNotNullNorEmpty(contest.countdown);
    };

    // show the active tab name when active contest widget is narrow
    var tabNames = ['Contest Summary', 'Contest Schedule', 'My Status'];
    $scope.getTabName = function (index) {
        return index >= 0 && index < tabNames.length ? tabNames[index] : 'Click to show tabs';
    };
}];

module.exports = activeContestsCtrl;