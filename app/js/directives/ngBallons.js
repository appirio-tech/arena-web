'use strict';
// the directive for 'Balloon Guides'
var ballons = [function () {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                key: '@',
                path: '@'
            },
            templateUrl: 'partials/balloons.html',
            controller: 'balloonCtrl'
        };
    }
        ];
module.exports = ballons;


