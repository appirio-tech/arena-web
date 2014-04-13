'use strict';
// the directive for 'Active Contests Widget'
var activecontests = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contests.active.html',
        controller: 'activeContestsCtrl'
    };
}];
module.exports = activecontests;