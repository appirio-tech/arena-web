/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This is the resolver.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Updated CreateProblemsResponse handler to move problems into rounds.
 * - Added getCurrentTCTime to get TC time.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Added CreateChallengeTableResponse handler to initialize the room summary page.
 * - Added UpdateCoderPointsResponse and UpdateCoderComponentResponse handlers to update room summary page.
 * - Updated to handle RoomInfoResponse
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI Fix):
 * - Added tcTimeService to the list of parameters.
 * - Added startSyncResponse to the scope to indicate if sync responses have started.
 * - Added connectionID to the rootScope needed for sync time requests.
 * - Updated SynchTimeResponse handler to use time service to update TC time.
 * - Added ForcedLogoutResponse handler to handle forced logout.
 * - Removed getCurrentTCTime from $rootScope.
 *
 * @author amethystlei, dexy
 * @version 1.3
 */
///////////////
// RESOLVERS //
'use strict';
/*global module, angular*/

var config = require('./config');
var helper = require('./helper');
/**
 * Represents the timeout of establishing socket connection.
 *
 * @type {number}
 */
var connectionTimeout = 25000;

/**
 * Represents the date format for TC TIME
 *
 * @type {string}
 */
var DATE_FORMAT = 'EEE MMM d, h:mm a';

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$rootScope', '$q', '$state', '$filter', 'cookies', 'sessionHelper', 'socket', 'tcTimeService', function ($rootScope, $q, $state, $filter, cookies, sessionHelper, socket, tcTimeService) {
    var deferred, sso = sessionHelper.getTcsso(), requestId,
        forceLogout = function () {
            $rootScope.isLoggedIn = false;
            sessionHelper.clear();
            sessionHelper.removeTcsso();

            // defer the logout promise
            deferred = $q.defer();
            deferred.promise.then(function () {
                $state.go('anon.home');
            });
            deferred.resolve();
            return deferred.promise;
        },
        /**
         * Update the coder placement.
         *
         * @param {Array} coders
         */
        updateCoderPlacement = function (coders) {
            coders.forEach(function (item) {
                item.roomPlace = 1;
                coders.forEach(function (other) {
                    if (item.userName !== other.userName && item.totalPoints < other.totalPoints) {
                        item.roomPlace += 1;
                    }
                });
            });
        };
    // if the listener is not ready, redirect
    setTimeout(function () {
        if (!$rootScope.connected) {
            return forceLogout();
        }
    }, connectionTimeout);
    // handle the start sync response
    socket.on(helper.EVENT_NAME.StartSyncResponse, function (data) {
        requestId = data.requestId;
        $rootScope.startSyncResponse = true;
    });
    // handle the login response
    socket.on(helper.EVENT_NAME.LoginResponse, function (data) {
        if (data.success) {
            // if success logged in, restore sso to session
            $rootScope.isLoggedIn = true;
            if (sessionHelper.getRemember()) {
                cookies.set(config.ssoKey, sso, -1);
                sessionHelper.clearRemember();
            }
            $rootScope.connectionID = data.connectionID;
        } else {
            // if fail to log in, remove sso
            $rootScope.isLoggedIn = false;
            sessionHelper.removeTcsso();
        }
    });

    // handle the user info response
    socket.on(helper.EVENT_NAME.UserInfoResponse, function (data) {
        // persist userInfo in session
        sessionHelper.persist({userInfo: data.userInfo});
    });

    // handle the create round list response
    socket.on(helper.EVENT_NAME.CreateRoundListResponse, function (data) {
        if (data.type === 2) { // only cares about active contests
            if (!$rootScope.roundData) {
                $rootScope.roundData = {};
            }
            angular.forEach(data.roundData, function (contest) {
                $rootScope.roundData[contest.roundID] = contest;
            });
        }
    });

    // handle the round schedule response
    socket.on(helper.EVENT_NAME.RoundScheduleResponse, function (data) {
        // restore values
        $rootScope.roundData[data.roundID].phases = [];
        angular.forEach(data.schedule, function (phase) {
            var format = function (time) {
                return $filter('date')(new Date(time), DATE_FORMAT) + ' ' + $rootScope.timezone;
            };
            phase.start = format(phase.startTime);
            phase.end = format(phase.endTime);
            phase.title = helper.PHASE_NAME[phase.phaseType];
            if (phase.phaseType === helper.PHASE_TYPE_ID.SystemTestingPhase) {
                // System Testing Phase
                phase.start = "";
            }
            $rootScope.roundData[data.roundID].phases.push(phase);
        });
    });

    // handle the create problems response
    socket.on(helper.EVENT_NAME.CreateProblemsResponse, function (data) {
        // move it to $rootScope.roundData as problems are associated with round
        if (angular.isDefined($rootScope.roundData[data.roundID])) {
            if (angular.isUndefined($rootScope.roundData[data.roundID].problems)) {
                $rootScope.roundData[data.roundID].problems = {};
            }
            $rootScope.roundData[data.roundID].problems[data.divisionID] = data.problems;
        }
    });

    // handle the keep alive initialization data response
    socket.on(helper.EVENT_NAME.KeepAliveInitializationDataResponse, function (data) {
        $rootScope.keepAliveTimeout = parseInt(data.timeout, 10);
        // handle the keep alive response
        socket.on(helper.EVENT_NAME.KeepAliveResponse, function () {
            console.log('Keep alive responded.');
        });
    });

    // handle the sync time response
    socket.on(helper.EVENT_NAME.SynchTimeResponse, function (data) {
        tcTimeService.setTimeTC(data.time);
        $rootScope.now = tcTimeService.getTime();
    });

    socket.on(helper.EVENT_NAME.RoomInfoResponse, function (data) {
        $rootScope.currentRoomInfo = data;
        $rootScope.$broadcast(helper.EVENT_NAME.RoomInfoResponse);
    });

    // handle create room list response
    socket.on(helper.EVENT_NAME.CreateRoomListResponse, function (data) {
        if ($rootScope.roundData[data.roundID]) {
            if (data.adminRoom) {
                $rootScope.roundData[data.roundID].adminRoom = data.adminRoom;
            }
            $rootScope.roundData[data.roundID].coderRooms = data.coderRooms;
        }
        $rootScope.$broadcast(helper.EVENT_NAME.CreateRoomListResponse, data);
    });

    // Handle create challenge table response.
    // This response initializes the room summary table.
    socket.on(helper.EVENT_NAME.CreateChallengeTableResponse, function (data) {
        if (!angular.isDefined($rootScope.roomData)) {
            $rootScope.roomData = {};
        }
        $rootScope.roomData[data.roomID] = data;
        updateCoderPlacement($rootScope.roomData[data.roomID].coders);
    });

    // handle update coder points response
    socket.on(helper.EVENT_NAME.UpdateCoderPointsResponse, function (data) {
        if (data.roomID < 0) {
            return;
        }
        angular.forEach($rootScope.roomData[data.roomID].coders, function (coder) {
            if (coder.userName === data.coderHandle) {
                // update the total points of the coder
                coder.totalPoints = data.points;
            }
        });
        updateCoderPlacement($rootScope.roomData[data.roomID].coders);
    });

    // handle update coder component response
    socket.on(helper.EVENT_NAME.UpdateCoderComponentResponse, function (data) {
        if (data.roomID < 0) {
            return;
        }
        angular.forEach($rootScope.roomData[data.roomID].coders, function (coder) {
            if (coder.userName === data.coderHandle) {
                angular.forEach(coder.components, function (component) {
                    if (component.componentID === data.component.componentID) {
                        // update the component by copying fields from data.
                        angular.extend(component, data.component);
                    }
                });
            }
        });
        updateCoderPlacement($rootScope.roomData[data.roomID].coders);
    });

    // handle the end sync response
    socket.on(helper.EVENT_NAME.EndSyncResponse, function (data) {
        $rootScope.startSyncResponse = false;
        if (data.requestId !== requestId) {
            return forceLogout();
        }
        // go to dashboard page
        deferred = $q.defer();
        deferred.promise.then(function () {
            $state.go('user.dashboard');
        });
        deferred.resolve();
        return deferred.promise;
    });

    // handle phase data response
    socket.on(helper.EVENT_NAME.PhaseDataResponse, function (data) {
        $rootScope.roundData[data.phaseData.roundID].phaseData = data.phaseData;
        $rootScope.$broadcast(helper.EVENT_NAME.PhaseDataResponse, data);
    });

    // handle system test progress response
    socket.on(helper.EVENT_NAME.SystestProgressResponse, function (data) {
        $rootScope.roundData[data.roundID].systestProgress = data.done + '/' + data.total;
    });

    // request login
    socket.emit(helper.EVENT_NAME.SSOLoginRequest, {sso: sso});

    // handle forced logout
    socket.on(helper.EVENT_NAME.ForcedLogoutResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.ForcedLogoutResponse, data);
    });
}];

//This function checks if there is already a sso cookie
resolvers.alreadyLoggedIn = ['$q', '$state', 'sessionHelper', function ($q, $state, sessionHelper) {
    var deferred = $q.defer();
    deferred.promise.then(function () {
        if (sessionHelper.isLoggedIn()) {
            $state.go('loggingin');
        }
    });
    deferred.resolve();
    return deferred.promise;
}];

resolvers.logout = ['$rootScope', '$q', '$state', 'sessionHelper', 'socket', function ($rootScope, $q, $state, sessionHelper, socket) {
    $rootScope.isLoggedIn = false;
    sessionHelper.clear();
    sessionHelper.removeTcsso();
    socket.emit(helper.EVENT_NAME.LogoutRequest, {});

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go('anon.home');
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
