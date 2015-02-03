/**
 * This directive is cloned from https://github.com/asafdav/ng-scrollbar/blob/53a2b3e558c84182d6afe6bc62f17b8835b3387d/dist/ng-scrollbar.js
 * with some minor changes to fix UI issues when rebuilding.
 * Two options 'scrollTop' and 'keepBottom' are added to keep the scrollbar at top / bottom position when it is rebuilt.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Added the 'reload' functionality similar to ng-scrollbar.
 * - The use of the 'reload' function is recommended, compared to the classic 'rebuild'.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena Bug Fix 14.10 - 2):
 * - Added skip prevent default event flag.
 *
 * @author TCSASSEMBLER
 * @version 1.2
 */
'use strict';
angular.module('ngCustomScrollbar', []).directive('ngCustomScrollbar', [
  '$parse',
  '$window',
  function ($parse, $window) {
    return {
      restrict: 'A',
      scope: true,
      replace: true,
      transclude: true,
      link: function (scope, element, attrs) {
        var mainElm, transculdedContainer, tools, thumb, thumbLine, track;
        var win = angular.element($window);
        var maxDraggerTop = 0;
        scope.rebuildScroll = true;
        var dragger = { top: 0 }, page = { top: 0 };
        var scrollboxStyle, draggerStyle, draggerLineStyle, pageStyle;
        var calcStyles = function () {
          scrollboxStyle = {
            position: 'relative',
            overflow: 'hidden',
            'max-width': '100%',
            height: '100%'
          };
          if (page.height) {
            scrollboxStyle.height = page.height + 'px';
          }
          draggerStyle = {
            position: 'absolute',
            height: dragger.height + 'px',
            top: dragger.top + 'px'
          };
          draggerLineStyle = {
            position: 'relative',
            'line-height': dragger.height + 'px'
          };
          pageStyle = {
            position: 'relative',
            top: page.top + 'px',
            overflow: 'hidden',
            width: 'calc(100% - 16px)'
          };
        };
        var redraw = function () {
          thumb.css('top', dragger.top + 'px');
          var draggerOffset = dragger.top / page.height;
          page.top = -Math.ceil(page.scrollHeight * draggerOffset * 1.0013);
          if ((attrs.hasOwnProperty('scrollTop') && dragger.top === 0) || dragger.top > maxDraggerTop) {
                if (dragger.top >= (page.height - Math.round(page.height / page.scrollHeight * page.height))) {
                  dragger.top = page.height - Math.round(page.height / page.scrollHeight * page.height);
                  dragger.height = Math.round(page.height / page.scrollHeight * page.height);
                }
                maxDraggerTop = dragger.top;
                scope.rebuildScroll = true;
                rebuild();
            } else {
                scope.rebuildScroll = false;
            }
          transculdedContainer.css('top', page.top + 'px');
        };
        var trackClick = function (event) {
          var offsetY = event.hasOwnProperty('offsetY') ? event.offsetY : event.layerY;
          var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          dragger.top = newTop;
          redraw();
          event.stopPropagation();
        };
        var wheelHandler = function (event) {
          var deltaY = event.wheelDeltaY !== undefined ? event.wheelDeltaY / 20 : event.wheelDelta !== undefined ? event.wheelDelta / 20 : -event.detail * 2;
          deltaY = deltaY * 3;
          dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - deltaY));
          redraw();
          if (!!event.preventDefault) {
            event.preventDefault();
          } else {
            return false;
          }
        };
          var keyDownHandler = function (event) {
              var deltaY = 0;
              if (event.keyCode === 38) {
                  //up
                  deltaY = 60;
                  dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - deltaY));
                  redraw();
              }
              if (event.keyCode === 40) {
                  //down
                  deltaY = -60;
                  dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - deltaY));
                  redraw();
              }
              if (!attrs.hasOwnProperty('skipPreventEvent')) {
                  if (!!event.preventDefault) {
                     event.preventDefault();
                  } else {
                     return false;
                  }
              }
          };
        var lastOffsetY;
        var thumbDrag = function (event, offsetX, offsetY) {
          var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          dragger.top = newTop;
          event.stopPropagation();
        };
        var dragHandler = function (event) {
          var newOffsetY = event.pageY - thumb[0].scrollTop - lastOffsetY;
          var newOffsetX = 0;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };
        var buildScrollbar = function (keepBottom) {
          mainElm = angular.element(element.children()[0]);
          transculdedContainer = angular.element(mainElm.children()[0]);
          tools = angular.element(mainElm.children()[1]);
          thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
          thumbLine = angular.element(thumb.children()[0]);
          track = angular.element(angular.element(tools.children()[0]).children()[1]);
          page.height = element[0].offsetHeight;
          if(attrs.class==="dropdown-menu" && page.height > 10) // fix negative height
            page.height -= 10;
          page.scrollHeight = transculdedContainer[0].scrollHeight;

          if (page.height < page.scrollHeight) {
            scope.showYScrollbar = true;
            dragger.height = Math.round(page.height / page.scrollHeight * page.height);
            dragger.trackHeight = page.height;
            calcStyles();
            element.css({ overflow: 'hidden' });
            mainElm.css(scrollboxStyle);
            transculdedContainer.css(pageStyle);
            thumb.css(draggerStyle);
            thumbLine.css(draggerLineStyle);
            track.bind('click', trackClick);
            var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
            transculdedContainer[0].addEventListener(wheelEvent, wheelHandler, false);
            transculdedContainer[0].addEventListener('keydown', keyDownHandler, false);
            thumb.bind('mousedown', function (event) {
              lastOffsetY = event.pageY - thumb[0].offsetTop;
              win.bind('mouseup', function () {
                win.unbind('mousemove', dragHandler);
                event.stopPropagation();
              });
              win.bind('mousemove', dragHandler);
              event.preventDefault();
            });
            tools.bind('click', function(e) {e.stopPropagation()});
            if (keepBottom) {
              dragger.top = Math.max(0, parseInt(page.height, 10) - parseInt(dragger.height, 10));
            } else {
              dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10)));
            }
              redraw();
          } else {
            // the scroll bar is not shown, move dragger and page to top
            page.top = 0;
            dragger.top = 0;

            dragger.height = page.height;
            calcStyles();
            mainElm.css(scrollboxStyle);
            scope.showYScrollbar = false;
              transculdedContainer.css({
                top: 0
              });
          }
        };
        var rebuildTimer;
        var rebuild = function (e, data) {
          if (rebuildTimer != null) {
            clearTimeout(rebuildTimer);
          }
          scope.rebuildScroll = true;
          rebuildTimer = setTimeout(function () {
            if (scope.rebuildScroll) {
              page.height = null;

              buildScrollbar(attrs.hasOwnProperty('keepBottom'));

              if (!scope.$$phase) {
                scope.$digest();
              }
            }
          }, 72);
        };
        var reload = function () {
          maxDraggerTop = 0;
          scope.rebuildScroll = true;
          dragger = { top: 0 }, page = { top: 0 };
          buildScrollbar();
        };
        buildScrollbar();
        if (!!attrs.rebuildOn) {
          attrs.rebuildOn.split(' ').forEach(function (eventName) {
            scope.$on(eventName, rebuild);
          });
        }
        if (attrs.hasOwnProperty('rebuildOnResize')) {
          win.on('resize', rebuild);
        }
        if (!!attrs.reloadOn) {
          attrs.reloadOn.split(' ').forEach(function (eventName) {
            scope.$on(eventName, reload);
          });
        }
        if (!!attrs.scrollOn) {
          scope.$on(attrs.scrollOn, function(_, data) {
              if (!page.height) {
                  reload();
              }

              if (-(page.top || 0) > data.top) {
                  dragger.top = (dragger.trackHeight - dragger.height) * Math.min(data.top / (page.scrollHeight-page.height), 1);
              }
              else if (-(page.top || 0) + page.height < data.bottom) {
                  dragger.top = dragger.trackHeight * (data.bottom / page.scrollHeight) - dragger.height;
              }
              else return;

              rebuild();
          });
        }
      },
        template: '<div>' + '<div class="ngsb-wrap">' + '<div class="ngsb-container" ng-transclude tabindex="100"></div>' + '<div class="ngsb-scrollbar" style="position: absolute; display: block; top: 0px;" ng-show="showYScrollbar">' + '<div class="ngsb-thumb-container">' + '<div class="ngsb-thumb-pos" oncontextmenu="return false;">' + '<div class="ngsb-thumb" ></div>' + '</div>' + '<div class="ngsb-track"></div>' + '</div>' + '</div>' + '</div>' + '</div>'
    };
  }
]);
