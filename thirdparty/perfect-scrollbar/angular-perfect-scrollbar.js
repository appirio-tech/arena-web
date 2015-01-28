/**
 * This directive is cloned from https://github.com/itsdrewmiller/angular-perfect-scrollbar/blob/6e712668f4b240d44e68fbb732d4ee8f826ac592/src/angular-perfect-scrollbar.js
 * with some minor tweaks to fit web-arena
 *
 * Changes in version 1.1 (Replace ng-scrollbar with prefect-scrollbar):
 * - add 'upDownArrow' to support the up/down arrow in the scrollbar.
 * - add 'keepBottom' to keep the scrollbar at the bottom of the container.
 * - support auto scroll to communicate with 'ngScrollbarAutoscroll' directive
 *
 * @author  xjtufreeman, TCSASSEMBLER
 * @version 1.1
 */

'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*jslint unparam: true*/
/*global module, require, angular, $, document, window, console*/

angular.module('perfect_scrollbar', []).directive('perfectScrollbar',
    ['$parse', '$window', function ($parse, $window) {
        var psOptions = [
            'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
            'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
            'scrollYMarginOffset', 'upDownArrow', 'arrowHeight', 'includePadding'//, 'onScroll', 'scrollDown'
        ];

        return {
            restrict: 'EA',
            transclude: true,
            template: '<div><div ng-transclude></div></div>',
            replace: true,
            scope: true,
            link: function ($scope, $elem, $attr) {
                var jqWindow = angular.element($window),
                    options = {},
                    i,
                    l,
                    opt;

                for (i = 0, l = psOptions.length; i < l; i++) {
                    opt = psOptions[i];
                    if ($attr[opt] !== undefined) {
                        options[opt] = $parse($attr[opt])();
                    }
                }

                $scope.$evalAsync(function () {
                    $elem.perfectScrollbar(options);
                    var onScrollHandler = $parse($attr.onScroll);
                    $elem.scroll(function () {
                        var scrollTop = $elem.scrollTop(),
                            scrollHeight = $elem.prop('scrollHeight') - $elem.height();
                        $scope.$apply(function () {
                            onScrollHandler($scope, {
                                scrollTop: scrollTop,
                                scrollHeight: scrollHeight
                            });
                        });
                    });
                });

                function update(event) {
                    $scope.$evalAsync(function () {
                        if ($attr.scrollDown === 'true' && event !== 'mouseenter') {
                            setTimeout(function () {
                                $($elem).scrollTop($($elem).prop("scrollHeight"));
                            }, 100);
                        }
                        $elem.perfectScrollbar('update');
                    });
                }

                // This is necessary when you don't watch anything with the scrollbar
                $elem.bind('mouseenter', update('mouseenter'));

                // Possible future improvement - check the type here and use the appropriate watch for non-arrays
                if ($attr.refreshOnChange) {
                    $scope.$watchCollection($attr.refreshOnChange, function () {
                        update();
                    });
                }

                // this is from a pull request - I am not totally sure what the original issue is but seems harmless
                if ($attr.refreshOnResize) {
                    jqWindow.on('resize', update);
                }

                $elem.bind('$destroy', function () {
                    jqWindow.off('resize', update);
                    $elem.perfectScrollbar('destroy');
                });

                // Custom code for web-arena
                if (!!$attr.rebuildOn) {
                    $attr.rebuildOn.split(' ').forEach(function (eventName) {
                        $scope.$on(eventName, update);
                    });
                }
                if ($attr.hasOwnProperty('rebuildOnResize')) {
                    jqWindow.on('resize', update);
                }
                if (!!$attr.reloadOn) {
                    $attr.reloadOn.split(' ').forEach(function (eventName) {
                        $scope.$on(eventName, update);
                    });
                }
                if (!!$attr.scrollOn) {
                    $scope.$on($attr.scrollOn, function (args, data) {
                        var space = 10;
                        if (data.bottom + space > $elem.height()) {
                            $elem.perfectScrollbar('scroll', (data.bottom + space) - $elem.height());
                        } else if (data.top < space) {
                            $elem.perfectScrollbar('scroll', -(space - data.top));
                        }
                    });
                }
                if ($attr.hasOwnProperty('keepBottom')) {
                    $scope.$on('chatboardScrollToBottom', function () {
                        if ($scope.chatSettings && $scope.chatSettings.autoscroll) {
                            $elem.perfectScrollbar('bottom');
                        }
                    });
                }
            }
        };
    }]);
