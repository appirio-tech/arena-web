/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive renders leader board panel.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/**
 * The leader board directive.
 *
 * @type {*[]}
 */
var overviewLeaderboard = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.overview.leaderboard.html',
        controller: 'overviewLeaderboardCtrl'
    };
}];
module.exports = overviewLeaderboard;