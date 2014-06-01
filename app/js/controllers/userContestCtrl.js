/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles user contest page.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Updated to use real data.
 *
 * @author TCSASSEMBLER
 * @version 1.1
 */
'use strict';
/*global module, angular*/

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The main controller.
 *
 * @type {*[]}
 */
var userContestCtrl = ['$scope', '$http', '$rootScope', '$stateParams', '$state', 'socket',
    function ($scope, $http, $rootScope, $stateParams, $state, socket) {
        // load contest data with contest id
        $scope.roundID = $stateParams.contestId;
        $scope.divisionID = $stateParams.divisionId;
        $scope.contest = $rootScope.roundData[$scope.roundID];

        
        /**
         * Init with contest.
         *
         * @param contest
         */
        var initWithContest = function (contest) {
            // set page title
            $state.current.data.pageTitle = contest.contestName;
            $state.current.data.pageMetaKeywords = contest.contestName + ",contest";
        };

        // handle update round list response
        socket.on(helper.EVENT_NAME.UpdateRoundListResponse, function (data) {
            if (data.action === 1) {
                $rootScope.roundData[data.roundData.roundID] = data.roundData;

                if (String($scope.roundID) === String(data.roundData.roundID)) {
                    $scope.contest = $rootScope.roundData[$scope.roundID];
                    initWithContest($scope.contest);
                }
            } else if (data.action === 2) {
                delete $rootScope.roundData[data.roundData.roundID];

                if (String($scope.roundID) === String(data.roundData.roundID)) {
                    $scope.contest = null;
                }
            }
        });

        if ($scope.contest) {
            initWithContest($scope.contest);
        }
    }];

module.exports = userContestCtrl;
