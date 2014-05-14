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
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to resolve required data for pages that contain chat widgets.
 * - Added handlers for chat-related responses.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - System Tests):
 * - Updated the handler of SystestProgressResponse to display progress with percentage.
 * - Added handler for SingleBroadcastResponse to display single broadcast response.
 *
 * @author amethystlei, dexy
 * @version 1.5
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
var connectionTimeout = config.connectionTimeout || 25000;

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
                $state.go(helper.STATE_NAME.AnonymousHome);
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
    $rootScope.loginTimeout = false;
    // if the listener is not ready, redirect
    setTimeout(function () {
        if (angular.isUndefined($rootScope.isLoggedIn)) {
            $rootScope.$apply(function(){
                $rootScope.loginTimeout = true;
            });
            return forceLogout();
        }
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

    /**
     * Handle room info response.
     * Logics for chat rooms are implemented here
     * as the data should be updated even when the user is in coding/leaderboard pages.
     */
    socket.on(helper.EVENT_NAME.RoomInfoResponse, function (data) {
        $rootScope.currentRoomInfo = data;
        if ($rootScope.currentRoomInfo.roomType === helper.ROOM_TYPE_ID.LobbyRoom) {
            $rootScope.lobbyID = $rootScope.currentRoomInfo.roomID;
        } else if ($rootScope.currentRoomInfo.roomType === helper.ROOM_TYPE_ID.CoderRoom) {
            $rootScope.competingRoomID = $rootScope.currentRoomInfo.roomID;
        }
    });

    /**
     * Handle create user list response.
     * Logics for chat rooms are implemented here
     * as the data should be prepared before entering the chat room or
     * even when the user is in coding/leaderboard pages.
     */
    socket.on(helper.EVENT_NAME.CreateUserListResponse, function (data) {
        var i;
        $rootScope.whosHereArray = [];
        for (i = 0; i < data.names.length; i += 1) {
            $rootScope.whosHereArray.push({
                name: data.names[i],
                userListItem: data.userListItems[i],
                rating: data.ratings[i]
            });
        }
        $rootScope.$broadcast('rebuild:whosHere');
        $rootScope.$broadcast('rebuild:members');
    });

    /**
     * Handle create menu response.
     * Logics for chat rooms are implemented here
     * as the data should be prepared before entering the chat room or
     * even when the user is in coding/leaderboard pages.
     */
    socket.on(helper.EVENT_NAME.CreateMenuResponse, function (data) {
        if (data.type === helper.MENU_TYPE_ID.LobbyMenu) {
            var i;
            $rootScope.lobbyMenu = {};
            for (i = 0; i < data.names.length; i += 1) {
                $rootScope.lobbyMenu[data.ids[i]] = {
                    roomTitle: data.names[i],
                    roomID: data.ids[i],
                    roomType: helper.ROOM_TYPE_ID.LobbyRoom
                };
            }
        }
    });

    /**
     * handle register response.
     */
    socket.on(helper.EVENT_NAME.RegisteredUsersResponse, function (data) {
        $rootScope.roundData[data.roundID].registrants = data.userListItems;
    });

    /**
     * Update user list in the chat room.
     * Logics for chat rooms are implemented here
     * as the data should be prepared before entering the chat room or
     * even when the user is in coding/leaderboard pages.
     */
    socket.on(helper.EVENT_NAME.UpdateUserListResponse, function (data) {
        var hasUserFlag = false,
            i;
        if (data.roomID === $rootScope.currentRoomInfo.roomID && data.type === helper.USER_LIST.RoomUsers) {
            for (i = 0; i < $rootScope.whosHereArray.length; i += 1) {
                if ($rootScope.whosHereArray[i].name === data.userListItem.userName) {
                    hasUserFlag = true;
                    if (data.action === helper.USER_LIST_UPDATE.Remove) {
                        $rootScope.whosHereArray.splice(i, 1);
                        if ($rootScope.memberIdx === i) {
                            $rootScope.memberIdx = null;
                        }
                    }
                }
            }
            if (!hasUserFlag && data.action === helper.USER_LIST_UPDATE.Add) {
                $rootScope.whosHereArray.push({
                    name: data.userListItem.userName,
                    userListItem: data.userListItem,
                    rating: data.userListItem.userRating
                });
            }
            $rootScope.$broadcast('rebuild:whosHere');
            $rootScope.$broadcast('rebuild:members');
        }
    });

    socket.remove(helper.EVENT_NAME.UpdateChatResponse);
    // update chat content
    socket.on(helper.EVENT_NAME.UpdateChatResponse, function (data) {
        /**
         * Get the chat type for font display.
         *
         * @param {string} typeID the type ID
         * @return {string} the CSS class for fonts
         */
        function getChatType(typeID) {
            switch (typeID) {
            case helper.CHAT_TYPES.UserChat:
                return 'general';
            case helper.CHAT_TYPES.SystemChat:
                return 'system';
            case helper.CHAT_TYPES.EmphSystemChat:
                return 'emph system';
            case helper.CHAT_TYPES.IrcChat:
                return 'secret';
            case helper.CHAT_TYPES.WhisperToYouChat:
                return 'secret toMe';
            }
            return '';
        }

        $rootScope.chatScope = data.scope;
        var user = data.data.split(':')[0];
        if (user === $rootScope.username()) {
            $rootScope.chatContent.push({
                userRating: data.rating,
                prefix: data.prefix,
                text: data.data,
                type: 'toMe'
            });
        } else {
            $rootScope.chatContent.push({
                userRating: data.rating,
                prefix: data.prefix,
                text: data.data,
                type: getChatType(data.type)
            });
        }
        $rootScope.$broadcast('rebuild:chatboard');
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

    // handle the end sync response for initialization when logging in
    socket.on(helper.EVENT_NAME.EndSyncResponse, function (data) {
        $rootScope.startSyncResponse = false;
        if (data.requestId !== requestId) {
            return forceLogout();
        }
        socket.remove(helper.EVENT_NAME.EndSyncResponse);
        // go to dashboard page
        deferred = $q.defer();
        deferred.promise.then(function () {
            $state.go(helper.STATE_NAME.Dashboard);
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
        // display as percentage instead of '0/0'
        $rootScope.roundData[data.roundID].systestProgress =
            data.total === data.done ? '100.00%' : (data.done * 100.0 / data.total).toFixed(2) + '%';
    });

    // handle registrated user response
    socket.on(helper.EVENT_NAME.RegisteredUsersResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.RegisteredUsersResponse, data);
    });

    // handle popup generic response
    socket.remove(helper.EVENT_NAME.PopUpGenericResponse);
    socket.on(helper.EVENT_NAME.PopUpGenericResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.PopUpGenericResponse, data);
    });

    // handle single broadcast response
    socket.remove(helper.EVENT_NAME.SingleBroadcastResponse);
    socket.on(helper.EVENT_NAME.SingleBroadcastResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.SingleBroadcastResponse, data);
    });

    // request login
    socket.emit(helper.EVENT_NAME.SSOLoginRequest, {sso: sso});

    // handle forced logout
    socket.on(helper.EVENT_NAME.ForcedLogoutResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.ForcedLogoutResponse, data);
    });
}];

/**
 * The resolver for entering lobby room.
 *
 * @type {*[]}
 */
resolvers.enterLobbyRoom = ['$q', 'socket', '$rootScope', function ($q, socket, $rootScope) {
    var deferred = $q.defer(),
        requestId = null;

    // handle end-sync response
    socket.on(helper.EVENT_NAME.EndSyncResponse, function (data) {
        socket.remove(helper.EVENT_NAME.EndSyncResponse);
        if (requestId === data.requestId) {
            $rootScope.isEnteringRoom = true;
            deferred.resolve();
        }
    });

    // handle start-sync response
    socket.on(helper.EVENT_NAME.StartSyncResponse, function (data) {
        socket.remove(helper.EVENT_NAME.StartSyncResponse);
        requestId = data.requestId;
    });

    if (angular.isDefined($rootScope.lobbyID) && $rootScope.lobbyID > -1) {
        if (!angular.isDefined($rootScope.currentRoomInfo) || $rootScope.currentRoomInfo.roomID !== $rootScope.lobbyID) {
            socket.emit(helper.EVENT_NAME.MoveRequest, {
                moveType: $rootScope.lobbyMenu[$rootScope.lobbyID].roomType,
                roomID: $rootScope.lobbyID
            });
        } else {
            // no need to change room, enter room directly
            $rootScope.isEnteringRoom = false;
            deferred.resolve();
        }
    } else {
        // no previous lobby, send default MoveRequest
        socket.emit(helper.EVENT_NAME.MoveRequest, {moveType: 3, roomID: -1});
    }
    return deferred.promise;
}];

/**
 * The resolver for entering competing room.
 *
 * @type {*[]}
 */
resolvers.enterCompetingRoom = ['$q', 'socket', '$rootScope', '$stateParams', function ($q, socket, $rootScope, $stateParams) {
    var deferred = $q.defer(),
        requestId = null;

    // handle end-sync response
    socket.on(helper.EVENT_NAME.EndSyncResponse, function (data) {
        socket.remove(helper.EVENT_NAME.EndSyncResponse);
        if (requestId === data.requestId) {
            $rootScope.isEnteringRoom = true;
            deferred.resolve();
        }
    });

    // handle start-sync response
    socket.on(helper.EVENT_NAME.StartSyncResponse, function (data) {
        socket.remove(helper.EVENT_NAME.StartSyncResponse);
        requestId = data.requestId;
    });

    if (angular.isDefined($rootScope.competingRoomID) && $rootScope.competingRoomID > -1) {
        if (!angular.isDefined($rootScope.currentRoomInfo) || $rootScope.currentRoomInfo.roomID !== $rootScope.competingRoomID) {
            socket.emit(helper.EVENT_NAME.MoveRequest, {
                moveType: $rootScope.roomData[$rootScope.competingRoomID].roomType,
                roomID: $rootScope.competingRoomID
            });
        } else {
            // no need to change room, enter room directly
            $rootScope.isEnteringRoom = false;
            deferred.resolve();
        }
    } else {
        socket.emit(helper.EVENT_NAME.EnterRoundRequest, {roundID: Number($stateParams.contestId)});
    }
    return deferred.promise;
}];

//This function checks if there is already a sso cookie
resolvers.alreadyLoggedIn = ['$q', '$state', 'sessionHelper', function ($q, $state, sessionHelper) {
    var deferred = $q.defer();
    deferred.promise.then(function () {
        if (sessionHelper.isLoggedIn()) {
            $state.go(helper.STATE_NAME.LoggingIn);
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
        $state.go(helper.STATE_NAME.AnonymousHome);
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
