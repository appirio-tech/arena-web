'use strict';

var contestStatsCtrl = ['$scope', 'appHelper', function ($scope, appHelper) {
    var status = [
        'Registration Unopened', // 0 - before registration
        'Registration', // 1 - registration
        'Registration Closed', // 2 - after registration, before coding
        'Coding Phase', // 3 - coding
        'Intermission Phase', // 4 - after coding, before challenge
        'Challenge Phase', // 5 - challenge
        'Preparing for System Tests', // 6 - after challenge, before sys. test
        'System Tests', // 7 - sys. test
        'Contest Complete' // 8 - complete
    ];
    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.isContestStarted = function (phase) {
        if (phase === undefined || phase.id === undefined) {
            return -1;
        }
        return phase.id >= 3 ? 1 : 0;
    };
    $scope.isCodingPhase = function (phase) {
        return phase !== undefined && phase.id === 3;
    };
    $scope.isIntermissionPhase = function (phase) {
        return phase !== undefined && phase.id === 4;
    };
    $scope.isChallengePhase = function (phase) {
        return phase !== undefined && phase.id === 5;
    };
    $scope.isSystemTestPhase = function (phase) {
        return phase !== undefined && phase.id >= 6 && phase.id <= 7;
    };
    // get the current status
    $scope.getStatus = function (phase) {
        if (phase === undefined || phase.id < 0 || phase.id >= status.length) {
            return '';
        }
        return status[phase.id];
    };
}];

module.exports = contestStatsCtrl;