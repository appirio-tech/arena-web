/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles practice problem list related logic.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global document, angular:false, $:false, module, window, require*/

var config = require('../config');
var helper = require('../helper');
/**
 * The practice problem list controller.
 */
var practiceProblemListCtrl = ['$scope', '$http', '$timeout', '$rootScope', '$modal', 'sessionHelper', function ($scope, $http, $timeout, $rootScope, $modal, sessionHelper) {
    var filter = $('.filterToggle'),
        problemFilter = $('#problemFilter'),
        defaultFilterValues = {
            type: 'All',
            difficulty: 'All',
            status: 'All',
            minPoints: 250,
            maxPoints: 1000
        },
        /**
         * Clear filter.
         */
        clearFilter = function () {
            $scope.filterShown = angular.copy(defaultFilterValues);
            $scope.filterUsed = angular.copy($scope.filterShown);
            $scope.setCurrentPage(1);
        },
        /**
         * Remove the filter by key.
         * @param key - the filter key.
         */
        removeFilter = function (key) {
            key = key.substring(0, 1).toLowerCase() + key.substring(1);
            if (key === 'points') {
                $scope.filterShown.minPoints = defaultFilterValues.minPoints;
                $scope.filterShown.maxPoints = defaultFilterValues.maxPoints;
            } else {
                $scope.filterShown[key] = 'All';
            }
            $scope.filterUsed = angular.copy($scope.filterShown);
            $scope.setCurrentPage(1);
        },
        /**
         * Add filter tag.
         * @param key - the filter key
         * @param val - the filter value
         */
        addTag = function (key, val) {
            $scope.tags.push({
                type: key.substring(0, 1).toUpperCase() + key.substring(1),
                value: val
            });
            $scope.setCurrentPage(1);
        },
        /**
         * Clear the tags.
         */
        clearTags = function () {
            $scope.tags = [];
            $scope.setCurrentPage(1);
        },
        header = {headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionHelper.getJwtToken()}},
        modalTimeoutPromise = null,
        popupDetailModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', 'cancel', function ($scope, $modalInstance, data, ok, cancel) {
            $scope.title = data.title;
            $scope.message = data.detail;
            $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
            $scope.enableClose = data.enableClose;

            /**
             * Close the dialog.
             */
            $scope.ok = function () {
                ok();
                $modalInstance.close();
            };

            /**
             * Cancel handler.
             */
            $scope.cancel = function () {
                cancel();
                $modalInstance.dismiss('cancel');
            };
        }];

    // keys for sorting
    $scope.problemKeys = ['problemName', 'problemType', 'points', 'difficulty', 'status', 'myPoints'];

    $scope.problems = [];
    $scope.numOfPage = Number(config.practiceProblemListPageSize);
    $scope.currentPage = 1;
    $scope.filterShown = angular.copy(defaultFilterValues);
    $scope.filterUsed = angular.copy($scope.filterShown);
    $scope.tags = [];

    $scope.totalRecords = 0;

    $scope.triggerSearch = false;

    /**
     * Close detail dialog.
     */
    $scope.closeDetailDialog = function () {
        if (modalTimeoutPromise) {
            $timeout.cancel(modalTimeoutPromise);
        }
        if ($rootScope.currentDetailModal) {
            $rootScope.currentDetailModal.dismiss('cancel');
            $rootScope.currentDetailModal = undefined;
        }
    };

    /**
     * Open detail modal.
     * @param data - the data
     * @param handle - the handle method
     * @param finish - the finish method.
     */
    $scope.openDetailModal = function (data, handle, finish) {
        if ($rootScope.currentDetailModal) {
            $rootScope.currentDetailModal.dismiss('cancel');
            $rootScope.currentDetailModal = undefined;
        }

        $rootScope.currentDetailModal = $modal.open({
            templateUrl: 'popupValidationDetail.html',
            controller: popupDetailModalCtrl,
            backdrop: 'static',
            resolve: {
                data: function () {
                    return data;
                },
                ok: function () {
                    return function () {
                        if (angular.isFunction(handle)) {
                            handle();
                        }
                        $rootScope.currentDetailModal = undefined;
                    };
                },
                cancel: function () {
                    return function () {
                        if (angular.isFunction(finish)) {
                            finish();
                        }
                        $rootScope.currentDetailModal = undefined;
                    };
                }
            }
        });
    };

    /**
     * Get error detail.
     * @param data the data value.
     * @param status the status code
     * @returns {*} the error detail.
     */
    function getErrorDetail(data, status) {
        var str = '';
        if (data !== undefined && data.message !== undefined) {
            return data.message;
        }
        if (data !== undefined && data.error !== undefined) {
            return data.error.details !== undefined ? data.error.details : data.error;
        }
        if (data && data.result && data.result.content) {
            return data.result.content;
        }
        if (status + str === '0') {
            return ' cannot connect to server';
        }
        return ' status code - ' + status;
    }

    /**
     * Show the detail modal.
     * @param data - the data to show.
     * @param status - the status code.
     */
    function showDetailModal(data, status) {
        $scope.closeDetailDialog();
        $scope.openDetailModal({'title': 'Error', 'detail': 'Failed to get practice problem: ' + getErrorDetail(data, status), 'enableClose': true});
    }

    /**
     * Get practice problem list.
     */
    function getPracticeProblems() {
        var url = '/challenges/srms/practice/problems?',
            sortColumn = $scope.problemKeys[0],
            sortOrder = 'asc',
            keys = ['type', 'difficulty', 'status'],
            i,
            key;
        if (sortColumn.indexOf('-') === 0) {
            sortColumn = sortColumn.substring(1);
            sortOrder = 'desc';
        }
        url = url + 'sortBy=' + sortColumn + '&sortOrder' + sortOrder + '&page=' + $scope.currentPage + '&perPage=' + $scope.numOfPage;

        var filters = [];
        for (i = 0; i < keys.length; i += 1) {
            if ($scope.filterUsed[keys[i]] !== 'All') {
                key = keys[i];
                if (key === 'type') {
                    key = 'problemTypes';
                }
                filters.push(key + '=' + $scope.filterUsed[keys[i]].toLowerCase());
            }
        }
        if ($scope.filterUsed.minPoints > $scope.filterOptions.points[0] ||
                $scope.filterUsed.maxPoints < $scope.filterOptions.points[$scope.filterOptions.points.length - 1]) {
            filters.push('pointsLowerBound=' + $scope.filterUsed.minPoints);
            filters.push('pointsUpperBound=' + $scope.filterUsed.maxPoints);
        }
        if ($scope.searchText !== '') {
            filters.push('problemName=' + $scope.searchText.replace(new RegExp("[^a-z0-9]", "gmi"), ""));
        }
        if (filters.length) {
            url = url + '&' + filters.join('&');
        }

        $scope.numPracticeProblemsRequests = 1;
        $http.get(config.v5ApiDomain + url, header).success(function (data, status, headers) {
            $scope.numPracticeProblemsRequests -= 1;
            if (Array.isArray(data)) {
                for (i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (!item.status) {
                        item.status = 'New';
                    }

                    if (item.difficulty) {
                        if (item.difficulty.toLowerCase() === 'easy') {
                            item.pointsColor = 'blue';
                        } else if (item.difficulty.toLowerCase() === 'medium') {
                            item.pointsColor = 'yellow';
                        } else if (item.difficulty.toLowerCase() === 'hard') {
                            item.pointsColor = 'red';
                        }
                    }
                }
                $scope.problems = data;
                $scope.totalRecords = headers('X-Total');
            }
        }).error(function (data, status) {
            $scope.numPracticeProblemsRequests -= 1;
            showDetailModal(data, status);
        });
    }

    // get filter options
    $http.get('data/practice-problem-filter-options.json').success(function (data) {
        $scope.filterOptions = data;

        getPracticeProblems();
    });

    /**
     * Remove filter tag.
     * @param index - the filter tag index
     */
    function removeTag(index) {
        removeFilter($scope.tags[index].type);
        $scope.tags.splice(index, 1);
        $scope.setCurrentPage(1);
        getPracticeProblems();
    }

    /**
     * Set current page.
     * @param index the current page.
     */
    $scope.setCurrentPage = function (index) {
        $scope.currentPage = index;
    };

    // use qtip to create filter panel and modal
    filter.qtip({
        content: {
            text: ''
        },
        position: {
            my: 'top right',
            at: 'bottom right',
            target: filter,
            adjust: {
                x: 15,
                y: -27
            }
        },
        show: {
            event: 'click',
            solo: true,
            modal: true
        },
        hide: {
            event: 'click unfocus'
        },
        style: {
            classes: 'filterPanel practiceProblemFilter'
        }
    });
    $.fn.qtip.zindex = 900;
    problemFilter.qtip('api').set('content.text', problemFilter.next());
    problemFilter.qtip('api').set('position.target', problemFilter);
    problemFilter.qtip('api').set('stype.classes', 'filterPanel practiceProblemFilter');
    /**
     * Close filter panel.
     */
    $scope.closeQtip = function () {
        problemFilter.qtip('api').toggle(false);
    };

    /**
     * Set filter option.
     * @param key - the filter key.
     * @param value - the filter value.
     * @param $event - the event instance
     */
    $scope.setFilterKey = function (key, value, $event) {
        $scope.filterShown[key] = value;
        // close the dropdown menu after clicking an item in it
        $($event.target).closest('.dropdown').removeClass('open');
    };

    /**
     * Apply the filter.
     */
    $scope.filterBegin = function () {
        if ($scope.filterShown.minPoints > $scope.filterShown.maxPoints) {
            $scope.openModal({
                title: 'Error',
                message: 'The range of points filter is invalid.',
                enableClose: true
            });
            return;
        }
        $scope.filterUsed = angular.copy($scope.filterShown);
        $scope.closeQtip();
        $scope.currentPage = 1;
        clearTags();
        var keys = ['type', 'difficulty', 'status'], i;
        for (i = 0; i < keys.length; i += 1) {
            if ($scope.filterUsed[keys[i]] !== 'All') {
                addTag(keys[i], $scope.filterUsed[keys[i]]);
            }
        }
        if ($scope.filterUsed.minPoints > $scope.filterOptions.points[0] ||
                $scope.filterUsed.maxPoints < $scope.filterOptions.points[$scope.filterOptions.points.length - 1]) {
            addTag('points', $scope.filterUsed.minPoints + ' - ' + $scope.filterUsed.maxPoints);
        }
        getPracticeProblems();
    };
    // search
    $scope.searchText = '';
    $scope.removeTag = removeTag;
    /**
     * Clear search area.
     */
    $scope.clearSearchArea = function () {
        clearTags();
        clearFilter();
        $scope.searchText = '';
        getPracticeProblems();
    };

    /**
     * Sort by the given key.
     * @param key - the sort key.
     */
    $scope.toggleSortKey = function (key) {
        var index = $scope.problemKeys.indexOf(key),
            i,
            targetKey = key,
            toggleKey = function (key) {
                return key[0] === '-' ? key.substring(1, key.length) : ('-' + key);
            };
        if (index < 0) {
            index = $scope.problemKeys.indexOf('-' + key);
            targetKey = '-' + key;
            if (index < 0) {
                return;
            }
        }
        if (index === 0) {
            targetKey = toggleKey(targetKey);
        } else {
            for (i = index; i > 0; i -= 1) {
                $scope.problemKeys[i] = $scope.problemKeys[i - 1];
            }
        }
        $scope.problemKeys[0] = targetKey;
        $scope.setCurrentPage(1);

        getPracticeProblems();
    };

    /**
     * Get the start number of current result set.
     * @returns {number} the start number
     */
    $scope.currentStart = function () {
        if ($scope.totalRecords === 0) {
            return 0;
        }
        return ($scope.currentPage - 1) * $scope.numOfPage + 1;
    };
    /**
     * Get the end number of current result set.
     * @returns {number} the end number
     */
    $scope.currentEnd = function () {
        if ($scope.totalRecords === 0) {
            return 0;
        }
        if ($scope.currentPage === $scope.getTotalPages() && ($scope.totalRecords % $scope.numOfPage !== 0)) {
            return ($scope.currentPage - 1) * $scope.numOfPage + $scope.totalRecords % $scope.numOfPage;
        }
        return $scope.currentPage * $scope.numOfPage;
    };

    /**
     * Search by text if clicked enter key.
     * @param keyEvent - the key event.
     */
    $scope.searchByText = function (keyEvent) {
        $scope.triggerSearch = false;
        if (keyEvent.which === 13) {
            $scope.triggerSearch = true;
            $scope.setCurrentPage(1);
            getPracticeProblems();
        }
    };

    /**
     * Get total pages.
     * @returns {number} - the total page number.
     */
    $scope.getTotalPages = function () {
        var result = Math.floor($scope.totalRecords / $scope.numOfPage);
        if ($scope.totalRecords % $scope.numOfPage !== 0) {
            result = result + 1;
        }
        return result;
    };

    /**
     * Get pages range.
     * @returns {Array} the page range.
     */
    $scope.getPagesRange = function () {
        var result = [];
        if ($scope.currentPage === 1 || $scope.currentPage === 2) {
            if ($scope.getTotalPages() > 2) {
                result.push(2);
            }
            if ($scope.getTotalPages() > 3) {
                result.push(3);
            }
            if ($scope.getTotalPages() > 4) {
                result.push(4);
            }
            if ($scope.getTotalPages() > 5) {
                result.push(5);
            }
            return result;
        }
        if ($scope.currentPage === $scope.getTotalPages() || ($scope.currentPage === ($scope.getTotalPages() - 1))
                || ($scope.currentPage === ($scope.getTotalPages() - 2))) {
            if ($scope.getTotalPages() > 5) {
                result.push($scope.getTotalPages() - 4);
            }
            if ($scope.getTotalPages() > 4) {
                result.push($scope.getTotalPages() - 3);
            }
            if ($scope.getTotalPages() > 3) {
                result.push($scope.getTotalPages() - 2);
            }
            if ($scope.getTotalPages() - 1 > 0) {
                result.push($scope.getTotalPages() - 1);
            }
            return result;
        }

        if ($scope.currentPage - 1 > 1) {
            result.push($scope.currentPage - 1);
        }
        result.push($scope.currentPage);
        if ($scope.currentPage + 1 < $scope.getTotalPages()) {
            result.push($scope.currentPage + 1);
        }
        if ($scope.currentPage + 2 < $scope.getTotalPages()) {
            result.push($scope.currentPage + 2);
        }

        return result;
    };

    /**
     * Open practice problem.
     */
    $scope.openProblem = function (roundId, componentId, problemId, divisionId, roomId) {
        $scope.$state.go(helper.STATE_NAME.PracticeCode, {
            roundId: roundId,
            divisionId: divisionId,
            componentId: componentId,
            problemId: problemId,
            roomId: roomId
        }, {reload: true});
    };

    /**
     * Go to given page.
     * @param page - the given page.
     */
    $scope.gotoPage = function (page) {
        if ($scope.currentPage === page) {
            return;
        }
        $scope.currentPage = page;
        getPracticeProblems();
    };
}];

module.exports = practiceProblemListCtrl;