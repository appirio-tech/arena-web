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
 * @author amethystlei, dexy, ananthhh, flytoj2ee, TCASSEMBLER
 * @version 1.9
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
var helper = require('../helper');

/**
 * The main controller for the room summary page.
 *
 * @type {*[]}
 */
var userContestDetailCtrl = ['$scope', '$stateParams', '$rootScope', '$location', '$timeout', 'socket', '$window', 'appHelper', function ($scope, $stateParams, $rootScope, $location, $timeout, socket, $window, appHelper) {
    /**
     * Check if the client suppports touch screen.
     *
     * @returns {boolean} true if the client supports touch screen.
     */
    function isTouchSupported() {
        var msTouchEnabled = window.navigator.msMaxTouchPoints,
            generalTouchEnabled = document.createElement('div').hasOwnProperty('ontouchstart');
        if (msTouchEnabled || generalTouchEnabled) {
            return true;
        }
        return false;
    }
    console.log('isTouch:' + isTouchSupported());
    if (isTouchSupported()) {
        $('.sumDiv .scroll, .tableDiv.scroll').hide();
        $('.sumDiv .default, .tableDiv.default').show();
    }

    /**
     * This function broadcasts the rebuild scrollbar message.
     */
    function rebuildScrollbars() {
        $('.ngsb-container').css('top', '0');
        $scope.$broadcast('rebuild:summary');
        $scope.$broadcast('rebuild:challengerTable');
        $scope.$broadcast('rebuild:challengeTable');
        $scope.$broadcast('rebuild:leaderboardTable');
    }

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

    var // qtip here
        // use qtip to create a filter panel
        filter = $('.filterToggle'),
        lbFilter = $('#leaderboardFilter'),
        challengeFilter = $('#challengeFilter'),
        challengerFilter = $('#challengerFilter'),
        ldrbrdTimeoutPromise,
        /**
         * Close the division summary.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        closeDivSummary = function (roundID, divisionID) {
            if (angular.isDefined($rootScope.lastDivSummary)) {
                socket.emit(helper.EVENT_NAME.CloseDivSummaryRequest, {
                    roundID: roundID,
                    divisionID: divisionID
                });
            }
        },
        /**
         * Close the last opened division summary.
         */
        closeLastDivSummary = function () {
            if (angular.isDefined($rootScope.lastDivSummary)) {
                closeDivSummary($rootScope.lastDivSummary.roundID, $rootScope.lastDivSummary.divisionID);
            }
            $rootScope.lastDivSummary = undefined;
        },
        /**
         * Open the division summary.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        openDivSummary = function (roundID, divisionID) {
            socket.emit(helper.EVENT_NAME.DivSummaryRequest, {
                roundID: roundID,
                divisionID : divisionID
            });
            $rootScope.lastDivSummary = {
                roundID: roundID,
                divisionID: divisionID
            };
        },
        /**
         * Get the division summary.
         * It is first sending close div summary for the summary we want to open.
         * NOTE: This is the behavior of the Arena applet.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        getDivSummary = function (roundID, divisionID) {
            if (angular.isDefined($rootScope.lastDivSummary) && angular.isDefined(angular.isDefined($rootScope.lastDivSummary.roundID))
                    && angular.isDefined($rootScope.lastDivSummary.divisionID)
                    && $rootScope.lastDivSummary.roundID === roundID && $rootScope.lastDivSummary.divisionID === divisionID) {
                return;
            }
            closeLastDivSummary();
            $scope.currentlyLoaded = 0;
            $scope.totalLoading = 0;
            $scope.isDivLoading = true;
            $scope.leaderboard = [];
            angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
                if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID) {
                    coderRoom.isLoading = true;
                    $scope.totalLoading += 1;
                }
            });
            if ($scope.totalLoading === 0) {
                $scope.isDivLoading = false;
            }
            closeDivSummary(roundID, divisionID);
            $timeout(function () {
                openDivSummary(roundID, divisionID);
            }, helper.DIVSUMMARYREQUEST_TIMEGAP);
        },
        /**
         * Update the division summary
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        updateDivSummary = function (roundID, divisionID) {
            var il;
            $scope.leaderboard = [];
            if (angular.isDefined($rootScope.roundData) && angular.isDefined($rootScope.roundData[roundID])
                    && angular.isDefined($rootScope.roundData[roundID].coderRooms)) {
                angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
                    if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID &&
                            angular.isDefined($rootScope.roomData[coderRoom.roomID])) {
                        coderRoom.isLoading = false;
                        angular.forEach($rootScope.roomData[coderRoom.roomID].coders, function (coder) {
                            coder.roomID = coderRoom.roomID;
                        });
                        $scope.leaderboard = $scope.leaderboard.concat($rootScope.roomData[coderRoom.roomID].coders);
                    }
                });
            }
            if ($scope.leaderboard.length > 0) {
                $scope.leaderboard.sort(function (coderA, coderB) {
                    return coderB.totalPoints - coderA.totalPoints;
                });
                $scope.leaderboard[0].divPlace = 1;
                for (il = 1; il < $scope.leaderboard.length; il += 1) {
                    if ($scope.leaderboard[il].totalPoints === $scope.leaderboard[il - 1].totalPoints) {
                        $scope.leaderboard[il].divPlace = $scope.leaderboard[il - 1].divPlace;
                    } else {
                        $scope.leaderboard[il].divPlace = (il + 1);
                    }
                }
            }
            $scope.isDivLoading = false;
            $scope.currentlyLoaded = 0;
            angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
                if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID) {
                    if (coderRoom.isLoading) {
                        $scope.currentlyLoaded += 1;
                        $scope.isDivLoading = true;
                    }
                }
            });
            $timeout.cancel(ldrbrdTimeoutPromise);
            ldrbrdTimeoutPromise = $timeout(function () {
                $scope.$broadcast('rebuild:leaderboardTable');
            }, helper.LEADERBOARD_TABLE_REBUILT_TIMEGAP);
        },
        /**
         * Update the room summary.
         * It only checks if the current opened division summary (if any) should be updated
         * if the room with roomID is updated. It then calls updateDivSummary.
         *
         * @param roomID the room id
         */
        updateRoomSummary = function (roomID) {
            var updatedDivSummary = false;
            if ($scope.viewOn !== 'room') {
                if (angular.isDefined($rootScope.roundData) && angular.isDefined($rootScope.roundData[$stateParams.contestId])
                        && angular.isDefined($rootScope.roundData[$stateParams.contestId].coderRooms)) {
                    angular.forEach($rootScope.roundData[$stateParams.contestId].coderRooms, function (coderRoom) {
                        if (coderRoom.roomID === roomID && coderRoom.divisionID === helper.VIEW_ID[$scope.viewOn] && coderRoom.roundID === Number($stateParams.contestId)) {
                            updatedDivSummary = true;
                        }
                    });
                }
            }
            if (updatedDivSummary) {
                updateDivSummary(Number($stateParams.contestId), helper.VIEW_ID[$scope.viewOn]);
            }
        },
        /**
         * Close the last opened division summary on leaving the page.
         */
        onLeavingContestDetailPage = function () {
            closeLastDivSummary();
        };
    /*jslint unparam:true*/
    $scope.$on(helper.EVENT_NAME.UpdateCoderComponentResponse, function (event, data) {
        updateRoomSummary(data.roomID);
    });
    $scope.$on(helper.EVENT_NAME.UpdateCoderPointsResponse, function (event, data) {
        updateRoomSummary(data.roomID);
    });
    $scope.$on(helper.EVENT_NAME.CreateChallengeTableResponse, function (event, data) {
        updateRoomSummary(data.roomID);
    });
    /*jslint unparam:false*/

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
    $scope.leaderboard = [];
    $scope.showBy = 'points';
    $scope.isDivisionActive = appHelper.isDivisionActive;
    /**
     * Get the selected leader board.
     *
     * @returns {Array} the leader board
     */
    $scope.getCurrentLeaderboard = function () {
        if ($scope.viewOn === 'room') {
            return $rootScope.roomData[$scope.roomID].coders;
        }
        if ($scope.viewOn === 'divOne') {
            return $scope.leaderboard;
        }
        if ($scope.viewOn === 'divTwo') {
            return $scope.leaderboard;
        }
    };

    // Closes the opened division summary on page leaving.
    $window.onbeforeunload = onLeavingContestDetailPage;
    $scope.$on("$destroy", onLeavingContestDetailPage);
    $scope.isDivLoading = false;

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
        }
    };

    /**
     * Set the view on Room, Division I, or Division II tab.
     *
     * @param view can be 'room', 'divOne', 'divTwo'
     */
    $scope.setViewOn = function (view) {
        $rootScope.currentViewOn = view;
        var divID = helper.VIEW_ID[view];
        if (view !== 'room') {
            getDivSummary($scope.contest.roundID, divID);
        } else {
            closeLastDivSummary();
            $scope.leaderboard = [];
            $scope.isDivLoading = false;
        }
        $scope.viewOn = view;

        rebuildScrollbars();
    };

    setTimeout(function () {
        rebuildScrollbars();
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

    if ($stateParams.viewOn) {
        $scope.setViewOn($stateParams.viewOn);
    } else {
        $scope.setViewOn('room');
    }

    /**
     * Get the score for display by dividing 100 and round at two digits after the decimal point.
     *
     * @param score the score multiplied by 100
     * @returns {string} the score for display
     */
    $scope.formatScore = function (score) {
        return (score * 0.01).toFixed(2);
    };
    $scope.percentage = function (success, total) {
        if (total <= 0) {
            return '0%';
        }
        return (success * 100.0 / total).toFixed(0) + '%';
    };

    /**
     * Get the css class for the color of the component status.
     *
     * @param component the component
     * @param languageID the id of the language
     * @returns {string} the css class name
     */
    $scope.getStatusColor = function (status, languageID) {
        var statusName = helper.CODER_PROBLEM_STATUS_NAME[status],
            className = 'color' + statusName;
        if (statusName === 'Submitted' || statusName === 'Challenged'
                || statusName === 'Failed' || statusName === 'Passed') {
            className += helper.LANGUAGE_NAME[languageID];
        }
        return className;
    };

    /**
     * Get the result to display on the room/division summary table for a coder component.
     *
     * @param component the coder component object
     * @param showBy 'points' or 'status'
     * @returns {string} the string indicating the coder component
     */
    $scope.showResult = function (component, showBy) {
        if (component.status < helper.CODER_PROBLEM_STATUS_ID.NOT_CHALLENGED) {
            // Not submitted, show status
            return helper.CODER_PROBLEM_STATUS_NAME[component.status];
        }
        // show points when:
        // 1) user wants to show by points; or
        // 2) the problem is submitted but not challenged nor system tested
        if (showBy === 'points' || component.status <= helper.CODER_PROBLEM_STATUS_ID.CHALLENGE_FAILED) {
            return $scope.formatScore(component.points);
        }
        // show status
        return helper.CODER_PROBLEM_STATUS_NAME[component.status];
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
     * Check if the code of the component can be viewed by the user.
     *
     * @params component the component
     * @returns {boolean} true if the component can be viewed
     */
    $scope.isViewable = function (component) {
        // cannot view when phase is not challenge or after.
        if ($scope.contest.phaseData.phaseType < helper.PHASE_TYPE_ID.ChallengePhase) {
            return false;
        }
        // cannot view if it is not submitted.
        if (component.status < helper.CODER_PROBLEM_STATUS_ID.NOT_CHALLENGED) {
            return false;
        }
        return true;
    };

    /**
     * Go back to the contest page.
     */
    $scope.goBack = function () {
        $scope.$state.go(helper.STATE_NAME.Contest, {
            contestId : $scope.contest.roundID,
            divisionId : $scope.divisionID
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
            $timeout.cancel(ldrbrdTimeoutPromise);
            ldrbrdTimeoutPromise = $timeout(function () {
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
            $scope.getKeys(viewOn).challengeFilterKey='specific';
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
        if ($scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.ChallengePhase) {
            $scope.$state.go(helper.STATE_NAME.ViewCode, {
                roundId: $stateParams.contestId,
                divisionId: $scope.divisionID,
                componentId: componentId,
                roomId: roomID,
                defendant: coder.userName
            });
        }
    };

    /**
     * Get coder history.
     *
     * @param userName - the user handle.
     */
    $scope.getCoderHistory = function (userName) {
        socket.emit(helper.EVENT_NAME.CoderHistoryRequest, {handle: userName, userType: 1, historyType: -1,
            roomID: $rootScope.currentRoomInfo.roomID});
    };

    // Show the coder history.
    socket.on(helper.EVENT_NAME.CoderHistoryResponse, function (data) {
        var i, tmpDate, coderHistoryData = [];

        for (i = 0; i < data.historyData.length; i++) {
            tmpDate = new Date(data.historyData[i].time);

            coderHistoryData.push({"time": (tmpDate.getMonth() + 1) + "-" + tmpDate.getDate() + "-" + tmpDate.getFullYear()
                + " " + tmpDate.getHours() + ":" + tmpDate.getMinutes() + ":" + tmpDate.getSeconds(),
                "actionDescription": data.historyData[i].actionDescription, "userName": data.historyData[i].coder.userName,
                "userRating": data.historyData[i].coder.userRating,
                "componentValue": data.historyData[i].componentValue, "points": data.historyData[i].points, "detail": data.historyData[i].detail});
        }

        $scope.openModal({
            title: 'Coder History',
            coderHistoryData: coderHistoryData,
            message: ''
        }, null, null, 'partials/user.code.history.html');

    });
}];

module.exports = userContestDetailCtrl;