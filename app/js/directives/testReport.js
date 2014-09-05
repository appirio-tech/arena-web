/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles test report.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for the test report
var testReport = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/testReport.html',
        transclude: true
    };
}];
module.exports = testReport;