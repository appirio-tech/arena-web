/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Handles all Round Management related logic
 *
 * Changes in version 1.1 (Module Assembly - Web Arena - Match Configurations)
 * - Round questions will be loaded on page load itself
 * - Added methods openTerms, openSchedule, openRegistrationQuestions to navigate user to appropriate popup
 *
 * Changes in version 1.2 (Module Assembly - Web Arena -Match Management Update):
 * - Added load round terms logic.
 *
 * @author TCASSEMBLER
 * @version 1.2
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*jslint unparam: true*/
/*global document, angular:false, $:false, module, window, require, angular*/

var config = require('../config');
var helper = require('../helper');

var contestManagementCtrl = ['$scope', '$http', '$timeout', 'sessionHelper', 'appHelper', function ($scope, $http, $timeout, sessionHelper, appHelper) {
    /**
     * Keys for management page filter
     * @type {Array}
     */
    $scope.contestKeys = [];
    /**
     * Keys for problem page filter
     * @type {Array}
     */
    $scope.problemKeys = [];
    /**
     * Not used. But kept for future implementation of past and hidden contests
     * @type {String}
     */
    $scope.key = 'active';
    /**
     * Represents current page
     * @type {number}
     */
    $scope.currentPage = 0;

    /**
     * Default filter keys
     * @type {{managementKeys: string[], managementFilterKey: {
     *      type: string, status: string},
     *      managementFilter: {type: string, status: string},
     *      assignmentFilterKey: {type: string, status: string},
     *      assignmentFilter: {type: string, status: string}}}
     */
    $scope.keys = {
        managementKeys: ['start', 'title'],
        managementFilterKey: {
            type: 'Any',
            status: 'Any'
        },
        managementFilter: {
            type: '',
            status: ''
        },
        assignmentFilterKey: {
            type: 'Any',
            status: 'Any'
        },
        assignmentFilter: {
            type: '',
            status: ''
        }
    };

    $scope.tags = [];

    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = appHelper.getHeader(),
        /**
         * Handle to Filter
         * @type {*|jQuery|HTMLElement}
         */
        filter = $('.filterToggle'),
        /**
         * Handle to filter in mangement panel
         * @type {*|jQuery|HTMLElement}
         */
        managementFilter = $('#managementFilter'),
        /**
         * Handle to filter in assignment panel
         * @type {*|jQuery|HTMLElement}
         */
        assignmentFilter = $('#assignmentFilter'),
        /**
         * Closes Filter dialog
         */
        clearFilter = function () {
            $scope.keys.assignmentFilterKey = {
                type: 'Any',
                status: 'Any'
            };
            $scope.keys.assignmentFilter = {
                type: '',
                status: ''
            };
            $timeout(function () {
                $scope.$broadcast('reload:availableProblems');
            }, 50);
        },
        /**
         * Takes to default filter value
         * @param key Key to which filter needs to be defaulted
         */
        removeFilter = function (key) {
            key = key.substring(0, 1).toLowerCase() + key.substring(1);
            $scope.keys.assignmentFilter[key] = '';
            $scope.keys.assignmentFilterKey[key] = 'Any';
            $timeout(function () {
                $scope.$broadcast('reload:availableProblems');
            }, 50);
        },
        /**
         * Add current selection criteria as tag
         * @param val Value of search or filter to be tagged
         * @param key Key of search or filter to be tagged
         */
        addTags = function (val, key) {
            var item = {
                type: key.substring(0, 1).toUpperCase() + key.substring(1),
                value: val.substring(0, 1).toUpperCase() + val.substring(1)
            };
            $scope.tags.push(item);
        },
        /**
         * Clears all existing tags
         */
        clearTags = function () {
            $scope.tags = [];
        },
        /**
         * Removes tag on clicking X button in tag
         * @param index Indes of tag to remove
         */
        removeTag = function (index) {
            removeFilter($scope.tags[index].type);
            $scope.tags.splice(index, 1);
        },
        /**
         * Clears problem to assign selection
         */
        clearSelection = function () {
            $scope.problemCheckedID = -1;
        };
    /**
     * Stack of opened popups
     * @type {Array}
     */
    $scope.popupStack = [];

    /**
     * Open's popup based on provided panel
     * @param panel Name of panel to open
     */
    $scope.showPopup = function (panelID) {
        $('#' + panelID).show();
        $scope.popupStack.push(panelID);
        $('body').addClass('popupOpen');
    };
    /**
     * Close popup based on provided panel
     * @param panel Name of panel to close
     */
    $scope.hidePopup = function (panelID) {
        $('#' + panelID).hide();
        $scope.popupStack.pop();
        if ($scope.popupStack.length === 0) {
            $('body').removeClass('popupOpen');
        }
    };

    /**
     * Get Keys to display various filter dropdowns
     */
    $http.get('data/management-keys.json').success(function (data) {
        $scope.contestKeys = data.contest;
        $scope.problemKeys = data.problem;
        // Add the 'Any' filter
        $scope.contestKeys.type.unshift('Any');
        $scope.contestKeys.status.unshift('Any');
        $scope.problemKeys.type.unshift('Any');
        $scope.problemKeys.status.unshift('Any');
    });

    /**
     * Not used. But kept for future implementation of past and hidden contests
     */
//    $http.get('data/management-pastContests.json').success(function (data) {
//        $scope.contests.past = data;
//    });
    /**
     * Not used. But kept for future implementation of past and hidden contests
     */
//    $http.get('data/management-hiddenContests.json').success(function (data) {
//        $scope.contests.hidden = data;
//    });

    /**
     * Not used. But kept for future implementation of past and hidden contests
     */
//    $scope.setDataTo = function (key) {
//        $scope.currentContests = $scope.contests[key];
//        $scope.key = key;
//        $scope.currentPage = 0;
//    };

    /**
     * Not used. But kept for future implementation of past and hidden contests
     */
//    $scope.getContests = function () {
//        return $scope.currentContests;
//    };

    /**
     * Generates page list to display for pagination
     * @param data Data to which no. of pages needs to be calculated
     * @param num total num of records per page
     * @returns {*} Array of numbers starting from 1 representing pages
     */
    $scope.range = function (data, num) {
        var len, actualLength = 0;
        if (num === 0) {
            return [];
        }
        if (data instanceof Array) {
            actualLength = data.length;

        }
        if (data instanceof Object) {
            actualLength = Object.keys(data).length;
        }
        len = actualLength % num !== 0 ?
                (actualLength - actualLength % num) / num + 1 : (actualLength - actualLength % num) / num;
        // If no. of pages is 1 then don't display pagination
        if (len === 1) {
            len = 0;
        }
        return new [].constructor(len);
    };
    /**
     * Changes page number
     * @param index Page number to be changed
     */
    $scope.setCurrentPage = function (index) {
        $scope.currentPage = index;
    };

    /**
     * qtip implementation
     */
    filter.qtip({
        content: {
            text: ''
        },
        position: {
            my: 'top right',
            at: 'bottom right',
            target: filter,
            adjust: {
                x: 17,
                y: -26
            }
        },
        show: {
            event: 'click',
            solo: true
        },
        hide: {
            event: 'click unfocus'
        },
        style: {
            classes: 'filterPanel contestFilter'
        }
    });
    /**
     * Default values for various filters
     */
    managementFilter.qtip('api').set('content.text', managementFilter.next());
    managementFilter.qtip('api').set('position.target', managementFilter);
    assignmentFilter.qtip('api').set('content.text', assignmentFilter.next());
    assignmentFilter.qtip('api').set('position.target', assignmentFilter);
    assignmentFilter.qtip('api').set('stype.classes', 'filterPanel contestFilter problemFilter');
    assignmentFilter.qtip('api').set('position.container', $('#problemAssignmentPanel .customQtip'));
    /**
     * Close Filter panel
     * @param panel Panel to be closed
     */
    $scope.closeQtip = function (panel) {
        switch (panel) {
        case 'management':
            managementFilter.qtip('api').toggle(false);
            break;
        case 'assignment':
            assignmentFilter.qtip('api').toggle(false);
            break;
        default:
            return;
        }
    };

    /**
     * Gets current selected value
     * @param panel Either management or assignment
     * @param key Key to get value
     * @returns {*} Filter value for provided key and panel
     */
    $scope.getFilterKey = function (panel, key) {
        function translate(val) {
            return val === '' ? 'Any' : val;
        }
        switch (panel) {
        case 'management':
            return translate($scope.keys.managementFilterKey[key]);
        case 'assignment':
            return translate($scope.keys.assignmentFilterKey[key]);
        default:
            return;
        }
    };
    /**
     * Sets currently selected filter
     * @param panel Panel of current selection
     * @param key Key of current selection
     * @param index Index of current selection
     */
    $scope.setFilterKey = function (panel, key, index) {
        switch (panel) {
        case 'management':
            $scope.keys.managementFilterKey[key] = $scope.contestKeys[key][index];
            break;
        case 'assignment':
            $scope.keys.assignmentFilterKey[key] = $scope.problemKeys[key][index];
            break;
        default:
            return;
        }
    };

    /**
     * Filters data based on current selection
     * @param panel Current popup. Either management or assignment
     */
    $scope.filterBegin = function (panel) {
        clearSelection();
        $scope.closeQtip(panel);
        switch (panel) {
        case 'management':
            angular.forEach($scope.keys.managementFilterKey, function (val, key) {
                $scope.keys.managementFilter[key] = val === 'Any' ? '' : val;
            });
            $scope.currentPage = 0;
            break;
        case 'assignment':
            clearTags();
            angular.forEach($scope.keys.assignmentFilterKey, function (val, key) {
                if (val !== 'Any' && val !== '') {
                    addTags(val, key);
                    $scope.keys.assignmentFilter[key] = val;
                } else {
                    $scope.keys.assignmentFilter[key] = '';
                }
            });
            $timeout(function () {
                $scope.$broadcast('reload:availableProblems');
            }, 50);
            break;
        default:
            return;
        }
    };

    /**
     * Sort implementation
     * @param keywords Sort keyword
     * @param key Sort column
     */
    $scope.toggleSortKey = function (keywords, key) {
        var index = keywords.indexOf(key),
            i,
            targetKey = key,
            toggleKey = function (key) {
                return key[0] === '-' ? key.substring(1, key.length) : ('-' + key);
            };
        if (index < 0) {
            index = keywords.indexOf('-' + key);
            targetKey = '-' + key;
            if (index < 0) {
                return;
            }
        }
        if (index === 0) {
            targetKey = toggleKey(targetKey);
        } else {
            for (i = index; i > 0; i -= 1) {
                keywords[i] = keywords[i - 1];
            }
        }
        keywords[0] = targetKey;
    };
    /**
     * Model to search text
     * @type {string}
     */
    $scope.searchText = '';
    /**
     * Model to removeTag
     * @type {removeTag}
     */
    $scope.removeTag = removeTag;
    /**
     * Clear's the search area.
     * It also clears all tags
     */
    $scope.clearSearchArea = function () {
        clearTags();
        clearFilter();
        $scope.searchText = '';
    };
    /**
     * Utility to search with case sensitivity
     * @param actual actual text
     * @param expected Expected text
     * @returns {boolean} Comparison of actual and expected
     */
    $scope.caseSensitiveCmp = function (actual, expected) {
        return expected === '' || actual.indexOf(expected) >= 0;
    };
    /**
     * Utility to check equality of strings
     * @param actual Actual string
     * @param expected Expected string
     * @returns {boolean} Comparision of actual and expected
     */
    $scope.stringsEqual = function (actual, expected) {
        // To make dropdown consistent with MPSQAS client
        if (expected === 'Proposal Pending') {
            expected = 'Proposal Pending Approval';
        }
        return expected === '' || expected === actual;
    };
    /**
     * Reload's problems scrollbar
     */
    $scope.reloadScrollBar = function () {
        $timeout(function () {
            $scope.$broadcast('reload:availableProblems');
        }, 50);
    };

    $scope.rebuildTypeFilter = function () {
        $timeout(function () {
            $scope.$broadcast('rebuild:typeFilter');
        }, 50);
    };

    // ----------------------- Live Data Implementation ---------------
    // ----------------------- Round management Panel -----------------
    /**
     * Represents all contests
     * @type {{contestId : {contestId: Number, groupId: Number, name: String, status: String }}}
     */
    $scope.allContests = {};
    /**
     * Represents all available rounds
     * @type {{roundId:
     *              {contest: Object,
     *              id: Number,
     *              name: String,
     *              Segments: Object,
     *              Status: String, type: {desc: String, id: Number}}
     *        }}
     */
    $scope.allRounds = {};
    /**
     * Array representation of allRounds
     * @type {Array}
     */
    $scope.allRoundsArray = [];
    /**
     * Represents all available problems
     * @type {{id:
     *          {id: Number,
     *          name: String,
     *          proposedDivisionId: Number,
     *          status: {description: String, id: Number},
     *          type: {description: String, id: Number}}
     *       }}
     */
    $scope.allProblems = {};
    /**
     * Array representation of allProblems
     * @type{Array}
     */
    $scope.allProblemsArray = [];
    /**
     * Represents maximum no. of records per page
     * @type {Number}
     */
    $scope.pageLength = helper.MANAGE_CONTESTS_PAGE_LENGTH;
    /**
     * Current selected round
     * @type {{contest: Object,
     *         id: Number,
     *         name: String,
     *         Segments: Object,
     *         Status: String, type: {desc: String, id: Number}}}
     */
    $scope.currentRound = undefined;

    /**
     * Disable assign button initially to give some time to load problems
     * @type {boolean}
     */
    $scope.disableAssign = true;
    /**
     * Error handler for all ajax requests to API
     * This will ignore 404s and handles all other requests
     * @param data Error data comes from API
     */
    function genericErrorHandler(data) {
        var message = 'Unexpected error occurred while accessing api. Please refresh this page and try again later';
        if (!data.error) {
            // No Error to handle
            return;
        }
        if (data.error.value === 400) {
            // No need to handle this.
            // some api such as get terms will return 400 instead of empty response
            return;
        }
        if (data.error.value === 404) {
            // No need to handle this.
            // This is normal to rest api to return 404 instead of empty response
            return;
        }
        if (data.error.value === 403) {
            $scope.openModal({
                title: 'Error',
                message: 'You are not authorized to view this page.',
                enableClose: true
            }, null, function () {
                $scope.$state.go(helper.STATE_NAME.Dashboard);
            });
            return;
        }
        if (data.error.details) {
            message = data.error.details;
        }
        $scope.openModal({
            title: 'Error',
            message: message,
            enableClose: true
        });
    }

    /**
     * Listens to errors across all contest management controllers like
     * contestTermsConfigCtrl, contestScheduleConfigCtrl, manageQuestionCtrl, registrationQuestionCtrl and manageAnswerCtrl
     * When there is genericApiError broadcase genericErrorHandler will be called.
     * Any specific errors will be handled in respective controllers itself
     */
    $scope.$on('genericApiError', function (event, data) {
        genericErrorHandler(data);
    });
    /**
     * It loads all rounds from $scope.allRounds to array to use in ng-repeat
     * Make sure to call this method whenever there is change in $scope.allRounds
     */
    function loadRoundsArray() {
        var roundKey;
        $scope.allRoundsArray = [];
        for (roundKey in $scope.allRounds) {
            if ($scope.allRounds.hasOwnProperty(roundKey)) {
                $scope.allRoundsArray.push($scope.allRounds[roundKey]);
            }
        }
    }

    /**
     * Retrieves response of all problems to given round as ajax response
     * Save them to respective rounds
     * @param data Ajax response of all problems assigned to given round
     */
    function saveRoundProblems(data) {
        var i = 0;
        if (data.error) {
            genericErrorHandler(data);
            return;
        }
        $scope.allRounds[data.assignedProblems[i].problemData.roundId].problems = {};
        for (i = 0; i < data.assignedProblems.length; i++) {
            $scope.allRounds[data.assignedProblems[i].problemData.roundId].
                problems[data.assignedProblems[i].problemData.id] = data.assignedProblems[i].problemData;
        }
    }

    /**
     * Retrieves response of all problem components to given round as ajax response
     * Save them to respective rounds
     * @param data Ajax response of all problem components assigned to given round
     */
    function saveRoundComponents(data) {
        var i = 0;
        if (data.error) {
            genericErrorHandler(data);
            return;
        }
        for (i = 0; i < data.components.length; i++) {
            if (!$scope.allRounds[data.components[i].roundId].components) {
                $scope.allRounds[data.components[i].roundId].components = {};
            }
            if (!$scope.allRounds[data.components[i].roundId].components[data.components[i].componentData.problemId]) {
                $scope.allRounds[data.components[i].roundId].components[data.components[i].componentData.problemId] = {};
            }
            $scope.allRounds[data.components[i].roundId].
                components[data.components[i].componentData.problemId][data.components[i].division.id] = data.components[i];
        }
    }
    /**
     * Retrieves response of all registration qustions to given round as ajax response
     * Save them to respective rounds
     * @param data Ajax response of all registration questions assigned to given round
     */
    function saveRoundQustions(data) {
        if (data.error) {
            genericErrorHandler(data);
            return;
        }
        $scope.allRounds[data.roundId].questions = data.questions;
    }

    /**
     * Retrieves response of all terms to given round as ajax response
     * Save them to respective rounds
     * @param roundId - the round id.
     * @return the funtion to get ajax response terms data.
     */
    function saveRoundTerms(roundId) {
        return function (data) {
            if (data.error) {
                genericErrorHandler(data);
                return;
            }
            $scope.allRounds[roundId].terms = data.roundTermsContent;
        };
    }

    /**
     * Retrieves response of all rounds to given contest as ajax response
     * Once round data is received, requests will be sent to retrieve respective problems and problem components
     * @param rounds Ajax response of all rounds assigned to given contest
     */
    function saveContestRounds(rounds) {
        var i = 0, roundId;
        if (rounds.error) {
            genericErrorHandler(rounds);
            return;
        }
        /**
         * Give 20 seconds for every problem to load
         */
        $timeout(function () {
            $scope.disableAssign = false;
        }, 2000);
        for (i = 0; i < rounds.data.length; i++) {
            $scope.allRounds[rounds.data[i].id] = rounds.data[i];
            if (rounds.data[i].name === $scope.allContests[rounds.data[i].contest.id].name) {
                $scope.allRounds[rounds.data[i].id].title = rounds.data[i].name;
            } else {
                $scope.allRounds[rounds.data[i].id].title = $scope.allContests[rounds.data[i].contest.id].name + " " + rounds.data[i].name;
            }

            $scope.allRounds[rounds.data[i].id].status = helper.ROUND_STATUS[rounds.data[i].status];
            $scope.allRounds[rounds.data[i].id].start =
                    undefined === rounds.data[i].segments ? '' : rounds.data[i].segments.registrationStartTime;
            $http.get(config.apiDomain + '/data/srm/rounds/' + rounds.data[i].id + '/problems', header).
                success(saveRoundProblems).error(genericErrorHandler);
            $http.get(config.apiDomain + '/data/srm/rounds/' + rounds.data[i].id + '/components', header).
                success(saveRoundComponents).error(genericErrorHandler);
            $http.get(config.apiDomain + '/data/srm/rounds/' + rounds.data[i].id + '/questions', header).
                success(saveRoundQustions).error(genericErrorHandler);
            //Retrieves response of terms to given round
            roundId = rounds.data[i].id;
            $http.get(config.apiDomain + '/data/srm/rounds/' + roundId + '/terms', header).
                success(saveRoundTerms(roundId)).error(genericErrorHandler);
        }
        loadRoundsArray();
    }




    /**
     * Sends request to api to get all contests
     * Once contests are received request will be sent to retrieve respective rounds
     */
    $http.get(config.apiDomain + '/data/srm/contests', header).success(function (contests) {
        var i = 0;
        if (contests.error) {
            genericErrorHandler(contests);
            return;
        }
        for (i = 0; i < contests.length; i++) {
            $scope.allContests[contests[i].contestId] = contests[i];
            $http.get(config.apiDomain + '/data/srm/rounds/' + contests[i].contestId, header).
                success(saveContestRounds).error(genericErrorHandler);
        }
    });
    /**
     * Sends api request to ret
     */
    $http.get(config.apiDomain + '/data/srm/problems', header).success(function (data) {
        var i = 0;
        if (data.error) {
            genericErrorHandler(data);
            return;
        }
        $scope.allProblemsArray = data.problems;
        for (i = 0; i < data.problems.length; i++) {
            $scope.allProblems[data.problems[i].id] = data.problems[i];
        }
    }).error(genericErrorHandler);
    // --------------- Problem Assignment panel ---------------------
    /**
     * Array of problems assigned to selected round
     * @type {Array}
     */
    $scope.assignedProblems = [];
    /**
     * Array of availble problems to selected round
     * @type {Array}
     */
    $scope.problemsToAssign = [];

    /**
     * Opens Assign Problems popup
     * It loads problem in appropriate divisions
     * @param round Selected round to assign problems
     */
    $scope.openAssignProblem = function (round) {
        $scope.currentRound = round;
        $scope.problemsToAssign = [];
        $scope.assignedProblems = [];
        var i = 0, j = 0, problem, divisions;

        for (i = 0; i < $scope.allProblemsArray.length; i++) {
            problem = angular.copy($scope.allProblemsArray[i]);
            problem.status = problem.status.description;
            problem.type = problem.type.description;
            $scope.problemsToAssign.push(problem);
            if ($scope.currentRound.problems) {
                if ($scope.currentRound.problems[problem.id]) {
                    divisions = Object.keys($scope.currentRound.components[problem.id]);
                    for (j = 0; j < divisions.length; j++) {
                        problem = angular.copy(problem);
                        angular.extend(problem, $scope.currentRound.components[problem.id][divisions[j]]);
                        $scope.assignedProblems.push(problem);
                    }
                }
            }
        }
        $scope.showPopup('problemAssignmentPanel');
        $timeout(function () {
            $scope.$broadcast('reload:assignedProblems');
            $scope.$broadcast('reload:availableProblems');
        }, 50);
    };
    /**
     * Implementation of Assign button action
     * It will check whether any problem is selcted.
     * If any selected, then send http request to retrieve component
     * Once component is retrieved component edit panel will be opened
     */
    $scope.assignProblem = function () {
        var i = 0, divisionId = 1;
        if (angular.isUndefined($scope.allProblems[$scope.problemCheckedID])) {
            $scope.openModal({
                title: 'Error',
                message: 'Please select a problem.',
                enableClose: true
            });
        } else {
            // Get division if available
            for (i = 0; i < $scope.problemsToAssign.length; i += 1) {
                if ($scope.problemsToAssign[i].id.toString() === $scope.problemCheckedID) {
                    if ($scope.problemsToAssign[i].proposedDivisionId !== -1) {
                        divisionId = $scope.problemsToAssign[i].proposedDivisionId;
                    }
                }
            }

            $http.get(config.apiDomain + '/data/srm/rounds/' + $scope.currentRound.id + '/' + $scope.problemCheckedID + '/' + divisionId + '/components', header).
                success(function (data) {
                    if (data.error) {
                        genericErrorHandler(data);
                        return;
                    }
                    $scope.problemToAssign.componentData = data.components[0].componentData;
                }).error(genericErrorHandler);
            $scope.problemToAssign = angular.copy($scope.allProblems[$scope.problemCheckedID]);
            $scope.problemToAssign.status = $scope.problemToAssign.status.description;
            $scope.problemToAssign.type = $scope.problemToAssign.type.description;
            $scope.showPopup('problemAssignment');
        }
    };
    /**
     * It implements Save Button action in Edit Component popup
     * This doesn't send any api requests. It simply adds to assignedProblems list.
     * Api requests will be sent on batch when submit button is clicked
     */
    $scope.saveProblemAssignment = function () {
        var i, message = '';

        if (angular.isUndefined($scope.problemToAssign.division) ||
                angular.isUndefined($scope.problemToAssign.division.desc)) {
            message = "Division cannot be empty. <br/>";
        }
        if (angular.isUndefined($scope.problemToAssign.difficulty) ||
                angular.isUndefined($scope.problemToAssign.difficulty.desc)) {
            message += "Difficulty Level cannot be empty. <br/>";
        }
        if (angular.isUndefined($scope.problemToAssign.pointValue)) {
            message += "Points cannot be empty. <br/>";
        }
        if (angular.isUndefined($scope.problemToAssign.openOrder)) {
            message += "Open Order is empty/invalid. Please fill it with numerical value <br/>";
        }
        if (angular.isUndefined($scope.problemToAssign.submitOrder)) {
            message += "Submit Order is empty/invalid. Please fill it with numerical value";
        }
        if (message !== '') {
            message = "Please Fix below problems and submit again<br/>" + message;
            $scope.openModal({
                title: 'Error',
                message: message,
                enableClose: true
            });
            return;
        }
        clearSelection();
        for (i = 0; i < $scope.assignedProblems.length; i += 1) {
            if ($scope.assignedProblems[i].id === $scope.problemToAssign.id) {
                if ($scope.assignedProblems[i].division.desc === $scope.problemToAssign.division.desc) {
                    // update problem configuration
                    angular.extend($scope.assignedProblems[i], $scope.problemToAssign);
                    $scope.hidePopup('problemAssignment');
                    return;
                }
            }
        }
        // save problem configuration
        $scope.assignedProblems.push(angular.copy($scope.problemToAssign));

        // remove from the list of problems to assign
//        for (i = 0; i < $scope.problemsToAssign.length; i += 1) {
//            if ($scope.problemsToAssign[i].id === $scope.problemToAssign.id) {
//                $scope.problemsToAssign.splice(i, 1);
//            }
//        }
        $scope.hidePopup('assignment');
        $timeout(function () {
            $scope.$broadcast('reload:assignedProblems');
            $scope.$broadcast('reload:availableProblems');
        }, 50);
    };
    /**
     * Submit all assigned problems to backend
     */
    $scope.submitProblemAssignments = function () {
        var i = 0, components = [], problem, component;

        for (i = 0; i < $scope.assignedProblems.length; i++) {
            problem = $scope.assignedProblems[i];
            component = {};
            component.roundId = problem.id;
            component.componentId = problem.componentData.id;
            component.points = problem.pointValue;
            component.divisionId = problem.division.id;
            component.difficultyId = problem.difficulty.id;
            component.openOrder = problem.openOrder;
            component.submitOrder = problem.submitOrder;
            components.push(component);
        }
        $http.post(config.apiDomain + '/data/srm/rounds/' + $scope.currentRound.id + '/components', {components: components}, header).
            success(function (data) {
                if (data.error) {
                    genericErrorHandler(data);
                    return;
                }
                // Refresh rounds data upon successful submission of components
                $http.get(config.apiDomain + '/data/srm/rounds/' + $scope.currentRound.id + '/problems', header).
                    success(saveRoundProblems).error(genericErrorHandler);
                $http.get(config.apiDomain + '/data/srm/rounds/' + $scope.currentRound.id + '/components', header).
                    success(saveRoundComponents).error(genericErrorHandler);
                $scope.currentRound = undefined;
                $scope.hidePopup('problemAssignmentPanel');
            }).error(genericErrorHandler);

    };
    /**
     * Open component edit window
     * @param problem Problem to which component needs to be edited
     */
    $scope.startEditProblem = function (problem) {
        $scope.problemToAssign = angular.copy(problem);
        $scope.showPopup('problemAssignment');
    };
    /**
     * Removes problem from assigned problem list
     * @param selectedProblem Problem to remove from assigned list
     */
    $scope.removeProblem = function (selectedProblem) {
        var problem = angular.copy($scope.allProblems[selectedProblem.id]), index;
        problem.status = problem.status.description;
        problem.type = problem.type.description;
//        $scope.problemsToAssign.push(selectedProblem);
        index = $scope.assignedProblems.indexOf(selectedProblem);
        if (index >= 0) {
            $scope.assignedProblems.splice(index, 1);
            $timeout(function () {
                $scope.$broadcast('reload:assignedProblems');
                $scope.$broadcast('reload:availableProblems');
            }, 50);
        }
    };
    /**
     * Implementation of cancel button in assignment popup
     */
    $scope.cancelProblemAssignments = function () {
        $scope.currentRound = undefined;
        $scope.hidePopup('problemAssignmentPanel');
    };
    // By default clears all selection when assignment panel opens
    clearSelection();

    /**
     * Implementation of cancel button in edit component popup
     */
    $scope.cancelProblemAssignment = function () {
        // clear problem configuration
        $scope.problemToAssign = {};
        $scope.hidePopup('problemAssignment');
    };
    /**
     * Return division Name provided with division ID
     * @param divisionId Id to which name is required
     * @returns {string} Name of division for provided ID
     */
    $scope.getDivisionName = function (divisionId) {
        switch (divisionId) {
        case -1:
            return '';
        case 1:
            return 'Division-I';
        case 2:
            return 'Division-II';
        default:
            return '';
        }
    };
    /**
     * Open the terms panel of the round.
     * @param round - the round to open terms
     */
    $scope.openTerms = function (round) {
        $scope.$broadcast('setContestTerms', {round: round});
    };

    // schedule
    $scope.openSchedule = function (round) {
        $scope.$broadcast('setContestSchedule', {round: round});
    };

    // registration questions
    $scope.openRegistrationQuestions = function (round) {
        $scope.$broadcast('setRegistrationQuestions', {round: round, questionKeys: $scope.questionKeys});
    };
}];

module.exports = contestManagementCtrl;