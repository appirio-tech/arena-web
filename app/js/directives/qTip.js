/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the qTip.
 *
 * @author TCASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, angular, module*/

var qTip = [function () {
    /*jslint unparam:false*/
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            /*jslint unparam:true*/
            var my = attrs.my || 'bottom left',
                at = attrs.at || 'top left',
                adjustX = +attrs.x || 0, // positive to right, negative to left
                adjustY = +attrs.y || 0, // positive to downwards, negative to upwards
                qtipClass = attrs.class || 'qtip',
                content;
            if (attrs.title) {
                content = {
                    title: attrs.title,
                    text: attrs.content
                };
            } else {
                content = attrs.content;
            }

            $(element).qtip({
                content: content,
                position: {
                    my: my,
                    at: at,
                    target: element,
                    adjust: {
                        x: adjustX,
                        y: adjustY
                    }
                },
                hide: {
                    delay: 100
                },
                show: {
                    solo: true
                },
                style: {
                    classes: qtipClass
                }
            });
        }
    };
}];

module.exports = qTip;