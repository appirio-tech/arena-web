'use strict';
/*global module*/
var resizerCtrl = ['$scope', '$element', '$attrs', '$document', '$window', function ($scope, $element, $attrs, $document, $window) {
    function mousemove(event) {
        var resizer = document.getElementById('resizer');
        var currentH = resizer.offsetTop - 43;
        var delta = event.clientY - $scope.lastY;
        var newH = currentH + delta;
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
                    height: 0 + 'px'
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
        if (($('#bottom-content').css('height') !== 1) || 
            ($('#top-content').css('height') !== 2)) {
                // console.log('normal');
                $scope.topStatus = 'normal';
                $scope.bottomStatus = 'normal';
            }
        event.preventDefault();
    }

    $element.on('mousedown', function (event) {
        console.log('mousedown!!!');
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