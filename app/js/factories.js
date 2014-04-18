'use strict';
var config = require('./config');
var Auth0 = require('auth0-js');
var socket = require('socket.io-client').connect(config.webSocketURL);
/*global $ : false, angular : false */

///////////////
// FACTORIES //

var factories = {};

factories.appHelper = [function () {

    var helper = {};

    // return an empty array of fixed length
    helper.range = function (num) {
        return new [].constructor(num);
    };

    // Checks if a string is not null nor empty.
    helper.isStringNotNullNorEmpty = function (s) {
        return s && s.length > 0;
    };

    // Gets the phase time for display.
    // Used in contest schedule displaying.
    // Usually we have start time and end time.
    // When start time is not available, end time should take its place.
    helper.getPhaseTime = function (phase, id) {
        if (id === 0) {
            if (helper.isStringNotNullNorEmpty(phase.start)) {
                return {key: 'Start', value: phase.start};
            }
            if (helper.isStringNotNullNorEmpty(phase.end)) {
                return {key: 'End', value: phase.end};
            }
        } else if (id === 1) {
            if (helper.isStringNotNullNorEmpty(phase.start) &&
                    helper.isStringNotNullNorEmpty(phase.end)) {
                return {key: 'End', value: phase.end};
            }
        }
        return {};
    };

    // parse the string formatted as 'Fri Feb 6, 4:02 PM EST' to date object.
    helper.parseDate = function (s) {
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

    return helper;
}];

factories.dashboardHelper = [function () {
    var notifications = [];
    return {
        notifications: function () {
            return notifications;
        },
        setNotifications: function (newNotifications) {
            notifications = newNotifications;
        }
    };
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

factories.sessionHelper = ['$window', '$cookies', function ($window, $cookies) {
    var helper = {};
    helper.isLoggedIn = function () {
        return $cookies[config.ssoKey] !== undefined;
    };
    helper.clear = function () {
        delete $window.localStorage.userId;
        delete $window.localStorage.username;
        delete $window.localStorage.remember;
    };
    helper.persist = function (sess) {
        //set the storage
        if (sess.userId) { $window.localStorage.userId = sess.userId; }
        if (sess.username) { $window.localStorage.username = sess.username; }
        if (sess.remember) { $window.localStorage.remember = angular.toJson(sess.remember); }
    };
    helper.getUserId = function () {
        return $window.localStorage.userId;
    };
    helper.getUsername = function () {
        return $window.localStorage.username;
    };
    helper.getRemember = function () {
        return angular.fromJson($window.localStorage.remember);
    };
    helper.getTcsso = function () {
        return $cookies[config.ssoKey];
    };
    helper.removeTcsso = function () {
        delete $cookies[config.ssoKey];
    };
    return helper;
}];

//wrap auth0 in an angular factory
factories.auth0 = function () {
    var auth0 = new Auth0({
        domain:       config.apiDomain,
        clientID:     config.auth0clientID,
        callbackURL:  config.callbackURL
    });
    return auth0;
};

factories.socket = ['$rootScope', function ($rootScope) {
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
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
        }
    };
}];

module.exports = factories;
