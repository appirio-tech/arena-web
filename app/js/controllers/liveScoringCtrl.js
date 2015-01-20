'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global angular, $, module, console*/
// Live Scoring Widget

var config = require('../config');

var liveScoringCtrl = ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

    // Score computing routine
    function computeSubmissionPoints(currentTime, pointVal, codingLength, numSubmissions, openTime) {
        if (openTime > 0) {
            var elapsedTime = currentTime - openTime;
            var newPointVal = pointVal * (0.3 + 0.7 / (10.0 * Math.pow(elapsedTime / codingLength, 2.0) + 1));

            if (newPointVal > 0 && numSubmissions > 0) {
                var maxPenalty = pointVal * 3 / 10;
                var newPenalizedPointValue = newPointVal - ((pointVal * 0.1) * numSubmissions);

                if (newPenalizedPointValue < maxPenalty) {
                    newPointVal = maxPenalty;
                } else {
                    newPointVal = newPenalizedPointValue;
                }
            }
            return Math.round(newPointVal);
        } else {
            console.log('Invalid input data');
            return 0;
        }
    }

    // Auto update score routine
    function updateScore() {
        var scoringData = $scope.scoringData,
            elapsedMillis = Number(new Date()) - scoringData.localOpenTime;

        scoringData.score = computeSubmissionPoints(Number(new Date()), scoringData.problemPoint,
            scoringData.codingLength, scoringData.numSubmissions, scoringData.localOpenTime);
        scoringData.elapsedTime = new Date(0,0,0,0,0, elapsedMillis / 1000);
        scoringData.elapsedPercent = Math.min(elapsedMillis / scoringData.codingLength, 1) * 100;
    }

    var timer;

    $scope.minimized = true;
    $scope.toggleMinimized = function () {
        $scope.minimized = !$scope.minimized;
    };

    $http.get('/data/live-scoring.json').success(function (data) {
        $scope.scoringData = {
            localOpenTime: data.openTime - data.currentTime + Number(new Date()),
            problemPoint: data.problemPoint,
            codingLength: data.codingLength,
            numSubmissions: data.numSubmissions,
            currentScore: data.currentScore
        };

        updateScore();
        // Turn on score auto update
        timer = $interval(updateScore, 1000);
    });

    // Destroy auto update when widget removed from DOM
    $scope.$on('$destroy', function () {
        $interval.cancel(timer);
    });
}];

module.exports = liveScoringCtrl;
