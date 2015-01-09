/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive emits scroll event to be processed by custom ngCustomScrollbar
 * when the scroll condition is met.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module*/


var ngScrollbarAutoscroll = [function () {
    return {
        restrict: 'A',
        scope: {
            autoscrollEvent: "@",
            id: '@ngScrollbarAutoscroll'
        },
        link: function (scope, element, attrs) {
            scope.$on('autoscroll', function(evt, targetId) {
                if(targetId === scope.id) {
                    var data = $(element).position();
                    data.bottom = data.top + $(element).outerHeight();
                    scope.$root.$broadcast(scope.autoscrollEvent, data);
                }
            });
        }
    };
}];
module.exports = ngScrollbarAutoscroll;
