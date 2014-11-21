/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * The controller for the registration questions table.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena -Match Management Update):
 * - Added delete question logic.
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
var registrationQuestionsCtrl = ['$scope', '$timeout', '$http', 'sessionHelper', 'appHelper', '$rootScope', function ($scope, $timeout, $http, sessionHelper, appHelper, $rootScope) {
    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = appHelper.getHeader(),
        index;

    /**
     * Refresh Registration Questions table's scrollbar
     */
    function refreshScrollbar() {
        $scope.$broadcast('rebuild:regQuestions');
        $timeout(function () {
            $scope.$broadcast('reload:regQuestions');
        }, 50);
    }

    /**
     * Initialize round to manage its questions
     * @param round
     */
    function initFields(round) {
        $scope.round = round;
        $http.get(config.apiDomain + '/data/srm/rounds/' + $scope.round.id + '/questions', header).
            success(function (data) {
                if (data.error) {
                    $rootScope.$broadcast('genericApiError', data);
                    return;
                }
                $scope.round.questions = data.questions;
                refreshScrollbar();
            }).error(function (data) {
                $rootScope.$broadcast('genericApiError', data);
            });
    }
    /*jslint unparam: true*/
    /**
     * Open Popup on setRegistrationQuestions event
     */
    $scope.$on('setRegistrationQuestions', function (event, data) {
        initFields(data.round);
        $scope.showPopup('registrationQuestions');
        refreshScrollbar();
    });
    /**
     * Close registration questions popup
     */
    $scope.closeRegistrationQuestions = function () {
        $scope.hidePopup('registrationQuestions');
    };
    /**
     * Sends event to open add question popup
     */
    $scope.openAddQuestionPopup = function () {
        $scope.$broadcast('addQuestion');
    };
    /**
     * Sends event to open manage question popup
     * @param question Question object to edit
     */
    $scope.openManageQuestion = function (question) {
        $scope.$broadcast('manageQuestion', {question: question});
    };

    /**
     * Delete question
     * @param question - the question to delete
     */
    $scope.deleteQuestion = function (question) {

        $scope.openModal({
            title: 'Delete Question',
            message: 'Are you sure you want to delete the question?',
            buttons: ['Delete Question', 'Cancel'],
            enableClose: true
        }, function () {
            $http.delete(config.apiDomain + '/data/srm/rounds/' + question.id + '/question', header).
                success(function (data) {
                    if (data.error) {
                        $rootScope.$broadcast('genericApiError', data);
                        return;
                    }
                    $scope.openModal({
                        title: 'Delete Question',
                        message: 'Question has been removed successfully.',
                        enableClose: true
                    });
                    index = $scope.round.questions.indexOf(question);
                    if (index >= 0) {
                        $scope.round.questions.splice(index, 1);
                        refreshScrollbar();
                    }

                }).error(function (data) {
                    $rootScope.$broadcast('genericApiError', data);
                });

        });


    };
    /*jslint unparam: true*/
    /**
     * Update question list when new question is created
     */
    $scope.$on('questionCreated', function (event, data) {
        // message sent from manageQuestionCtrl.js when new question is created.
        $scope.round.questions.push(data.question);
        refreshScrollbar();
    });

}];

module.exports = registrationQuestionsCtrl;