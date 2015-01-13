/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file is the controller for create contest.
 *
 * Changes in version 1.1:
 *  - Changed the contest id and round id generation logic.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena - Contest Creation Wizard Bug Fix):
 *  - Fixed the issues in create contest popup dialog.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena - Match Configurations)
 *  - Changed date format to save segments to match with API changes in srmRoundSegments.js
 *  - Fixed JSLINT errors
 *
 * Changes in version 1.4 (Module Assembly - Web Arena - Quick Fixes for Contest Management)
 * - Added roundDataIn to handle the case when contest will be updated and not created.
 * - Adjusted parameters from the loaded contest if it is not undefined.
 *
 * Changes in version 1.5 (Web Arena - Match Management Page Load Improvement):
 * - Added validation for roundData.roomAssignment and roundData.languages fields.
 * If they are not there, then default values will be used
 *
 * @author flytoj2ee, dexy, TCSASSEMBLER
 * @version 1.5
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*jslint unparam: true*/
/*global FileReader, document, console, angular, $:false, module, require*/
var config = require('../config');
var helper = require('../helper');

/**
 * The create contest controller.
 * @type {*[]}
 */
var contestCreationCtrl = ['$scope', '$http', '$modalInstance', 'ok', 'cancel', '$timeout', '$filter', 'appHelper', '$rootScope', '$modal', '$state', 'roundDataIn',
    function ($scope, $http, $modalInstance, ok, cancel, $timeout, $filter, appHelper, $rootScope, $modal, $state, roundDataIn) {
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
                    min: 0,
                    max: 12
                },
                startMm: {
                    min: 0,
                    max: 59
                }
            },
            modalTimeoutPromise = null,
            reader = new FileReader(),
            showDetailModal;

        $scope.isUpdate = angular.isDefined(roundDataIn);
        $scope.contestName = '';
        $scope.notes = '';

        // get data
        $scope.languages = {};
        $scope.languageChoice = [];
        $scope.assignByRegion = false;
        $scope.type = 'Public';

        /**
         * Check whether the current language is common set.
         * @param lang - the language
         * @param commonSet - the common language set
         * @returns {boolean} the checked result
         */
        function isCommonLanguage(lang, commonSet) {
            return commonSet.indexOf(lang) > -1;
        }
        // get language data
        $http.get('data/languages.json').success(function (data) {
            $scope.languages = data;
            angular.forEach(data.all, function (language) {
                var item = {};
                item.language = language.text;
                item.id = language.id;
                if (language.text === 'Java' || language.text === 'C#' || language.text === 'VB'
                        || language.text === 'C++' || language.text === 'Python') {
                    item.checked = true;
                } else {
                    item.checked = false;
                }
                $scope.languageChoice.push(item);
            });
            if ($scope.isUpdate && $scope.roundData.languages) {
                angular.forEach($scope.languageChoice, function (item) {
                    item.checked = false;
                    if ($scope.roundData.languages.length === 0) {
                        item.checked = isCommonLanguage(item.language, $scope.languages.commonSet);
                    } else {
                        angular.forEach($scope.roundData.languages, function (language) {
                            if (language.id === item.id) {
                                item.checked = true;
                            }
                        });
                    }
                });
            }
        });

        // default value
        $scope.officialRated = true;
        $scope.assignByDiv = true;
        // handle registration limit
        $scope.regLimit = 1024;
        $scope.regStartH = 2;
        $scope.regStartMm = '00';
        $scope.codeLengthH = 1;
        $scope.codeLengthMm = '15';
        $scope.intermissionLengthH = 0;
        $scope.intermissionLengthMm = '05';
        $scope.challengeLengthH = 0;
        $scope.challengeLengthMm = 15;
        $scope.coderPerRoom = 20;
        $scope.startHh = 0;
        $scope.startMm = 0;
        // handle am/pm marker
        $scope.marker = 'AM';
        $scope.roomAssignmentMethod = {};

        $scope.currentSelectedDate = null;
        $scope.currentStartMonth = null;
        $scope.currentEndMonth = null;

        $scope.roundData = roundDataIn;
        if ($scope.isUpdate) {
            $scope.contestName = $scope.roundData.name;
            if ($scope.contestName.indexOf(' Round', $scope.contestName.length - ' Round'.length) !== -1) {
                $scope.contestName = $scope.contestName.substr(0, $scope.contestName.length - ' Round'.length);
            }
            if ($scope.roundData.roomAssignment) {
                $scope.roomAssignmentMethod.id = $scope.roundData.roomAssignment.type;
                $scope.assignByRegion = $scope.roundData.roomAssignment.isByRegion === 1;
                $scope.assignByDiv = $scope.roundData.roomAssignment.isByDivision === 1;
                $scope.coderPerRoom = $scope.roundData.roomAssignment.codersPerRoom;
            }
            if (angular.isDefined($scope.roundData.invitationalType)) {
                $scope.type = $scope.roundData.invitationalType === 'Not' ? 'Public' : 'Invitational';
            }
            $scope.regLimit = $scope.roundData.registrationLimit;
            $scope.currentSelectedDate = new Date($scope.roundData.roundSchedule[0].startTime);
            $scope.marker = 'AM';
            $scope.startHh = $scope.currentSelectedDate.getHours();
            if ($scope.startHh >= 12) {
                $scope.marker = 'PM';
                $scope.startHh -= 12;
            }
            if ($scope.currentSelectedDate.getMinutes() < 10) {
                $scope.startMm = '0' + $scope.currentSelectedDate.getMinutes().toString();
            } else {
                $scope.startMm = $scope.currentSelectedDate.getMinutes().toString();
            }
            $scope.regStartH = Math.floor($scope.roundData.segments.registrationLength / 60).toString();
            if (($scope.roundData.segments.registrationLength % 60) < 10) {
                $scope.regStartMm = '0' + ($scope.roundData.segments.registrationLength % 60).toString();
            } else {
                $scope.regStartMm = ($scope.roundData.segments.registrationLength % 60).toString();
            }
            $scope.codeLengthH = Math.floor($scope.roundData.segments.codingLength / 60).toString();
            if (($scope.roundData.segments.codingLength % 60) < 10) {
                $scope.codeLengthMm = '0' + ($scope.roundData.segments.codingLength % 60).toString();
            } else {
                $scope.codeLengthMm = ($scope.roundData.segments.codingLength % 60).toString();
            }
            $scope.intermissionLengthH = Math.floor($scope.roundData.segments.intermissionLength / 60).toString();
            if (($scope.roundData.segments.intermissionLength % 60) < 10) {
                $scope.intermissionLengthMm = '0' + ($scope.roundData.segments.intermissionLength % 60).toString();
            } else {
                $scope.intermissionLengthMm = ($scope.roundData.segments.intermissionLength % 60).toString();
            }
            $scope.challengeLengthH = Math.floor($scope.roundData.segments.challengeLength / 60);
            if (($scope.roundData.segments.challengeLength % 60) < 10) {
                $scope.challengeLengthMm = '0' + ($scope.roundData.segments.challengeLength % 60).toString();
            } else {
                $scope.challengeLengthMm = ($scope.roundData.segments.challengeLength % 60).toString();
            }
        }

        /**
         * Close detail dialog.
         */
        $scope.closeDetailDialog = function () {
            // requests will be sent by the resolvers
            $state.go(helper.STATE_NAME.ContestManagement, null, {reload: true});
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            if ($rootScope.currentDetailModal) {
                $rootScope.currentDetailModal.dismiss('cancel');
                $rootScope.currentDetailModal = undefined;
            }
        };

        /**
         * Get error detail.
         * @param data the data value.
         * @param status the status code
         * @returns {*} the error detail.
         */
        function getErrorDetail(data, status) {
            var str = '';
            if ((status + str) === '0') {
                return 'cannot connect to server.';
            }
            if (data !== undefined && data.error !== undefined) {
                return (data.error.details !== undefined) ? data.error.details : data.error;
            }
            return ' status code - ' + status;
        }

        /**
         * Set timeout modal.
         */
        function setTimeoutModal() {
            $scope.closeDetailDialog();
            $scope.openDetailModal({'title': 'Timeout', 'detail': 'Sorry, the request is timeout.', 'enableClose': true});
            modalTimeoutPromise = null;
        }

        /**
         * Close dialog.
         */
        $scope.ok = function () {
            ok();
            $modalInstance.close();

            var roundId, date, hour, dateString, contestData, roundData, languageData, i, popupDetailModalCtrl, header, segment;

            date = new Date();
            hour = +$scope.startHh;
            if ($scope.marker === 'PM') {
                hour = +$scope.startHh + 12;
            }
            dateString = $scope.startDate;
            date.setFullYear(+dateString.substring(6, 10));
            date.setMonth((+dateString.substring(0, 2)) - 1);
            date.setDate(+dateString.substring(3, 5));
            date.setHours(hour);
            date.setMinutes(+$scope.startMm);

            contestData = {};
            contestData.name = $scope.contestName;
            contestData.startDate = $filter('date')(date, 'yyyy-MM-dd HH:mm');
            contestData.status = 'A';
            contestData.endDate = $filter('date')(new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm');

            roundData = {};
            roundData.type = {id: 1};
            roundData.invitationalType = ($scope.type === 'Public' ? 0 : 1);
            roundData.region = {region_id: 1};
            roundData.registrationLimit = +$scope.regLimit;
            roundData.roomAssignment = {};
            roundData.roomAssignment.codersPerRoom = +$scope.coderPerRoom;
            roundData.roomAssignment.type = +$scope.roomAssignmentMethod.id;
            roundData.roomAssignment.isByDivision = $scope.assignByDiv;
            roundData.roomAssignment.isByRegion = $scope.assignByRegion;
            roundData.roomAssignment.isFinal = true;
            roundData.roomAssignment.p = 2;
            roundData.name = contestData.name + ' Round';
            roundData.status = 'A';
            roundData.short_name = contestData.name + ' Round';

            languageData = {};
            languageData.languages = [];

            segment = {};
            segment.registrationStart = $filter('date')(date, 'yyyy-MM-dd HH:mm:ssZ');
            segment.registrationLength = (+$scope.regStartH) * 60 + (+$scope.regStartMm);
            segment.codingStart = $filter('date')(new Date(date.getTime() + ((+$scope.regStartH) * 60
                + (+$scope.regStartMm) + 1) * 60 * 1000), 'yyyy-MM-dd HH:mm:ssZ');
            segment.codingLength = (+$scope.codeLengthH) * 60 + (+$scope.codeLengthMm);
            if (!!$scope.removeInter) {
                segment.intermissionLength = 0;
                segment.challengeLength = 0;
            } else {
                segment.intermissionLength = (+$scope.intermissionLengthH) * 60 + (+$scope.intermissionLengthMm);
                segment.challengeLength = (+$scope.challengeLengthH) * 60 + (+$scope.challengeLengthMm);
            }

            segment.registrationStatus = 'F';
            segment.codingStatus = 'F';
            segment.intermissionStatus = 'F';
            segment.challengeStatus = 'F';
            segment.systemTestStatus = 'F';

            for (i = 0; i < $scope.languageChoice.length; i++) {
                if ($scope.languageChoice[i].checked === true) {
                    languageData.languages.push($scope.languageChoice[i].id);
                }
            }
            header = appHelper.getHeader();

            popupDetailModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', 'cancel', function ($scope, $modalInstance, data, ok, cancel) {
                $scope.title = data.title;
                $scope.message = data.detail;
                $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
                $scope.enableClose = data.enableClose;

                /**
                 * Close the dialog.
                 */
                $scope.ok = function () {
                    ok();
                    $modalInstance.close();
                };

                /**
                 * Cancel handler.
                 */
                $scope.cancel = function () {
                    cancel();
                    $modalInstance.dismiss('cancel');
                };
            }];

            /**
             * Open detail modal.
             * @param data - the data
             * @param handle - the handle method
             * @param finish - the finish method.
             */
            $scope.openDetailModal = function (data, handle, finish) {
                if ($rootScope.currentDetailModal) {
                    $rootScope.currentDetailModal.dismiss('cancel');
                    $rootScope.currentDetailModal = undefined;
                }

                $rootScope.currentDetailModal = $modal.open({
                    templateUrl: 'popupValidationDetail.html',
                    controller: popupDetailModalCtrl,
                    backdrop: 'static',
                    resolve: {
                        data: function () {
                            return data;
                        },
                        ok: function () {
                            return function () {
                                if (angular.isFunction(handle)) {
                                    handle();
                                }
                                $rootScope.currentDetailModal = undefined;
                            };
                        },
                        cancel: function () {
                            return function () {
                                if (angular.isFunction(finish)) {
                                    finish();
                                }
                                $rootScope.currentDetailModal = undefined;
                            };
                        }
                    }
                });
            };

            /**
             * Show the detail modal.
             * @param data - the data to show.
             * @param status - the status code.
             */
            showDetailModal = function (data, status) {
                $scope.closeDetailDialog();
                $scope.openDetailModal({'title': 'Error', 'detail': 'Failed to create match: ' + getErrorDetail(data, status), 'enableClose': true});
            };

            $scope.openDetailModal({'title': 'Saving match data', 'detail': 'Please wait while saving match data.', 'enableClose': false});

            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
            if ($scope.isUpdate) {
                contestData.contestId = $scope.roundData.contestId;
                contestData.id = $scope.roundData.contestId;
                roundData.auto_end = angular.isDefined($scope.roundData.autoEnd) ? $scope.roundData.autoEnd : false;

                $http.put(config.apiDomain + '/data/srm/contests/' + $scope.roundData.contestId, contestData, header).success(function (data, status, headers) {
                    if (data.error && data.error !== '') {
                        showDetailModal(data, status);
                    } else {
                        roundData.contest_id = $scope.roundData.contestId;
                        roundData.id = $scope.roundData.id;
                        $http.put(config.apiDomain + '/data/srm/rounds/' + $scope.roundData.id, roundData, header).success(function (data, status, headers) {
                            if (data.error && data.error !== '') {
                                showDetailModal(data, status);
                            } else {
                                languageData.roundId = $scope.roundData.id;
                                segment.roundId = $scope.roundData.id;
                                roundId = $scope.roundData.id;
                                $http.post(config.apiDomain + '/data/srm/rounds/' + roundId + '/languages', languageData, header).success(function (data, status, headers) {
                                    if (data.error && data.error !== '') {
                                        showDetailModal(data, status);
                                    } else {
                                        $http.post(config.apiDomain + '/data/srm/rounds/' + roundId + '/segments', segment, header).success(function (data, status, headers) {
                                            if (data.error && data.error !== '') {
                                                showDetailModal(data, status);
                                            } else {
                                                $scope.closeDetailDialog();
                                                $scope.openDetailModal({'title': 'Success', 'detail': 'Match updated successfully.', 'enableClose': true});
                                            }
                                        }).error(function (data, status) {
                                            showDetailModal(data, status);
                                        });
                                    }
                                }).error(function (data, status) {
                                    showDetailModal(data, status);
                                });

                            }
                        }).error(function (data, status) {
                            showDetailModal(data, status);
                        });
                    }
                }).error(function (data, status) {
                    showDetailModal(data, status);
                });
            } else {
                // Make auto end to true by default when creating contest through web-arena
                roundData.auto_end = 1;
                $http.post(config.apiDomain + '/data/srm/contests', contestData, header).success(function (data, status, headers) {
                    if (data.error && data.error !== '') {
                        showDetailModal(data, status);
                    } else {
                        roundData.contest_id = data.contestId;
                        $http.post(config.apiDomain + '/data/srm/rounds', roundData, header).success(function (data, status, headers) {
                            if (data.error && data.error !== '') {
                                showDetailModal(data, status);
                            } else {
                                languageData.roundId = data.roundId;
                                segment.roundId = data.roundId;
                                roundId = data.roundId;
                                $http.post(config.apiDomain + '/data/srm/rounds/' + roundId + '/languages', languageData, header).success(function (data, status, headers) {
                                    if (data.error && data.error !== '') {
                                        showDetailModal(data, status);
                                    } else {
                                        $http.post(config.apiDomain + '/data/srm/rounds/' + roundId + '/segments', segment, header).success(function (data, status, headers) {
                                            if (data.error && data.error !== '') {
                                                showDetailModal(data, status);
                                            } else {
                                                $scope.closeDetailDialog();
                                                $scope.openDetailModal({'title': 'Success', 'detail': 'Match created successfully.', 'enableClose': true});
                                            }
                                        }).error(function (data, status) {
                                            showDetailModal(data, status);
                                        });
                                    }
                                }).error(function (data, status, headers, config) {
                                    showDetailModal(data, status);
                                });

                            }
                        }).error(function (data, status, headers, config) {
                            showDetailModal(data, status);
                        });
                    }
                }).error(function (data, status, headers, config) {
                    showDetailModal(data, status);
                });
            }
        };

        /**
         * Cancel creation
         */
        $scope.cancel = function () {
            cancel();
            $modalInstance.dismiss('cancel');
        };
        $scope.index = 1;
        /**
         * set page to show
         * @param index the page index
         */
        $scope.setPage = function (index) {
            $scope.index = index;
        };
        /**
         * The page navigation
         * @param index the page index.
         */
        $scope.navTo = function (index) {
            if ($scope.index === 4) {
                $scope.setPage(index);
            }
        };
        // go to next step.
        // if it is step-1, do validate.
        $scope.hasError = false;
        $scope.formValid = {
            contestName: true,
            type: true,
            regLimit: true,
            startDate: true,
            language: true,
            startHh: true,
            startMm: true,
            coderPerRoom: true,
            regStartH: true,
            regStartMm: true,
            codeLengthH: true,
            codeLengthMm: true,
            intermissionLengthH: true,
            intermissionLengthMm: true,
            challengeLengthH: true,
            challengeLengthMm: true,
            logoData: true
        };

        function isValid(target) {
            var str = '', value;
            if (($scope[target] + str).trim() === str) {
                return false;
            }
            value = +$scope[target];
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
         * The move to next page action.
         * @param form the form data
         */
        $scope.next = function (form) {
            $timeout(function () {
                $('#langPanel').click();
            }, 10);
            var noError;
            if ($scope.index === 1) {
                $scope.formValid.contestName = form.contestName.$valid ? true : false;
                $scope.formValid.type = form.type.$valid ? true : false;
                $scope.formValid.regLimit = (form.regLimit.$valid && isValid('regLimit') ? true : false);
                $scope.formValid.startDate = form.startDate.$valid ? true : false;
                $scope.formValid.language = $scope.languageCount > 0 ? true : false;
                $scope.formValid.startHh = isValid('startHh') ? true : false;
                $scope.formValid.startMm = isValid('startMm') ? true : false;
                noError = true;
                /*jslint unparam:false*/
                noError = noError && $scope.formValid.contestName;
                noError = noError && $scope.formValid.type;
                noError = noError && $scope.formValid.regLimit;
                noError = noError && $scope.formValid.startDate;
                noError = noError && $scope.formValid.language;
                noError = noError && $scope.formValid.startHh;
                noError = noError && $scope.formValid.startMm;
                if (noError) {
                    if ($scope.logoData !== '' && $scope.logoData.indexOf('data:image') !== 0) {
                        $scope.formValid.logoData = false;
                        $scope.hasError = true;
                        $scope.setPage(2);
                        return;
                    }
                    $scope.hasError = false;
                    $scope.setPage(2);
                } else {
                    $scope.hasError = true;
                }
                return;
            }
            if ($scope.index === 2) {
                if ($scope.logoData !== '' && $scope.logoData.indexOf('data:image') !== 0) {
                    $scope.formValid.logoData = false;
                    $scope.hasError = true;
                    $scope.setPage(2);
                    return;
                }
                $scope.formValid.logoData = true;
            }
            if ($scope.index === 2 || $scope.index === 3) {
                $scope.formValid.coderPerRoom = (form.coderPerRoom.$valid && isValid('coderPerRoom') ? true : false);
                $scope.formValid.regStartH = (form.regStartH.$valid && isValid('regStartH') ? true : false);
                $scope.formValid.regStartMm = (form.regStartMm.$valid && isValid('regStartMm') ? true : false);
                $scope.formValid.codeLengthH = (form.codeLengthH.$valid && isValid('codeLengthH') ? true : false);
                $scope.formValid.codeLengthMm = (form.codeLengthMm.$valid && isValid('codeLengthMm') ? true : false);
                if (!$scope.removeInter) {
                    $scope.formValid.intermissionLengthH = (form.intermissionLengthH.$valid && isValid('intermissionLengthH') ? true : false);
                    $scope.formValid.intermissionLengthMm = (form.intermissionLengthMm.$valid && isValid('intermissionLengthMm') ? true : false);
                    $scope.formValid.challengeLengthH = (form.challengeLengthH.$valid && isValid('challengeLengthH') ? true : false);
                    $scope.formValid.challengeLengthMm = (form.challengeLengthMm.$valid && isValid('challengeLengthMm') ? true : false);
                }
                noError = true;
                /*jslint unparam:false*/
                noError = noError && $scope.formValid.coderPerRoom;
                noError = noError && $scope.formValid.regStartH;
                noError = noError && $scope.formValid.regStartMm;
                noError = noError && $scope.formValid.codeLengthH;
                noError = noError && $scope.formValid.codeLengthMm;
                if (!$scope.removeInter) {
                    noError = noError && $scope.formValid.intermissionLengthH;
                    noError = noError && $scope.formValid.intermissionLengthMm;
                    noError = noError && $scope.formValid.challengeLengthH;
                    noError = noError && $scope.formValid.challengeLengthMm;
                }

                if ($scope.index === 3) {
                    if (noError) {
                        $scope.hasError = false;
                        $scope.setPage(4);
                    } else {
                        $scope.hasError = true;
                        $scope.setPage(3);
                    }
                    return;
                }

                if ($scope.index === 2) {
                    $scope.hasError = !noError;
                    $scope.setPage(3);
                    return;
                }
            }
            $scope.setPage($scope.index + 1);
        };
        /**
         * Go to previous step
         */
        $scope.prev = function () {
            $timeout(function () {
                $('#langPanel').click();
            }, 10);
            $scope.hasError = false;
            $scope.setPage($scope.index - 1);
        };

        /**
         * Get chose language
         * @returns {string} the language
         */
        $scope.getChoice = function () {
            var string = '';
            $scope.languageCount = 0;
            angular.forEach($scope.languageChoice, function (item) {
                if (item.checked) {
                    $scope.languageCount += 1;
                    if (string === '' || string === undefined) {
                        string = ' ' + item.language;
                    } else {
                        string += ', ' + item.language;
                    }
                }
            });
            return '(' + $scope.languageCount + '):' + string;
        };
        /**
         * Select all language.
         * @param event - the event
         */
        $scope.selectAll = function (event) {
            var checked = !!event.target.checked;
            angular.forEach($scope.languageChoice, function (item) {
                item.checked = checked;
            });
        };
        /**
         * Check if all languages are selected.
         * @returns {boolean} the checked result
         */
        $scope.isSelectedAll = function () {
            var i;
            for (i = 0; i < $scope.languageChoice.length; i += 1) {
                if (!$scope.languageChoice[i].checked) {
                    return false;
                }
            }
            return true;
        };

        /**
         * Checks whether it's selected set.
         * @param event
         */
        $scope.selectSet = function (event) {
            var checked = !!event.target.checked;
            angular.forEach($scope.languageChoice, function (item) {
                item.checked = checked && isCommonLanguage(item.language, $scope.languages.commonSet);
            });
        };
        /**
         * Check whether the set is selected.
         * @returns {boolean} the check result
         */
        $scope.isSelectedSet = function () {
            var i, item, isCommon;
            for (i = 0; i < $scope.languageChoice.length; i += 1) {
                item = $scope.languageChoice[i];
                isCommon = isCommonLanguage(item.language, $scope.languages.commonSet);
                if (($scope.languageChoice[i].checked && !isCommon) ||
                        (!$scope.languageChoice[i].checked && isCommon)) {
                    return false;
                }
            }
            return true;
        };
        $scope.langToggle = false;
        /**
         * Toggle language selector
         * @param event the event
         */
        $scope.toggleLangPanel = function (event) {
            var closeLangPanel = function (event) {
                // the depth of DOM tree rooted at the element with id 'themePanel'
                var panelDOMDepth = 4;
                if (appHelper.clickOnTarget(event.target, 'selectAllLabel', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'selectAll', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'selectSetLabel', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'selectSet', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-0', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-0-label', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-1', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-1-label', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-2', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-2-label', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-3', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-3-label', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-4', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-4-label', panelDOMDepth)
                        || appHelper.clickOnTarget(event.target, 'language-5', panelDOMDepth) || appHelper.clickOnTarget(event.target, 'language-5-label', panelDOMDepth)) {
                    return;
                }
                if (!appHelper.clickOnTarget(event.target, 'langPanel', panelDOMDepth)) {
                    $scope.langToggle = false;
                }
            };
            if ($scope.langToggle) {
                $scope.langToggle = false;
                document.removeEventListener('click', closeLangPanel);
            } else {
                $scope.langToggle = true;
                document.addEventListener('click', closeLangPanel);
                event.stopPropagation();
            }
        };

        $scope.openPhaseSchedule = false;
        $scope.openRoomAssignment = false;
        /**
         * Toggle the page 3 detail.
         * @param target - the target flag
         */
        $scope.toggle = function (target) {
            $timeout(function () {
                $('#langPanel').click();
            }, 10);
            $scope[target] = !$scope[target];
            // only one section can be open
            if (target === 'openPhaseSchedule' && $scope.openPhaseSchedule) {
                $scope.openRoomAssignment = false;
            } else if (target === 'openRoomAssignment' && $scope.openRoomAssignment) {
                $scope.openPhaseSchedule = false;
            }
        };

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
            var result = applyConstraints((+$scope[target]) + delta, limits[target]);
            $scope[target] = (result < 10 ? '0' : '') + result;
        };
        /**
         * Add string value by 1.
         * @param target the target flag
         */
        $scope.addStr = function (target) {
            if ($scope.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm')) {
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
            if ($scope.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm')) {
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
            if ($scope.removeInter && (target === 'intermissionLengthH' || target === 'challengeLengthH')) {
                // disable click
                return;
            }
            if (isNaN(+$scope[target])) {
                $scope[target] = limits[target].min;
            } else {
                $scope[target] = applyConstraints((+$scope[target]) + 1, limits[target]);
            }
            $scope.validateInput(target);
        };
        /**
         * Minus the target value by 1.
         * @param target the target flag
         */
        $scope.minus = function (target) {
            if ($scope.removeInter && (target === 'intermissionLengthH' || target === 'challengeLengthH')) {
                // disable click
                return;
            }
            if (isNaN(+$scope[target])) {
                $scope[target] = limits[target].min;
            } else {
                $scope[target] = applyConstraints((+$scope[target]) - 1, limits[target]);
            }

            $scope.validateInput(target);
        };

        /**
         * Disable the minus arrow.
         *
         * @param target - the target field which contains arrow
         * @returns {*|boolean} the checked result
         */
        $scope.minusDisable = function (target) {
            if ($scope.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm'
                || target === 'intermissionLengthH' || target === 'challengeLengthH')) {
                return true;
            }
            return limits[target] && angular.isDefined(limits[target].min) && (+$scope[target] <= limits[target].min);
        };

        /**
         * Disable the added arrow.
         * @param target - the target field which contains arrow
         * @returns {*|boolean} - the checked result.
         */
        $scope.addDisable = function (target) {
            if ($scope.removeInter && (target === 'intermissionLengthMm' || target === 'challengeLengthMm'
                || target === 'intermissionLengthH' || target === 'challengeLengthH')) {
                return true;
            }
            return limits[target] && angular.isDefined(limits[target].max) && (+$scope[target] >= limits[target].max);
        };
        /**
         * Trim the zero prefix.
         * @param str the string value
         * @returns {number} the converted value
         */
        $scope.trimLeadingZero = function (str) {
            return +str;
        };

        $scope.contestCalendarEvents = [];
        $scope.contestCalendarEventSources = [$scope.contestCalendarEvents];

        /*jslint unparam: true*/
        /**
         * Add color info to day number.
         * @param event the event instance
         * @param element the element instance
         * @param monthView the month view
         */
        $scope.eventRender = function (event, element, monthView) {
            var date = event.start.getFullYear() + '-' +
                    (event.start.getMonth() > 8 ? '' : '0') + (event.start.getMonth() + 1) + '-' +
                    (event.start.getDate() > 9 ? '' : '0') + event.start.getDate(),
                target = $('#contestCalendar .fc-view-month').find('[data-date=' + date + ']');
            target.addClass('eventColor');
        };

        /**
         * Select the day
         * @param date the date instance
         * @param allDay the all day flag
         * @param jsEvent the js event
         * @param view the view
         */
        $scope.selectDay = function (date, allDay, jsEvent, view) {
            var current = new Date(), dateSelect, day;
            if (view && (+date < (+current - 60 * 1000 * 60 * 24))) {
                return;
            }

            $scope.startDate = $filter('date')(date, 'MM/dd/yyyy');
            $scope.startDateSum = $filter('date')(date, 'dd MMM yyyy');
            dateSelect = $filter('date')(date, 'yyyy-MM-dd');
            day = $filter('date')(date, 'd');
            $('#contestCalendar').find('.selectedDate').removeClass('selectedDate');
            $('#contestCalendar .fc-view-month')
                .find('[data-date=' + dateSelect + ']')
                .addClass('selectedDate')
                .find('.fc-day-number')
                .attr('day', day);

            $scope.currentSelectedDate = date;

            if (view !== null) {
                if (date < $scope.currentStartMonth) {
                    // click previous
                    $('#contestCalendar .fc-header-right .fc-text-arrow').first().click();
                }
                if (date >= $scope.currentEndMonth) {
                    // click next
                    $('#contestCalendar .fc-header-right .fc-text-arrow').last().click();
                }
            }
        };

        // config calendar plugin
        $scope.contestCalConfig = {
            calendar: {
                height: 241,
                editable: false,
                header: {
                    left: 'title',
                    center: '',
                    right: 'month, prev, next'
                },
                titleFormat: {
                    month: 'MMMM yyyy',
                    day: 'MMM d, yyyy'
                },
                eventRender: $scope.eventRender, // add color tag and events number qtip to day number when events are loading
                dayClick: $scope.selectDay, // change to day view when clicking day number
                viewRender: function (view, element) {
                    $scope.currentStartMonth = view.start;
                    $scope.currentEndMonth = view.end;
                    if ($scope.currentSelectedDate !== null) {
                        $scope.selectDay($scope.currentSelectedDate, null, null, null);
                    }
                }
            }
        };

        /*jslint unparam: false*/
        $timeout(function () {
            $scope.selectDay($scope.currentSelectedDate || new Date(), null, null, null);
            $('#contestCalendar').fullCalendar('gotoDate', $scope.currentSelectedDate.getFullYear(),
                    $scope.currentSelectedDate.getMonth());
        }, 400);

        /**
         * Set the am/pm marker.
         * @param marker the marker flag
         */
        $scope.setMarker = function (marker) {
            $scope.marker = marker;
        };
        /**
         * Get the am/pm marker.
         * @returns {string} the marker
         */
        $scope.getMarker = function () {
            return $scope.marker;
        };

        $scope.logoData = '';
        $scope.logoFile = undefined;
        /**
         * Reader on load event.
         * @param event the event instance.
         */
        reader.onload = function (event) {
            $scope.logoData = event.target.result;
        };
        $(document).on('change', '#logoFile', function () {
            if (this.files && this.files[0]) {
                $scope.logoFile = this.files[0];
                reader.readAsDataURL(this.files[0]);
            }
        });

        // Get room assignment methods
        $http.get('data/assignmentMethod.json').success(function (data) {
            var found = false;
            $scope.assignMethods = data;
            if (angular.isDefined($scope.roomAssignmentMethod.id)) {
                angular.forEach($scope.assignMethods, function (method) {
                    if (method.id === $scope.roomAssignmentMethod.id) {
                        found = true;
                        $scope.roomAssignmentMethod = method;
                    }
                });
            }
            if (!found) {
                $scope.roomAssignmentMethod = $scope.assignMethods[0];
            }
        });

        /**
         * Get room assignment method.
         *
         * @returns {*} the room assignment methods.
         */
        $scope.getMethod = function () {
            if ($scope.roomAssignmentMethod) {
                return $scope.roomAssignmentMethod.text;
            }
            return '';
        };
        /**
         * Set room assignment method.
         * @param method the room assignment method
         */
        $scope.setMethod = function (method) {
            $scope.roomAssignmentMethod = method;
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

module.exports = contestCreationCtrl;