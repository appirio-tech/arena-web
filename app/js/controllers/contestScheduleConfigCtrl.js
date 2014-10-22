/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * The contest schedule configuration controller.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */

'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*global $:false, angular:false, module, require*/
var config = require('../config');
var contestScheduleConfigCtrl = ['$scope', '$http', 'sessionHelper', '$filter', function ($scope, $http, sessionHelper, $filter) {
    /**
     * Limits defined for various schedule length
     * @type {{regLimit: {min: number, max: number},
     *      regStartH: {min: number, max: number},
     *      regStartMm: {min: number, max: number},
     *      codeLengthH: {min: number, max: number},
     *      codeLengthMm: {min: number, max: number},
     *      intermissionLengthH: {min: number, max: number},
     *      intermissionLengthMm: {min: number, max: number},
     *      challengeLengthH: {min: number, max: number},
     *      challengeLengthMm: {min: number, max: number},
     *      coderPerRoom: {min: number, max: number},
     *      startHh: {min: number, max: number},
     *      startMm: {min: number, max: number}}}
     */
    var limits = {
        regLimit: {
            min: 1,
            max: 99999
        },
        regStartH: {
            min: 0,
            max: 999
        },
        regStartMm: {
            min: 0,
            max: 59
        },
        codeLengthH: {
            min: 0,
            max: 999
        },
        codeLengthMm: {
            min: 0,
            max: 59
        },
        intermissionLengthH: {
            min: 0,
            max: 999
        },
        intermissionLengthMm: {
            min: 0,
            max: 59
        },
        challengeLengthH: {
            min: 0,
            max: 999
        },
        challengeLengthMm: {
            min: 0,
            max: 59
        },
        coderPerRoom: {
            min: 1,
            max: 99999
        },
        startHh: {
            min: 1,
            max: 12
        },
        startMm: {
            min: 0,
            max: 59
        }
    },
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = {headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionHelper.getJwtToken()}};
    /**
     * Used for validation of fields
     * @type {boolean}
     */
    $scope.hasError = false;
    /**
     * Used for validation of fields
     * @type {{Object}}
     */
    $scope.formValid = {
        regStartH: true,
        regStartMm: true,
        codeLengthH: true,
        codeLengthMm: true,
        intermissionLengthH: true,
        intermissionLengthMm: true,
        challengeLengthH: true,
        challengeLengthMm: true
    };

    function isValid(target) {
        var str = '', value;
        if (($scope.displaySchedule[target] + str).trim() === str) {
            return false;
        }
        value = +$scope.displaySchedule[target];
        if (isNaN(value)) {
            return false;
        }
        if (angular.isDefined(limits[target].min) && value < limits[target].min) {
            return false;
        }
        if (angular.isDefined(limits[target].max) && value > limits[target].max) {
            return false;
        }
        return true;
    }
    /**
     * Check the value's limits.
     * @param value the value to check
     * @param limit the limit values.
     * @returns {*} the checked result.
     */
    function applyConstraints(value, limit) {
        if (limit && angular.isDefined(limit.min) && value < limit.min) {
            return limit.min;
        }
        if (limit && angular.isDefined(limit.max) && value > limit.max) {
            return limit.max;
        }
        return value;
    }

    /**
     * Change the string value.
     * @param target the target flag
     * @param delta the delta value
     */
    $scope.changeStr = function (target, delta) {
        var result = applyConstraints((+$scope.displaySchedule[target]) + delta, limits[target]);
        $scope.displaySchedule[target] = (result < 10 ? '0' : '') + result;
        $scope.validateInput(target);
    };
    /**
     * Add string value by 1.
     * @param target the target flag
     */
    $scope.addStr = function (target) {
        if ($scope.displaySchedule.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm')) {
            // disable click
            return;
        }
        $scope.changeStr(target, +1);
        $scope.validateInput(target);
    };
    /**
     * Minus string value by 1.
     * @param target the target flag
     */
    $scope.minusStr = function (target) {
        if ($scope.displaySchedule.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm')) {
            // disable click
            return;
        }
        $scope.changeStr(target, -1);
        $scope.validateInput(target);
    };
    /**
     * Add the target value by 1.
     * @param target the target flag
     */
    $scope.add = function (target) {
        if ($scope.displaySchedule.removeInter && (target === 'intermissionLengthH' || target === 'challengeLengthH')) {
            // disable click
            return;
        }
        $scope.displaySchedule[target] = applyConstraints((+$scope.displaySchedule[target]) + 1, limits[target]);
        $scope.validateInput(target);
    };
    /**
     * Minus the target value by 1.
     * @param target the target flag
     */
    $scope.minus = function (target) {
        if ($scope.displaySchedule.removeInter && (target === 'intermissionLengthH' || target === 'challengeLengthH')) {
            // disable click
            return;
        }
        $scope.displaySchedule[target] = applyConstraints((+$scope.displaySchedule[target]) - 1, limits[target]);
        $scope.validateInput(target);
    };
    /**
     * Modal to hold schedule details
     * @type {{regStartH: number,
     * regStartMm: string,
     * codeLengthH: number,
     * codeLengthMm: string,
     * intermissionLengthH: number,
     * intermissionLengthMm: string,
     * challengeLengthH: number,
     * challengeLengthMm: string}}
     */
    $scope.displaySchedule = {
        regStartH: 0,
        regStartMm: '00',
        codeLengthH: 0,
        codeLengthMm: '00',
        intermissionLengthH: 0,
        intermissionLengthMm: '00',
        challengeLengthH: 0,
        challengeLengthMm: '00'
    };
    /**
     * Initialize $scope.displaySchedule with existing values.
     * If no schedule exists for a round then simply use default values
     * @param round
     */
    function initFields(round) {
        $scope.round = round;
        if (!round) {
            return;
        }
        if (round.segments) {
            $scope.displaySchedule.regStartH = +Math.floor(round.segments.registrationLength / 60);
            $scope.displaySchedule.regStartMm = +Math.floor(round.segments.registrationLength % 60);
            $scope.displaySchedule.codeLengthH = +Math.floor(round.segments.codingLength / 60);
            $scope.displaySchedule.codeLengthMm = +Math.floor(round.segments.codingLength % 60);
            $scope.displaySchedule.intermissionLengthH = +Math.floor(round.segments.intermissionLength / 60);
            $scope.displaySchedule.intermissionLengthMm = +Math.floor(round.segments.intermissionLength % 60);
            $scope.displaySchedule.challengeLengthH = +Math.floor(round.segments.challengeLength / 60);
            $scope.displaySchedule.challengeLengthMm = +Math.floor(round.segments.challengeLength % 60);
        }
    }

    /**
     * Listen for setContestSchedule event to initialize open popup
     */
    /*jslint unparam: true*/
    $scope.$on('setContestSchedule', function (event, data) {
        initFields(data.round);
        $scope.showPopup('contestScheduleConfig');
    });
    /**
     * Method to submit round schedule
     */
    $scope.submitContestScheduleConfig = function () {
        var segments = $scope.round.segments, date;
        if ($scope.hasError) {
            return;
        }
        // If no existing schedule exist use current date as registration start date
        if (!segments) {
            date = Date.now();
            segments = {};
            segments.registrationStart = $filter('date')(date, 'yyyy-MM-dd HH:mm:ssZ');
            segments.codingStart = $filter('date')(new Date(date + ((+$scope.displaySchedule.regStartH) * 60
                + (+$scope.displaySchedule.regStartMm) + 1) * 60 * 1000), 'yyyy-MM-dd HH:mm:ssZ');
            segments.registrationStatus = 'F';
            segments.codingStatus = 'F';
            segments.intermissionStatus = 'F';
            segments.challengeStatus = 'F';
            segments.systemTestStatus = 'F';
        } else {
            segments.registrationStart = $filter('date')(segments.registrationStartTime, 'yyyy-MM-dd HH:mm:ssZ');
            segments.codingStart = $filter('date')(segments.codingStartTime, 'yyyy-MM-dd HH:mm:ssZ');
        }
        segments.registrationLength = (+$scope.displaySchedule.regStartH) * 60 + (+$scope.displaySchedule.regStartMm);
        segments.codingLength = (+$scope.displaySchedule.codeLengthH) * 60 + (+$scope.displaySchedule.codeLengthMm);
        if (!!$scope.displaySchedule.removeInter) {
            segments.intermissionLength = 0;
            segments.challengeLength = 0;
        } else {
            segments.intermissionLength = (+$scope.displaySchedule.intermissionLengthH) * 60 + (+$scope.displaySchedule.intermissionLengthMm);
            segments.challengeLength = (+$scope.displaySchedule.challengeLengthH) * 60 + (+$scope.displaySchedule.challengeLengthMm);
        }
        $http.post(config.apiDomain + '/data/srm/rounds/' + $scope.round.id + '/segments', segments, header).
            success(function (data) {
                if (data.error) {
                    $scope.$broadcast('genericApiError', data);
                    return;
                }

                $scope.openModal({
                    title: 'Update Schedule',
                    message: 'Schedule have been updated successfully.',
                    enableClose: true
                });
                // close the popup
                $scope.closeContestScheduleConfig();
            }).error(function (data) {
                $scope.$broadcast('genericApiError', data);
            });
    };
    /**
     * Closes round schedule popup
     */
    $scope.closeContestScheduleConfig = function () {
        $scope.hidePopup('contestScheduleConfig');
    };

    /**
     * Validate the input.
     * @param target - the input target.
     */
    $scope.validateInput = function (target) {
        $scope.formValid[target] = isValid(target) ? true : false;
        $scope.hasError = !$scope.formValid[target];
    };
}];

module.exports = contestScheduleConfigCtrl;