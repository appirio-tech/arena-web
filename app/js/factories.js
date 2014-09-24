/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provide some global services.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 1):
 * - Added getUserPreferences method.
 * - Added remove listener function to socket.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI Fix):
 * - Added helper.
 * - Some small changes to pass jslint.
 * - Added $rootScope, $timeout and socket to tcTimeService, and removed $http and appHelper.
 * - Updated tcTimeService to sync time with TC server.
 * - Removed $http from connectionService, updated it to handle disconnection event.
 * - Added getUserInfo to helper to retrieve complete user profile.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated present and past phrases for verbs in appHelper.getPhaseTime.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Division Summary)
 * - Updated appHelper to include isDivisionActive.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Added new method 'hyphenate' to apphelper factory, to break long word in chat widget
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Notifications):
 * - Removed $timeout, $http from notificationService.
 * - Removed the demo code and put real data handling in notificationService.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Added setUserLanguagePreference() method.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Added logic to set / get / clear data in local storage.
 *
 * @author tangzx, dexy, amethystlei, ananthhh, flytoj2ee
 * @version 1.8
 */
'use strict';
var config = require('./config');
var Auth0 = require('auth0-js');
var socket = require('socket.io-client').connect(config.webSocketURL);
/*jshint -W097*/
/*global $ : false, angular : false, require, module, document*/
/*jslint plusplus: true*/

var helper = require('./helper');
///////////////
// FACTORIES //

var factories = {};

factories.notificationService = ['$rootScope', '$filter', function ($rootScope, $filter) {
    var service = {
        notifications: [],
        unRead: 0,
        pastNotifications: []
    },
        sameMessage = function (msgA, msgB) {
            return msgA.date === msgB.date && msgA.type === msgB.type && msgA.message === msgB.message
                && ((!angular.isDefined(msgA.action) && !angular.isDefined(msgB.action))
                    || (angular.isDefined(msgA.action) && angular.isDefined(msgB.action)
                        && msgA.action.question === msgB.action.question && msgA.action.target === msgB.action.target));
        },
        /**
         * Formats the broadcat message into HTML format suitable for pop-up.
         *
         * @param message the notification which needs to be formatted into HTML
         * @return {string} the HTML content of the formatted message
         */
        formatMessage = function (message) {
            if (message.type === 'general') {
                return "<div class = 'notificationPopup'>"
                        + "<div>Broadcast information</div>"
                        + "<table>"
                        + "<tr><td><p>Time: <span>" + message.date + "</span></p></td></tr>"
                        + "</table>"
                        + "<div>Broadcast Message</div>"
                        + "<p><span>" + message.popUpContent + "</span></p>"
                        + "</div>";
            }
            if (message.type === 'round') {
                return "<div class = 'notificationPopup'>"
                        + "<div>Broadcast information</div>"
                        + "<table>"
                        + "<tr><td><p>Time: <span>" + message.date + "</span></p></td></tr>"
                        + "<tr><td><p>Round: <span>" + message.roundName + "</span></p></td></tr>"
                        + "</table>"
                        + "<div>Broadcast Message</div>"
                        + "<p><span>" + message.popUpContent + "</span></p>"
                        + "</div>";
            }
            if (message.type === 'problem') {
                return "<div class = 'notificationPopup'>"
                        + "<div>Broadcast information</div>"
                        + "<table>"
                        + "<tr><td><p>Time: <span>" + message.date + "</span></p></td>"
                        + "<td><p>Class: <span>" + message.className + "</span></p></td></tr>"
                        + "<tr><td><p>Round: <span>" + message.roundName + "</span></p></td>"
                        + "<td><p>Method: <span>" + message.methodSignature + "</span></p></td></tr>"
                        + "<tr><td><p>Division: <span>" + message.division + "</span></p></td>"
                        + "<td><p>Returns: <span>" + message.returnType + "</span></p></td></tr>"
                        + "<tr><td><p>Point value: <span>" + message.pointValue + "</span></p></td></tr>"
                        + "</table>"
                        + "<div>Broadcast Message</div>"
                        + "<p><span>" + message.popUpContent + "</span></p>"
                        + "</div>";
            }
            return message.message;
        };
    service.getUnRead = function () {
        return service.unRead;
    };
    service.clearUnRead = function () {
        service.notifications.forEach(function (message) {
            message.read = true;
            message.status = '[...]'; // consider putting 'Read'/'Unread'
        });
        service.unRead = 0;
    };
    service.clearNotifications = function () {
        service.clearUnRead();
        service.notifications.length = 0;
    };
    /**
     * Checks if the message is already added to the list of notifications.
     * NOTE: This is to prevent to insert duplicates, which backend sometimes send
     */
    service.existMessage = function (message) {
        var exist = false, inotification;
        if (angular.isDefined(service) && angular.isDefined(service.notifications) && service.notifications.length > 0) {
            for (inotification = 0; inotification < service.notifications.length && !exist; inotification += 1) {
                if (sameMessage(message, service.notifications[inotification])) {
                    exist = true;
                }
            }
        }
        return exist;
    };

    // the central way to add message
    service.addMessages = function (messages) {
        var player = document.getElementById('player'),
            i,
            unreadDelta = 0;
        if (player) {
            player.load();
            player.play();
        }
        // messages: array of message
        // message: {
        //   read: boolean - indicate the message is read or not
        //   type: string - 'general'|'problem'|'round'
        //   date: mm/dd/yy hh:mm AM|PM
        //   status: string
        //   message: string - message content
        //   action: {
        //     question: string - the action question
        //     target: string - target href (url)
        //   }
        // }
        for (i = messages.length - 1; i >= 0; i -= 1) {
            if (!service.existMessage(messages[i])) {
                service.notifications.unshift(messages[i]);
                if (!messages[i].read) {
                    unreadDelta += 1;
                }
            }
        }
        // the change of service.unRead is watched in messageArenaCtrl.js
        service.unRead += unreadDelta;
    };

    /**
     * Notification message to be added to the list of notifications.
     *
     * @param message the notification message
     */
    service.addNotificationMessage = function (message) {
        message.read = false;
        if (angular.isDefined(helper.BROADCAST_TYPE_NAME[message.type])) {
            message.type = helper.BROADCAST_TYPE_NAME[message.type];
        }
        message.date = $filter('date')(new Date(message.time), helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone;
        message.status = '[...]';
        message.messageHTML = formatMessage(message);
        service.addMessages([message]);
    };
    // demo starts in messageArenaCtrl.js
    service.startLoadMessages = function () {
        service.clearNotifications();
    };
    // add a past notification
    service.addPastNotification = function (message) {
        service.pastNotifications.unshift(message);
    };
    return service;
}];

factories.appHelper = ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
    var retHelper = {};

    // return an empty array of fixed length
    retHelper.range = function (num) {
        return new [].constructor(num);
    };

    // Checks if a string is not null nor empty.
    retHelper.isStringNotNullNorEmpty = function (s) {
        return s && s.length > 0;
    };

    // Gets the phase time for display.
    // Used in contest schedule displaying.
    // Usually we have start time and end time.
    // When start time is not available, end time should take its place.
    retHelper.getPhaseTime = function (phase, id, currentPhase) {
        function displayStart() {
            return phase.phaseType <= currentPhase.phaseType ? 'Started' : 'Starts';
        }
        function displayEnd() {
            return phase.phaseType < currentPhase.phaseType ? 'Ended' : 'Ends';
        }
        if (id === 0) {
            if (retHelper.isStringNotNullNorEmpty(phase.start)) {
                return {
                    key: displayStart(),
                    value: phase.start
                };
            }
            if (retHelper.isStringNotNullNorEmpty(phase.end)) {
                return {
                    key: displayEnd(),
                    value: phase.end
                };
            }
        } else if (id === 1) {
            if (retHelper.isStringNotNullNorEmpty(phase.start) &&
                    retHelper.isStringNotNullNorEmpty(phase.end)) {
                return {
                    key: displayEnd(),
                    value: phase.end
                };
            }
        }
        return {};
    };

    // parse the string formatted as 'Fri Feb 6, 4:02 PM EST' to date object.
    retHelper.parseDate = function (s) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            arr = s.split(' '),
            month = (function (monthAbbr) {
                var i = 0;
                for (i = 0; i < months.length; i += 1) {
                    if (months[i] === monthAbbr) {
                        return i;
                    }
                }
                return -1;
            }(arr[1])),
            day = parseInt(arr[2].substring(0, arr[2].length - 1), 10),
            timeArr = arr[3].split(':'),
            hour = parseInt(timeArr[0], 10),
            minute = parseInt(timeArr[1], 10),
            seconds = timeArr.length <= 2 ? 0 : parseInt(timeArr[2], 10),
            ampm = arr[4].toLowerCase(),
            date = new Date();

        if (ampm === 'pm') {
            hour += 12;
        }

        date.setMonth(month);
        date.setDate(day);
        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(seconds);
        date.setMilliseconds(0);
        return date;
    };

    retHelper.clickOnTarget = function (clicked, id, stepLimit) {
        if (!clicked) {
            return false;
        }
        while (clicked && stepLimit > 0) {
            stepLimit -= 1;
            if (clicked.id === id) {
                return true;
            }
            clicked = clicked.parentNode;
        }
        return false;
    };

    retHelper.stripPx = function (str) {
        return parseInt(str.substring(0, str.length - 2), 10);
    };

    retHelper.getRenderedHeight = function (el) {
        return retHelper.stripPx(angular.element(el).css('height'));
    };

    /**
     * Checks if a user is assigned to a room.
     *
     * @param  {string}  handle the handle to be checked
     * @param  {number}  roomID the room ID
     * @returns {boolean} true if the user is assigned to the room
     */
    retHelper.isCoderAssigned = function (handle, roomID) {
        var result = false;
        if (roomID === undefined) {
            result = false;
        }
        angular.forEach($rootScope.roomData[roomID].coders, function (coder) {
            if (coder.userName === handle) {
                result = true;
                return;
            }
        });
        return result;
    };

    /**
     * Checks if the division is active (has non empty set of problems).
     *
     * @param view the current opened view
     * @return true if the division is active, false otherwise
     */
    retHelper.isDivisionActive = function (contest, view) {
        var divisionID = helper.VIEW_ID[view];
        if (angular.isUndefined(contest.problems) || angular.isUndefined(contest.problems[divisionID])
                || contest.problems[divisionID].length === 0) {
            return false;
        }
        return true;
    };

    /**
     * Set data to local storage.
     * @param roomId - the given room id which used as key
     * @param value - the value.
     */
    retHelper.setLocalStorage = function (roomId, value) {
        if (localStorageService.isSupported) {
            // maintain the room list
            var roomList = localStorageService.get(helper.LOCAL_STORAGE.ROOM_LIST), found, i, key, items, itemsJson, roomIdStr, str = '';
            roomIdStr = roomId + str;
            if (roomList) {
                found = false;
                for (i = 0; i < roomList.length; i++) {
                    if (roomList[i] === roomIdStr) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    roomList.push(roomIdStr);
                }

            } else {
                roomList = [];
                roomList.push(roomIdStr);
            }
            localStorageService.set(helper.LOCAL_STORAGE.ROOM_LIST, JSON.stringify(roomList));

            // get data by key
            key = helper.LOCAL_STORAGE.PREFIX + roomId;
            items = localStorageService.get(key);
            itemsJson = [];
            if (items) {
                itemsJson = items;
            }

            // remove one if reach the limit count
            if (itemsJson.length >= (+config.chatLength)) {
                itemsJson.shift();
            }
            angular.extend(value, {createdTime: Date.now()});
            itemsJson.push(value);

            // save to local storage
            localStorageService.set(key, JSON.stringify(itemsJson));
        }
    };

    /**
     * Get data from local storage.
     * @param roomId - the room id.
     */
    retHelper.getLocalStorage = function (roomId) {
        if (localStorageService.isSupported) {
            var expire = Date.now() - ((+config.localStorageExpireTime) * 1000), roomList, newRoomList, k, roomItems, key, items, i, roomIdStr, str = '', newRoomItems, m;

            roomIdStr = roomId + str;

            // remove the expired cache
            roomList = localStorageService.get(helper.LOCAL_STORAGE.ROOM_LIST);
            newRoomList = [];
            if (roomList) {
                for (k = 0; k < roomList.length; k++) {
                    roomItems = localStorageService.get(helper.LOCAL_STORAGE.PREFIX + roomList[k]);
                    if (roomItems && roomItems.length > 0) {
                        if (roomItems[roomItems.length - 1].createdTime < expire) {
                            // if the latest message expire, clear all.
                            localStorageService.remove(helper.LOCAL_STORAGE.PREFIX + roomList[k]);
                        } else {
                            newRoomList.push(roomList[k]);

                            newRoomItems = [];
                            for (m = 0; m < roomItems.length; m++) {
                                if (roomItems[m].createdTime >= expire) {
                                    // just keep the not expired item
                                    newRoomItems.push(roomItems[m]);
                                }
                            }
                            localStorageService.set(helper.LOCAL_STORAGE.PREFIX + roomList[k], JSON.stringify(newRoomItems));
                        }
                    }
                }

                localStorageService.set(helper.LOCAL_STORAGE.ROOM_LIST, JSON.stringify(newRoomList));
            }

            // get data from local storage
            key = helper.LOCAL_STORAGE.PREFIX + roomId;
            if (!$rootScope.chatContent) {
                $rootScope.chatContent = {};
            }
            $rootScope.chatContent[roomIdStr] = [];

            items = localStorageService.get(key);

            if (items && items.length > 0) {
                for (i = 0; i < items.length; i++) {
                    if (items[i].createdTime > expire) {
                        $rootScope.chatContent[roomIdStr].push(items[i]);
                    }
                }
            }

            $rootScope.$broadcast('rebuild:chatboard');
        }
    };

    /**
     * Clear the data in local storage.
     */
    retHelper.clearLocalStorage = function () {
        if (localStorageService.isSupported) {
            var roomList = localStorageService.get(helper.LOCAL_STORAGE.ROOM_LIST), k;
            if (roomList) {
                for (k = 0; k < roomList.length; k++) {
                    localStorageService.remove(helper.LOCAL_STORAGE.PREFIX + roomList[k]);
                }

                localStorageService.remove(helper.LOCAL_STORAGE.ROOM_LIST);
            }
        }
    };

    return retHelper;
}];

factories.tcTimeService = ['$rootScope', '$timeout', '$filter', 'socket', function ($rootScope, $timeout, $filter, socket) {
    var service = {},
        counter = 0; // temporary solution before better handling of sync requests is added
    // makes sync time request to the TC server
    service.syncTimeRequest = function () {
        if ($rootScope.connectionID !== undefined) {
            socket.emit(helper.EVENT_NAME.SynchTimeRequest, {connectionID: $rootScope.connectionID});
        }
    };
    service.syncTimeTC = function () {
        if ($rootScope.isLoggedIn) {
            // we don't have correct handling of Sync requests/responses
            // so this is a temporary solution before correct implementation
            // of sync requests is added
            if ($rootScope.startSyncResponse && counter < 3) {
                counter += 1;
                $rootScope.startSyncResponse = false;
                $timeout(service.syncTimeTC, 1000);
            } else {
                counter = 0;
                service.syncTimeRequest();
                $timeout(service.syncTimeTC, helper.SYNC_TIME_INTERVAL);
            }
        } else {
            $timeout(service.syncTimeTC, helper.SYNC_TIME_INTERVAL);
        }
    };
    service.diffTC = 0;
    service.syncTimeTC();
    // helper function to return current time at TC server with zone offset (in minutes)
    service.getTimeZoneOffset = function (zoneOffset) {
        return service.getTime() + 60000 * zoneOffset;
    };
    // Helper function to retrieve the current time at TC server in a given zone.
    // If zone code is not in a helper TIME_ZONES list, default value 0 will be used.
    service.getTimeZone = function (zoneCode) {
        var code = zoneCode.trim().toUpperCase;
        if (angular.isDefined(helper.TIME_ZONES[code])) {
            return service.getTimeZoneOffset(helper.TIME_ZONES[code]);
        }
        return service.getTimeZoneOffset(0);
    };
    // returns the current time at TC server
    service.getTime = function () {
        return new Date().getTime() - service.diffTC;
    };
    // the central way to set time here
    service.setTimeTC = function (timeTC) {
        service.diffTC = new Date().getTime() - timeTC;
    };
    // Retrieves local time zone short name.
    // see: https://stackoverflow.com/questions/2897478/get-client-timezone-not-gmt-offset-amount-in-js
    service.getZoneName = function () {
        /*jslint regexp:true*/
        var now = new Date().toString(), tmp,
            timeZone = "UTC" + $filter('date')(new Date(), 'Z');
        if (now.indexOf('(') > -1) {
            tmp = now.match(/\([^\)]+\)/);
            if (tmp !== null) {
                tmp = tmp[0].match(/[A-Z]/g);
                if (tmp !== null) {
                    tmp = tmp.join('');
                    if (tmp !== null) {
                        timeZone = tmp;
                    }
                }
            }
        } else {
            tmp = now.match(/[A-Z]{3,4}/);
            if (tmp !== null) {
                timeZone = tmp[0];
            }
        }
        /*jslint regexp:false*/
        if (timeZone === "GMT" && /(GMT\W*\d{4})/.test(now)) {
            timeZone = RegExp.$1;
        }
        return timeZone;
    };
    $rootScope.timeZone = service.getZoneName();
    return service;
}];

// this service repeatedly updates the connection status
factories.connectionService = ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    var service = {cStatus: {}},
        isConnected = false;

    // demoXXX are used for demo only.
    service.demoStatus = true;
    service.demoCounter = 0;
    // central way to set the connection status
    // 'stable' or 'lost'
    service.setConnectionStatus = function (status) {
        service.cStatus.status = status;
    };

    service.repeatUpdateStatus = function () {
        var inactivityInterval = new Date().getTime() - $rootScope.lastServerActivityTime;
        if (inactivityInterval >= $rootScope.keepAliveTimeout) {
            // emit keep alive request every timeout interval
            socket.emit(helper.EVENT_NAME.KeepAliveRequest, {});
        }
        if (socket.socket.connected && $rootScope.online && inactivityInterval < helper.INNACTIVITY_TIMEOUT) {
            service.setConnectionStatus('stable');
            if (!isConnected) {
                isConnected = true;
                $rootScope.$broadcast(helper.EVENT_NAME.Connected, {});
            }
        } else {
            isConnected = false;
            service.setConnectionStatus('lost');
            $rootScope.$broadcast(helper.EVENT_NAME.Disconnected, {});
        }
        $timeout(service.repeatUpdateStatus, helper.CONNECTION_UPDATE_INTERVAL);
    };
    service.repeatUpdateStatus();

/*
    // for starting the demo
    $timeout(function () {
        // set to a positive integer to demo
        service.demoCounter = 0;
    }, 3000);
*/
    return service;
}];

factories.API = [function () {
    var api = {};
        //this maps update to a put and also sets id:_id in conformance to mongo.
        /*makeResource = function (url) {
            var actions = {
                update : { method : 'PUT' }
            };
            //if not using mongo remove pass in {} instead of {id:'@_id'}
            return $resource(url, {
                id: '@_id'
            }, actions);
        };*/
    //for example:
    //api.User = makeResource(config.apiDomain + 'api/v1/users/:id');

    return api;
}];

factories.sessionHelper = ['$window', 'cookies', function ($window, cookies) {
    var helper = {};
    helper.isLoggedIn = function () {
        return cookies.get(config.ssoKey);
    };
    helper.clear = function () {
        delete $window.localStorage.userInfo;
        delete $window.localStorage.remember;
    };
    helper.clearRemember = function () {
        delete $window.localStorage.remember;
    };
    helper.persist = function (sess) {
        //set the storage
        if (sess.userInfo) { $window.localStorage.userInfo = angular.toJson(sess.userInfo); }
        if (sess.remember) { $window.localStorage.remember = angular.toJson(sess.remember); }
    };
    helper.getUsername = function () {
        var userInfo = angular.fromJson($window.localStorage.userInfo);
        return userInfo ? userInfo.handle : null;
    };
    helper.getUserInfo = function () {
        var userInfo = angular.fromJson($window.localStorage.userInfo);
        return userInfo || null;
    };

    /**
     * Get user preferences.
     *
     * @returns {*} user preferences or null if not exist
     */
    helper.getUserPreferences = function () {
        var userInfo = angular.fromJson($window.localStorage.userInfo);
        return userInfo ? userInfo.preferences : null;
    };

    /**
     * Set user language preference.
     * @param languageId - the language id.
     */
    helper.setUserLanguagePreference = function (languageId) {
        var userInfo = angular.fromJson($window.localStorage.userInfo);
        if (userInfo) {
            userInfo.preferences[0] = languageId;
        }
        $window.localStorage.userInfo = angular.toJson(userInfo);
    };

    helper.getRemember = function () {
        return angular.fromJson($window.localStorage.remember);
    };
    helper.getTcsso = function () {
        return cookies.get(config.ssoKey);
    };
    helper.removeTcsso = function () {
        cookies.remove(config.ssoKey);
    };
    helper.getJwtToken = function () {
        return cookies.get(config.jwtToken);
    };
    return helper;
}];

//wrap auth0 in an angular factory
factories.auth0 = function () {
    var result = new Auth0({
        domain:       config.auth0domain,
        clientID:     config.auth0clientID,
        callbackURL:  config.callbackURL
    });

    result.auth0connection = config.auth0connection;
    return result;
};

factories.socket = ['$rootScope', function ($rootScope) {
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.lastServerActivityTime = new Date().getTime();
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        remove: function (eventName) {
            socket.removeAllListeners(eventName);
        }
    };
}];

factories.cookies = ['$document', function ($document) {
    var cookies = {};
    cookies.set = function (key, value, expires) {
        $document[0].cookie = key + '=' + value + '; domain=topcoder.com; path=/'
            + (expires === -1 ? '; expires=Tue, 19 Jan 2038 03:14:07 GMT' : '');
    };
    cookies.remove = function (key) {
        $document[0].cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=topcoder.com; path=/';
    };
    cookies.get = function (key) {
        return $document[0].cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + key.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || null;
    };
    return cookies;
}];

module.exports = factories;
