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
 * @author amethystlei
 * @version 1.2
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
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
var userContestDetailCtrl = ['$scope', '$stateParams', '$rootScope', '$location', function ($scope, $stateParams, $rootScope, $location) {
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
    // Challengers
    function getChallengers(viewOn) {
        if ($scope.challengersDivs.length < 2 || (viewOn === 'room' && ($scope.userDivision < 1 || $scope.userRoomId < 1))) {
            return [];
        }
        if (viewOn === 'room') {
            // return $filter('filter')($scope.challengersDivs[$scope.userDivision - 1], {roomId: $scope.userRoomId});
            return $scope.roomChallengers;
        }
        return viewOn === 'divOne' ? $scope.challengersDivs[0] : $scope.challengersDivs[1];
    }
    function populateChallengers(viewOn) {
        var data = getChallengers(viewOn);
        $scope.challengers.length = 0;
        data.forEach(function (item) {
            $scope.challengers.push(item);
        });
        $scope.$broadcast('rebuild:challengerTable');
    }
    // Challenges
    function getChallenges(viewOn) {
        if ($scope.challengesDivs.length < 2 || (viewOn === 'room' && ($scope.userDivision < 1 || $scope.userRoomId < 1))) {
            return [];
        }
        if (viewOn === 'room') {
            // return $filter('filter')($scope.challengesDivs[$scope.userDivision - 1], {roomId: $scope.userRoomId});
            return $scope.roomChallenges;
        }
        return viewOn === 'divOne' ? $scope.challengesDivs[0] : $scope.challengesDivs[1];
    }
    function populateChallenges(viewOn) {
        var data = getChallenges(viewOn);
        $scope.challenges.length = 0;
        data.forEach(function (item) {
            $scope.challenges.push(item);
        });
        $scope.$broadcast('rebuild:challengeTable');
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
    $scope.showChallengers = 5;
    // challenges
    $scope.challenges = [];
    $scope.challengesDivs = [[], []];
    $scope.showChallenges = 5;
    // leaderboards
    $scope.boards = [[], []];
    $scope.leaderboard = [];
    $scope.showBy = 'points';

    /**
     * Get the selected leader board.
     *
     * @returns {Array} the leader board
     */
    $scope.getCurrentLeaderboard = function () {
        if ($scope.viewOn === 'room') {
            return $rootScope.roomData[$scope.roomID].coders;
        }
        // For now it is set to empty for division summary.
        if ($scope.viewOn === 'divOne') {
            return [];
        }
        if ($scope.viewOn === 'divTwo') {
            return [];
        }
    };

    $scope.roomKeys = {
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
            // filter on the field 'userName' of a coder
            userName: ''
        }
    };
    $scope.divOneKeys = {
        challengerKey: '-points',
        challengeKey: '-date',
        leaderboardKey: '-results[0].score',
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
            handle: ''
        }
    };
    $scope.divTwoKeys = {
        challengerKey: '-points',
        challengeKey: '-date',
        leaderboardKey: '-results[0].score',
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
            handle: ''
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
        $scope.viewOn = view;
        rebuildScrollbars();
    };
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
     * @param status the status
     * @returns {string} the css class name
     */
    $scope.getStatusColor = function (status) {
        return 'color' + helper.CODER_PROBLEM_STATUS_NAME[status];
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
                $scope.showChallengers = $scope.challengers.length;
                populateChallengers($scope.viewOn);
                $scope.$broadcast('rebuild:challengerTable');
            } else if (element === 'challengesPanel') {
                $scope.showChallenges = $scope.challenges.length;
                populateChallenges($scope.viewOn);
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
                $scope.showChallengers = 5;
                populateChallengers($scope.viewOn);
                $scope.$broadcast('rebuild:challengerTable');
            } else if (element === 'challengesPanel') {
                $scope.showChallenges = 5;
                populateChallenges($scope.viewOn);
                $scope.$broadcast('rebuild:challengeTable');
            } else {
                $scope.$broadcast('rebuild:leaderboardTable');
            }
        }
    };

    // qtip here
    // use qtip to create a filter panel
    var filter = $('.filterToggle'),
        lbFilter = $('#leaderboardFilter'),
        challengeFilter = $('#challengeFilter'),
        challengerFilter = $('#challengerFilter');
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
        } else if (panel === 'challenge') {
            $scope.getKeys(viewOn).challengeFilterKey = key;
        } else if (panel === 'challenger') {
            $scope.getKeys(viewOn).challengerFilterKey = key;
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
        } else if (panel === 'challenge') {
            challengeFilter.qtip('api').toggle(false);
            if ($scope.getKeys(viewOn).challengeFilterKey === 'specific') {
                $scope.getKeys(viewOn).challengeFilter.challenger.handle = $scope.challengeHandleString;
            } else {
                $scope.getKeys(viewOn).challengeFilter.challenger.handle = '';
            }
        } else if (panel === 'challenger') {
            challengerFilter.qtip('api').toggle(false);
            if ($scope.getKeys(viewOn).challengerFilterKey === 'specific') {
                $scope.getKeys(viewOn).challengerFilter.handle = $scope.challengerHandleString;
            } else {
                $scope.getKeys(viewOn).challengerFilter.handle = '';
            }
        }
    };
    // bind keypress enter to filter
    $scope.pressKeyInFilter = function (ev, viewOn, panel) {
        if (ev.which === 13) {
            $scope.filterBegin(viewOn, panel);
        }
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
        if ($scope.contest.phaseData.phaseType >= helper.PHASE_TYPE_ID.ChallengePhase) {
            $scope.$state.go(helper.STATE_NAME.ViewCode, {
                roundId: $stateParams.contestId,
                divisionId: $scope.divisionID,
                componentId: componentId,
                roomId: $scope.roomID,
                defendant: coder.userName
            });
        }
    };
}];

module.exports = userContestDetailCtrl;