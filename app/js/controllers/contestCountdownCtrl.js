'use strict';

var contestCountdownCtrl = ['$scope', '$http', '$timeout', 'appHelper', function ($scope, $http, $timeout, appHelper) {
    // messages for different phases.
    var messages = [
        'Registration Phase will start in:',
        'Registration Phase will end in:',
        'Coding Phase will start in:',
        'Coding Phase will end in:',
        'Challenge Phase will start in:',
        'Challenge Phase will end in:',
        'Waiting for system tests to start.',
        'System tests are in process: ',
        'Contest is complete.'
    ];
    $scope.getPhaseMessage = function (contest) {
        if (!contest.phase) {
            return 'Loading...';
        }
        return contest.phase.id >= 0 && contest.phase.id <= 8 ? messages[contest.phase.id] : 'Unknown phase';
    };
    $scope.getCurrentPhase = function (contest) {
        var id = 0, i;
        for (i = 0; i < contest.schedule.length; i++) {
            if (!contest.schedule[i].startParsed) {
                break;
            }
            if (contest.schedule[i].startParsed > contest.tcCurrentTime) {
                return {id: id, time: contest.schedule[i].startParsed};
            }
            ++id;
            if (!contest.schedule[i].endParsed) {
                break;
            }
            if (contest.schedule[i].endParsed > contest.tcCurrentTime) {
                return {id: id, time: contest.schedule[i].endParsed};
            }
            ++id;
        }
        // when id >= 6, we have to check systest result
        if (contest.systestProgress === undefined && id < 7) {
            return {id: 6, time: contest.tcCurrentTime, percentage: ''};
        }
        if (id < 8 || contest.systestProgress < 100) {
            if (contest.systestProgress === undefined) {
                contest.systestProgress = 0;
            }
            return {id: 7, time: contest.tcCurrentTime, percentage: contest.systestProgress};
        }
        return {id: 8, time: contest.tcCurrentTime, percentage: contest.systestProgress};
    };

    $scope.startTimer = function () {
        var seconds = -1;
        if ($scope.contest && $scope.contest.phase && $scope.contest.phase.time) {
            // how many seconds between now and the phase end time
            seconds = ($scope.contest.phase.time - $scope.contest.tcCurrentTime) / 1000;
        }
        if (seconds > 0) {
            // set and start the timer, see angular-timer code for implementation details.
            $scope.$broadcast('timer-set-countdown', seconds);
            $scope.$broadcast('timer-start');
        } else {
            // if no timer can be set, update phase directly.
            $scope.updatePhase($scope.contest);
        }
    };

    $scope.$on('contest-loaded', function () {
        // parse dates into Date objects
        (function (contest) {
            var i;
            for (i = 0; i < contest.schedule.length; i++) {
                if (appHelper.isStringNotNullNorEmpty(contest.schedule[i].start)) {
                    contest.schedule[i].startParsed = appHelper.parseDate(contest.schedule[i].start);
                }
                if (appHelper.isStringNotNullNorEmpty(contest.schedule[i].end)) {
                    contest.schedule[i].endParsed = appHelper.parseDate(contest.schedule[i].end);
                }
            }
        }($scope.contest));
        $scope.contest.phase = $scope.getCurrentPhase($scope.contest);
        // when contest is loaded in the parent state, start counting down
        $scope.startTimer();
    });

    $scope.$on('timer-stopped', function () {
        // when the timer of the current phase is stopped, update the phase is possible.
        $scope.updatePhase($scope.contest);
    });

    // In the real app, we should talk to the server to retrieve real data.
    $scope.updatePhase = function (contest) {
        if (!contest.phase || contest.phase.id === undefined ||
                contest.phase.id < 0 || contest.phase.id >= 8) {
            return;
        }

        // increase tc current time by milliseconds, it is for demo only.
        var increaseCurrentTime = function (milliseconds) {
            contest.tcCurrentTime = new Date(contest.tcCurrentTime.getTime() + milliseconds);
        };

        // try to load the next phase data with AJAX
        var goToNextPhase = function () {
            // generate current phase based on time and systest progress
            contest.phase = $scope.getCurrentPhase(contest);
            $scope.$apply();
            if (contest.phase.id === 3) {
                // the new phase is coding phase, we can see problems!
                // In the real app, problems should be retrieved with real url.
                $http.get('data/problems.json').success(function (data) {
                    contest.problems = data;
                    $scope.startTimer();
                });
            } else {
                $scope.startTimer();
            }
        };

        if (contest.phase.id === 6) {
            // Current phase is 'Waiting for sys-test'.
            // Here we periodically check if the sys-test has started.
            // In the real app, we can ask for the signal to enter the sys-test phase
            // every few seconds.
            var timeLeft = 6000,
                waitForSysTest = function () {
                    timeLeft -= 2000;
                    if (timeLeft > 0) {
                        $timeout(waitForSysTest, 2000);
                    } else {
                        // go to next phase
                        // In the real app, load systest progress
                        contest.systestProgress = 0;
                        increaseCurrentTime(6000);
                        contest.schedule[3].startParsed = contest.tcCurrentTime;
                        goToNextPhase();
                    }
                };
            $timeout(waitForSysTest, 2000);
        } else if (contest.phase.id === 7) {
            // Current phase is 'System Test'.
            // In this demo, we periodically update the progress with a random number.
            var updateProgress = function () {
                var delta = 10;
                contest.phase.percentage = Math.min(100, contest.phase.percentage + delta * Math.random());
                contest.systestProgress = contest.phase.percentage;
                increaseCurrentTime(1000);
                if (contest.phase.percentage < 100) {
                    $timeout(updateProgress, 1000);
                } else {
                    contest.schedule[3].endParsed = contest.tcCurrentTime;
                    $timeout(goToNextPhase, 500);
                }
            };
            $timeout(updateProgress, 1000);
        } else {
            // In the real app, should sync server time
            contest.tcCurrentTime = contest.phase.time;
            goToNextPhase();
        }
    };
}];

module.exports = contestCountdownCtrl;