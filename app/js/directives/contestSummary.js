'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
// the directive for 'Summary Widget' in contest page
var contestSummary = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contest.summary.html',
        controller: 'contestSummaryCtrl'
    };
}];
module.exports = contestSummary;