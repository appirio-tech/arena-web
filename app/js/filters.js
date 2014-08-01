/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * Handles the filters logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added startFrom filter.
 *
 * @author TCASSEMBLER
 * @version 1.1
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

module.exports = filters;