/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller all logic related to home page, login and register functions.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Added variable to keep track of hasError specific to form.
 *      So that error class can be removed when user clicks on any input field
 *  - Added variable to say empty username and password
 *  - Flags such as loginTimeout, isEmpty and hasError are handled to avoid text overlap in login page
 *
 * Changes in version 1.2 (Module Assembly - Web Arena - Local Chat Persistence):
 *  - Clear the data in local storage if clicked login buttons.
 *
 * @author ananthhh, TCASSEMBLER
 * @version 1.2
 */
'use strict';

var config = require('../config');

var anonHomeCtrl = ['$scope', '$state', '$window', 'sessionHelper', 'auth0', '$rootScope', 'appHelper', '$cookies', function ($scope, $state, $window, sessionHelper, auth0, $rootScope, appHelper, $cookies) {
    // whether the login has error
    $scope.hasError = false;
    $scope.hasErrorForm = false;
    $scope.isUsernameEmpty = false;
    $scope.isPasswordEmpty = false;
    if ($cookies.username && $cookies.username !== '') {
        $scope.username = $cookies.username;
        $scope.remember = true;
    } else {
        $scope.username = '';
    }
    $scope.password = '';

    $scope.register = function() {
        window.location = config.registrationUrl;
    };

    $scope.accountLogin = function () {
        $scope.hasError = false;
        $scope.hasErrorForm = false;
        var $usernameError = $scope.accountLoginForm.username.$error,
            $passwordError = $scope.accountLoginForm.password.$error;
        if ($usernameError.required) {
            $scope.username = '';
            $scope.isUsernameEmpty = true;
            $scope.isPasswordEmpty = false;
            $scope.hasError = false;
            $rootScope.loginTimeout = false;
            $scope.hasErrorForm = true;
            return;
        }
        if ($passwordError.required) {
            $scope.password = '';
            $scope.isPasswordEmpty = true;
            $scope.isUsernameEmpty = false;
            $scope.hasError = false;
            $rootScope.loginTimeout = false;
            $scope.hasErrorForm = true;
            return;
        }

        // Its not empty but doesn't follow pattern
        // So we cannot have $scope.isEmpty = true for this condition
        if ($usernameError.pattern) {
            $scope.username = '';
            $scope.password = '';
            $scope.hasError = true;
            $scope.hasErrorForm = true;
            $scope.isUsernameEmpty = false;
            $scope.isPasswordEmpty = false;
            $rootScope.loginTimeout = false;
            return;
        }
        if ($passwordError.pattern) {
            $scope.password = '';
            $scope.hasError = true;
            $scope.hasErrorForm = true;
            $scope.isUsernameEmpty = false;
            $scope.isPasswordEmpty = false;
            $rootScope.loginTimeout = false;
            return;
        }
        sessionHelper.clear();
        sessionHelper.persist({remember: $scope.remember});
        if ($scope.remember === true) {
            $cookies.username = $scope.username;
        } else {
            $cookies.username = '';
        }

        appHelper.clearLocalStorage();

        auth0.signin({
            connection: auth0.auth0connection,
            username: $scope.username,
            password: $scope.password,
            state: $window.location.href
        }, function () {
            $scope.hasError = true;
            $scope.hasErrorForm = true;
            $scope.isUsernameEmpty = false;
            $scope.isPasswordEmpty = false;
            $rootScope.loginTimeout = false;
            $scope.$apply();
        });
    };

    $scope.socialLogin = function (connection) {
        appHelper.clearLocalStorage();
        auth0.signin({
            connection: connection,
            state: $window.location.href
        });
    };

    $scope.accountSignup = function () {
        //creds below would be a parameter for this function
        //auth0.signup(mapCreds(creds), errCb);
        sessionHelper.username = 'long_username_5555';
        $state.go('loggingin');
    };
}];

module.exports = anonHomeCtrl;
