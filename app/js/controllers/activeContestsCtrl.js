/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles coding editor related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Moved socket handler of RoomInfoResponse to resolver.js
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI Fix):
 * - Removed updating $rootScope.now and moved to tcTimeCtrl.
 *
 * @author amethystlei, dexy
 * @version 1.2
 */
'use strict';
/*global module, angular*/

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The controller for the active contests widget in the dashboard.
 *
 * @type {*[]}
 */
var activeContestsCtrl = ['$scope', '$rootScope', '$state', '$http', '$modal', 'socket', 'appHelper', function ($scope, $rootScope, $state, $http, $modal, socket, appHelper) {
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
            contest.action = (contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase
                            && contest.coderRooms.length > 0) ? 'Enter' : '';
        },
        // show the active tab name when active contest widget is narrow
        tabNames = ['Contest Summary', 'Contest Schedule', 'My Status'],
        popupModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', function ($scope, $modalInstance, data, ok) {
            $scope.title = data.title;
            $scope.message = data.message.replace(/(\r\n|\n|\r)/gm, "<br/>");
            $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
            $scope.ok = function () {
                ok();
                $modalInstance.close();
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }],
        openModal = function (data, handle) {
            return $modal.open({
                templateUrl: 'popupModal.html',
                controller: popupModalCtrl,
                resolve: {
                    data: function () {
                        return data;
                    },
                    ok: function () {
                        return handle;
                    }
                }
            });
        };

    $scope.getPhaseTime = appHelper.getPhaseTime;
    $scope.range = appHelper.range;
    $scope.currentContest = 0;

    /*jslint unparam:true*/
    $scope.$on(helper.EVENT_NAME.CreateRoomListResponse, function (event, data) {
        updateContest($rootScope.roundData[data.roundID]);
    });
    $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
        updateContest($rootScope.roundData[data.phaseData.roundID]);
    });
    /*jslint unparam:false*/
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

    $scope.isShown = function (contest) {
        if (contest.action !== 'Enter') {
            contest.action = $scope.isRegistrationOpen(contest) ? 'Register' : '';
        }
        return contest.action !== '';
    };

    // sets the current contest for viewing
    $scope.setCurrentContest = function (newContest) {
        $scope.currentContest = newContest;
    };

    // gets the current action available
    $scope.getAction = function (contest) {
        return contest.action;
    };

    socket.on(helper.EVENT_NAME.EnableRoundResponse, function (data) {
        angular.forEach($scope.contests, function (contest) {
            if (data.roundID === contest.id) {
                contest.action = 'Enter';
            }
        });
    });

    // action for 'Register' or 'Enter'
    $scope.doAction = function (contest) {
        var roundID = contest.roundID;
        $scope.okDisabled = true;
        // in the real app, we should perform real actions.
        if (contest.action === 'Enter') {
            // Get ready to handle RoomInfoResponse broadcasted from resolvers.js
            $scope.$on(helper.EVENT_NAME.RoomInfoResponse, function () {
                // clears the listeners for RoomInfoResponse
                $scope.$$listeners[helper.EVENT_NAME.RoomInfoResponse] = [];

                $scope.okDisabled = false;

                var divisionID = null;
                angular.forEach(contest.coderRooms, function (room) {
                    if (room.roomID === $rootScope.currentRoomInfo.roomID) {
                        divisionID = room.divisionID;
                    }
                });

                if (divisionID) {
                    $state.go('user.contest', {
                        contestId: contest.roundID,
                        divisionId: divisionID
                    });
                }
            });
            socket.emit(helper.EVENT_NAME.EnterRoundRequest, {roundID: roundID});
            socket.emit(helper.EVENT_NAME.EnterRequest, {roomID: -1});

            socket.remove(helper.EVENT_NAME.EndSyncResponse);
        } else {
            socket.emit(helper.EVENT_NAME.RegisterInfoRequest, {roundID: roundID});

            // show the popup
            socket.remove(helper.EVENT_NAME.PopUpGenericResponse);
            socket.on(helper.EVENT_NAME.PopUpGenericResponse, function (data) {
                var modalInstance = openModal(data, function () {

                    socket.emit(helper.EVENT_NAME.RegisterRequest, {roundID: roundID});
                    socket.remove(helper.EVENT_NAME.PopUpGenericResponse);
                    socket.on(helper.EVENT_NAME.PopUpGenericResponse, function (data) {
                        var innerModalInstance = openModal(data, null);
                        innerModalInstance.result.then(null, null);
                    });
                });
                modalInstance.result.then(function () {
                    contest.isRegistered = true;
                    $scope.setDetailIndex(contest, 2);
                }, function () {
                    contest.isRegistered = false;
                });
                $scope.okDisabled = false;
            });
        }
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

    // show the active tab name when active contest widget is narrow
    $scope.getTabName = function (index) {
        return index >= 0 && index < tabNames.length ? tabNames[index] : 'Click to show tabs';
    };
}];

module.exports = activeContestsCtrl;
