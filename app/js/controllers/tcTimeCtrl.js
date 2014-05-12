'use strict';

var tcTimeCtrl = ['$scope', '$timeout', 'tcTimeService', function ($scope, $timeout, tcTimeService) {
	// update time every second
	$scope.updateTime = function () {
		$scope.serverTime = tcTimeService.getTime();
		$timeout($scope.updateTime, 1000);
	};
	$scope.updateTime();
}];

module.exports = tcTimeCtrl;