/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the panel for managing a registration question.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for managing a registration question.
var manageQuestion = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.contest.management.manageQuestion.html',
        controller: 'manageQuestionCtrl'
    };
}];
module.exports = manageQuestion;