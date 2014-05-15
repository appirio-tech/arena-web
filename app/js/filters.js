'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global filter, angular:false, module*/
var filters = {};
filters.showByMonth = [function () {
    return function (events, currentDate) {
        var newevents = [];
        var target = currentDate.year + '-' + currentDate.month;
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

module.exports = filters;