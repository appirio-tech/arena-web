/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * The contest terms configuration controller.
 *
 * @author TCSASSEMBLER
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global require*/
var config = require('../config');
var contestTermsConfigCtrl = ['$scope', '$http', 'sessionHelper', function ($scope, $http, sessionHelper) {
    var
        /**
         * Header to be added to all http requests to api
         * @type {{headers: {Content-Type: string, Authorization: string}}}
         */
        header = {headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionHelper.getJwtToken()}};

    /**
     * Initialize fields
     */
    function initFields() {
        $scope.roundTerms = '';
        $scope.round = undefined;
    }
    /*jslint unparam: true*/
    /**
     * Opens popup on setContestTerms event from contestManagementCtrl
     */
    $scope.$on('setContestTerms', function (event, data) {
        initFields();
        $scope.round = data.round;
        $scope.showPopup('contestTermsConfig');
    });
    /**
     * Submits contest terms
     */
    $scope.submitContestTermsConfig = function () {
        if (!$scope.roundTerms || $scope.roundTerms.trim().length === 0) {
            $scope.openModal({
                title: 'Error',
                message: 'The terms should not be empty.',
                enableClose: true
            });
            return;
        }
        // set terms
        $scope.round.terms = $scope.roundTerms;
        $http.post(config.apiDomain + '/data/srm/rounds/' + $scope.round.id + '/terms', {terms: $scope.roundTerms}, header).
            success(function (data) {
                if (data.error) {
                    $scope.$broadcast('genericApiError', data);
                    return;
                }
                $scope.openModal({
                    title: 'Set Terms',
                    message: 'Terms have been updated successfully.',
                    enableClose: true
                });
                // close the popup
                $scope.closeContestTermsConfig();
            }).error(function (data) {
                $scope.$broadcast('genericApiError', data);
            });
    };
    /**
     * Closes round terms popup
     */
    $scope.closeContestTermsConfig = function () {
        $scope.hidePopup('contestTermsConfig');
    };
    /*jslint todo: true */
    /**
     * Loads existing terms for selected round
     */
    $scope.loadPreviousTerm = function () {
        // TODO Need to implement it when API is ready
        $scope.roundTerms = $scope.round.terms;
    };
}];

module.exports = contestTermsConfigCtrl;