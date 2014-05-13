'use strict';
// the directive for the connection status
var connectionstatus = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.connection.html',
        controller: 'connectionStatusCtrl'
    };
}];
module.exports = connectionstatus;