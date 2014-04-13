'use strict';
// the directive for 'Contest Stats Widget'
var conteststats = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contest.stats.html',
        controller: 'contestStatsCtrl'
    };
}];

module.exports = conteststats;