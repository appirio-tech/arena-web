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
 * @author TCASSEMBLER
 * @version 1.2
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

module.exports = filters;