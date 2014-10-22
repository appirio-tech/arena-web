/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * The controller for managing a single question.
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
var manageQuestionCtrl = ['$scope', '$rootScope', '$timeout', '$http', 'sessionHelper', function ($scope, $rootScope, $timeout, $http, sessionHelper) {
    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = {headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionHelper.getJwtToken()}};
    /**
     * Get Keys to display various question dropdowns
     */
    $http.get('data/management-keys.json').success(function (data) {
        $scope.questionKeys = data.question;
    });
    /**
     * Refreshes answers table scrollbar
     */
    function refreshScrollbar() {
        $timeout(function () {
            $scope.$broadcast('rebuild:assignedAnswers');
            $scope.$broadcast('reload:assignedAnswers');
        }, 50);
    }
    /**
     * Initialize question
     * Retrieves answers to the question to manage
     * @param question Question object to manage
     */
    function initFields(question) {
        // the object for the editing question.
        $scope.editingQuestion = question;

        // the object for displaying values
        $scope.question = angular.copy(angular.isDefined(question) ? question : {
            keyword: '',
            type: $scope.questionKeys.type[0],
            style: $scope.questionKeys.style[0],
            status: $scope.questionKeys.status[0],
            text: '',
            answers: []
        });
        if ($scope.question.id) {
            $http.get(config.apiDomain + '/data/srm/rounds/' + $scope.question.id + '/answers', header).
                success(function (data) {
                    if (data.error) {
                        $scope.$broadcast('genericApiError', data);
                        return;
                    }
                    $scope.question.answers = data.answers;
                    refreshScrollbar();
                }).error(function (data) {
                    $scope.$broadcast('genericApiError', data);
                });
        }
    }
    /*jslint unparam: true*/
    /**
     * Initialize fields and opens popup on manageQuestion event
     */
    $scope.$on('manageQuestion', function (event, data) {
        $scope.answersEnabled = true;
        initFields(data.question);
        $scope.showPopup('manageQuestion');
        refreshScrollbar();
    });
    /**
     * Initialize fields and open popup
     */
    $scope.$on('addQuestion', function () {
        $scope.answersEnabled = false;
        initFields();
        $scope.showPopup('manageQuestion');
        refreshScrollbar();
    });
    /*jslint unparam: true*/
    /**
     * Push answer to existing list when new answer is created
     */
    $scope.$on('answerCreated', function (event, data) {
        if (!angular.isArray($scope.question.answers)) {
            $scope.question.answers = [];
        }
        $scope.question.answers.push(data.answer);
        refreshScrollbar();
    });
    /**
     * Closes Manage question popup
     */
    $scope.closeManageQuestion = function () {
        $scope.hidePopup('manageQuestion');
    };
    /**
     * Sends event to open add answer popup
     */
    $scope.openAddAnswer = function () {
        $scope.$broadcast('manageAnswer', {questionId: $scope.question.id});
    };
    /**
     * Sends event to open manage answer popup
     * @param answer Answer to be managed
     */
    $scope.openManageAnswer = function (answer) {
        $scope.$broadcast('manageAnswer', {questionId: $scope.question.id, answer: answer});
    };
    /*jslint todo: true */
    /**
     * Method to delete answer
     * @param answer Answer to delete
     */
    $scope.deleteAnswer = function (answer) {
        // TODO implement it when API is ready
        return;
    };
    /**
     * Submits new or edited question to backend
     */
    $scope.submitManageQuestion = function () {
        var i = 0, isValid = false;
        function validate(key, name) {
            if (angular.isUndefined($scope.question[key]) ||
                    $scope.question[key].length === 0) {
                $scope.openModal({
                    title: 'Error',
                    message: name + ' should not be empty.',
                    enableClose: true
                });
                return false;
            }
            return true;
        }
        if (!validate('keyword', 'Keyword') || !validate('text', 'Text')) {
            return;
        }
        if ($scope.question.type.id === 2) {
            $scope.question.isRequired = "true";
        } else {
            $scope.question.isRequired = "false";
        }
        $scope.question.typeId = $scope.question.type.id;
        $scope.question.styleId = $scope.question.style.id;
        $scope.question.statusId = $scope.question.status.id;
        // Submit modified question
        if ($scope.editingQuestion) {
            angular.copy($scope.question, $scope.editingQuestion);
            if ($scope.question.isRequired === 'true') {
                if ($scope.question.answers.length === 0) {
                    $scope.openModal({
                        title: 'Error',
                        message: 'Eligible question should have at-least 1 correct answer.',
                        enableClose: true
                    });
                    return;
                }
                for (i = 0; i < $scope.question.answers.length; i += 1) {
                    if ($scope.question.answers[i].correct) {
                        isValid = true;
                        break;
                    }
                }
                if (!isValid) {
                    $scope.openModal({
                        title: 'Error',
                        message: 'Eligible question should have at-least 1 correct answer.',
                        enableClose: true
                    });
                    return;
                }
            }
            $http.post(config.apiDomain + '/data/srm/rounds/' + $scope.question.id + '/question', $scope.question, header).
                success(function (data) {
                    if (data.error) {
                        $scope.$broadcast('genericApiError', data);
                        return;
                    }
                    $scope.openModal({
                        title: 'Modify Question',
                        message: 'Question have been updated successfully.',
                        enableClose: true
                    });
                    // close the popup
                    $scope.closeManageQuestion();
                }).error(function (data) {
                    $scope.$broadcast('genericApiError', data);
                });
        } else {
            // Submits new question
            $scope.question.typeId = $scope.question.type.id;
            $scope.question.styleId = $scope.question.style.id;
            $scope.question.statusId = $scope.question.status.id;
            $http.post(config.apiDomain + '/data/srm/rounds/' + $scope.round.id + '/questions', $scope.question, header).
                success(function (data) {
                    if (data.error) {
                        $scope.$broadcast('genericApiError', data);
                        return;
                    }

                    $scope.openModal({
                        title: 'Add Question',
                        message: 'Question have been added successfully.',
                        enableClose: true
                    });
                    $scope.question.id = data.questionId;
                    $scope.$broadcast('questionCreated', {question: $scope.question});

                    // close the popup
                    $scope.closeManageQuestion();
                }).error(function (data) {
                    $scope.$broadcast('genericApiError', data);
                });
        }
    };
}];

module.exports = manageQuestionCtrl;