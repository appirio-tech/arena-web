/*jshint -W097*/
/*jshint strict:false*/
'use strict';
/*global module*/
// the directive for 'leaderboard widget'
var leaderboard = [function () {
    /*jslint unparam:false*/
    return {
        restrict: 'A',
        templateUrl: 'partials/leaderboard.html',
        controller: 'leaderboardCtrl',
        link: function (scope, element, attrs, chatCtrl) {
            /*jslint unparam:true*/
            scope.attrs = attrs;
        }
    };
}];
module.exports = leaderboard;