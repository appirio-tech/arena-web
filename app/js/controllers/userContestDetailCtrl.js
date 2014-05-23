'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module, require, angular, $, document, console*/
var userContestDetailCtrl = ['$scope', '$http', '$state', '$stateParams', '$rootScope', '$location', function ($scope, $http, $state, $stateParams, $rootScope, $location) {
    var helper = require('../helper');
    // Represents the problem status name
    helper.PROBLEM_STATUS_NAME = [
        'Unopened',
        'Opened',
        'Compiled',
        'Submitted',
        'Challenged',
        'Passed',
        'Failed'
    ];
    // Represents the problem status id.
    helper.PROBLEM_STATUS_ID = {
        Unopened: 0,
        Opened: 1,
        Compiled: 2,
        Submitted: 3,
        Challenged: 4,
        Passed: 5,
        Failed: 6
    };
    // is touch screen
    function isTouchSupported() {
        var msTouchEnabled = window.navigator.msMaxTouchPoints;
        var generalTouchEnabled = "ontouchstart" in document.createElement("div");
     
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
    // Leaderboard
    function getLeaderboard(viewOn) {
        if ($scope.boards.length < 2 || (viewOn === 'room' && ($scope.userDivision < 1 || $scope.userRoomId < 1))) {
            return [];
        }
        if (viewOn === 'room') {
            // return $filter('filter')($scope.boards[$scope.userDivision - 1], {roomId: $scope.userRoomId});
            return $scope.roomBoard;
        }
        return viewOn === 'divOne' ? $scope.boards[0] : $scope.boards[1];
    }
    function populateLeaderboard(viewOn) {
        var data = getLeaderboard(viewOn);
        $scope.leaderboard.length = 0;
        data.forEach(function (item) {
            $scope.leaderboard.push(item);
        });
        $scope.$broadcast('rebuild:leaderboardTable');
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
    function populateDataByView(view) {
        populateLeaderboard(view);
        populateChallengers(view);
        populateChallenges(view);
        $('.ngsb-container').css('top', '0');
        $scope.$broadcast('rebuild:challengerTable');
        $scope.$broadcast('rebuild:challengeTable');
        $scope.$broadcast('rebuild:leaderboardTable');
    }
    // tentative names/ids for problem status, not defined in helper.js
    function revParseStatus(status) {
        return helper.PROBLEM_STATUS_NAME.indexOf(status);
    }
    function isFailed(status) {
        var statusId = revParseStatus(status);
        return statusId === helper.PROBLEM_STATUS_ID.Failed || statusId === helper.PROBLEM_STATUS_ID.Challenged;
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
    $scope.contest = {};

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

    $scope.roomKeys = {
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

    // viewOn ('room', 'divOne', 'divTwo')
    $scope.setViewOn = function (view) {
        $scope.viewOn = view;
        $scope.$broadcast('rebuild:summary');
        populateDataByView(view);
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

    // load data
    $http.get('data/contest-' + $stateParams.contestId + '.json').
        success(function (data) {

            function getDemoStatus(phaseId) {
                if (phaseId < helper.PHASE_TYPE_ID.CodingPhase) {
                    return 'preCoding';
                }
                if (phaseId < helper.PHASE_TYPE_ID.ChallengePhase) {
                    return 'preChallenge';
                }
                if (phaseId <= helper.PHASE_TYPE_ID.SystemTestingPhase) {
                    return 'preSystest';
                }
                return 'systest';
            }

            function setLeaderboard(board, division, boardData) {
                board.length = 0;
                boardData.leaderboard.forEach(function (item) {
                    if (!angular.isDefined(item.score)) {
                        item.score = 0;
                    }
                    if (item.results) {
                        item.results.forEach(function (problem) {
                            if (!angular.isDefined(problem.score) || isFailed(problem.status)) {
                                problem.score = 0;
                            }
                        });
                    }
                    board.push(item);
                });
                board.forEach(function (item) {
                    item.roomPlace = 1;
                    item.division = division;
                    board.forEach(function (subItem) {
                        if (item.roomId === subItem.roomId && item.handle !== subItem.handle &&
                                item.score < subItem.score) {
                            item.roomPlace += 1;
                        }
                    });
                });
            }

            function loadLeaderboard(board, division) {
                var url;
                if ($scope.contest.phaseId === helper.PHASE_TYPE_ID.AlmostContestPhase) {
                    url = 'data/4problems-leaderboard-div' + division + '-' + getDemoStatus($scope.contest.phaseId) + '.json';
                } else {
                    url = 'data/leaderboard-div' + division + '-' + getDemoStatus($scope.contest.phaseId) + '.json';
                }
                $http.get(url).success(function (boardData) {
                    setLeaderboard(board, division, boardData);
                    // populate data
                    populateLeaderboard($scope.viewOn);
                });
            }

            function setChallengeItems(challengers, items) {
                var i;
                challengers.length = 0;
                for (i = 0; i < items.length; i += 1) {
                    items[i].id = i + 1;
                    challengers.push(items[i]);
                }
            }

            function loadChallengers(challengers, division) {
                var url = 'data/challengers-div' + division + '.json';
                $http.get(url).success(function (data) {
                    setChallengeItems(challengers, data.challengers);
                    // populate data
                    populateChallengers($scope.viewOn);
                });
            }

            function loadChallenges(challenges, division) {
                var url = 'data/challenges-div' + division + '.json';
                $http.get(url).success(function (data) {
                    setChallengeItems(challenges, data.challenges);
                    // populate data
                    populateChallenges($scope.viewOn);
                });
            }

            function loadUserDivsionRoom() {
                var leaderboardURL;
                $http.get('data/div-room-' + $rootScope.username() + '.json').success(function (userData) {
                    $scope.userDivision = userData.division;
                    $scope.userRoomId = userData.roomId;
                    // load mock data for room leaderboard
                    if ($scope.contest.phaseId === helper.PHASE_TYPE_ID.AlmostContestPhase) {
                        leaderboardURL = 'data/4problems-leaderboard-div' + $scope.userDivision + 'room' + $scope.userRoomId + '-' + getDemoStatus($scope.contest.phaseId) + '.json';
                    } else {
                        leaderboardURL = 'data/leaderboard-div' + $scope.userDivision + 'room' + $scope.userRoomId + '-' + getDemoStatus($scope.contest.phaseId) + '.json';
                    }
                    $http.get(leaderboardURL).
                        success(function (boardData) {
                            setLeaderboard($scope.roomBoard, $scope.userDivision, boardData);
                            // populate data
                            populateDataByView($scope.viewOn);
                        });
                    // load mock data for room challenges
                    $http.get('data/challenges-div' + $scope.userDivision + 'room' + $scope.userRoomId + '.json').
                        success(function (data) {
                            setChallengeItems($scope.roomChallenges, data.challenges);
                            // populate data
                            if ($scope.viewOn === 'room') {
                                populateDataByView($scope.viewOn);
                            }
                        });
                    // load mock data for room challengers
                    $http.get('data/challengers-div' + $scope.userDivision + 'room' + $scope.userRoomId + '.json').
                        success(function (data) {
                            setChallengeItems($scope.roomChallengers, data.challengers);
                            // populate data
                            if ($scope.viewOn === 'room') {
                                populateDataByView($scope.viewOn);
                            }
                        });
                });
            }

            var j;
            $scope.contest = data;
            $scope.$broadcast('rebuild:summary');
            // set page title
            $state.current.data.pageTitle = $scope.contest.name;
            $state.current.data.pageMetaKeywords = $scope.contest.name + ",contest";

            //demo: populate data according to $scope.contest.phaseId
            if ($scope.contest.phaseId >= helper.PHASE_TYPE_ID.AlmostContestPhase) {
                for (j = 0; j <= 1; j += 1) {
                    loadLeaderboard($scope.boards[j], j + 1);
                    loadChallengers($scope.challengersDivs[j], j + 1);
                    loadChallenges($scope.challengesDivs[j], j + 1);
                }
                loadUserDivsionRoom();
            }
        });
    // show data properly
    $scope.formatScore = function (x) {
        return x ? x.toFixed(2) : '0.00';
    };
    $scope.percentage = function (success, total) {
        if (total <= 0) {
            return '0%';
        }
        return (success * 100.0 / total).toFixed(0) + '%';
    };
    $scope.showResult = function (result, showBy) {
        var statusId = revParseStatus(result.status);
        if (statusId < helper.PROBLEM_STATUS_ID.Submitted) {
            // Not submitted, show status
            return result.status;
        }
        if (statusId === helper.PROBLEM_STATUS_ID.Submitted) {
            // Submitted, not challenged nor system tested, show points
            return $scope.formatScore(result.score);
        }
        if (showBy !== 'points') {
            // show status
            return result.status;
        }
        return statusId === helper.PROBLEM_STATUS_ID.Failed || statusId === helper.PROBLEM_STATUS_ID.Challenged ?
                '0.00' : $scope.formatScore(result.score);
    };
    $scope.challengeAvailable = function () {
        return $scope.contest.phaseId >= helper.PHASE_TYPE_ID.ChallengePhase;
    };
    $scope.registrationFinished = function () {
        return $scope.contest.phaseId >= helper.PHASE_TYPE_ID.AlmostContestPhase;
    };
    $scope.isViewable = function (problem) {
        // cannot view when phase is not challenge or after.
        if ($scope.contest.phaseId < helper.PHASE_TYPE_ID.ChallengePhase) {
            return false;
        }
        // must be submitted
        if (revParseStatus(problem.status) < helper.PROBLEM_STATUS_ID.Submitted) {
            return false;
        }
        return true;
    };

    // back to contest page
    $scope.goBack = function (contest) {
        var divisionID = $stateParams.divisionId;
        $state.go('user.contest', {contestId : contest.id, divisionId : divisionID});
    };
    $scope.toggleExpand = function (element, container, hidden) {
        var target = angular.element(document.getElementById(element));
        var containerPart = angular.element(document.getElementById(container));
        var hiddenPart = angular.element(document.getElementById(hidden));
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
    var filter = $('.filterToggle');
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
    var lbFilter = $('#leaderboardFilter');
    lbFilter.qtip('api').set('content.text', lbFilter.next());
    lbFilter.qtip('api').set('position.target', lbFilter);
    var challengeFilter = $('#challengeFilter');
    challengeFilter.qtip('api').set('content.text', challengeFilter.next());
    challengeFilter.qtip('api').set('position.target', challengeFilter);
    var challengerFilter = $('#challengerFilter');
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
                $scope.getKeys(viewOn).lbFilter.handle = $scope.lbHandleString;
            } else {
                $scope.getKeys(viewOn).lbFilter.handle = '';
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
}];

module.exports = userContestDetailCtrl;