'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global $:false, module*/
var messageArena = ['$http', '$compile', '$templateCache', function ($http, $compile, $templateCache) {
    return {
        restrict: 'A',
        controller: 'messageArenaCtrl',
        link: function (scope, element, attrs) {
            $http.get('partials/user.messageArena.html', {cache: $templateCache}).success(function (content) {
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
                        classes: 'messageArena'
                    },
                    events: {
                        show: function (event, api) {
                            scope.isReading = true;
                            scope.$broadcast('rebuild:messages');
                        },
                        hide: function (event, api) {
                            scope.isReading = false;
                            scope.$broadcast('rebuild:messages');
                        }
                    }
                });
            });
        }
    };
}];

module.exports = messageArena;