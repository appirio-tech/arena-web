'use strict';
var config = require('./config');
/*global $ : false, Auth0 : false, angular : false */

///////////////
// FACTORIES //

var factories = {};

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