/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive fixes problem with firefox autofill
 * http://victorblog.com/2014/01/12/fixing-autocomplete-autofill-on-angularjs-form-submit/
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';

/**
 * Directive for auto file fix
 * @type {*[]}
 */
var autoFillFix = ['$timeout', function ($timeout) {
    return function (scope, elem, attrs) {
        // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
        elem.prop('method', 'POST');

        // Fix autofill issues where Angular doesn't know about autofilled inputs
        if (attrs.ngSubmit) {
            $timeout(function () {
                elem.unbind('submit').bind('submit', function (e) {
                    e.preventDefault();
                    elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
                    scope.$apply(attrs.ngSubmit);
                });
            }, 0);
        }
    };
}];
module.exports = autoFillFix;