'use strict';
/*global module, angular*/
var activeContestsCtrl = ['$scope', '$rootScope', '$filter', '$http', 'appHelper', function ($scope, $rootScope, $filter, $http, appHelper) {
    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.currentContest = 0;
    angular.forEach($rootScope.roundData, function (contest) {
        contest.detailIndex = 1;
        contest.phases = [];
        angular.forEach($rootScope.roundSchedule[contest.roundID], function (phase) {
            var format = function (time) {
                    return $filter('date')(new Date(time), 'EEE MMM d, h:mm a') + ' ' + $rootScope.timezone;
                };
            phase.start = format(phase.startTime);
            phase.end = format(phase.endTime);
            if (phase.phaseType === 2) {
                phase.title = "Registration Phase";
            } else if (phase.phaseType === 4) {
                phase.title = "Coding Phase";
            } else if (phase.phaseType === 5) {
                phase.title = "Intermission Phase";
            } else if (phase.phaseType === 6) {
                phase.title = "Challenge Phase";
            } else if (phase.phaseType === 8) {
                phase.start = "";
                phase.title = "System Testing Phase";
            }
            contest.phases.push(phase);
        });
    });

    setInterval(function () {
        $rootScope.$apply(function () {
            $rootScope.now = new Date();
        });
    }, 1000);

    $scope.isRegistrantOpen = function (contest) {
        return $rootScope.now <= contest.phases[0].endTime;
    };

    // sets the current contest for viewing
    $scope.setCurrentContest = function (newContest) {
        $scope.currentContest = newContest;
    };

    // gets the current action available
    $scope.getAction = function (contest) {
        return $scope.isRegistrantOpen(contest) ? 'Register' : 'Enter';
    };

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        // integrate with real service
        return contest;
    };

    // sets the tab index to view contest details
    $scope.setDetailIndex = function (contest, index) {
        if (index < 0 ||
                ($scope.isRegistrantOpen(contest) && index >= 2) ||
                (!$scope.isRegistrantOpen(contest) && index >= 3)) {
            // invalid index for detail tabs
            return;
        }
        if (index === 2 && !contest.myStatus) {
            // if myStatus is not loaded, load it.
            // in the real app, contest id and user id should be sent.
            $http.get('data/my-status.json').success(function (data) {
                contest.myStatus = data;
            });
        }
        contest.detailIndex = index;
    };

    // Checks if it is counting down
    $scope.isCountingDown = function (contest) {
        return $scope.isRegistrantOpen(contest);
    };

    $scope.displayCountDown = function (contest) {
        var left = contest.phases[1].startTime - $rootScope.now,
            hours = Math.floor(left / 3600000),
            minutes = Math.floor(left % 3600000 / 60000),
            displayHour = function (hours) {
                if (hours === 0) {
                    return '';
                }
                return hours + ' ' + (hours > 1 ? 'hours' : 'hour');
            },
            displayMinute = function (minutes) {
                return minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute');
            };
        return displayHour(hours) + ' ' + displayMinute(minutes);
    };

    // show the active tab name when active contest widget is narrow
    var tabNames = ['Contest Summary', 'Contest Schedule', 'My Status'];
    $scope.getTabName = function (index) {
        return index >= 0 && index < tabNames.length ? tabNames[index] : 'Click to show tabs';
    };
}];

module.exports = activeContestsCtrl;
