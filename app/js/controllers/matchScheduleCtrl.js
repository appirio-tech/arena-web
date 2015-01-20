/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles match schedule page related logic.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*jslint plusplus: true*/
/*global document, angular:false, $:false, module, window, require*/

var config = require('../config');
var helper = require('../helper');
/**
 * The match schedule page controller.
 */
var matchScheduleCtrl = ['$scope', '$http', '$timeout', '$rootScope', function ($scope, $http, $timeout, $rootScope) {
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    var tmpDate = new Date();

    // config calendar plugin
    $scope.matchScheduleConfig = {
        calendar: {
            height: 600,
            editable: true,
            header: {
                left: 'prev, next today',
                center: 'title',
                right: 'month basicWeek basicDay'
            },
            titleFormat: {
                month: 'MMMM yyyy',
                day: 'MMM d, yyyy'
            }
        }
    };

    /**
     * Parse the date string.
     * @param dateString - the date string to parse
     * @returns {Date} the parsed result
     */
    function parseDate(dateString) {
        var date = new Date();
        date.setFullYear(+dateString.substring(0, 4));
        date.setMonth((+dateString.substring(5, 7)) - 1);
        date.setDate(+dateString.substring(8, 10));
        date.setHours(+dateString.substring(11, 13));
        date.setMinutes(+dateString.substring(14, 16));

        // Timezone
        var tz_regex = /(\+|-)(\d{4})$/;
        var tz = tz_regex.exec(dateString);

        if(tz) {
            var hours = Number(tz[2].substr(0, 2));
            var minutes = Number(tz[2].substr(2, 2));

            if(tz[1] === '-') {
                hours = -hours;
                minutes = -minutes;
            }

            date.setHours(date.getHours() + hours);
            date.setMinutes(date.getMinutes() + minutes);
        }

        return date;
    }
    /**
     * Init the calendar with events.
     */
    function initCalendar() {
        $scope.matchScheduleConfig = {
            calendar: {
                height: 600,
                editable: false,
                header: {
                    left: 'prev, next today',
                    center: 'title',
                    right: 'month basicWeek basicDay'
                },
                titleFormat: {
                    month: 'MMMM yyyy',
                    day: 'MMM d, yyyy'
                },
                timeFormat: 'HH:mm',
                year: tmpDate.getFullYear(), //the initial year when the calendar loads
                month: tmpDate.getMonth(), //the initial month when the calendar loads
                day: tmpDate.getDate(),    //the initial day when the calendar loads
                eventClick: $scope.changeView
            }
        };
    }
    $scope.numScheduleRequests = 1;
    // Call tc-api server to get srm schedule
    $http.get(config.apiDomain + '/data/srm/schedule?pageIndex=-1&sortColumn=startDate&sortOrder=asc').success(function (data, status, headers) {
        $scope.numScheduleRequests -= 1;
        if (data.data) {
            data.data.forEach(function (item) {
                $scope.eventSources[0].push({
                    title: item.contestName,
                    start: parseDate(item.registrationStartTime || item.startDate),
                    end: parseDate(item.challengeEndTime),
                    allDay: false
                });
            });
        }
        initCalendar();
    }).error(function (data, status, headers, config) {
        $scope.numScheduleRequests -= 1;
        //skip the error, simply print to console
        console.log(data);
    });

    /**
     * Change the view.
     * @param date - the selected date
     * @param jsEvent - the js event
     * @param allDay - the all day flag.
     * @param view - the view flag
     */
    $scope.changeView = function (date, jsEvent, allDay, view) {
        var pageX = jsEvent.clientX,
            pageY = jsEvent.clientY,
            list = $('.matchSchedule .fc-day'),
            result = null,
            rect,
            i;
        for (i = 0; i < list.length; i++) {
            rect = list[i].getBoundingClientRect();
            if (pageX > rect.left && pageX < (rect.left + rect.width) && pageY > rect.top && pageY < (rect.top + rect.height)) {
                result = list[i].getAttribute("data-date");
                break;
            }
        }

        if (result !== null) {
            $scope.matchSchedule.fullCalendar('changeView', 'basicDay');
            $scope.matchSchedule.fullCalendar('gotoDate', parseDate(result + 'T00:00:00'));
        }
    };
}];

module.exports = matchScheduleCtrl;