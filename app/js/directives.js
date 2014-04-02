'use strict';
var defaultOptions = {
        slideInput                      : true,
        labelStartTop                   : '',
        labelEndTop                     : '',
        transitionDuration              : 0.3,
        transitionEasing                : 'ease-in-out',
        labelClass                      : 'floating-label',
        typeMatches                     : /text|password|email|number|search|url/
    };

var directives = {};

directives.leaderboardusers = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/anon.leaderboard.users.html',
        controller: 'leaderboardUsersCtrl'
    };
}];

// define directives for widgets (e.g. 'Active Contests') here.
directives.activecontests = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contests.active.html',
        controller: 'activeContestsCtrl'
    };
}];

module.exports = directives;
