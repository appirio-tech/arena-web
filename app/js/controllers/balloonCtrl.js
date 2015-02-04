/* controller for balloon guide */
'use strict';
var balloonCtrl = ['$scope', '$timeout', '$http', '$cookies', '$window',
    function ($scope, $timeout, $http, $cookies, $window) {

        /* updateBalloons */
        function updateBalloons() {
            var i, bln, offset, offTop, wtAtt, wt, ht;
            $('.ballonsWrap').hide();
            for (i = 0; i < $scope.balloons.length; i = i + 1) {
                $('.ballonsWrap').show();
                bln = $scope.balloons[i];
                if (bln.content && bln.content !== '') {
                    bln.disabled = false;
                    if ($(bln.attachTo) && $(bln.attachTo).length > 0 && $(bln.attachTo).is(':visible')) {
                        offset = $(bln.attachTo).offset();
                        offTop = -55 + Math.min(55, ($(bln.attachTo).height() + 20));
                        bln.posB = 'auto';
                        bln.posT = Math.max(20, (offset.top + offTop));
                        bln.posL = offset.left;
                        bln.posT += 'px';
                        bln.posL += 'px';

                        if (bln.position) {
                            wtAtt = $(bln.attachTo).width();
                            wt = $('.ballonWrap.bl-' + i).width();
                            ht = $('.ballonWrap.bl-' + i).height();
                            // rightBelow pos.
                            if (bln.position.toLowerCase() === 'rightbelow') {
                                bln.posL = offset.left - wt + wtAtt + 55;
                                bln.posL += 'px';
                            }
                            // leftAbove pos.
                            if (bln.position.toLowerCase() === 'leftabove') {
                                bln.posT = offset.top - 55 - ht - 30;
                                bln.posT += 'px';
                            }
                            // rightAbove pos.
                            if (bln.position.toLowerCase() === 'rightabove') {
                                bln.posL = offset.left - wt + wtAtt + 55;
                                bln.posL += 'px';
                                bln.posT = offset.top - 55 - ht - 30;
                                bln.posT += 'px';
                            }
                        }
                    } else {
                        bln.disabled = true;
                    }
                }
            }
        }

        $scope.balloons = {};
        var timeout, cookieName, i, bln, balloonsData, isFirstTime;

        if (!$cookies[cookieName] || $cookies[cookieName] !== 'expired') {
            $http({
                method: 'GET',
                url: 'data/balloons.json'
            }).success(function (data) {
                balloonsData = data;
                $scope.balloons = balloonsData[$scope.key] ? balloonsData[$scope.key].balloonGuides : [];
                for (i = 0; i < $scope.balloons.length; i = i + 1) {
                    bln = $scope.balloons[i];
                    bln.posT = "auto";
                    bln.posR = "auto";
                    bln.posB = "-300px";
                    bln.posL = "auto";
                }
                cookieName = $scope.key + (balloonsData[$scope.key] ? balloonsData[$scope.key].id : '') + $scope.$parent.username();
                if (!$cookies[cookieName] || $cookies[cookieName] !== 'expired') {
                    isFirstTime = true;
                    /* gets to position of attached element and then updates the position of ballons */
                    $timeout(updateBalloons, 50);
                    /* it also updates the position of ballons but after a long delay as ajax data takes some time to load*/
                    $timeout(updateBalloons, 4000);
                }
                $cookies[cookieName] = 'expired';
            });
        }


        /* reposition on resize */
        if (timeout) { $timeout.cancel(timeout); }
        $($window).on('resize', function () {
            if (!isFirstTime) { return; }
            timeout = $timeout(function () {
                updateBalloons();
            }, 350);
        });
        $($window).on('scroll', function () {
            if (!isFirstTime) { return; }
            timeout = $timeout(function () {
                updateBalloons();
            }, 350);
        });

        //removeBalloon
        $scope.removeBalloon = function (idx) {
            $scope.balloons.splice(idx, 1);
            $timeout(function () {
                if ($('.ballonsWrap .ballonWrap:visible').length <= 0) {
                    $('.ballonsWrap').hide();
                }
            }, 10);
        };
    }
     ];

module.exports = balloonCtrl;
