/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Directive for challenges advertising widget.
 *
 * @author Helstein
 * @version 1.0
 */

'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/

var challengesAdvertiser = [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'partials/user.challenges.advertising.html',
        controller: 'challengesAdvertisingCtrl'
    };
}];
module.exports = challengesAdvertiser;