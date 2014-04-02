'use strict';
/*global $ : false, Auth0 : false, angular : false */
var controllers = {};

controllers.anonHomeCtrl = ['$scope', '$state', 'sessionHelper', function ($scope, $state, sessionHelper) {
    // whether the login has error
    $scope.hasError = false;
    $scope.username = '';
    $scope.password = '';

    $scope.accountLogin = function () {
        //creds below would be a parameter for this function
        //auth0.login(mapCreds(creds), errCb);
        $scope.hasError = false;
        var $usernameError = $scope.accountLoginForm.username.$error,
            $passwordError = $scope.accountLoginForm.password.$error;
        if ($usernameError.required || $usernameError.pattern) {
            $scope.username = '';
            $scope.hasError = true;
        }
        if ($passwordError.required || $passwordError.pattern) {
            $scope.password = '';
            $scope.hasError = true;
        }

        if (!$scope.hasError) {
            sessionHelper.username = $scope.username;
            $state.go('loggingin');
        }
    };

    $scope.socialLogin = function () {
        //In real app you would do something like:
        //auth0.login({connection: connection});
        //where connection is the parameter for this function
        sessionHelper.username = 'long_username_5555';
        $state.go('loggingin');
    };

    $scope.accountSignup = function () {
        //creds below would be a parameter for this function
        //auth0.signup(mapCreds(creds), errCb);
        sessionHelper.username = 'long_username_5555';
        $state.go('loggingin');
    };

}];

controllers.errorCtrl = ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.errDetail = $stateParams;
    console.log('error: ' + $scope.errDetail.description);
}];

controllers.userProfileCtrl = ['$scope', '$timeout', function ($scope, $timeout) {

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

controllers.leaderboardUsersCtrl = ['$scope', function ($scope) {
    //query your api for the leaderboard
    //$scope.users = API.Users.query({});
    $scope.users = [
        {id: 1, handle: 'doc', rating: 1800},
        {id: 2, handle: 'merry', rating: 1900},
        {id: 3, handle: 'dopey', rating: 600},
        {id: 4, handle: 'sneezy', rating: 1000}
    ];
}];

controllers.activeContestsCtrl = ['$scope', '$http', function ($scope, $http) {
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

controllers.userDashboardCtrl = ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $scope.notifications = [];
    $rootScope.notifications = [];
    $http.get('data/notifications.json').success(function (data) {
        $scope.notifications = data;
        $rootScope.notifications = data;
    });
}];

module.exports = controllers;
