/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the test panel.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/

// directive for the test panel
var testPanel = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/testPanel.html',
        controller: 'testPanelCtrl'
    };
}];
module.exports = testPanel;