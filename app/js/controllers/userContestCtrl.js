/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles user contest page.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Updated to use real data.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to retrieve divisionID based on roomID and roundID.
 * - Updated to remove divisionID from the state params.
 *
 * @author amethystlei
 * @version 1.2
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
var userContestCtrl = ['$scope', '$rootScope', '$stateParams', '$state', 'socket',
    function ($scope, $rootScope, $stateParams, $state, socket) {
        function setContest(data) {
            $scope.contest = data;
            // rebuild the contest schedule when phase data updated
            $scope.$broadcast('rebuild:contestSchedule');
        }
        /*jslint unparam:true*/
        $scope.$on(helper.EVENT_NAME.PhaseDataResponse, function (event, data) {
            // phase data already set in resolvers.js, no need to assign again.
            $scope.$broadcast('rebuild:contestSchedule');
        });
        /*jslint unparam:false*/

        // load contest data with contest id
        $scope.roundID = +$stateParams.contestId;
        setContest($rootScope.roundData[$scope.roundID]);
        $scope.divisionID = null;
        angular.forEach($scope.contest.coderRooms, function (room) {
            if (angular.isDefined($rootScope.currentRoomInfo) &&
                    room.roomID === $rootScope.currentRoomInfo.roomID) {
                $scope.divisionID = room.divisionID;
            }
        });

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
                    setContest($rootScope.roundData[$scope.roundID]);
                    initWithContest($scope.contest);
                }
            } else if (data.action === 2) {
                delete $rootScope.roundData[data.roundData.roundID];

                if (String($scope.roundID) === String(data.roundData.roundID)) {
                    setContest(null);
                }
            }
        });

        if ($scope.contest) {
            initWithContest($scope.contest);
        }
    }];

module.exports = userContestCtrl;
