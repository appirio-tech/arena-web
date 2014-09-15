'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/
var pastNotifications = ['$http', '$compile', '$templateCache', function ($http, $compile, $templateCache) {
    /*jslint unparam: true*/
    return {
        restrict: 'A',
        controller: 'notificationsCtrl',
        link: function (scope, element, attrs) {
            $http.get('partials/user.notifications.html', {cache: $templateCache}).success(function (content) {
                var compiledContent = $compile(content)(scope);
                $(element).qtip({
                    content: compiledContent,
                    position: {
                        my: 'top right',
                        at: 'bottom right',
                        target: $(element),
                        adjust: {
                            x: 46,
                            y: 12
                        }
                    },
                    show: 'click',
                    hide: 'unfocus click',
                    style: {
                        classes: 'messageArena pastNotifications'
                    },
                    events: {
                        show: function (event, api) {
                            // scope.viewMoreClicked = false;
                            scope.viewDefault();
                            scope.$broadcast('rebuild:pastNotifications');
                        },
                        hide: function (event, api) {
                            // scope.viewDefault();
                            // scope.$broadcast('rebuild:pastNotifications');
                        }
                    }
                });
                /*jslint unparam: false*/
            });
        }
    };
}];

module.exports = pastNotifications;