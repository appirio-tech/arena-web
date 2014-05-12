'use strict';
// the directive for the TC time
var topcodertime = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.tctime.html',
        controller: 'tcTimeCtrl'
    };
}];
module.exports = topcodertime;