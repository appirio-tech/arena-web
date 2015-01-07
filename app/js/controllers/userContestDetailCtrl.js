/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles coding editor related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Updated to use real data for room summary.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Challenge Phase):
 * - Added the navigation for viewing code.
 * - Removed unnecessary $state injection as it is exposed by $rootScope.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Division Summary):
 * - Added $timeout, socket and $window.
 * - Added closeDivSummary, closeLastDivSummary, openDivSummary, getDivSummary,
 *   updateDivSummary, updateRoomSummary to handle retrieving and updating division summary.
 * - Added listeners for UpdateCoderComponentResponse, UpdateCoderPointsResponse,
 *   CreateChallengeTableResponse events to handle division summary update.
 * - Added getLeaderRoomClass to $scope to handle room leader class.
 * - Added isDivisionActive to scope to check if division is active (has problems).
 * - Updated getCurrentLeaderboard to handle 'divOne' and 'divTwo' views.
 * - Added $window.onbeforeunload and $scope.$on('destroy') listeners to close
 *   division summary on page leaving
 * - Updated divOneKeys and divTwoKeys to handle real data.
 * - Updated setViewOn to open division summary and retrieve real data.
 * - Updated getStatusColor to include language id for color selection.
 * - Updated viewCode to include the room of the coder and not the current room
 *   when opening the problem.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Color will be different for different language
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Added show coder history logic.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Rebuild the scroll bar at page load.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Coder History):
 * - Refractor the code for coder history modal.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Phase I Bug Fix 5):
 * - Set current view value to cache.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Challenges and Challengers):
 * - Added logic to support challenges and challengers table.
 *
 * Changes in version 2.0 (Web Arena - Division Leaderboard Pagination):
 * - Added division leaderboard pagination
 *
 * Changes in version 2.1 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Moved closeDivSummary, closeLastDivSummary, openDivSummary, getDivSummary, updateDivSummary
 *   updateRoomSummary, formatScore, getStatusColor, showResult, isViewable, ldrbrdTimeoutPromise,
 *   getCoderHistory to baseCtrl.js to have global support for leaderboard tables.
 *
 * Changes in version 2.2 (Sort is not retained in room summary):
 * - Fix issue of Sort is not retained in room summary
 *
 * Changes in version 2.3 (Web Arena - Leaderboard Performance Improvement):
 * - Updated to use the variable leaderboard instead of calling the function
 *   getCurrentLeaderboard() in the template app/partials/user.contest.detail.html
 *   to improve the performance of the leaderboard.
 *
 * @author amethystlei, dexy, ananthhh, flytoj2ee, savon_cn, TCSASSEMBLER
 * @version 2.3
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global module, require, angular, $, document, window, console*/

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper'),
    config = require('../config');
/**
 * The main controller for the room summary page.
 *
 * @type {*[]}
 */
var userContestDetailCtrl = ['$scope', '$stateParams', '$rootScope', '$location', '$timeout', '$window', 'appHelper', function ($scope, $stateParams, $rootScope, $location, $timeout, $window, appHelper) {
    var // qtip here
        // use qtip to create a filter panel
        filter = $('.filterToggle'),
        lbFilter = $('#leaderboardFilter'),
        challengeFilter = $('#challengeFilter'),
        challengerFilter = $('#challengerFilter'),
        lastPageNums = [],
        lastInvokeTime = 0,
        preserveLastDivSummary = false,
        cleanBeforeUnload = function () {
            if (!preserveLastDivSummary) {
                $rootScope.closeLastDivSummary();
            }
        };
// page for Division Leaderboard
    $scope.numOfPage = Number(config.divsionLearderBoardLimit);
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

        if (num === 0) {
            return [];
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
        $scope.restoreSortKeys();
        $scope.$broadcast('rebuild:summary');
        $scope.$broadcast('rebuild:challengerTable');
        $scope.$broadcast('rebuild:challengeTable');
        $scope.$broadcast('rebuild:leaderboardTable');
    };

    /**
     * This function is to restore the sort keys.
     */
    $scope.restoreSortKeys = function () {
        if (!$rootScope.isKeepSort) {
            $rootScope.contestSortKeys = {};
        } else {
            angular.forEach($rootScope.contestSortKeys, function (status, panel) {
                if (panel === 'challenger') {
                    $scope.getKeys(status.viewOn).challengerKey = status.key;
                } else if (panel === 'challenge') {
                    $scope.getKeys(status.viewOn).challengeKey = status.key;
                } else {
                    $scope.getKeys(status.viewOn).leaderboardKey = status.key;
                    $scope.setCurrentPage(0);
                }
            });
        }
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
     * Get all challenges.
     * @returns {*} the challenges.
     */
    $scope.getAllChallenges = function () {
        return $rootScope.challenges[$scope.roomID];

    };

    /**
     * Get all challengers.
     * @returns {Array} the challengers.
     */
    $scope.getAllChallengers = function () {
        return $rootScope.calculatedChallengers;

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
    $scope.contest = $rootScope.roundData[$stateParams.contestId];
    $scope.divisionID = $stateParams.divisionId;
    $scope.roomID = $rootScope.currentRoomInfo.roomID;

    $scope.$state.current.data.pageTitle = $scope.contest.roundName;

    // room
    $scope.userRoomId = 0;
    $scope.userDivision = 0;
    $scope.roomBoard = [];
    $scope.roomChallenges = [];
    $scope.roomChallengers = [];
    // challengers
    $scope.challengers = [];
    $scope.challengersDivs = [[], []];
    // challenges
    $scope.challengesDivs = [[], []];
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
        return $rootScope.getCurrentLeaderboard($scope.viewOn, $scope.roomID);
    };




    // Closes the opened division summary on page leaving.
    $window.onbeforeunload = cleanBeforeUnload;
    $scope.$on("$destroy", cleanBeforeUnload);

    $scope.roomKeys = {
        challengerKey: '-points',
        challengeKey: '-date',
        leaderboardKey: '-totalPoints',
        challengerFilterKey: 'all',
        challengeFilterKey: 'all',
        lbFilterKey: 'all',
        challengerFilter : {
            challengerHandle: ''
        },
        challengeFilter : {
            challengerHandle: ''
        },
        lbFilter : {
            // filter on the field 'userName' of a coder
            userName: ''
        }
    };
    $scope.divOneKeys = {
        challengerKey: '-points',
        challengeKey: '-date',
        leaderboardKey: '-totalPoints',
        challengerFilterKey: 'all',
        challengeFilterKey: 'all',
        lbFilterKey: 'all',
        challengerFilter : {
            handle: ''
        },
        challengeFilter : {
            challenger: {
                handle: ''
            }
        },
        lbFilter : {
            userName: ''
        }
    };
    $scope.divTwoKeys = {
        challengerKey: '-points',
        challengeKey: '-date',
        leaderboardKey: '-totalPoints',
        challengerFilterKey: 'all',
        challengeFilterKey: 'all',
        lbFilterKey: 'all',
        challengerFilter : {
            handle: ''
        },
        challengeFilter : {
            challenger: {
                handle: ''
            }
        },
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
        var currentKey = "", currentKeys = $scope.getKeys(viewOn);
        if (panel === 'challenger') {
            currentKeys.challengerKey = toggleKey(currentKeys.challengerKey, key);
            currentKey = currentKeys.challengerKey;
            $scope.$broadcast('rebuild:challengerTable');
        } else if (panel === 'challenge') {
            currentKeys.challengeKey = toggleKey(currentKeys.challengeKey, key);
            currentKey = currentKeys.challengeKey;
            $scope.$broadcast('rebuild:challengeTable');
        } else {
            currentKeys.leaderboardKey = toggleKey(currentKeys.leaderboardKey, key);
            currentKey = currentKeys.leaderboardKey;
            $scope.$broadcast('rebuild:leaderboardTable');
            $scope.setCurrentPage(0);
        }
        //store the current sort keys
        $rootScope.contestSortKeys[panel] = {viewOn: viewOn, key: currentKey};
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

    setTimeout(function () {
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
     * Check if the challenge related sections are availalbe.
     *
     * @returns {boolean} true if challege related sections are available
     */
    $scope.challengeAvailable = function () {
        return $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.ChallengePhase;
    };

    /**
     * Check if the registration phase is finished.
     *
     * @returns {boolean} true if the registration phase is finished
     */
    $scope.registrationFinished = function () {
        return $scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.AlmostContestPhase;
    };

    /**
     * Go back to the contest page.
     */
    $scope.goBack = function () {
        preserveLastDivSummary = true;
        $scope.$state.go(helper.STATE_NAME.Contest, {
            contestId : $scope.contest.roundID,
            divisionId : $scope.divisionID,
            viewOn: $scope.viewOn
        });
    };

    $scope.toggleExpand = function (element, container, hidden) {
        var target = angular.element(document.getElementById(element)),
            containerPart = angular.element(document.getElementById(container)),
            hiddenPart = angular.element(document.getElementById(hidden));
        if (!target.hasClass('expand')) {
            // expand
            target.addClass('expand');
            hiddenPart.addClass('hidden');
            containerPart.removeClass('col-lg-6')
                .removeClass('col-md-6')
                .addClass('col-lg-12')
                .addClass('col-md-12')
                .addClass('expand');
            if (element === 'challengersPanel') {
                $scope.$broadcast('rebuild:challengerTable');
            } else if (element === 'challengesPanel') {
                $scope.$broadcast('rebuild:challengeTable');
            } else {
                $scope.$broadcast('rebuild:leaderboardTable');
            }
        } else {
            target.removeClass('expand');
            hiddenPart.removeClass('hidden');
            containerPart.addClass('col-lg-6')
                .addClass('col-md-6')
                .removeClass('col-lg-12')
                .removeClass('col-md-12')
                .removeClass('expand');
            if (element === 'challengersPanel') {
                $scope.$broadcast('rebuild:challengerTable');
            } else if (element === 'challengesPanel') {
                $scope.$broadcast('rebuild:challengeTable');
            } else {
                $scope.$broadcast('rebuild:leaderboardTable');
            }
        }
    };

    filter.qtip({
        content: {
            text: ''
        },
        position: {
            my: 'top left',
            at: 'bottom left',
            target: filter,
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
    challengeFilter.qtip('api').set('content.text', challengeFilter.next());
    challengeFilter.qtip('api').set('position.target', challengeFilter);
    challengerFilter.qtip('api').set('content.text', challengerFilter.next());
    challengerFilter.qtip('api').set('position.target', challengerFilter);

    $scope.closeQtip = function (panel) {
        if (panel === 'leaderboard') {
            lbFilter.qtip('api').toggle(false);
        } else if (panel === 'challenge') {
            challengeFilter.qtip('api').toggle(false);
        } else if (panel === 'challenger') {
            challengerFilter.qtip('api').toggle(false);
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
        } else if (panel === 'challenge') {
            if ($scope.getKeys(viewOn).challengeFilterKey === 'all') {
                return 'All Handles';
            }
            if ($scope.getKeys(viewOn).challengeFilterKey === 'specific') {
                return 'Specific Handle';
            }
        } else if (panel === 'challenger') {
            if ($scope.getKeys(viewOn).challengerFilterKey === 'all') {
                return 'All Handles';
            }
            if ($scope.getKeys(viewOn).challengerFilterKey === 'specific') {
                return 'Specific Handle';
            }
        }
    };
    $scope.checkFilter = function (viewOn, panel) {
        if ((panel === 'leaderboard' && $scope.getKeys(viewOn).lbFilterKey === 'all') ||
                (panel === 'challenge' && $scope.getKeys(viewOn).challengeFilterKey === 'all') ||
                (panel === 'challenger' && $scope.getKeys(viewOn).challengerFilterKey === 'all')) {
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
        } else if (panel === 'challenge') {
            $scope.getKeys(viewOn).challengeFilterKey = key;
            $scope.challengeHandleString = '';
        } else if (panel === 'challenger') {
            $scope.getKeys(viewOn).challengerFilterKey = key;
            $scope.challengerHandleString = '';
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
        } else if (panel === 'challenge') {
            challengeFilter.qtip('api').toggle(false);
            if ($scope.getKeys(viewOn).challengeFilterKey === 'specific') {
                $scope.getKeys(viewOn).challengeFilter.challengerHandle = $scope.challengeHandleString;
            } else {
                $scope.getKeys(viewOn).challengeFilter.challengerHandle = '';
            }
        } else if (panel === 'challenger') {
            challengerFilter.qtip('api').toggle(false);
            if ($scope.getKeys(viewOn).challengerFilterKey === 'specific') {
                $scope.getKeys(viewOn).challengerFilter.challengerHandle = $scope.challengerHandleString;
            } else {
                $scope.getKeys(viewOn).challengerFilter.challengerHandle = '';
            }
        }
    };
    // bind keypress enter to filter
    $scope.pressKeyInFilter = function (ev, viewOn, panel) {
        if (ev.which === 13) {
            $scope.filterBegin(viewOn, panel);
        }
    };

    // Removes coder handle filter
    $scope.stopHandleFilter = function(viewOn) {
        $scope.getKeys(viewOn).lbFilter.userName = '';

        $timeout.cancel($rootScope.ldrbrdTimeoutPromise);

        $rootScope.ldrbrdTimeoutPromise = $timeout(function () {
            $scope.$broadcast('rebuild:leaderboardTable');
        }, helper.LEADERBOARD_TABLE_REBUILT_TIMEGAP);
    }

    $scope.previousChallengeHandle = '';

    /**
     * Filter the challenges by user handle.
     *
     * @param viewOn - the view which current user using
     * @param handle - the user handle
     */
    $scope.filterChallenges = function (viewOn, handle) {
        if ($scope.previousChallengeHandle === handle) {
            $scope.getKeys(viewOn).challengeFilter.challengerHandle = '';
            $scope.previousChallengeHandle = '';
            $scope.challengeHandleString = '';
        } else {
            $('.filterPanel').addClass('largeSize');
            $scope.previousChallengeHandle = handle;
            $scope.getKeys(viewOn).challengeFilterKey = 'specific';
            $scope.getKeys(viewOn).challengeFilter.challengerHandle = handle;
            $scope.challengeHandleString = handle;
            challengeFilter.qtip('api').render();
        }
        $rootScope.$broadcast('rebuild:challengeTable');
    };

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
        $rootScope.viewCode($scope.contest.phaseData.phaseType, $stateParams.contestId, $scope.divisionID,
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

module.exports = userContestDetailCtrl;
