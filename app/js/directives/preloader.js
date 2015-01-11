/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the directive for loading spinner indicator.
 *
 * Usage:
 *   - Just add following element as child of the element where the data will be loaded:
 *    <div class="preloader-window" data-preloader data-num-requests='{{numRequests}}'
 *            text='Loading Questions...'></div>
 *     numRequests should contain the number of http requests made which are not yet answered
 *                 so when the numRequests > 0 the loading indicator will be shown
 *                 every time you make http request for the data increase the value of numRequests by 1
 *                 and for every response decrease the value by 1
 *     text        contains the text shown in the loading indicator
 *     NOTE: if there is no change in numRequests for config.spinnerTimeout milliseconds
 *           "Time out." message will be shown.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint strict:false*/
/*global module*/

/*jslint unparam:true*/
var config = require('../config');

/**
 * The directive for Loading Indicator.
 *
 * @type {*[]}
 */
var preloader = ['$http', '$timeout', function ($http, $timeout) {
    return {
        restrict: 'A',
        scope: {
            text: '@',
            numrequests: '@'
        },
        link: function (scope, element, attributes) {
            var timeoutHndl;
            attributes.$observe('numRequests', function (numRequests, oldNumRequests) {
                if (numRequests > 0) {
                    if (scope.text) {
                        element.html('<div class="preloader-indicator"><img/>' + scope.text + '</div>');
                    } else {
                        element.html('<div class="preloader-indicator"><img/>Loading...</div>');
                    }
                    element.show();
                    $timeout.cancel(timeoutHndl);
                    timeoutHndl = $timeout(function () {
                        element.html('<div class="preloader-indicator"><img/>Time out.</div>');
                        element.show();
                        $timeout(function () {
                            element.hide();
                            if (scope.callback) {
                                scope[callback]();
                            }
                        }, 1000);
                    }, config.spinnerTimeout);
                } else {
                    element.hide();
                    $timeout.cancel(timeoutHndl);
                }
            });

        }
    };
}];
/*jslint unparam:false*/
module.exports = preloader;
