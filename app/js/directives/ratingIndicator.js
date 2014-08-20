/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the directive for rating indicators.
 *
 * @author amethystlei
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module, angular*/

/*jslint unparam:true*/
/**
 * the directive for Rating Indicator.
 *
 * @type {*[]}
 */
var ratingIndicator = [function () {
    // constants
    var r = 6, // radius
        coderRed = '#ee0000',
        coderYellow = '#ddcc00',
        coderBlue = '#6666ff',
        coderGreen = '#00a900',
        coderGrey = '#999',
        ratingColors = [coderRed, coderYellow, coderBlue, coderGreen, coderGrey],
        ratingBreaks = [3000, 2200, 1500, 1200, 900, 1, 0, -1];
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            var dom = angular.element(element),
                rating = attrs.ratingIndicator,
                username = attrs.username,
                svg,
                grad,
                stop1,
                stop2,
                circle,
                circleInner,
                i,
                perc;
            /**
             * Paint the icon with rating percentage and color.
             * Refer to https://github.com/cloudspokes/arena-client/blob/00e2f94eb6e3d956510cea292df7dffe39904859/src/main/com/topcoder/client/contestApplet/common/Common.java
             *
             * @param  {number} perc  the rating percentage in this rank
             * @param  {string} color the rating color
             */
            function paintIcon(perc, color) {
                dom.append('<svg><defs><linearGradient><stop></stop><stop></stop></linearGradient></defs><circle></circle></svg>');
                svg = angular.element(dom.children()[0]);
                grad = angular.element(angular.element(svg.children()[0]).children()[0]);
                stop1 = angular.element(grad.children()[0]);
                stop2 = angular.element(grad.children()[1]);
                circle = angular.element(svg.children()[1]);
                svg.attr('class', 'ratingSvg').css('height', 2 * (r + 1)).css('width', 2 * (r + 1));
                var time = new Date().getTime();
                grad.attr('id', 'grad' + username + time)
                    .attr('x1', '0%').attr('x2', '0%').attr('y1', '100%').attr('y2', '0%');
                stop1.attr('offset', perc).css('stop-color', color);
                stop2.attr('offset', perc).css('stop-color', 'transparent').attr("stop-opacity", 0);
                circle.attr('cx', r + 1).attr('cy', r + 1).attr('r', r).attr('stroke', color).attr('fill', 'url(#grad' + username + time + ')');
            }

            /**
             * Paint the target icon.
             */
            function paintTarget() {
                dom.append('<svg viewBox="0 0 12 12"><svg><circle></circle><circle></circle></svg></svg>');
                svg = angular.element(dom.children()[0]);
                circle = angular.element(angular.element(svg.children()[0]).children()[0]);
                circleInner = angular.element(angular.element(svg.children()[0]).children()[1]);
                svg.attr('class', 'targetIndicator').css('background', coderRed);
                circle.attr('cx', r).attr('cy', r).attr('r', 4).attr('stroke', 'white').attr('stroke-width', 1).attr('fill', 'transparent');
                circleInner.attr('cx', r).attr('cy', r).attr('r', 2).attr('stroke', 'white').attr('stroke-width', 1).attr('fill', 'transparent');
            }

            if (rating >= 3000) {
                // target
                paintTarget();
            } else if (rating === 0) {
                // non-rated
                dom.append('<span></span>').attr('class', 'nonRatedIndicator');
            } else if (rating < 0) {
                // admin
                dom.append('<span></span>').attr('class', 'adminIndicator');
            } else {
                // filling over indicator
                for (i = 1; i < ratingBreaks.length - 2; i += 1) {
                    if (rating >= ratingBreaks[i]) {
                        perc = (rating - ratingBreaks[i]) / (ratingBreaks[i - 1] - ratingBreaks[i]);
                        paintIcon(perc, ratingColors[i - 1]);
                        break;
                    }
                }
            }
        }
    };
}];
/*jslint unparam:false*/

module.exports = ratingIndicator;