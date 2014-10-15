/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the overview controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Removed $http and $rootScope, added sessionHelper
 * - Changed userProfile.username to userProfile.handle to display correct information
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Rating Indicator):
 * - Removed the rating class function to use the global one in baseCtrl.js.
 *
 * Changes in version 1.3 (Module Assembly - Dashboard - Active Users and Leaderboard Panel):
 * - Broadcast the rebuild event for active user panel and leader board panel.
 *
 * Changes in version 1.4 (PoC Assembly - Share Member Status To Facebook and Twitter):
 * - Added Facebook to the controller.
 * - Added formatStatusMessage, loginFacebookAndPost, postFacebookStatusMessage to handle posting
 *   messages to Facebook and Twitter.
 * - Added getMemberStatusMessage and postFacebookStatus to the scope to handle posting messages to
 *   Facebook and Twitter.
 *
 * @author dexy, amethystlei
 * @version 1.4
 */
/*global twttr : true */
'use strict';

var helper = require('../helper'),
    config = require('../config');

var overviewCtrl = ['$scope', '$rootScope', 'Facebook', function ($scope, $rootScope, Facebook) {
    var formatStatusMessage, loginFacebookAndPost, postFacebookStatusMessage;

    /**
     * Formats the message to be posted on Twitter and Facebook
     *
     * @param {integer} numRatedEvents number of rated events
     * @param {integer} rating the rating
     * @since 1.4
     */
    formatStatusMessage = function (numRatedEvents, rating) {
        var matches, message;
        if (numRatedEvents === 0) {
            return "I have not participated in any matches in the #topcoder arena yet, and I'm not rated.";
        }
        matches = numRatedEvents + (numRatedEvents === 1 ? " match" : " matches");
        if (rating <= 0) {
            return "I have participated in " + matches + " in #topcoder arena and I'm not rated.";
        }
        message = config.social.statusTemplate;
        message = message.replace(helper.SOCIAL.StatusMessage.NumberEventsTag, matches);
        message = message.replace(helper.SOCIAL.StatusMessage.RatingTag, rating);
        return message;
    };
    /**
     * Log in facebook and send the message to the wall if there are no errors.
     *
     * @since 1.4
     */
    loginFacebookAndPost = function () {
        Facebook.login(function (response) {
            if (response.status === 'connected') {
                postFacebookStatusMessage();
            } else {
                if (response.status !== 'unknown') {
                    $scope.openModal({
                        title: helper.FACEBOOK_TITLES.LoginError,
                        message: helper.FACEBOOK_MESSAGES.LoginError,
                        enableClose: true
                    });
                }
            }
        }, {scope: 'publish_actions'});
    };
    /**
     * Posts the message to the facebook wall.
     *
     * @since 1.4
     */
    postFacebookStatusMessage = function () {
        $rootScope.facebookMessage = formatStatusMessage($scope.userProfile.numRatedEvents, $scope.userProfile.rating);
        $scope.openModal({
            title: helper.FACEBOOK_TITLES.StatusMessageConfirm,
            message: helper.FACEBOOK_MESSAGES.StatusMessageConfirm,
            buttons: ['Yes', 'No'],
            enableClose: true
        }, function () {
            Facebook.api('/me/feed', 'post', {
                message: $rootScope.facebookMessage,
                link: config.social.arena.URL,
                description: config.social.arena.description,
                name: config.social.arena.title
            }, function (response) {
                if (!response || response.error) {
                    if (response.error && response.error.type && response.error.type === 'OAuthException') {
                        loginFacebookAndPost();
                    } else {
                        $scope.openModal({
                            title: helper.FACEBOOK_TITLES.StatusMessageError,
                            message: helper.FACEBOOK_MESSAGES.StatusMessageError,
                            enableClose: true
                        });
                    }
                } else {
                    $scope.openModal({
                        title: helper.FACEBOOK_TITLES.StatusMessageOK,
                        message: helper.FACEBOOK_MESSAGES.StatusMessageOK,
                        enableClose: true
                    });
                }
            });
        }, function () { return; }, 'popupFacebookMessage.html');
    };
    $scope.showSection = "overview";
    $scope.userProfile = $rootScope.userInfo();

    $scope.isInt = function (value) {
        return !isNaN(value) && (parseInt(value, 10) === value);
    };

    // broadcast the rebuild UI event.
    $scope.$watch('showSection', function () {
        if ($scope.showSection === "users") {
            $scope.$broadcast('rebuild:activeUser');
        } else if ($scope.showSection === 'leaderboard') {
            $scope.$broadcast('rebuild:leaderBoardMethods');
            $scope.$broadcast('rebuild:leaderBoardLeaders');
        }
    });

    /**
     * Returns the formatted message to be published to Twitter.
     *
     * @since 1.4
     */
    $scope.getMemberStatusMessage = function () {
        return formatStatusMessage($scope.userProfile.numRatedEvents, $scope.userProfile.rating);
    };

    /**
     * Returns the URL of Arena.
     *
     * @since 1.4
     */
    $scope.getMemberStatusUrl = function () {
        return config.social.arena.URL;
    };
    /**
     * Posts status to the Facebook wall.
     *
     * @since 1.4
     */
    $scope.postFacebookStatus = function () {
        if (!Facebook.isReady()) {
            $scope.openModal({
                title: helper.FACEBOOK_TITLES.NotReady,
                message: helper.FACEBOOK_MESSAGES.NotReady,
                enableClose: true
            });
        } else {
            Facebook.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    postFacebookStatusMessage();
                } else {
                    loginFacebookAndPost();
                }
            });
        }
    };
}];

module.exports = overviewCtrl;