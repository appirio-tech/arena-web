/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
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
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Removed weekly information from date format (DATE_FORMAT).
 * - Updated the handler of RoundScheduleResponse to use $rootScope.timeZone instead of $rootScope.timezone.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Division Summary):
 * - Added $broadcast to the $rootScope of CreateChallengeTableResponse and
 *   UpdateCoderComponentResponse events.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Hyphenated chat text to break correctly in chat widget
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Handled re-connect logic.
 * - Sorted the chat user list.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena UI - Rooms Tab):
 *  - Sets rooms data for rooms tab.
 *  - Sets the currentRoomInfo while changed the room.
 *
 * Changes in version 1.11 (Module Assembly - Web Arena UI - Notifications):
 * - Added notificationService to finishLogin.
 * - Update PhaseDataResponse handling to add notifications.
 * - Removed out previous SingleBroadcastResponse handling and added new one.
 * - Added handlers for GetAdminBroadcastResponse and ImportantMessageResponse.
 *
 * Changes in version 1.12 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Handled the html links in chat content.
 *
 * Changes in version 1.13 (Module Assembly - Web Arena UI - Challenges and Challengers):
 * - Added logic to support challenges and challengers table.
 *
 * Changes in version 1.14 (Module Assembly - Dashboard - Active Users and Leaderboard Panel):
 * - Updated the logic in CreateLeaderBoardResponse, UpdateLeaderBoardResponse and CreateUserListResponse.
 *
 * Changes in version 1.15 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Added set / get / clear data for local storage.
 *
 * Changes in version 1.16 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the broadcast message format.
 * - Fixed some JSLint format in other projects.
 *
 * Changes in version 1.17 (PoC Assembly - Web Arena - Chat Widget Improvement):
 * - Added user entering / leaving room icon logic.
 *
 * Changes in version 1.18 (Module Assembly - Web Arena - Quick Fixes for Contest Management)
 * - Added handling of ChangeRoundResponse, CommandSucceededResponse, CommandFailedResponse
 *   and RoundAccessResponse events.
 *
 * Changes in version 1.19 (Web Arena Plugin API Part 1):
 * - Added plugin logic for global and editor events.
 *
 * Changes in version 1.20 (Web Arena Plugin API Part 2):
 * - Added plugin logic to trigger events.
 *
 * Changes in version 1.21 (Web Arena SRM Problem Deep Link Assembly):
 * - Updated enterCompetingRoom resolver to accommodate user.coding state as well
 *
 * Changes in version 1.22 (Module Assembly - Web Arena - Setting Panel for Chat Widget):
 * - Added the logic for chat setting and shown time in chat message.
 *
 * Changes in version 1.23 (TopCoder Competition Engine - Improve Automated Notification Messages)
 * - Updated phase change notifications to match with arena applet
 *
 * Changes in version 1.24 (Web Arena - Recovery From Lost Connection)
 * - Added forwardAfterReconnected() method.
 *
 * Changes in version 1.25 (Replace ng-scrollbar with prefect-scrollbar):
 * - Fix to support the perfect-scrollbar
 *
 * @author amethystlei, dexy, ananthhh, flytoj2ee, xjtufreeman
 * @version 1.25
 */
///////////////
// RESOLVERS //
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global require, setTimeout, console, module, angular, document*/

var config = require('./config');
var helper = require('./helper');
require('./server_newrelic');
/**
 * Represents the timeout of establishing socket connection.
 *
 * @type {number}
 */
var connectionTimeout = Number(config.connectionTimeout || 25000);
/**
 * Represents the member photo host.
 *
 * @type {string}
 */
var memberPhotoHost = config.memberPhotoHost || 'http://apps.topcoder.com';
/**
 * Represents the date format for TC TIME
 *
 * @type {string}
 */
var DATE_FORMAT = 'MMM d, h:mm a';

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$rootScope', '$q', '$state', '$filter', 'cookies', 'sessionHelper', 'socket', 'tcTimeService', 'notificationService', 'appHelper', '$timeout', function ($rootScope, $q, $state, $filter, cookies, sessionHelper, socket, tcTimeService, notificationService, appHelper, $timeout) {
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
    // No need to start again if user already logged in
    if ($rootScope.isLoggedIn) {
        // go to dashboard page
        deferred = $q.defer();
        deferred.promise.then(function () {
            $state.go(helper.STATE_NAME.Dashboard);
        });
        deferred.resolve();
        return deferred.promise;
    }
    $rootScope.loginTimeout = false;
    // if the listener is not ready, redirect
    var checkLoginTimeOut = function () {
        if (angular.isUndefined($rootScope.isLoggedIn)) {
            var inactivityInterval = new Date().getTime() - $rootScope.lastServerActivityTime;
            if (inactivityInterval >= connectionTimeout) {
                $rootScope.$apply(function () {
                    $rootScope.loginTimeout = true;
                });
                return forceLogout();
            }
            $timeout(checkLoginTimeOut, connectionTimeout);
        }
    };
    checkLoginTimeOut();

    // handle the start sync response
    socket.on(helper.EVENT_NAME.StartSyncResponse, function (data) {
        requestId = data.requestId;
        $rootScope.startSyncResponse = true;
    });


    /**
     * Forward the page after reconnected.
     */
    function forwardAfterReconnected() {
        if ($rootScope.reconnected) {
            $rootScope.reconnected = false;
            var currentStateName = $rootScope.currentStateName(),
                params = $rootScope.currentState().params,
                stateName,
                stateData;

            if (currentStateName === helper.STATE_NAME.DefaultContest || currentStateName === helper.STATE_NAME.Contest) {
                stateName = currentStateName;
                stateData = {contestId: params.contestId};
            } else if (currentStateName === helper.STATE_NAME.Member) {
                stateName = currentStateName;
                stateData = {
                    memberName: params.memberName
                };
            } else if (currentStateName === helper.STATE_NAME.PracticeCode) {
                stateName = currentStateName;
                stateData = {
                    roundId : params.roundId,
                    componentId : params.componentId,
                    divisionId : params.divisionId,
                    roomId : params.roomId
                };
            } else if (currentStateName === helper.STATE_NAME.Coding) {
                $rootScope.competingRoomID = -1;
                stateName = currentStateName;
                stateData = {
                    roundId : params.roundId,
                    problemId : params.problemId,
                    divisionId : params.divisionId
                };
            } else if (currentStateName === helper.STATE_NAME.Anonymous || currentStateName === helper.STATE_NAME.AnonymousHome
                || currentStateName === helper.STATE_NAME.LoggingIn || currentStateName === helper.STATE_NAME.Logout) {
                stateName = currentStateName;
                stateData = {};
            } else {
                stateName = helper.STATE_NAME.Dashboard;
                stateData = {};
            }

            $timeout(function () {
                $rootScope.loginPendingCount = 0;
                $state.go(stateName, stateData, {reload: true});
            }, helper.LOGIN_WAITING_TIME);
        }
    }

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
            $rootScope.connected = true;

            forwardAfterReconnected();
        } else {
            // if fail to log in, remove sso
            $rootScope.isLoggedIn = false;
            sessionHelper.removeTcsso();
        }
    });

    // handle the user info response
    socket.on(helper.EVENT_NAME.UserInfoResponse, function (data) {
        //set member photo
        if (angular.isUndefined(data.userInfo.avatar) || data.userInfo.avatar === '') {
            data.userInfo.avatar = memberPhotoHost + '/i/m/nophoto_login.gif';
        } else {
            data.userInfo.avatar = memberPhotoHost + data.userInfo.avatar;
        }
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
        if (data.type === 1) { // practice rooms
            if (!$rootScope.practiceRoundData) {
                $rootScope.practiceRoundData = {};
            }
            angular.forEach(data.roundData, function (contest) {
                $rootScope.practiceRoundData[contest.roundID] = contest;
            });
        }
    });

    // handle the round schedule response
    socket.on(helper.EVENT_NAME.RoundScheduleResponse, function (data) {
        // restore values
        $rootScope.roundData[data.roundID].phases = [];
        angular.forEach(data.schedule, function (phase) {
            var format = function (time) {
                return $filter('date')(new Date(time), DATE_FORMAT) + ' ' + $rootScope.timeZone;
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

        appHelper.getLocalStorage($rootScope.currentRoomInfo.roomID);
        $rootScope.$broadcast(helper.EVENT_NAME.RoomInfoResponse);

        appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.roomChanged, data);
    });

    // Handle the CreateLeaderBoardResponse event.
    socket.on(helper.EVENT_NAME.CreateLeaderBoardResponse, function (data) {
        if (!$rootScope.leaderBoardRoundData) {
            $rootScope.leaderBoardRoundData = [];
        }
        // it should replace the existing one
        var existFlag = false, i;
        for (i = 0; i < $rootScope.leaderBoardRoundData.length; i++) {
            if ($rootScope.leaderBoardRoundData[i].roundID === data.roundID) {
                $rootScope.leaderBoardRoundData[i] = data;
                existFlag = true;
                break;
            }
        }
        if (!existFlag) {
            $rootScope.leaderBoardRoundData.push(data);
        }

        $rootScope.$broadcast('rebuild:leaderBoardMethods');
        $rootScope.$broadcast('rebuild:leaderBoardLeaders');
    });

    // handle UpdateLeaderBoardResponse event.
    socket.on(helper.EVENT_NAME.UpdateLeaderBoardResponse, function (data) {
        if (!$rootScope.leaderBoardRoundData) {
            $rootScope.leaderBoardRoundData = [];
        }
        var existFlag = false, i, j, items;
        for (i = 0; i < $rootScope.leaderBoardRoundData.length; i++) {
            if ($rootScope.leaderBoardRoundData[i].roundID === data.roundID) {
                if ($rootScope.leaderBoardRoundData[i].items) {
                    for (j = 0; j < $rootScope.leaderBoardRoundData[i].items.length; j++) {
                        if ($rootScope.leaderBoardRoundData[i].items[j].roomID === data.item.roomID) {
                            $rootScope.leaderBoardRoundData[i].items[j] = data.item;
                            break;
                        }
                    }
                } else {
                    $rootScope.leaderBoardRoundData[i].items = [];
                    $rootScope.leaderBoardRoundData[i].items.push(data.item);
                }
                existFlag = true;
                break;
            }
        }

        if (!existFlag) {
            items = [];
            items.push(data.item);
            $rootScope.leaderBoardRoundData.push({roundID: data.roundID, items: items});
        }

        appHelper.triggerPluginLeaderBoardEvent(helper.PLUGIN_LEADER_BOARD_EVENT.changed, data.roundID, data);

        $rootScope.$broadcast('rebuild:leaderBoardMethods');
        $rootScope.$broadcast('rebuild:leaderBoardLeaders');
    });

    /**
     * Handle create user list response.
     *
     * If the data type is room users, logic for chat rooms are implemented here
     * as the data should be prepared before entering the chat room or
     * even when the user is in coding/leaderboard pages.
     *
     * If data type is active users, it's for active users panel in dashboard.
     */
    socket.on(helper.EVENT_NAME.CreateUserListResponse, function (data) {
        if (data.type === helper.CREATE_USER_LIST_RESPONSE_TYPE.ACTIVE_USERS) {
            $rootScope.activeUsers = data.userListItems;
            $rootScope.activeUserCount = $rootScope.activeUsers.length;
            $rootScope.$broadcast('rebuild:activeUser');
            $rootScope.isLoadingActiveUsersData = false;
        } else if (data.type === helper.CREATE_USER_LIST_RESPONSE_TYPE.ROOM_USERS) {
            $rootScope.userEnteringIcons = {};
            $rootScope.userLeavingIcons = {};
            var i, tmpArray = [];
            $rootScope.whosHereArray = [];
            for (i = 0; i < data.names.length; i += 1) {
                if ($rootScope.userLeavingTimeouts && $rootScope.userLeavingTimeouts[data.names[i]]) {
                    $timeout.cancel($rootScope.userLeavingTimeouts[data.names[i]]);
                    $rootScope.userLeavingTimeouts[data.names[i]] = null;
                }

                if ($rootScope.userEnteringTimeouts && $rootScope.userEnteringTimeouts[data.names[i]]) {
                    $timeout.cancel($rootScope.userEnteringTimeouts[data.names[i]]);
                    $rootScope.userEnteringTimeouts[data.names[i]] = null;
                }
                tmpArray.push({name: data.names[i],
                    userListItem: data.userListItems[i],
                    rating: data.ratings[i]});
            }

            tmpArray = tmpArray.sort(
                function (a, b) {
                    var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                    if (nameA < nameB) {//sort string ascending
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                }
            );
            $rootScope.whosHereArray = tmpArray;
            $rootScope.whosHereArrayFullList = tmpArray;
            $rootScope.$broadcast('rebuild:whosHere');
            $rootScope.$broadcast('rebuild:members');
        }
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
     * Calculate the challengers data.
     * @param roomID - the room id.
     */
    function calculateChallengers(roomID) {
        $rootScope.calculatedChallengers = [];
        var index = 0, tmp, success, foundIndex, i, j;

        for (i = 0; i < $rootScope.challenges[roomID].length; i++) {
            $rootScope.challenges[roomID][i].id = i + 1;

            tmp = null;
            foundIndex = 0;
            for (j = 0; j < $rootScope.calculatedChallengers.length; j++) {
                if ($rootScope.calculatedChallengers[j].challengerHandle === $rootScope.challenges[roomID][i].challengerHandle) {
                    tmp = $rootScope.calculatedChallengers[j];
                    foundIndex = j;
                    break;
                }
            }
            if (tmp === null) {
                success = $rootScope.challenges[roomID][i].success === true ? 1 : 0;
                tmp = {
                    id: index + 1,
                    challengerHandle: $rootScope.challenges[roomID][i].challengerHandle,
                    challengerUserType: $rootScope.challenges[roomID][i].challengerUserType,
                    challengerRating: $rootScope.challenges[roomID][i].challengerRating,
                    success: success,
                    total: 1,
                    points: $rootScope.challenges[roomID][i].points,
                    rate: parseInt((success * 100.0).toFixed(0), 10)
                };
                index = index + 1;
                $rootScope.calculatedChallengers.push(tmp);
            } else {
                success = ($rootScope.challenges[roomID][i].success === true ? 1 : 0) + tmp.success;
                tmp.success = success;
                tmp.total = tmp.total + 1;
                tmp.rate = parseInt(((success * 100.0 / tmp.total).toFixed(0)), 10);
                tmp.points = tmp.points + $rootScope.challenges[roomID][i].points;
                $rootScope.calculatedChallengers[foundIndex] = tmp;
            }
        }
    }

    // Handle the ChallengesListResponse.
    socket.on(helper.EVENT_NAME.ChallengesListResponse, function (data) {
        var i, j;
        if (!$rootScope.challenges) {
            $rootScope.challenges = [];
        }

        if ($rootScope.roomData && $rootScope.roomData[data.roomID] && $rootScope.roomData[data.roomID].coders) {
            for (i = 0; i < data.challenges.length; i++) {
                data.challenges[i].language = helper.LANGUAGE_NAME[data.challenges[i].language];
                for (j = 0; j < $rootScope.roomData[data.roomID].coders.length; j++) {
                    if (data.challenges[i].challengerHandle === $rootScope.roomData[data.roomID].coders[j].userName) {
                        data.challenges[i].challengerRating = $rootScope.roomData[data.roomID].coders[j].userRating;
                        data.challenges[i].challengerUserType = $rootScope.roomData[data.roomID].coders[j].userType;
                    }
                    if (data.challenges[i].defenderHandle === $rootScope.roomData[data.roomID].coders[j].userName) {
                        data.challenges[i].defenderRating = $rootScope.roomData[data.roomID].coders[j].userRating;
                        data.challenges[i].defenderUserType = $rootScope.roomData[data.roomID].coders[j].userType;
                    }
                }
            }
        }

        $rootScope.challenges[data.roomID] = data.challenges;
        calculateChallengers(data.roomID);
        $rootScope.$broadcast('rebuild:challengeTable');
        $rootScope.$broadcast('rebuild:challengerTable');
    });


    // Handle ChallengeResponse
    socket.on(helper.EVENT_NAME.ChallengeResponse, function (data) {
        if (!$rootScope.challenges) {
            $rootScope.challenges = [];
        }

        data.challenge.language = helper.LANGUAGE_NAME[data.challenge.language];

        $rootScope.challenges[data.roomID].push(data.challenge);
        calculateChallengers(data.roomID);
        $rootScope.$broadcast('rebuild:challengeTable');
        $rootScope.$broadcast('rebuild:challengerTable');

    });

    /**
     * Remove user from whosHereArray.
     * @param name - the user name.
     */
    function removeUserFromList(name) {
        var timeoutInstance = $timeout(function () {
            var i;
            for (i = 0; i < $rootScope.whosHereArray.length; i += 1) {
                if ($rootScope.whosHereArray[i].name === name) {
                    $rootScope.whosHereArray.splice(i, 1);
                    if ($rootScope.memberIdx === name) {
                        $rootScope.memberIdx = null;
                    }
                }
            }

            $rootScope.whosHereArrayFullList = $rootScope.whosHereArray;

            $rootScope.$broadcast('rebuild:whosHere');
            $rootScope.$broadcast('rebuild:members');
        }, config.chatIconDisappearTime);

        if (!$rootScope.userLeavingTimeouts) {
            $rootScope.userLeavingTimeouts = {};
        }
        $rootScope.userLeavingTimeouts[name] = timeoutInstance;
    }

    /**
     * Update user list in the chat room.
     * Logics for chat rooms are implemented here
     * as the data should be prepared before entering the chat room or
     * even when the user is in coding/leaderboard pages.
     */
    socket.on(helper.EVENT_NAME.UpdateUserListResponse, function (data) {
        var hasUserFlag = false,
            i,
            tmpArray,
            timeoutInstance;

        if (data.roomID === $rootScope.currentRoomInfo.roomID && data.type === helper.USER_LIST.RoomUsers) {
            // something changed, cancel all timer now.
            if ($rootScope.userLeavingTimeouts && $rootScope.userLeavingTimeouts[data.userListItem.userName]) {
                $timeout.cancel($rootScope.userLeavingTimeouts[data.userListItem.userName]);
                $rootScope.userLeavingTimeouts[data.userListItem.userName] = null;
            }

            if ($rootScope.userEnteringTimeouts && $rootScope.userEnteringTimeouts[data.userListItem.userName]) {
                $timeout.cancel($rootScope.userEnteringTimeouts[data.userListItem.userName]);
                $rootScope.userEnteringTimeouts[data.userListItem.userName] = null;
            }

            // Init the show / hide icon object
            if (!$rootScope.userEnteringIcons) {
                $rootScope.userEnteringIcons = {};
            }
            if (!$rootScope.userLeavingIcons) {
                $rootScope.userLeavingIcons = {};
            }

            if (data.action === helper.USER_LIST_UPDATE.Add) {
                // show entering icon
                $rootScope.userLeavingIcons[data.userListItem.userName] = false;
                $rootScope.userEnteringIcons[data.userListItem.userName] = true;

                // set time out to hide entering icon
                timeoutInstance = $timeout(function () {
                    $rootScope.userEnteringIcons[data.userListItem.userName] = false;
                }, config.chatIconDisappearTime);

                // cache entering timer
                if (!$rootScope.userEnteringTimeouts) {
                    $rootScope.userEnteringTimeouts = {};
                }
                $rootScope.userEnteringTimeouts[data.userListItem.userName] = timeoutInstance;
            }

            if (data.action === helper.USER_LIST_UPDATE.Remove) {
                // show leaving icon
                $rootScope.userEnteringIcons[data.userListItem.userName] = false;
                $rootScope.userLeavingIcons[data.userListItem.userName] = true;
                removeUserFromList(data.userListItem.userName);
            }

            for (i = 0; i < $rootScope.whosHereArray.length; i += 1) {
                if ($rootScope.whosHereArray[i].name === data.userListItem.userName) {
                    hasUserFlag = true;
                    break;
                }
            }

            if (!hasUserFlag && data.action === helper.USER_LIST_UPDATE.Add) {

                tmpArray = $rootScope.whosHereArray;

                tmpArray.push({
                    name: data.userListItem.userName,
                    userListItem: data.userListItem,
                    rating: data.userListItem.userRating
                });

                tmpArray = tmpArray.sort(
                    function (a, b) {
                        var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                        if (nameA < nameB) {//sort string ascending
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    }
                );
                $rootScope.whosHereArray = tmpArray;
            }

            $rootScope.whosHereArrayFullList = $rootScope.whosHereArray;
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

        if (data.type === helper.CHAT_TYPES.SystemChat && data.data && (data.data.indexOf('has left the room.') !== -1
            || data.data.indexOf('has entered the room.') !== -1 || data.data.indexOf('has logged out.') !== -1)) {
            //skip the entering and leaving message
            $rootScope.$broadcast('rebuild:chatboard');
            return;
        }

        var str = '', roomId = data.roomID + str, links = [], user = '', splitData = '', index = data.data.indexOf(': '),
            allLinks, linksArray, i, j, flag, tmp, chatSound;
        if (!$rootScope.chatContent) {
            $rootScope.chatContent = {};
        }
        if (!$rootScope.chatContent[roomId]) {
            $rootScope.chatContent[roomId] = [];
        }

        if (index !== -1) {
            user = data.data.substring(0, index);
            splitData = data.data.substring(index + 1);
        } else {
            splitData = data.data;
        }

        if (splitData.length > 1) {
            allLinks = splitData;
            if (allLinks.length > 1) {
                allLinks = allLinks.substring(0, allLinks.length - 1);
            }
            linksArray = allLinks.split(' ');

            for (i = 0; i < linksArray.length; i++) {
                if (linksArray[i].toLowerCase().indexOf('http://') === 0 ||
                        linksArray[i].toLowerCase().indexOf('https://') === 0) {
                    flag = false;
                    for (j = 0; j < links.length; j++) {
                        if (links[j] === linksArray[i]) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        links.push(linksArray[i]);
                    }

                }
            }
        }

        if (user === $rootScope.username()) {
            tmp = {
                userRating: data.rating,
                prefix: data.prefix,
                text: data.data,
                hasLink: links.length !== 0,
                links: links,
                type: 'toMe',
                time: new Date()
            };
        } else {
            tmp = {
                userRating: data.rating,
                prefix: data.prefix,
                text: data.data,
                hasLink: links.length !== 0,
                links: links,
                type: getChatType(data.type),
                time: new Date()
            };
        }

        if (appHelper.getChatSettingFromLocalStorage(helper.LOCAL_STORAGE.CHAT_SETTING_CHAT)) {
            $rootScope.chatContent[roomId].push(tmp);
        }

        if (appHelper.getChatSettingFromLocalStorage(helper.LOCAL_STORAGE.CHAT_SETTING_CHAT)
                && appHelper.getChatSettingFromLocalStorage(helper.LOCAL_STORAGE.CHAT_SETTING_HISTORY)) {
            appHelper.setLocalStorage(roomId, tmp);
        }

        if ($rootScope.chatContent[roomId].length > Number(config.chatLength)) {
            $rootScope.chatContent[roomId].shift();
        }

        appHelper.triggerPluginRoomEvent(helper.PLUGIN_ROOMS_EVENT.chatMessageReceived, roomId, data);

        if ((data.type === helper.CHAT_TYPES.WhisperToYouChat || user === $rootScope.username())
                && appHelper.getChatSettingFromLocalStorage(helper.LOCAL_STORAGE.CHAT_SETTING_SOUNDS)) {
            chatSound = document.getElementById('chatSound');
            if (chatSound) {
                chatSound.load();
                chatSound.play();
            }
        }
        $rootScope.$broadcast('rebuild:chatboard');
        $rootScope.$broadcast('chatboardScrollToBottom');
    });

    // handle create room list response
    socket.on(helper.EVENT_NAME.CreateRoomListResponse, function (data) {
        if ($rootScope.roundData[data.roundID]) {
            if (data.adminRoom) {
                $rootScope.roundData[data.roundID].adminRoom = data.adminRoom;
            }
            $rootScope.roundData[data.roundID].coderRooms = data.coderRooms;

            if (!angular.isDefined($rootScope.roomData)) {
                $rootScope.roomData = {};
            }
            angular.forEach(data.coderRooms, function (room) {
                $rootScope.roomData[room.roomID] = room;
            });
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
        $rootScope.$broadcast(helper.EVENT_NAME.CreateChallengeTableResponse, data);
    });

    // handle update coder points response
    socket.on(helper.EVENT_NAME.UpdateCoderPointsResponse, function (data) {
        if (data.roomID < 0) {
            return;
        }
        var roundId = null;
        angular.forEach($rootScope.roomData[data.roomID].coders, function (coder) {
            if (coder.userName === data.coderHandle) {
                // update the total points of the coder
                coder.totalPoints = data.points;
            }
        });
        updateCoderPlacement($rootScope.roomData[data.roomID].coders);
        $rootScope.$broadcast(helper.EVENT_NAME.UpdateCoderPointsResponse, data);
        angular.forEach($rootScope.roundData, function (contest) {
            if (contest.coderRooms) {
                angular.forEach(contest.coderRooms, function (room) {
                    if (room.roomID === data.roomID) {
                        roundId = contest.roundID;
                    }
                });
            }
        });

        if (roundId !== null) {
            appHelper.triggerPluginLeaderBoardEvent(helper.PLUGIN_LEADER_BOARD_EVENT.changed, roundId, data);
        }
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
        $rootScope.$broadcast(helper.EVENT_NAME.UpdateCoderComponentResponse, data);
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
        /**
         * Format the time frame message for the given phase data.
         *
         * @param  {Object}  phaseData          the phase data
         * @param  {Number}  now                the current time in milliseconds
         * @return {string}                     the formatted string
         */
        function formatTimeFrameMessage(phaseData, now) {
            /**
             * Format the time given in milliseconds.
             *
             * @param  {Number} timeInMs the time given in milliseconds
             * @return {string}          the formatted time
             */
            function formattedTime(timeInMs) {
                return $filter('date')(timeInMs, helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone;
            }
            // Represents the phase names.
            var messages = [
                'Inactive Phase',
                'Starts In Phase',
                'Registration is now open',
                'Registration is closed',
                'Coding Phase has started',
                'Coding Phase has ended',
                'Challenge Phase has started',
                'Challenge Phase has ended',
                'System Test Phase has started'
            ],
                msg = helper.PHASE_NAME[data.phaseData.phaseType];

            // Match has completed.
            if (phaseData.phaseType === helper.PHASE_TYPE_ID.ContestCompletePhase) {
                return 'Match completed at ' + formattedTime(now);
            }
            // The next phase is the Registration Phase
            if (phaseData.phaseType === helper.PHASE_TYPE_ID.StartsInPhase) {
                return 'Registration will open at ' + formattedTime(data.phaseData.endTime) + '.';
            }
            if (phaseData.phaseType > helper.PHASE_TYPE_ID.StartsInPhase && phaseData.phaseType < helper.PHASE_TYPE_ID.ContestCompletePhase) {
                return messages[phaseData.phaseType];
            }
            if (data.phaseData.startTime > 0) {
                // has 'started at' message
                msg += ' started at ' + formattedTime(data.phaseData.startTime);
            } else {
                return msg + ' started at ' + formattedTime(now);
            }

            // Only if the ending time can be scheduled.
            if (data.phaseData.endTime > 0 &&
                    phaseData.phaseType >= helper.PHASE_TYPE_ID.RegistrationPhase &&
                    phaseData.phaseType <= helper.PHASE_TYPE_ID.ChallengePhase) {
                msg += ' and ends at ' + formattedTime(data.phaseData.endTime);
            }
            return msg + '.';
        }
        var now = Date.now();
        if ($rootScope.roundData[data.phaseData.roundID]) {
            $rootScope.roundData[data.phaseData.roundID].phaseData = data.phaseData;
            $rootScope.$broadcast(helper.EVENT_NAME.PhaseDataResponse, data);
            if (data.phaseData.phaseType === helper.PHASE_TYPE_ID.ContestCompletePhase) {
                // Handled at popup generic response in baseCtrl
                return;
            }
            notificationService.addNotificationMessage({
                type: 'round',
                time: now,
                roundName: $rootScope.roundData[data.phaseData.roundID].contestName,
                message: $rootScope.roundData[data.phaseData.roundID].contestName + ': ' +
                    formatTimeFrameMessage(data.phaseData, now),
                popUpContent: $rootScope.roundData[data.phaseData.roundID].contestName + ': ' +
                    formatTimeFrameMessage(data.phaseData, now)
            });
        }

        appHelper.triggerPluginMatchEvent(helper.PLUGIN_MATCHES_EVENT.phaseChanged, data.phaseData.roundID, data.phaseData);

        if (data.phaseData.phaseType === helper.PHASE_TYPE_ID.CodingPhase) {
            appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.codingStart, data.phaseData);
        } else if (data.phaseData.phaseType === helper.PHASE_TYPE_ID.IntermissionPhase) {
            appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.codingEnd, data.phaseData);
        }
    });

    // handle system test progress response
    socket.on(helper.EVENT_NAME.SystestProgressResponse, function (data) {
        appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.systemTestEnd, data);
        if ($rootScope.roundData[data.roundID]) {
            // display as percentage instead of '0/0'
            $rootScope.roundData[data.roundID].systestProgress =
                data.total === data.done ? '100.00%' : (data.done * 100.0 / data.total).toFixed(2) + '%';
        }
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

    // handle single broadcast
    socket.on(helper.EVENT_NAME.SingleBroadcastResponse, function (data) {
        data.broadcast.popUpContent = data.broadcast.message;
        notificationService.addNotificationMessage(data.broadcast);
        appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.systemBroadcastReceived, data);
    });

    // request login
    socket.emit(helper.EVENT_NAME.SSOLoginRequest, {sso: sso});

    // handle forced logout
    socket.on(helper.EVENT_NAME.ForcedLogoutResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.ForcedLogoutResponse, data);
    });

    /// handle admin broadcasts
    socket.on(helper.EVENT_NAME.GetAdminBroadcastResponse, function (data) {
        angular.forEach(data.broadcasts, function (broadcast) {
            broadcast.popUpContent = broadcast.message;
            notificationService.addNotificationMessage(broadcast);
        });

        appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.systemBroadcastReceived, data);
    });

    // handle important messages
    socket.on(helper.EVENT_NAME.ImportantMessageResponse, function (data) {
        notificationService.addNotificationMessage({
            type: 'general',
            time: Date.now(),
            message: data.text,
            popUpContent: data.text
        });
        appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.systemBroadcastReceived, data);
    });

    // handle change round response
    socket.on(helper.EVENT_NAME.ChangeRoundResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.ChangeRoundResponse, data);
    });

    // handle command succeeded response
    socket.on(helper.EVENT_NAME.CommandSucceededResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.CommandSucceededResponse, data);
    });
    // handle command failed response
    socket.on(helper.EVENT_NAME.CommandFailedResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.CommandFailedResponse, data);
    });


    // handle round access response
    socket.on(helper.EVENT_NAME.RoundAccessResponse, function (data) {
        $rootScope.$broadcast(helper.EVENT_NAME.RoundAccessResponse, data);
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
        requestId = null,
        contestId = angular.isDefined($stateParams.contestId) ? $stateParams.contestId : $stateParams.roundId;

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
        $rootScope.currentRoomInfo.roomID = $rootScope.competingRoomID;
        socket.emit(helper.EVENT_NAME.MoveRequest, {
            moveType: $rootScope.roomData[$rootScope.competingRoomID].roomType,
            roomID: $rootScope.competingRoomID
        });
    } else {
        socket.emit(helper.EVENT_NAME.EnterRoundRequest, {roundID: Number(contestId)});
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

resolvers.logout = ['$rootScope', '$q', '$state', 'sessionHelper', 'socket', 'appHelper', function ($rootScope, $q, $state, sessionHelper, socket, appHelper) {
    $rootScope.isLoggedIn = false;
    sessionHelper.clear();
    sessionHelper.removeTcsso();
    socket.emit(helper.EVENT_NAME.LogoutRequest, {});

    appHelper.clearLocalStorage();

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go(helper.STATE_NAME.AnonymousHome);
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
