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
    var resizer, resizerTop, resizerBottom, resizerCodeMirror;

    function mousemove(event) {
        var currentH = resizerTop.height();
        var delta = event.pageY - resizer.offset().top;
        var newH = currentH + delta;

        if (newH < 1) newH = 1;
        if (newH > $scope.originTotal) newH = $scope.originTotal;

        resizerTop.css({
            height: newH + 'px'
        });
        resizerBottom.css({
            height: ($scope.originTotal - newH) + 'px'
        });
        if ($scope.topAndCodeMirror >= newH) {
            resizerCodeMirror.css({
                height: ($scope.topAndCodeMirror - newH) + 'px'
            });
        } else {
            resizerCodeMirror.css({
                height: '0px'
            });
        }
        $scope.cmElem.CodeMirror.refresh();
        $scope.sharedObj.rebuildErrorBar();
    }

    function mouseup(event) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);

        $scope.topStatus = 'normal';
        $scope.bottomStatus = 'normal';

        if (resizerBottom.height() == 0)
            $scope.topStatus = 'expand';
        else if (resizerTop.height() == 1)
            $scope.bottomStatus = 'expand';

        event.preventDefault();
        $rootScope.$broadcast('problem-loaded');
    }

    $element.on('mousedown', function (event) {
        event.preventDefault();

        resizer = $('#resizer');
        resizerTop = $($attrs.resizerTop);
        resizerBottom = $($attrs.resizerBottom);
        resizerCodeMirror = $($attrs.resizerCodeMirror);

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);

        // origin height of top-content: 169(with 1 px padding)
        // origin height of bottom-content: 516
        // origin height of codemirror: 475
        $scope.originTotal = resizerTop.height() + resizerBottom.height();
        $scope.topAndCodeMirror = resizerTop.height() + resizerCodeMirror.height();;
    });
}];
module.exports = resizerCtrl;
