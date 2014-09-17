/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive renders active users panel.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/**
 * The active users directive.
 *
 * @type {*[]}
 */
var activeUsers = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.activeUsers.html',
        controller: 'activeUsersCtrl'
    };
}];
module.exports = activeUsers;