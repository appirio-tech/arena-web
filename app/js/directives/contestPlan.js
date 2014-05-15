'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
// the directive for 'Active Contests Widget'
var contestPlan = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contestPlan.html',
        controller: 'contestPlanCtrl'
    };
}];
module.exports = contestPlan;