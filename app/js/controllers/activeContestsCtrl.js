'use strict';

var activeContestsCtrl = ['$scope', '$http', '$state', function ($scope, $http, $state) {
    var isStringNotNullNorEmpty = function (s) {
        return s && s.length > 0;
    };

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
        if (contest.isRegistered) {
            return 'Enter';
        }
        return 'Register';
    };

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        // in the real app, we should perform real actions.
        if (contest.isRegistered) {
            // TODO: temporarily used for testing coding arena page.
            $state.go('user.coding', {problemId : 1001});
            return;
        }
        contest.isRegistered = true;
        $scope.setDetailIndex(contest, 2);
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

    // Gets the phase time for display.
    // Usually we have start time and end time.
    // When start time is not available, end time should take its place.
    $scope.getPhaseTime = function (phase, id) {
        if (id === 0) {
            if (isStringNotNullNorEmpty(phase.start)) {
                return {key: 'Start in', value: phase.start};
            }
            if (isStringNotNullNorEmpty(phase.end)) {
                return {key: 'End in', value: phase.end};
            }
        } else if (id === 1) {
            if (isStringNotNullNorEmpty(phase.start) &&
                    isStringNotNullNorEmpty(phase.end)) {
                return {key: 'End in', value: phase.end};
            }
        }
        return {key: '', value: ''};
    };

    // Checks if it is counting down
    $scope.isCountingDown = function (contest) {
        return isStringNotNullNorEmpty(contest.countdown);
    };

    // return an empty array of fixed length
    $scope.range = function (num) {
        return new [].constructor(num);
    };
}];

module.exports = activeContestsCtrl;