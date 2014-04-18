'use strict';
var config = require('./config');
/*global $ : false, Auth0 : false, angular : false */

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
                for (i = 0; i < months.length; i++) {
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
            ampm = arr[4].toLowerCase();

        if (ampm === 'pm') {
            hour += 12;
        }
        var date =  new Date();

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

factories.sessionHelper = ['$window', function ($window) {
    var helper = {};
    helper.isLoggedIn = function () {
        if (!$window.localStorage.profile) { return false; }
        var now = new Date(),
            exp = new Date(0);
        exp.setUTCSeconds((angular.fromJson($window.localStorage.profile)).exp);
        return (exp > now);
    };
    helper.clear = function () {
        delete $window.localStorage.jwt;
        delete $window.localStorage.profile;
    };
    helper.persist = function (sess) {
        //set the storage
        if (sess.jwt) { $window.localStorage.jwt = sess.jwt; }
        if (sess.profile) { $window.localStorage.profile = angular.toJson(sess.profile); }
        if (sess.userId) { $window.localStorage.userId = sess.userId; }
        if (sess.username) { $window.localStorage.username = sess.username; }
    };
    helper.getJwt = function () {
        return $window.localStorage.jwt;
    };
    helper.getProfile = function () {
        return angular.fromJson($window.localStorage.profile);
    };
    helper.getUserId = function () {
        return $window.localStorage.userId;
    };
    helper.getUsername = function () {
        return $window.localStorage.username;
    };
    return helper;
}];

/* //wrap auth0 in an angular factory
factories.auth0 = function () {
    var auth0 = new Auth0({
        domain:       config.auth0Domain,
        clientID:     config.auth0ClientId,
        callbackURL:  config.auth0CallbackURL,
        callbackOnLocationHash: true
    });
    return auth0;
};
*/

module.exports = factories;