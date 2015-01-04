/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the toggle setting element for chat settings widget
 *
 * @author Helstein
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/
var toggleSetting = [function () {
    return {
        restrict: 'E',
        require: '^chatSettings',
        replace: true,
        scope: {
            label: '@',
            value: '='
        },
        template:
            '<div class="setting"><span class="setting-label">{{label}}</span>' +
                '<input bs-switch ng-model="value" type="checkbox" switch-on-text="ON" switch-off-text="OFF" /></div>'
    };
}];
module.exports = toggleSetting;