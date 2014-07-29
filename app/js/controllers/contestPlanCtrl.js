/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the contest plan controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 *  - Updated the code to show current date in calendar.
 *
 * @author TCASSEMBLER
 * @version 1.1
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*global $:false, angular:false, module*/
// contest plan widget
var contestPlanCtrl = ['$scope', '$http', '$timeout', '$filter', function ($scope, $http, $timeout, $filter) {
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.listEvents = [];
    // used for list view
    $scope.currentDate = {
        year: 2012,
        month: 1,
        day: 1
    };
    $scope.viewNow = 'calendar';
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
    function listRender(events, currentDate) {
        $scope.listEvents.length = 0;
        $scope.listEvents = $filter('showByMonth')(events, currentDate);
        $scope.$broadcast('rebuild:list');
    }
    $http.get('data/contest-plan.json').success(function (data) {
        data.contests.forEach(function (contest) {
            $timeout(function () {
                $scope.events.push({
                    title: contest.title,
                    start: parseDate(contest.start),
                    allDay: false
                });
            }, 0);
        });

        var tmpDate = new Date();
        // config calendar plugin
        $scope.uiConfig = {
            calendar: {
                height: 255,
                editable: true,
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
                timeFormat: 'H(:mm)',
                year: tmpDate.getFullYear(), //the initial year when the calendar loads
                month: tmpDate.getMonth(), //the initial month when the calendar loads
                day: tmpDate.getDate(),    //the initial day when the calendar loads
                eventRender: $scope.eventRender, // add color tag and events number qtip to day number when events are loading
                dayClick: $scope.changeView, // change to day view when clicking day number
                viewRender: $scope.viewRender, // when view loads, implement some style issues
                eventAfterAllRender: $scope.eventAfterAllRender, //debug, try to add a sign to indicate number of events that day
                dayRender: $scope.dayRender
            }
        };
        $scope.currentDate = data.today;
        // it will get current date information from calendar when list view is loaded
        $scope.getCurrentMonth = function () {
            if ($scope.viewNow === 'list') { return false; }
            var d = $scope.contestPlan.fullCalendar('getDate');
            $scope.currentDate = {
                year: d.getFullYear(),
                month: d.getMonth(),
                day: d.getDate()
            };
            listRender($scope.events, $scope.currentDate);
        };
        // according to currentDate create a new header string for list view
        $scope.showMonth = function () {
            var monthString = $scope.currentDate.year + '-' +
                ($scope.currentDate.month > 8 ? '' : '0') + ($scope.currentDate.month + 1) + '-' +
                ($scope.currentDate.day > 9 ? '' : '0') + $scope.currentDate.day;
            return monthString;
        };
        // go to the previous month in list view
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
        // go to the next month in list view
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
        // get current date information from list view, 
        // go to that date and refresh the whole calendar
        $scope.renderCalendar = function () {
            if ($scope.viewNow === 'calendar') { return false; }
            $scope.contestPlan.fullCalendar('gotoDate', $scope.currentDate.year, $scope.currentDate.month);
            $scope.contestPlan.fullCalendar('render');
        };
    });
    // add color info to day number
    $scope.eventRender = function (event, element, monthView) {
        var date = event.start.getFullYear() + '-' +
                (event.start.getMonth() > 8 ? '' : '0') + (event.start.getMonth() + 1) + '-' +
                (event.start.getDate() > 9 ? '' : '0') + event.start.getDate(),
            target = $('#calendar .fc-view-month').find('[data-date=' + date + ']');
        target.addClass('eventColor');
        $scope.$broadcast('rebuild:list');
    };
    // change to basicDay view to show events of that day
    $scope.changeView = function (date, allDay, jsEvent, view) {
        angular.forEach($scope.events, function (event) {
            if (date.getFullYear() === event.start.getFullYear() && date.getMonth() === event.start.getMonth() && date.getDate() === event.start.getDate()) {
                $scope.contestPlan.fullCalendar('changeView', 'basicDay');
                $scope.contestPlan.fullCalendar('gotoDate', date);
            }
        });
    };
    // when view loads, implement some style issues
    $scope.viewRender = function (view, element) {
        if (view.name === 'basicDay') {
            $('#calendar .fc-header .fc-header-right span').hide();
            $('#calendar .fc-header .fc-header-right .fc-button-month').show();
        } else {
            $('#calendar .fc-header .fc-header-right span').show();
            $('#calendar .fc-header .fc-header-right .fc-button-month').hide();
        }
    };
    //debug
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
    //DEBUG HERE, try to add a tooltip indicate the number of events in that day
    $scope.eventAfterAllRender = function (view) {
        var i, data = eventsADay($scope.eventSources);
        for (i = 0; i < data[0].length; i += 1) {
            $('#calendar .fc-view-month').find('[data-date=' + data[0][i] + ']').find('.numOfEvents').html(data[1][i]);
        }
    };
    $scope.dayRender = function (date, cell) {
        angular.element(cell).append('<span class="numOfEvents"></span>');
    };
    //DEBUG END
}];

module.exports = contestPlanCtrl;