/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the registration questions panel.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for the contest schedule configuration popup
var registrationQuestions = [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'partials/user.contest.management.registrationQuestions.html',
        controller: 'registrationQuestionsCtrl'
    };
}];
module.exports = registrationQuestions;