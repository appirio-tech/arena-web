/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles the logic for the leaderboard directive.
 *
 * Changes in version 1.1 (Web Arena - Leaderboard Performance Improvement):
 * - Updated to use the variable leaderboard instead of calling the function
 *   getCurrentLeaderboard() in the template app/partials/leaderboard.html
 *   to improve the performance of the leaderboard.
 *
 * @author TCSASSEMBLER
 * @version 1.1
 */
/*jshint -W097*/
/*jshint strict:false*/
'use strict';
/*global module, require, $, document, console, angular*/
/*jslint plusplus: true*/

// the controller for 'leaderboard widget'
// copy from userContestDetailCtrl.js
var helper = require('../helper'),
    config = require('../config');
var leaderboardCtrl = ['$scope', '$stateParams', '$rootScope', '$location', '$timeout', '$window', 'appHelper', function ($scope, $stateParams, $rootScope, $location, $timeout, $window, appHelper) {
    var // qtip here
        // use qtip to create a filter panel
        filter = $('.filterToggle'),
        lbFilter = $('#leaderboardFilter'),
        lastPageNums = [],
        lastInvokeTime = 0,
        preserveLastDivSummary = false,
        cleanBeforeUnload = function () {
            if (!preserveLastDivSummary) {
                $rootScope.closeLastDivSummary();
            }
        };
// page for Division Leaderboard
    $scope.numOfPage = config.divsionLearderBoardLimit;
    $scope.currentPage = 0;
    $scope.setCurrentPage = function (index) {
        $scope.currentPage = index;
    };
// limit the page item length
    function filterPageItem(items) {

        var pageNumber = items.length, cpage = $scope.currentPage + 1,
            // limit size param
            showPageLength = 13, result = [], i,
            skipPage, showi;

        if (cpage > pageNumber) {
            cpage = pageNumber;
        }
        if (cpage < 1) {
            cpage = 1;
        }

        for (i = 1; i <= pageNumber; i += 1) {
            skipPage = false;
            if (cpage <= 6 + showPageLength) {
                if (pageNumber > 7 + showPageLength) {
                    if (i !== 1 && i !== pageNumber) {
                        if (cpage <= 4 + showPageLength && i > 6 + showPageLength) {
                            skipPage = true;
                        } else if (cpage > 4 + showPageLength && pageNumber - cpage > 2 + showPageLength && Math.abs(i - cpage) > 2 + showPageLength / 2) {
                            skipPage = true;
                        } else if (cpage > 4 + showPageLength && pageNumber - cpage < 2 + showPageLength) {
                            if (i < cpage && pageNumber - cpage + cpage - i > 4 + showPageLength) {
                                skipPage = true;
                            }
                        }

                    }
                }

            } else if (cpage > 6 + showPageLength && cpage < pageNumber - 3 - showPageLength) {
                if (i !== 1 && i !== pageNumber && Math.abs(i - cpage) > 2 + showPageLength / 2) {
                    skipPage = true;
                }

            } else if (cpage > 6 + showPageLength && cpage >= pageNumber - 3 - showPageLength) {
                if (i !== 1 && i !== pageNumber) {
                    if (i < cpage) {
                        if (pageNumber - cpage + cpage - i > 5 + showPageLength) {
                            skipPage = true;
                        }
                    }
                }
            }
            if (!skipPage) {
                showi = i;
                if (i === 1 && cpage >= 5 + showPageLength && pageNumber > 7 + showPageLength) {
                    showi = "1...";
                }
                if (i === pageNumber && pageNumber - cpage >= 4 + showPageLength && i > 6 + showPageLength) {
                    showi = "..." + i;
                }

                result.push({i: i - 1, show: showi});
            }
        }
        return result;
    }

// get pagination index
    $scope.range = function (data, num) {
        if (new Date().getTime() - lastInvokeTime < 500) {
            return lastPageNums;
        }

        if (!angular.isArray(data) || num === 0) {
            return [1];
        }
        lastInvokeTime = new Date().getTime();
        var len = data.length % num !== 0 ? (data.length - data.length % num) / num + 1 : (data.length - data.length % num) / num;
        lastPageNums = new [].constructor(len);
        lastPageNums = filterPageItem(lastPageNums);
        return lastPageNums;
    };
    $scope.leaderboardPageRange = [1];

    /**
     * This function broadcasts the rebuild scrollbar message.
     */
    $scope.rebuildScrollbars = function () {
        $('.ngsb-container').css('top', '0');
        $scope.$broadcast('rebuild:leaderboardTable');
    };

    // toggle key
    function toggleKey(target, key) {
        var val;
        if (target !== key) {
            val = key;
        } else {
            if (key[0] === '-') {
                val = key.substring(1, key.length);
            } else {
                val = '-' + key;
            }
        }
        return val;
    }

    /**
     * Gets the leader room class.
     *
     * @param roomPlace the rank in the room of the competitor
     * @return 'roomLeader' class if the competitor is the first in the room, otherwise returns ''
     */
    $scope.getLeaderRoomClass = function (roomPlace) {
        return roomPlace === 1 ? 'roomLeader' : '';
    };

    /**
     * Get language name.
     *
     * @param languageID - the language id.
     * @returns {*} the language name
     */
    $scope.getLanguageName = function (languageID) {
        return helper.LANGUAGE_NAME[languageID];
    };
    $scope.contest = $rootScope.roundData[$stateParams.roundId];
    $scope.divisionID = $stateParams.divisionId;
    $scope.roomID = $rootScope.currentRoomInfo.roomID;

    // room
    $scope.userRoomId = 0;
    $scope.userDivision = 0;
    $scope.roomBoard = [];
    $scope.roomChallenges = [];
    $scope.roomChallengers = [];
    // leaderboards
    $scope.boards = [[], []];
    $scope.showBy = 'points';
    $scope.isDivisionActive = appHelper.isDivisionActive;
    $scope.leaderboardToShow = [];
    $scope.leaderboardFiltered = [];

    /**
     * Get the selected leader board.
     *
     * @returns {Array} the leader board
     */
    $scope.getCurrentLeaderboard = function () {
        // this is assembly code
        return $rootScope.getCurrentLeaderboard($scope.viewOn, $scope.roomID);
        // if (viewOn === 'room') {
        //     return $rootScope.roomData[roomID].coders;
        // }
        // if (viewOn === 'divOne' || viewOn === 'divTwo') {
        //     return $rootScope.leaderboard;
        // }
    };




    // Closes the opened division summary on page leaving.
    $window.onbeforeunload = cleanBeforeUnload;
    $scope.$on("$destroy", cleanBeforeUnload);

    $scope.roomKeys = {
        leaderboardKey: '-totalPoints',
        lbFilterKey: 'all',
        lbFilter : {
            // filter on the field 'userName' of a coder
            userName: ''
        }
    };
    $scope.divOneKeys = {
        leaderboardKey: '-totalPoints',
        lbFilterKey: 'all',
        lbFilter : {
            userName: ''
        }
    };
    $scope.divTwoKeys = {
        leaderboardKey: '-totalPoints',
        lbFilterKey: 'all',
        lbFilter : {
            userName: ''
        }
    };
    // get sort Key according to view
    $scope.getKeys = function (viewOn) {
        if (viewOn === 'room') {return $scope.roomKeys; }
        if (viewOn === 'divOne') {return $scope.divOneKeys; }
        return $scope.divTwoKeys;
    };
    $scope.currentKeys = {};

    $scope.toggleSortKey = function (viewOn, panel, key) {
        if (panel === 'challenger') {
            $scope.getKeys(viewOn).challengerKey = toggleKey($scope.getKeys(viewOn).challengerKey, key);
            $scope.$broadcast('rebuild:challengerTable');
        } else if (panel === 'challenge') {
            $scope.getKeys(viewOn).challengeKey = toggleKey($scope.getKeys(viewOn).challengeKey, key);
            $scope.$broadcast('rebuild:challengeTable');
        } else {
            $scope.getKeys(viewOn).leaderboardKey = toggleKey($scope.getKeys(viewOn).leaderboardKey, key);
            $scope.$broadcast('rebuild:leaderboardTable');
            $scope.setCurrentPage(0);
        }
    };

    /**
     * show pagination only in division leaderboard panel.
     */
    $scope.isShowPage = function () {
        return $rootScope.currentViewOn !== 'room';
    };

    /**
     * Set the view on Room, Division I, or Division II tab.
     * Not limit page size when in room tab.
     * @param view can be 'room', 'divOne', 'divTwo'
     */
    $scope.setViewOn = function (view) {
        $rootScope.currentViewOn = view;
        var divID = helper.VIEW_ID[view];
        $scope.viewOn = view;
        $scope.currentKeys = $scope.getKeys($scope.viewOn);
        if (view !== 'room') {
            $scope.divisionID = divID;
            $rootScope.getDivSummary($scope.contest.roundID, divID);
            $scope.numOfPage = Number(config.divsionLearderBoardLimit);
        } else {
            $scope.divisionID = $stateParams.divisionId;
            $scope.numOfPage = 999999;
            $rootScope.closeLastDivSummary();
            $rootScope.leaderboard = $scope.getCurrentLeaderboard();

            $rootScope.isDivLoading = false;
        }
        $rootScope.$broadcast(helper.EVENT_NAME.LeaderboardRefreshed, {
            moveToFirstPage: true,
            updateNow: true
        });
    };

    $timeout(function () {
        $scope.rebuildScrollbars();
    }, 100);

    $scope.getViewOnTitle = function () {
        if ($scope.viewOn === 'room') {
            return 'Room';
        }
        if ($scope.viewOn === 'divOne') {
            return 'Division I';
        }
        if ($scope.viewOn === 'divTwo') {
            return 'Division II';
        }
    };

    $scope.percentage = function (success, total) {
        if (total <= 0) {
            return '0%';
        }
        return (success * 100.0 / total).toFixed(0) + '%';
    };
    /**
     * Check if the registration phase is finished.
     *
     * @returns {boolean} true if the registration phase is finished
     */
    $scope.registrationFinished = function () {
        //return $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase;
        return true;
    };

    /**
     * Check if the challenge related sections are availalbe.
     *
     * @returns {boolean} true if challege related sections are available
     */
    $scope.challengeAvailable = function () {
        if (angular.isUndefined($scope.contest) || angular.isUndefined($scope.contest.phaseDate)) {
            return false;
        }
        return $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.ChallengePhase;
    };

    filter.qtip({
        content: {
            text: ''
        },
        position: {
            my: 'top left',
            at: 'bottom left',
            target: $window,
            adjust: {
                x: -34,
                y: -25
            }
        },
        show: {
            event: 'click',
            solo: true
        },
        hide: 'click unfocus',
        style: {
            classes: 'filterPanel'
        }
    });
    lbFilter.qtip('api').set('content.text', lbFilter.next());
    lbFilter.qtip('api').set('position.target', lbFilter);

    $scope.closeQtip = function (panel) {
        if (panel === 'leaderboard') {
            lbFilter.qtip('api').toggle(false);
        }
    };
    // browser back action
    $rootScope.$watch(function () { // fixed function declaration
        return $location.path();
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) { // Update: variable name case should be the same
            $('.filterPanel').hide(); // close filter panel
        }
    }, true);
    // filter action
    $scope.getFilterKey = function (viewOn, panel) {
        if (panel === 'leaderboard') {
            if ($scope.getKeys(viewOn).lbFilterKey === 'all') {
                return 'All Handles';
            }
            if ($scope.getKeys(viewOn).lbFilterKey === 'specific') {
                return 'Specific Handle';
            }
        }
    };
    $scope.checkFilter = function (viewOn, panel) {
        if (panel === 'leaderboard' && $scope.getKeys(viewOn).lbFilterKey === 'all') {
            $('.filterPanel').removeClass('largeSize');
        } else {
            $('.filterPanel').addClass('largeSize');
        }
    };
    $scope.setFilterKey = function (viewOn, panel, key) {
        if (key === 'specific') {
            $('.filterPanel').addClass('largeSize');
        }
        if (key === 'all') {
            $('.filterPanel').removeClass('largeSize');
        }
        if (panel === 'leaderboard') {
            $scope.getKeys(viewOn).lbFilterKey = key;
            $scope.lbHandleString = '';
        }
    };
    $scope.filterBegin = function (viewOn, panel) {
        // filter here
        if (panel === 'leaderboard') {
            lbFilter.qtip('api').toggle(false);
            if ($scope.getKeys(viewOn).lbFilterKey === 'specific') {
                $scope.getKeys(viewOn).lbFilter.userName = $scope.lbHandleString;
            } else {
                $scope.getKeys(viewOn).lbFilter.userName = '';
            }
            $timeout.cancel($rootScope.ldrbrdTimeoutPromise);
            $rootScope.ldrbrdTimeoutPromise = $timeout(function () {
                $scope.$broadcast('rebuild:leaderboardTable');
            }, helper.LEADERBOARD_TABLE_REBUILT_TIMEGAP);
        }
    };
    // bind keypress enter to filter
    $scope.pressKeyInFilter = function (ev, viewOn, panel) {
        if (ev.which === 13) {
            $scope.filterBegin(viewOn, panel);
        }
    };

    $scope.previousChallengeHandle = '';

    /**
     * View the source of the given coder and component.
     *
     * @param {{
     *           userName: string,
     *           userRating: number,
     *           teamName: string,
     *           userID: number,
     *           userType: number,
     *           countryName: string,
     *           components: {
     *              componentID: number,
     *              points: number,
     *              status: number,
     *              language: number
     *           }
     *        }} coder
     * @param {number} componentId
     */
    $scope.viewCode = function (coder, componentId) {
        var roomID = ($scope.viewOn === 'room') ? $scope.roomID : coder.roomID;
        preserveLastDivSummary = true;
        $rootScope.viewCode($scope.contest.phaseData.phaseType, $stateParams.roundId, $scope.divisionID,
                            componentId, roomID, coder.userName, 'details');
    };

    // Watch leaderboard display options changes.
    $scope.$watch(
        function (scope) {
            return {
                viewOn: scope.viewOn,
                currentKeys: scope.currentKeys,
                numOfPage: scope.numOfPage,
                currentPage: scope.currentPage
            };
        },
        function (newValues, oldValues) {
            $rootScope.leaderboardViewChangeHandler($scope, newValues, oldValues);
        },
        true
    );

    /*jslint unparam:true*/
    $scope.$on(helper.EVENT_NAME.LeaderboardRefreshed, function (event, options) {
        $rootScope.leaderboardRefreshHandler($scope, options);
    });
    /*jslint unparam:false*/

    $rootScope.injectLeaderboardRefresher($scope);

    if ($stateParams.viewOn) {
        $scope.setViewOn($stateParams.viewOn);
    } else {
        $scope.setViewOn('room');
    }
}];

module.exports = leaderboardCtrl;