/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive renders active contests.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to use seperate scope to prevent interfering the chat widget in Dashboard.
 *
 * @author amethystlei
 * @version 1.1
 */
'use strict';

/**
 * The directive for 'Active Contests Widget'.
 *
 * @type {*[]}
 */
var activecontests = [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'partials/user.contests.active.html',
        controller: 'activeContestsCtrl'
    };
}];
module.exports = activecontests;