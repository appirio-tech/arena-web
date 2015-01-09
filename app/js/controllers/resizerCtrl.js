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
        var delta = event.clientY - $scope.startY,
            newRatio = Math.max(0, Math.min($scope.startRatio + delta / $scope.containerHeight, 1));

        console.log('newRatio: ' + newRatio);

        $scope.$apply(function() {
            $scope[$attrs.resizer] = newRatio;
        });
    }

    function mouseup(event) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        $scope.startY = $scope.startRatio = $scope.containerHeight = undefined;
        event.preventDefault();
    }

    $element.on('mousedown', function (event) {
        event.preventDefault();
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        $scope.startY = event.clientY;
        $scope.startRatio = $scope[$attrs.resizer];
        $scope.containerHeight = $($element).parent().height();

        console.log('startY: ' + $scope.startY);
        console.log('startRatio: ' + $scope.startRatio);
        console.log('containerHeight: ' + $scope.containerHeight);
    });
}];
module.exports = resizerCtrl;
