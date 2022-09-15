/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles match schedule page related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena - Match Plan Widget and Match Schedule Page Improvement):
 *  - Improved the logic of loading match plan data.
 *
 * @author TCASSEMBLER
 * @version 1.1
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
var matchScheduleCtrl = ['$scope', '$http', '$timeout', '$rootScope', 'appHelper', '$filter', function ($scope, $http, $timeout, $rootScope, appHelper, $filter) {
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    var tmpDate = new Date(), existingFlag, currentDate, currentDateStr, index;

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
                viewRender: $scope.viewRender,
                eventClick: $scope.changeView
            }
        };
    }

    /**
     * Load contest plan data.
     * @param filter - the filter parameters in string format
     * @param pendingPlanMonth - the pending month which is getting data
     */
    $scope.loadMatchSchedule = function (filter, pendingPlanMonth) {
        $scope.numScheduleRequests = 1;
        // Call tc-api server to get srm schedule
        $http.get(config.v4ApiDomain + '/srms/schedule?orderBy=registrationStartTime desc&filter=' + encodeURIComponent(filter)).success(function (data, status, headers) {
            $scope.numScheduleRequests -= 1;
            $scope.eventSources = appHelper.parseMatchScheduleData(data, pendingPlanMonth, $scope.eventSources);
            $rootScope.contestPlanList = $scope.eventSources[0];
            initCalendar();
        }).error(function (data, status, headers, config) {
            $scope.numScheduleRequests -= 1;
            //skip the error, simply print to console
            console.log(data);
        });
    };

    /**
     * Load month view data.
     * @param monthDate the first date of month.
     */
    $scope.loadMonthViewData = function (monthDate) {
        if (!appHelper.isExistingMatchPlan(monthDate)) {
            $scope.loadMatchSchedule(appHelper.getRegistrationStartTimeRangeUrl(monthDate, 1) + appHelper.getMonthViewStatus(monthDate),
                [monthDate.getFullYear() + '-' + monthDate.getMonth()]);
        }
    };

    /**
     * View render.
     * @param view the view.
     * @param element the element.
     */
    $scope.viewRender = function (view, element) {
        if (view.name === 'basicWeek') {
            $scope.loadMonthViewData(view.end);
        } else {
            $scope.loadMonthViewData(view.start);
        }
    };

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
            $scope.matchSchedule.fullCalendar('gotoDate', appHelper.parseTDate(result + 'T00:00:00'));
        }
    };

    existingFlag = false;
    currentDate = new Date();
    currentDateStr = currentDate.getFullYear() + '-' + currentDate.getMonth();
    if (angular.isDefined($rootScope.loadedContestPlanList)) {
        for (index = 0; index < $rootScope.loadedContestPlanList.length; index++) {
            if ($rootScope.loadedContestPlanList[index] === currentDateStr) {
                existingFlag = true;
                break;
            }
        }
    }

    if (existingFlag) {
        $scope.eventSources[0] = $rootScope.contestPlanList;
        initCalendar();
    } else {
        $scope.loadMatchSchedule(appHelper.getRegistrationStartTimeRangeUrl(new Date(), 3) + '&statuses=F,A,P',
            appHelper.getComingThreeMonths());
    }

    $timeout(function () {
        if ($rootScope.selectedDate) {
            $scope.matchSchedule.fullCalendar('gotoDate', $rootScope.selectedDate.year, $rootScope.selectedDate.month);

        }
    }, 10);
}];

module.exports = matchScheduleCtrl;