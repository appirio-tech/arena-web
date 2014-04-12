'use strict';
// the directive for 'Time Countdown Widget'
var contestcountdown = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contest.countdown.html',
        controller: 'contestCountdownCtrl'
    };
}];
module.exports = contestcountdown;