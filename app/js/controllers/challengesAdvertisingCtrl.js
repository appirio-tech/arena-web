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
     * Handles the data successfully received from TC-API server.
     *
     * @param data the data containing challenges advertisments
     * @since 1.1
     */
    function successHandler(data) {

        $scope.challenges = [];

        angular.forEach(data, function (challenge) {
            var regPhase = challenge.phases ? challenge.phases.find(phase => phase.name === 'Registration') : null;
            var endDate = regPhase ? appHelper.parseTDate(regPhase.scheduledEndDate) : null;

            if (!endDate) {
                console.error('Cant determine registration end date of challenge ' + challenge.id);
                return;
            }
            // Don't add this challenge if registration is closed
            if (endDate <= new Date()) {
                console.info('Challenge registration end date is closed: ' + challenge.id);
                return;
            }
            var link, iconText;

            link = config.tcHostName || 'https://www.topcoder.com';
            link += '/challenges/' + challenge.id;
            // link += '/?type=' + challenge.challengeCommunity.toLowerCase();

            if (challenge.legacy && challenge.legacy.subTrack) {
                iconText = helper.CHALLENGE_ADVERTISING.TRACK_SHORTNAMES[challenge.legacy.subTrack.toLowerCase()];
            }

            // Fallback challenge icon text based on challenge community
            if (!iconText) {
                iconText = (challenge.track.toLowerCase() === 'design' ? 'w' : 'c');
            }

            iconText = iconText.toUpperCase();

            $scope.challenges.push({
                type: challenge.type.toLowerCase(),
                iconText: iconText,
                color: helper.CHALLENGE_ADVERTISING.COLOR[challenge.track.toLowerCase()],
                prize: challenge.overview.totalPrizes,
                title: challenge.name,
                end: endDate,
                technologies: challenge.tags,
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
        $http.get(config.v5ApiDomain + '/challenges?status=Active&currentPhaseName=Registration&perPage=100&page=1&sortBy=startDate&sortOrder=desc&isLightweight=true', header).
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
