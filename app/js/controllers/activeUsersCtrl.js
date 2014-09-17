/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles active users panel related logic.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The active users controller.
 * @type {*[]}
 */
var activeUsersCtrl = [ '$scope', '$rootScope', '$timeout', 'socket', function ($scope, $rootScope, $timeout, socket) {

        $scope.isLoadingData = false;

        // The sorting flags.
        $scope.sortAu = {
            column: '',
            descending: false
        };

        /**
         * Get active users.
         * @returns the active users.
         */
        $scope.getActiveUsers = function () {
            if ($rootScope.activeUsers) {
                return $rootScope.activeUsers;
            }
            return [];
        };

        /**
         * Get active users count detail.
         * @returns the users count detail.
         */
        $scope.getActiveUsersCountDetail = function () {
            if ($rootScope.activeUsers) {
                return '(' + $rootScope.activeUsers.length + ')';
            }

            return '';
        };
        /**
         * Change the sorting flag.
         * @param column - the column value.
         */
        $scope.changeSortingAu = function (column) {
            var sort = $scope.sortAu;
            if (sort.column === column) {
                sort.descending = !sort.descending;
            } else {
                sort.column = column;
                sort.descending = false;
            }
        };

        /**
         * Refresh the active user panel.
         *
         * @param isExpand the expand flag.
         */
        $scope.refreshActiveUser = function (isExpand) {
            if ($rootScope.isLoadingActiveUsersData) {
                return;
            }
            if (isExpand && ($scope.showSection === 'users')) {
                return;
            }
            $rootScope.isLoadingActiveUsersData = true;
            socket.emit(helper.EVENT_NAME.ActiveUsersRequest, {});

            // set the flag if request time out.
            $timeout(function () {
                $rootScope.isLoadingActiveUsersData = false;
            }, helper.REQUEST_TIME_OUT);

        };
    }
        ];

module.exports = activeUsersCtrl;