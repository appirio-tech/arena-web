/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the contest plan controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 *  - Updated the code to show current date in calendar.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena - Match Schedule Widget Update):
 *  - Updated the code to use real data of SRM schedule.
 *
 * @author TCASSEMBLER
 * @version 1.2
 */
'use strict';

var config = require('../config');
var helper = require('../helper');

/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*global $:false, angular:false, module*/
// contest plan widget
var contestPlanCtrl = ['$scope', '$http', '$timeout', '$filter', function ($scope, $http, $timeout, $filter) {
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.listEvents = [];

    var tmpDate = new Date();
    // used for list view
    $scope.currentDate = {
        year: tmpDate.getFullYear(),
        month: tmpDate.getMonth(),
        day: tmpDate.getDate()
    };
    $scope.viewNow = 'calendar';
    /**
     * Parse the date string.
     * @param dateString - the date string to parse
     * @returns {Date} the parsed result
     */
    function parseDate(dateString) {
        var date = new Date();
        // ignore Timezone
        date.setFullYear(+dateString.substring(0, 4));
        date.setMonth((+dateString.substring(5, 7)) - 1);
        date.setDate(+dateString.substring(8, 10));
        date.setHours(+dateString.substring(11, 13));
        date.setMinutes(+dateString.substring(14, 16));
        return date;
    }

    /**
     * Render the list view.
     * @param events - the events source
     * @param currentDate - the current date in calendar
     */
    function listRender(events, currentDate) {
        $scope.listEvents.length = 0;
        $scope.listEvents = $filter('showByMonth')(events, currentDate);
        $scope.$broadcast('rebuild:list');
    }
    // The default ui config
    $scope.uiConfig = {
        calendar: {
            height: 255,
            editable: false,
            header: {
                left: 'title',
                center: '',
                right: 'month, prev, next'
            },
            titleFormat: {
                month: 'MMMM yyyy',
                day: 'MMM d, yyyy'
            },
            buttonText: {
                month: 'Back'
            }
        }
    };
    /**
     * Init the calendar with events.
     */
    function initCalendar() {
        $scope.uiConfig = {
            calendar: {
                height: 255,
                editable: false,
                header: {
                    left: 'title',
                    center: '',
                    right: 'month, prev, next'
                },
                titleFormat: {
                    month: 'MMMM yyyy',
                    day: 'MMM d, yyyy'
                },
                buttonText: {
                    month: 'Back'
                },
                timeFormat: 'HH:mm',
                year: tmpDate.getFullYear(), //the initial year when the calendar loads
                month: tmpDate.getMonth(), //the initial month when the calendar loads
                day: tmpDate.getDate(),    //the initial day when the calendar loads
                eventRender: $scope.eventRender, // add color tag and events number qtip to day number when events are loading
                dayClick: $scope.changeView, // change to day view when clicking day number
                viewRender: $scope.viewRender, // when view loads, implement some style issues
                eventAfterAllRender: $scope.eventAfterAllRender, //try to add a sign to indicate number of events that day
                dayRender: $scope.dayRender
            }
        };
    }

    $scope.numCalendarRequests = 1;
    // Call tc-api server to get srm schedule
    $http.get(config.apiDomain + '/data/srm/schedule?pageIndex=-1&sortColumn=startDate&sortOrder=asc').success(function (data, status, headers) {
        $scope.numCalendarRequests -= 1;
        if (data.data) {
            data.data.forEach(function (item) {
                $scope.eventSources[0].push({
                    title: item.contestName,
                    start: parseDate(item.registrationStartTime),
                    allDay: false
                });
            });
        }
        initCalendar();
    }).error(function (data, status, headers, config) {
        $scope.numCalendarRequests -= 1;
        //skip the error, simply print to console
        console.log(data);
    });

    /**
     * It will get current date information from calendar when list view is loaded.
     * @returns {boolean} - false if the view is list, otherwise return true.
     */
    $scope.getCurrentMonth = function () {
        if ($scope.viewNow === 'list') { return false; }
        var d = $scope.contestPlan.fullCalendar('getDate');
        $scope.currentDate = {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate()
        };
        listRender($scope.events, $scope.currentDate);
        return true;
    };

    /**
     * According to currentDate create a new header string for list view
     * @returns {string} the month value in string.
     */
    $scope.showMonth = function () {
        var monthString = $scope.currentDate.year + '-' +
            ($scope.currentDate.month > 8 ? '' : '0') + ($scope.currentDate.month + 1) + '-' +
            ($scope.currentDate.day > 9 ? '' : '0') + $scope.currentDate.day;
        return monthString;
    };

    /**
     * Go to the previous month in list view.
     */
    $scope.calendarPrev = function () {
        var d = $scope.currentDate;
        if (d.month === 0) {
            $scope.currentDate = {
                year: d.year - 1,
                month: 11,
                day: d.day
            };
        } else {
            $scope.currentDate = {
                year: d.year,
                month: d.month - 1,
                day: d.day
            };
        }
        listRender($scope.events, $scope.currentDate);
    };
    /**
     * Go to the next month in list view.
     */
    $scope.calendarNext = function () {
        var d = $scope.currentDate;
        if (d.month === 11) {
            $scope.currentDate = {
                year: d.year + 1,
                month: 0,
                day: d.day
            };
        } else {
            $scope.currentDate = {
                year: d.year,
                month: d.month + 1,
                day: d.day
            };
        }
        listRender($scope.events, $scope.currentDate);
    };

    /**
     * Get current date information from list view, go to that date and refresh the whole calendar.
     */
    $scope.renderCalendar = function () {
        $scope.contestPlan.fullCalendar('gotoDate', $scope.currentDate.year, $scope.currentDate.month);
        $scope.contestPlan.fullCalendar('changeView', 'month');
        $scope.contestPlan.fullCalendar('render');
    };

    /**
     * Add color info to day number.
     *
     * @param event - the calendar event.
     * @param element - the date element.
     * @param monthView - the month view type.
     */
    $scope.eventRender = function (event, element, monthView) {
        var date = event.start.getFullYear() + '-' +
                (event.start.getMonth() > 8 ? '' : '0') + (event.start.getMonth() + 1) + '-' +
                (event.start.getDate() > 9 ? '' : '0') + event.start.getDate(),
            target = $('#calendar .fc-view-month').find('[data-date=' + date + ']');
        target.addClass('eventColor');
        $scope.$broadcast('rebuild:list');
    };
    /**
     * Change to basicDay view to show events of that day
     * @param date - the date which uses to get events.
     * @param allDay - all day flag
     * @param jsEvent - js event instance
     * @param view - the view flag
     */
    $scope.changeView = function (date, allDay, jsEvent, view) {
        angular.forEach($scope.events, function (event) {
            if (date.getFullYear() === event.start.getFullYear() && date.getMonth() === event.start.getMonth() && date.getDate() === event.start.getDate()) {
                $scope.contestPlan.fullCalendar('changeView', 'basicDay');
                $scope.contestPlan.fullCalendar('gotoDate', date);
            }
        });

        $scope.$broadcast('rebuild:list');
    };
    /**
     * When view loads, implement some style issues.
     *
     * @param view - the view flag
     * @param element - the date element
     */
    $scope.viewRender = function (view, element) {
        if (view.name === 'basicDay') {
            $('#calendar .fc-header .fc-header-right span').hide();
            $('#calendar .fc-header .fc-header-right .fc-button-month').show();
        } else {
            $('#calendar .fc-header .fc-header-right span').show();
            $('#calendar .fc-header .fc-header-right .fc-button-month').hide();
        }
        $scope.currentDate = {
            year: view.start.getFullYear(),
            month: view.start.getMonth(),
            day: view.start.getDate()
        };
    };

    /**
     * Get events number in a day. It's not used in current implementation.
     *
     * @param data - the events data
     * @returns {*[]} the events number
     */
    function eventsADay(data) {
        var nums = [], dates = [], dateString, index, i, event;
        if (angular.isArray(data)) {
            for (i = 0; i < data[0].length; i += 1) {
                event = data[0][i];
                dateString = event.start.getFullYear() + '-' +
                    (event.start.getMonth() > 8 ? '' : '0') + (event.start.getMonth() + 1) + '-' +
                    (event.start.getDate() > 9 ? '' : '0') + event.start.getDate();
                index = $.inArray(dateString, dates);
                if (index === -1) {
                    dates.push(dateString);
                    nums.push(1);
                } else {
                    nums[index] += 1;
                }
            }
        }
        return [dates, nums];
    }

    /**
     * Try to add a tooltip indicate the number of events in that day, it's not used in current implementation.
     *
     * @param view - the view flag.
     */
    $scope.eventAfterAllRender = function (view) {
        var i, data = eventsADay($scope.eventSources);
        for (i = 0; i < data[0].length; i += 1) {
            $('#calendar .fc-view-month').find('[data-date=' + data[0][i] + ']').find('.numOfEvents').html(data[1][i]);
        }
    };
    /**
     * Append span element while rendering the day.
     * @param date - the date instance
     * @param cell - the date sell instance
     */
    $scope.dayRender = function (date, cell) {
        angular.element(cell).append('<span class="numOfEvents"></span>');
    };
}];

module.exports = contestPlanCtrl;