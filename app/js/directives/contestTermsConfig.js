/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the contest terms panel.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for the contest terms configuration popup
var contestTermsConfig = [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'partials/user.contest.management.terms.html',
        controller: 'contestTermsConfigCtrl'
    };
}];
module.exports = contestTermsConfig;