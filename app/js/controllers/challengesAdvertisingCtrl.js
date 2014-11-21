/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Controller for challenges advertising widget.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena - Challenges Advertising Widget):
 *  - load real data from TC API server which is updated in regular intervals when widget is loaded
 *
 * @author Helstein, dexy
 * @version 1.1
 */

'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global require, module, angular*/

var config = require('../config.js');
var helper = require('../helper');

/**
 * The advertising challenges widget controller.
 *
 * @type {*[]}
 */
var challengesAdvertisingCtrl = ['$scope', '$http', 'appHelper', '$timeout', '$window', function ($scope, $http, appHelper, $timeout, $window) {
    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = appHelper.getHeader(),
        updaterHndl;

    // Challenges to be advertised
    $scope.challenges = [];
    // Interval between advertising changes (miliseconds)
    $scope.interval = Number(config.challengeAdvertisingInterval || 5000);

    /**
     * Handles the data successfully received from TC-API server.
     *
     * @param data the data containing challenges advertisments
     * @since 1.1
     */
    function successHandler(data) {
        var prize, link, iconText;
        $scope.challenges = [];
        angular.forEach(data.data, function (challenge) {
            prize = 0;
            angular.forEach(challenge.prize, function (curPrize) {
                prize += Number(curPrize);
            });
            link = config.tcHostName || 'https://www.topcoder.com';
            link += '/challenge-details/' + challenge.challengeId;
            link += '/?type=' + challenge.challengeCommunity.toLowerCase();
            iconText = helper.CHALLENGE_ADVERTISING.TRACK_SHORTNAMES[(challenge.challengeType || "default")
                .toLowerCase()].toUpperCase();
            $scope.challenges.push({
                type: challenge.challengeCommunity.toLowerCase(),
                iconText: iconText,
                color: helper.CHALLENGE_ADVERTISING.COLOR[challenge.challengeCommunity.toLowerCase()],
                prize: prize,
                title: challenge.challengeName,
                end: new Date(challenge.registrationEndDate),
                technologies: challenge.technologies,
                link: link
            });
        });
    }
    /**
     * Handles error request to TC-API server.
     *
     * @param data the data.
     * @since 1.1
     */
    function errorHandler(data) {
        console.log("error: " + JSON.stringify(data));
    }
    /**
     * Update challenge advertisments. Makes request to TC-API server.
     *
     * @since 1.1
     */
    function updateChallenges() {
        $http.get(config.apiDomain + '/challenges?pageIndex=-1&sortColumn=registrationEndDate&sortOrder=asc', header).
                    success(successHandler).error(errorHandler);
        $timeout.cancel(updaterHndl);
        updaterHndl = $timeout(updateChallenges, Number(config.challengeAdvertisingUpdate || 300000));
    }
    updateChallenges();

    /**
     * Handles destroying of the widget. It cancels timeout handler.
     * @since 1.1
     */
    function onLeavingChallengesAdvertising() {
        $timeout.cancel(updaterHndl);
    }
    /**
     * Register function to handle widget destroying.
     * @since 1.1
     */
    $window.onbeforeunload = onLeavingChallengesAdvertising;
    $scope.$on("$destroy", onLeavingChallengesAdvertising);
}];

module.exports = challengesAdvertisingCtrl;