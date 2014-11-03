/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the contest schedule configuration panel.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for the contest schedule configuration popup
var contestScheduleConfig = [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'partials/user.contest.management.schedule.html',
        controller: 'contestScheduleConfigCtrl'
    };
}];
module.exports = contestScheduleConfig;