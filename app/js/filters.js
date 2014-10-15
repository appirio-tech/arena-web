/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Handles the filters logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added startFrom filter.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Contest Management and Problem Assignment v1.0)
 * - Added highlight filter
 *
 * Changes in version 1.3 (Module Assembly - Practice Problem Listing Page):
 * - Added practiceProblemFilter.
 *
 * @author TCASSEMBLER
 * @version 1.3
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global filter, angular:false, module*/
var filters = {};
filters.showByMonth = [function () {
    return function (events, currentDate) {
        var newevents = [],
            target = currentDate.year + '-' + currentDate.month;
        if (angular.isArray(events)) {
            angular.forEach(events, function (event) {
                var eventString = event.start.getFullYear() + '-' + event.start.getMonth();
                if (eventString === target) {
                    newevents.push(event);
                }
            });
        }
        return newevents;
    };
}];
/**
 * The start from filter for list.
 */
filters.startFrom = [function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
}];

// highlight the results
filters.highlight = [function () {
    return function (text, search, caseSensitive) {
        if (text && (search || angular.isNumber(search))) {
            text = text.toString();
            search = search.toString();
            if (caseSensitive) {
                return text.split(search).join('<span class="hl-matched">' + search + '</span>');
            }
            return text.replace(new RegExp(search, 'gi'), '<span class="hl-matched">$&</span>');
        }
        return text;
    };
}];

/**
 * Filter the practice problem list.
 */
filters.practiceProblemFilter = [function () {
    return function (problems, problemFilter, searchText) {
        function isValid(problem) {
            if (searchText.length > 0 && problem.name.indexOf(searchText) < 0) {
                // problem name must contain the search text as a substring
                return false;
            }
            var keys = ['type', 'difficulty', 'status'], i;
            for (i = 0; i < keys.length; i += 1) {
                if (problemFilter[keys[i]] !== 'All' && problem[keys[i]] !== problemFilter[keys[i]]) {
                    return false;
                }
            }
            return problem.points >= problemFilter.minPoints &&
                problem.points <= problemFilter.maxPoints;
        }
        var newProblems = [];
        if (!angular.isArray(problems)) {
            return newProblems;
        }
        angular.forEach(problems, function (problem) {
            if (isValid(problem)) {
                newProblems.push(problem);
            }
        });
        return newProblems;
    };
}];

module.exports = filters;