/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
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
 * Changes in version 1.3 (Module Assembly - Web Arena - Match Schedule Widget Update):
 *  - Move the code before calendar configuration so that calendar is populated with $scope.*
 *    methods which are already defined.
 *  - Added isToday and goToday methods to support moving to the current date.
 *  - Added tooltip and updated methods eventsADay and eventAfterAllRender to support tooltips
 *    with brief contest information.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena - Match Plan Widget and Match Schedule Page Improvement):
 *  - Improved the logic of loading match plan data.
 *
 * @author TCASSEMBLER, dexy
 * @version 1.4
 */
'use strict';

var config = require('../config');
var helper = require('../helper');

/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*jslint plusplus: true*/
/*global $:false, angular:false, module*/
// contest plan widget
var contestPlanCtrl = ['$rootScope', '$scope', '$http', '$timeout', '$filter', '$compile', 'appHelper', function ($rootScope, $scope, $http, $timeout, $filter, $compile, appHelper) {
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
    $rootScope.selectedDate = $scope.currentDate;
    $scope.viewNow = 'calendar';

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
        $rootScope.selectedDate = $scope.currentDate;
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

    /**
     * Load contest plan data.
     * @param filter - the filter parameters in string format
     * @param pendingPlanMonth - the pending month which is getting data
     */
    $scope.loadMatchSchedule = function (filter, pendingPlanMonth) {
        $scope.numCalendarRequests = 1;
        // Call tc-api server to get srm schedule
        $http.get(config.v5ApiDomain + '/challenges/srms/schedule?sortBy=registrationStartTime&sortOrder=desc&page=1&perPage=50&' + filter).success(function (data, status, headers) {
            $scope.numCalendarRequests -= 1;
            $scope.eventSources = appHelper.parseMatchScheduleData(data, pendingPlanMonth, $scope.eventSources);
            $rootScope.contestPlanList = $scope.eventSources[0];
            initCalendar();
        }).error(function (data, status, headers, config) {
            $scope.numCalendarRequests -= 1;
            //skip the error, simply print to console
            console.log(data);
        });
    };

    /**
     * Load month view data.
     * @param monthDate the first date of month
     */
    $scope.loadMonthViewData = function (monthDate) {
        if (!appHelper.isExistingMatchPlan(monthDate)) {
            $scope.loadMatchSchedule(appHelper.getRegistrationStartTimeRangeUrl(monthDate, 1) + appHelper.getMonthViewStatus(monthDate),
                [monthDate.getFullYear() + '-' + monthDate.getMonth()]);
        }
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

        $rootScope.selectedDate = $scope.currentDate;

        $scope.loadMonthViewData(new Date($scope.currentDate.year, $scope.currentDate.month, $scope.currentDate.day));
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
        $rootScope.selectedDate = $scope.currentDate;

        $scope.loadMonthViewData(new Date($scope.currentDate.year, $scope.currentDate.month, $scope.currentDate.day));
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
        $('.tooltip').remove();

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

        $rootScope.selectedDate = $scope.currentDate;

        if (view.name === 'month') {
            $scope.loadMonthViewData(view.start);
        }
    };

    /**
     * Get events number in a day. It's not used in current implementation.
     *
     * @param data - the events data
     * @returns {*[]} the events number
     */
    function eventsADay(data) {
        var nums = [], dates = [], events = [], dateString, index, event, i;
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
                    events.push([{
                        name: event.title,
                        regStart: event.regStart,
                        codeStart: event.codeStart
                    }]);
                } else {
                    nums[index] += 1;
                    events[index].push({
                        name: event.title,
                        regStart: event.regStart,
                        codeStart: event.codeStart
                    });
                }
            }
        }
        return [dates, nums, events];
    }
    /**
     * Formats the date/time to specific format.
     *
     * @param date the date
     * @return formatted date
     */
    function formatDateTime(date) {
        return $filter('date')(date, helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone;
    }

    /**
     * Adds a tooltip to indicate the number of events in that day
     *
     * @param view - the view flag.
     */
    $scope.eventAfterAllRender = function (view) {
        var j, data = eventsADay($scope.eventSources), element, htmlTip, i;
        for (i = 0; i < data[0].length; i += 1) {
            element = $('#calendar .fc-view-month').find('[data-date=' + data[0][i] + ']').find('.fc-day-number');
            htmlTip = data[1][i].toString() + ' event' + ((data[1][i] !== 1) ? 's' : '');
            for (j = 0; j < data[2][i].length; j += 1) {
                htmlTip += '<hr/>' + data[2][i][j].name;
                htmlTip += '</br>' + 'Registration: ' + formatDateTime(data[2][i][j].regStart);
                htmlTip += '</br>' + 'Coding: ' + formatDateTime(data[2][i][j].codeStart);
            }
            element.attr({
                'tooltip-html-unsafe': htmlTip,
                'tooltip-popup-delay': 100,
                'tooltip-placement': 'bottom',
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        }
    };
    /**
     * Append span element while rendering the day.
     * @param date - the date instance
     * @param cell - the date sell instance
     */
    $scope.dayRender = function (date, cell) {
        if (date.getDate() < 10) {
            cell.find('.fc-day-number').css('padding-left', '20px');
        }
        angular.element(cell).append('<span class="numOfEvents"></span>');
    };

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

    $rootScope.loadedContestPlanList = [];

    $scope.loadMatchSchedule(appHelper.getRegistrationStartTimeRangeUrl(new Date(), 3) + '&statuses[]=F&statuses[]=A&statuses[]=P',
        appHelper.getComingThreeMonths());

    /**
     * Checks if the calendar date is the current month.
     *
     * @return true if calendar month is the current month.
     */
    $scope.isToday = function () {
        tmpDate = new Date();
        return tmpDate.getFullYear() === $scope.currentDate.year
                && tmpDate.getMonth() === $scope.currentDate.month;
    };
    /**
     * Moves the calendar to the current date.
     */
    $scope.goToday = function () {
        tmpDate = new Date();
        $scope.contestPlan.fullCalendar('gotoDate', tmpDate);
        $scope.currentDate = {
            day: tmpDate.getDay(),
            month: tmpDate.getMonth(),
            year: tmpDate.getFullYear()
        };

        $rootScope.selectedDate = $scope.currentDate;
        listRender($scope.events, $scope.currentDate);
    };
}];

module.exports = contestPlanCtrl;