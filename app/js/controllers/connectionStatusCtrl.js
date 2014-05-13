'use strict';

var connectionStatusCtrl = ['$scope', 'connectionService', function ($scope, connectionService) {
    $scope.connectionService = connectionService;
}];

module.exports = connectionStatusCtrl;