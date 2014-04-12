'use strict';

var errorCtrl = ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.errDetail = $stateParams;
    console.log('error: ' + $scope.errDetail.description);
}];

module.exports = errorCtrl;