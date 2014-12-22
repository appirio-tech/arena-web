/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Controller for challenges advertising widget.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena - Challenges Advertising Widget):
 *  - load real data from TC API server which is updated in regular intervals when widget is loaded
 *
 * Changes in version 1.2 (Quick 72hrs!! Module Assembly - Web Arena - Challenge Advertising Widget Improvement):
 *  - advertisement is removed when its end date passes
 *  - date parsing fix for IE (timezone parsing)
 *  - added default icon text if challenge type is unknown
 *
 * @author Helstein, dexy
 * @version 1.2
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global require, module, angular, console*/

var config = require('../config.js');
var helper = require('../helper');

/**
 * The advertising challenges widget controller.
 *
 * @type {*[]}
 */
var challengesAdvertisingCtrl = ['$scope', '$http', 'appHelper', '$timeout', '$window', function ($scope, $http, appHelper, $timeout, $window) {
    /**
     * Header to be added to all http requests to api
     * @type {{headers: {Content-Type: string, Authorization: string}}}
     */
    var header = appHelper.getHeader(),
        updaterHndl;

    // Challenges to be advertised
    $scope.challenges = [];

    // Interval between advertising changes (miliseconds)
    $scope.interval = Number(config.challengeAdvertisingInterval || 5000);

    // Removes advertisement with specified index
    $scope.removeAdvertisement = function (index) {
        function remove() {
            $scope.challenges.splice(index, 1);
        }

        // Transition to the next slide if available
        if ($scope.challenges[index].active && $scope.challenges.length - 1 > index) {
            $scope.challenges[index + 1].active = true;

            // Give enought time to change the slide, then remove model
            $timeout(remove, 2000);
        } else {
            remove();
        }
    };

    /**
     * Parse the date string.
     * @param dateString - the date string to parse
     * @returns {Date} the parsed result
     * @since 1.2
     */
    function parseDate(dateString) {
        // Timezone
        var tz_regex = /(\+|-)(\d{4})$/,
            tz = tz_regex.exec(dateString),
            date = null,
            hours = null,
            minutes = null,
            diff = null;

        // IE cannot parse timezone. Remove it, parse
        // and then add timezone manually
        if (tz) {
            dateString = dateString.replace(tz[0], 'Z');
            date = new Date(dateString);
            hours = Number(tz[2].substr(0, 2));
            minutes = Number(tz[2].substr(2, 2));

            if (tz[1] === '-') {
                hours = -hours;
                minutes = -minutes;
            }

            diff = hours * 60 + minutes;
            date.setMinutes(date.getMinutes() - diff);

            return date;
        }

        return new Date(dateString);
    }


    /**
     * Handles the data successfully received from TC-API server.
     *
     * @param data the data containing challenges advertisments
     * @since 1.1
     */
    function successHandler(data) {
        var link, iconText;

        $scope.challenges = [];

        angular.forEach(data.data, function (challenge) {
            var endDate = parseDate(challenge.registrationEndDate);

            // Don't add this challenge if registration is closed
            if (endDate <= new Date()) {
                return;
            }

            link = config.tcHostName || 'https://www.topcoder.com';
            link += '/challenge-details/' + challenge.challengeId;
            link += '/?type=' + challenge.challengeCommunity.toLowerCase();

            iconText = helper.CHALLENGE_ADVERTISING.TRACK_SHORTNAMES[(challenge.challengeType || "default").toLowerCase()];

            // Fallback challenge icon text based on challenge community
            if (!iconText) {
                iconText = (challenge.challengeCommunity === 'design' ? 'w' : 'c');
            }

            iconText = iconText.toUpperCase();

            $scope.challenges.push({
                type: challenge.challengeCommunity.toLowerCase(),
                iconText: iconText,
                color: helper.CHALLENGE_ADVERTISING.COLOR[challenge.challengeCommunity.toLowerCase()],
                prize: challenge.totalPrize,
                title: challenge.challengeName,
                end: endDate,
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
        $http.get(config.apiDomain + '/challenges/open?pageIndex=-1&sortColumn=registrationEndDate&sortOrder=asc', header).
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
