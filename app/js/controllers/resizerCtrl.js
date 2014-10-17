/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This is the resizer for the code editing and viewing page.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Rebuild the scrollbar of the Problem Area when the resizer's position changed.
 * - Fixed JSLint issues.
 *
 * @author amethystlei
 * @version 1.1
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global module, angular, document, $, window*/
var resizerCtrl = ['$scope', '$element', '$attrs', '$document', '$rootScope', function ($scope, $element, $attrs, $document, $rootScope) {
    function mousemove(event) {
        var resizer = document.getElementById('resizer'),
            currentH = resizer.offsetTop - 43,
            delta = event.clientY - $scope.lastY,
            newH = currentH + delta;
        if (newH >= 1 && newH <= $scope.originTotal) {
            $($attrs.resizerTop).css({
                height: newH + 'px'
            });
            $($attrs.resizerBottom).css({
                height: ($scope.originTotal - newH) + 'px'
            });
            if ($scope.topAndCodeMirror >= newH) {
                $($attrs.resizerCodeMirror).css({
                    height: ($scope.topAndCodeMirror - newH) + 'px'
                });
            } else {
                $($attrs.resizerCodeMirror).css({
                    height: '0px'
                });
            }
            $scope.lastY = event.clientY;
            $scope.cmElem.CodeMirror.refresh();
            $scope.sharedObj.rebuildErrorBar();
        }
    }

    function mouseup(event) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        $scope.lastY = undefined;
        if ($('#bottom-content').css('height') !== 1 ||
                $('#top-content').css('height') !== 2) {
            $scope.topStatus = 'normal';
            $scope.bottomStatus = 'normal';
        }
        event.preventDefault();
        $rootScope.$broadcast('problem-loaded');
    }

    $element.on('mousedown', function (event) {
        event.preventDefault();
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        $scope.lastY = event.clientY;
        // origin height of top-content: 169(with 1 px padding)
        // origin height of bottom-content: 516
        // origin height of codemirror: 475
        $scope.originTotal = 685;
        $scope.topAndCodeMirror = 644;
        if (window.innerWidth <= 502) {
            $scope.originTotal = 685 + 60;
        } else if (window.innerWidth <= 741) {
            $scope.originTotal = 685 + 30;
        } else {
            $scope.originTotal = 685;
        }
    });
}];
module.exports = resizerCtrl;