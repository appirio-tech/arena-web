/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the panel for managing an answer for a registration question.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for managing an answer for a registration question.
var manageAnswer = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contest.management.manageAnswer.html',
        controller: 'manageAnswerCtrl'
    };
}];
module.exports = manageAnswer;