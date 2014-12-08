/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * The controller for managing a single answer.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena -Match Management Update):
 * - Added modify answer logic.
 *
 * @author TCSASSEMBLER
 * @version 1.1
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint unparam: true*/
/*global $:false, angular:false, module, require*/

var config = require('../config');
var manageAnswerCtrl = ['$scope', '$http', 'appHelper', '$rootScope', function ($scope, $http, appHelper, $rootScope) {
    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = appHelper.getHeader();

    /**
     * Initialize answer to edit or empty object if add
     * @param data Object holding answer data to edit
     */
    function initFields(data) {
        $scope.editingAnswer = data.answer;
        $scope.answer = angular.isDefined(data.answer) ? angular.copy(data.answer) : {
            sortOrder: undefined,
            correct: true,
            text: ''
        };
        $scope.answer.questionId = data.questionId;
    }
    /*jslint unparam: true*/
    /**
     * Opens popup on manageAnswer event
     */
    $scope.$on('manageAnswer', function (event, data) {
        initFields(data);
        $scope.showPopup('manageAnswer');
    });
    /*jslint unparam: false*/
    /**
     * Closes manage answer popup
     */
    $scope.closeManageAnswer = function () {
        $scope.hidePopup('manageAnswer');
    };
    /**
     * Checks for empty answer text
     * @returns {boolean} Returns whether text is empty or not
     */
    $scope.errorText = function () {
        return !$scope.answer.text || $scope.answer.text.length === 0;
    };
    /**
     * Submits answer to backend
     */
    $scope.submitManageAnswer = function () {
        var errorMsg = 'Please fill in the fields with valid values.', answer;
        if ($scope.errorText() || angular.isUndefined($scope.answer.sortOrder)) {
            if (angular.isUndefined($scope.answer.sortOrder)) {
                errorMsg += '\n  - Sort Order must be a non-negative integer.';
            }
            if ($scope.errorText()) {
                errorMsg += '\n  - Text must be non-empty.';
            }
            $scope.openModal({
                title: 'Error',
                message: errorMsg,
                enableClose: true
            });
            return;
        }
        answer = angular.copy($scope.answer);
        // Sending boolean to API causing exception
        if (answer.correct) {
            answer.correct = "true";
        } else {
            answer.correct = "false";
        }
        if (angular.isDefined($scope.editingAnswer)) {

            $http.put(config.apiDomain + '/data/srm/answer/' + $scope.answer.id, answer, header).
                success(function (data) {
                    if (data.error) {
                        $rootScope.$broadcast('genericApiError', data);
                        return;
                    }
                    $scope.openModal({
                        title: 'Modify Answer',
                        message: 'Answer has been updated successfully.',
                        enableClose: true
                    });
                    // close the popup
                    angular.copy($scope.answer, $scope.editingAnswer);
                    $scope.hidePopup('manageAnswer');
                }).error(function (data) {
                    $rootScope.$broadcast('genericApiError', data);
                });

        } else {
            $http.post(config.apiDomain + '/data/srm/questions/' + $scope.answer.questionId + '/answers', answer, header).
                success(function (data) {
                    if (data.error) {
                        $rootScope.$broadcast('genericApiError', data);
                        return;
                    }

                    $scope.openModal({
                        title: 'Add Answer',
                        message: 'Answer have been added successfully.',
                        enableClose: true
                    });
                    $scope.$broadcast('answerCreated', {answer: $scope.answer});

                    // close the popup
                    $scope.hidePopup('manageAnswer');
                }).error(function (data) {
                    $rootScope.$broadcast('genericApiError', data);
                });
        }
    };
}];

module.exports = manageAnswerCtrl;