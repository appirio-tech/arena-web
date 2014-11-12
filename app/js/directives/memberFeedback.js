'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
// the directive for 'Active Contests Widget'
var memberFeedback = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/memberFeedback.html',
        controller: 'memberFeedbackCtrl'
    };
}];
module.exports = memberFeedback;