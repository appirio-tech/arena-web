'use strict';
/*global module, angular*/

var helper = require('../helper');

var activeContestsCtrl = ['$scope', '$rootScope',  '$http', 'socket', 'appHelper', function ($scope, $rootScope, $http, socket, appHelper) {
    var getPhase = function (contest, phaseTypeId) {
        var i;
        if (!contest.phases) {
            return null;
        }
        for (i = 0; i < contest.phases.length; i += 1) {
            if (contest.phases[i].phaseType === phaseTypeId) {
                return contest.phases[i];
            }
        }
        return null;
    },
        updateContest = function (contest) {
            contest.detailIndex = 1;
            contest.action = 'Register';
        },
        // show the active tab name when active contest widget is narrow
        tabNames = ['Contest Summary', 'Contest Schedule', 'My Status'];

    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.currentContest = 0;

    // Renders the TC TIME
    setInterval(function () {
        $rootScope.$apply(function () {
            $rootScope.now = new Date();
        });
    }, 1000);

    angular.forEach($rootScope.roundData, function (contest) {
        updateContest(contest);
    });

    // handle update round list response
    socket.on(helper.EVENT_NAME.UpdateRoundListResponse, function (data) {
        if (data.action === 1) {
            $rootScope.roundData[data.roundData.roundID] = data.roundData;
            updateContest($rootScope.roundData[data.roundData.roundID]);
        } else if (data.action === 2) {
            delete $rootScope.roundData[data.roundData.roundID];
        }
    });

    // handle round enable response
    socket.on(helper.EVENT_NAME.EnableRoundResponse, function (data) {
        $rootScope.roundData[data.roundID].action = 'Enter';
    });

    $scope.getContests = function () {
        var result = [];
        angular.forEach($rootScope.roundData, function (contest) {
            result.push(contest);
        });
        return result;
    };

    // Test whether registration phase is open
    $scope.isRegistrationOpen = function (contest) {
        if (!contest) {
            return false;
        }
        var phase = getPhase(contest, helper.PHASE_TYPE_ID.RegistrationPhase);
        if (!phase) {
            return false;
        }
        return phase.startTime <= $rootScope.now && $rootScope.now <= phase.endTime;
    };

    // sets the current contest for viewing
    $scope.setCurrentContest = function (newContest) {
        $scope.currentContest = newContest;
    };

    // gets the current action available
    $scope.getAction = function (contest) {
        return contest.action;
    };

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        // integrate with real service
        return contest;
    };

    // sets the tab index to view contest details
    $scope.setDetailIndex = function (contest, index) {
        if (index < 0 ||
                ($scope.isRegistrationOpen(contest) && index >= 2) ||
                (!$scope.isRegistrationOpen(contest) && index >= 3)) {
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
        return $scope.isRegistrationOpen(contest);
    };

    // Render the contest count down
    $scope.displayCountDown = function (contest) {
        if (!contest) {
            return '';
        }
        var phase, left, hours, minutes,
            displayHour = function (hours) {
                if (hours === 0) {
                    return '';
                }
                return hours + ' ' + (hours > 1 ? 'hours' : 'hour');
            },
            displayMinute = function (minutes) {
                return minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute');
            };
        phase = getPhase(contest, helper.PHASE_TYPE_ID.CodingPhase);
        if (!phase) {
            return '';
        }
        left = contest.phases[1].startTime - $rootScope.now;
        hours = Math.floor(left / 3600000);
        minutes = Math.floor(left % 3600000 / 60000);
        return displayHour(hours) + ' ' + displayMinute(minutes);
    };

    $scope.getTabName = function (index) {
        return index >= 0 && index < tabNames.length ? tabNames[index] : 'Click to show tabs';
    };
}];

module.exports = activeContestsCtrl;
