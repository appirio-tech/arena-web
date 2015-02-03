/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles test panel logic.
 * Currently it can be used for coding and viewing others' code.
 * It is distinguished by states 'user.coding' and 'user.viewCode'.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena Bug Fix 20140909):
 *  - Fixed the issues in test panel.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena - Code With Practice Problem)
 *  - Added checking logic for practice code state.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the challenge popup.
 *
 * Changes in version 1.4 (Web Arena Plugin API Part 1):
 * - Added plugin logic for test panel.
 *
 * @author amethystlei, flytoj2ee
 * @version 1.4
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*jslint unparam: true*/
/*global module, console, angular, $:false*/
var helper = require('../helper');
// controller of the test panel
var testPanelCtrl = ['$rootScope', '$scope', 'socket', '$timeout', 'appHelper', function ($rootScope, $scope, socket, $timeout, appHelper) {
    // initialize the object containing user tests for each round
    if (!angular.isDefined($rootScope.userTestForRound)) {
        $rootScope.userTestForRound = {};
    }
    // initialize the object containing user tests for the round
    if (!angular.isDefined($rootScope.userTestForRound[$scope.roundID])) {
        $rootScope.userTestForRound[$scope.roundID] = [];
    }
    // get user tests for the round
    $rootScope.userTests = $rootScope.userTestForRound[$scope.roundID];
    $scope.caseName = '';
    $scope.report = [];
    var count = 0, modalTimeoutPromise = null, populateTestCases;

    /**
     * Show report.
     */
    function showReport() {
        if ($scope.report.length > 0) {
            var i;
            for (i = 0; i < $scope.report.length; i++) {
                $scope.report[i].toggle = true;
            }
        }
        $scope.testOpen = false;
        $('#testReport').removeClass('hide');
        $rootScope.$broadcast('test-report-loaded');
    }

    /**
     * Close report.
     */
    $scope.closeReport = function () {
        $('#testReport').addClass('hide');
    };

    // Handle the BatchTestResponse event.
    socket.on(helper.EVENT_NAME.BatchTestResponse, function (data) {
        var i, j, reportItem, params;
        if (modalTimeoutPromise) {
            $timeout.cancel(modalTimeoutPromise);
        }
        if ($rootScope.currentModal) {
            $rootScope.currentModal.dismiss('cancel');
            $rootScope.currentModal = undefined;
        }
        $scope.report = [];

        for (i = 0; i < data.results.length; i++) {
            params = [];
            for (j = 0; j < $scope.argsList[i].length; j++) {
                params.push({value: $scope.argsList[i][j]});
            }
            reportItem = {params: params, name: $scope.allTestCaseNames[i], toggle: false};
            angular.extend(reportItem, data.results[i]);
            $scope.report.push(reportItem);
        }

        appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.solutionTestFinished, data);

        showReport();
    });

    /**
     * Set timeout modal.
     */
    function setTimeoutModal() {
        $scope.openModal({
            title: 'Timeout',
            message: 'Sorry, the request is timeout.',
            enableClose: true
        });
        modalTimeoutPromise = null;
    }

    /**
     * Generates the confirmation for the challenge parameters.
     *
     * @param testCase the test case data
     * @return {string} the html source in the confirmation popup
     */
    function getChallengeConfirmationPopup(testCase) {
        var paramNum,
            allArgTypes = $scope.problem.allArgTypes,
            html = '';

        for (paramNum = 0; paramNum < allArgTypes.length; paramNum += 1) {
            html += '<li>(' + (paramNum + 1) + ') <span class="argType">' + allArgTypes[paramNum].typeMapping[$scope.lang($scope.langIdx).id] + '</span>';
            html += '&nbsp;<span class="argContent">' + testCase[paramNum].value + '</span>';
            html += '</li>';
        }
        return '<ul class="confirmPara">' + html + '</ul>';
    }

    /**
     * Populate the test cases and send them to server side.
     */
    populateTestCases = function () {
        var errorMessage = [], index = 0, errorFlag = false, str, k;

        angular.forEach($scope.allTestCases, function (testcase) {
            var param, params = [], args = [], i, j;
            errorFlag = false;
            for (j = 0; j < testcase.length; j += 1) {
                param = $.trim(testcase[j].value);

                if (param.length > 1 && param[0] === '{' && param[param.length - 1] === '}') {
                    param = '[' + param.substr(1, param.length - 2) + ']';
                }

                try {
                    param = JSON.parse(param);
                } catch (e) {
                    errorMessage.push('In ' + $scope.allTestCaseNames[index] + ': The ' + $scope.problem.allArgTypes[j].typeMapping[$scope.lang($scope.langIdx).id] + ' type parameter '
                        + param + ' is invalid.');
                    errorFlag = true;
                }
                params.push(param);
            }

            if (!errorFlag) {
                for (i = 0; i < params.length; i += 1) {
                    param = angular.copy(params[i]);

                    if (param instanceof Array) {
                        for (j = 0; j < param.length; j += 1) {
                            param[j] = String(param[j]);
                        }
                        args.push(param);
                    } else if (param instanceof Object) {
                        errorMessage.push('In ' + $scope.allTestCaseNames[index] + ': The parameter ' + param + ' is invalid.');
                    } else {
                        param = String(param);
                        args.push(param);
                    }
                }
                $scope.argsList.push(args);
            }

            index = index + 1;

        });

        if (errorMessage.length > 0) {
            str = '';
            for (k = 0; k < errorMessage.length; k++) {
                str = str + errorMessage[k] + '\n';
            }
            $scope.openModal({
                title: 'Error',
                message: str,
                enableClose: true
            });
        } else {
            if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
                $scope.openModal({
                    title: 'Retrieving Test Result',
                    message: 'Please wait for test result.',
                    enableClose: false
                });

                if (modalTimeoutPromise) {
                    $timeout.cancel(modalTimeoutPromise);
                }
                modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);

                socket.emit(helper.EVENT_NAME.BatchTestRequest, {
                    componentID: $scope.componentID,
                    tests: $scope.argsList
                });

            } else if ($scope.currentStateName() === helper.STATE_NAME.ViewCode) {
                // challenge others' code
                $scope.openModal({
                    title: 'Confirm Parameters',
                    message: getChallengeConfirmationPopup($scope.allTestCases[0]),
                    buttons: ['OK', 'Cancel'],
                    enableClose: true
                }, function () {
                    socket.emit(helper.EVENT_NAME.ChallengeRequest, {
                        componentID: $scope.componentID,
                        defender: $scope.defendant,
                        test: $scope.argsList[0]
                    });
                });
            }
        }
    };

    /**
     * run single test and have single test report
     * @param testCase the test case.
     */
    $scope.runSingleTest = function (testCase) {
        // test the data
        $scope.report = [];
        $scope.allTestCases = [];
        $scope.allTestCaseNames = [];
        $scope.allTestCases.push(testCase.params);
        $scope.allTestCaseNames.push(testCase.name);
        $scope.argsList = [];
        $rootScope.currentModal = undefined;

        populateTestCases();
    };

    $scope.argsList = [];
    $scope.allTestCases = [];
    $scope.allTestCaseNames = [];

    /**
     * run checked test cases
     */
    $scope.runCheckedTests = function () {
        $rootScope.currentModal = undefined;
        $scope.report = [];
        $scope.allTestCases = [];
        $scope.allTestCaseNames = [];
        angular.forEach($rootScope.userTests, function (item) {
            if (item.checked) {
                $scope.allTestCases.push(item.params);
                $scope.allTestCaseNames.push(item.name);
            }
        });
        angular.forEach($scope.userData.tests, function (item) {
            if (item.checked) {
                $scope.allTestCases.push(item.params);
                $scope.allTestCaseNames.push(item.name);
            }
        });

        if ($scope.allTestCases.length < 1) {
            $scope.openModal({
                title: 'Error',
                message: 'You are required to select at least one test case.',
                enableClose: true
            });
            return;
        }

        $scope.argsList = [];

        populateTestCases();
    };

    /**
     * add test case
     */
    $scope.addTestCase = function () {
        var testCase = {};
        testCase.checked = false;
        testCase.toggle = true;
        testCase.name = 'Custom Test Case ' + (count + 1);
        testCase.problemId = $scope.problem.problemID;
        testCase.params = [];
        /*jslint unparam: true*/
        angular.forEach($scope.problem.allArgTypes, function (arg) {
            testCase.params.push({
                value: ''
            });
        });
        /*jslint unparam: false*/
        $rootScope.userTests.unshift(testCase);
        count += 1;
    };

    /**
     * Filters out test cases with problem ID different than current problem.
     * @param testCase the test case to be checked.
     */
    $scope.filterTestCases = function (testCase) {
        return !testCase.problemId || testCase.problemId === $scope.problem.problemID;
    }

    /**
     * Delete test case.
     * @param index the test case index.
     */
    $scope.deleteTestCase = function (index) {
        $rootScope.userTests.splice(index, 1);
        $scope.$broadcast('test-panel-loaded');
    };
    /**
     * Edit the name of test case.
     *
     * @param index the index
     * @param event the event
     */
    $scope.editName = function (index, event) {
        angular.element(event.target).next().removeClass('hide').focus();
        $scope.caseName = $rootScope.userTests[index].name;
    };
    /**
     * Update the name of test case.
     *
     * @param index the index
     * @param event the event name
     */
    $scope.updateName = function (index, event) {
        if ($scope.caseName === '') {
            angular.element(event.target).addClass('hide');
            return;
        }
        $rootScope.userTests[index].name = $scope.caseName;
        angular.element(event.target).addClass('hide');
        $scope.caseName = '';
    };

    /**
     * Run tests.
     */
    $scope.runTests = function () {
        $scope.$broadcast('test-panel-loaded');
        $scope.report = [];
        $scope.allTestCases = [];
        $scope.allTestCaseNames = [];

        if (!!$scope.customChecked) {
            $scope.allTestCases.push($scope.customTest);
            $scope.allTestCaseNames.push('Test Case');
        }

        angular.forEach($scope.userData.tests, function (item) {
            if (item.checked) {
                $scope.allTestCases.push(item.params);
                $scope.allTestCaseNames.push(item.name);
            }
        });

        if ($scope.allTestCases.length !== 1) {
            $scope.openModal({
                title: 'Error',
                message: 'You are required to select one test case.',
                enableClose: true
            });
            return;
        }

        $scope.argsList = [];
        populateTestCases();
    };

    /**
     * Set the custom checked flag.
     */
    $scope.setCustomChecked = function () {
        $scope.customChecked = !$scope.customChecked;
    };

    $scope.toggleTextCase = function () {
        $scope.$broadcast('test-panel-loaded');
    };

    $scope.toggleTextReport = function () {
        $scope.$broadcast('test-report-loaded');
    };

    // Run all test cases for plugin.
    $scope.$on(helper.BROADCAST_PLUGIN_EVENT.runAllTestCasesFromPlugin, function (event) {
        $scope.userData.tests.forEach(function (testCase) {
            testCase.checked = true;
        });
        $rootScope.userTests.forEach(function (testCase) {
            testCase.checked = true;
        });

        $scope.runCheckedTests();
    });

    // Run test case for plugin.
    $scope.$on(helper.BROADCAST_PLUGIN_EVENT.runTestCaseFromPlugin, function (event, name) {
        $scope.userData.tests.forEach(function (testCase) {
            testCase.checked = (testCase.name === name);
        });
        $rootScope.userTests.forEach(function (testCase) {
            testCase.checked = (testCase.name === name);
        });

        $scope.runCheckedTests();
    });

    /**
     * Set test cases from plugin.
     */
    $scope.$on(helper.BROADCAST_PLUGIN_EVENT.setTestCasesFromPlugin, function (event, testCases) {
        count = 0;
        $rootScope.userTests.length = 0;

        var testCase, i, handleParams = function (param, j) {
            testCase.params.push({
                value: testCases[i].params[j]
            });
        };
        for (i = 0; i < testCases.length; i++) {
            testCase = {};
            testCase.checked = false;
            testCase.toggle = true;
            testCase.name = testCases[i].name;
            testCase.params = [];

            angular.forEach(testCases[i].params, handleParams);
            $rootScope.userTests.unshift(testCase);
            count += 1;
        }
    });
}];
module.exports = testPanelCtrl;
