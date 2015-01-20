'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
// the directive for 'Live Scoring Widget'
var liveScoring = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/liveScoring.html',
        controller: 'liveScoringCtrl'
    };
}];
module.exports = liveScoring;
