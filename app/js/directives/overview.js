'use strict';
// the directive for the profile overview and important messages widget
var overview = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.overview.html',
        controller: 'overviewCtrl'
    };
}];
module.exports = overview;