'use strict';

var anonHomeCtrl = ['$scope', '$state', 'sessionHelper', 'auth0', function ($scope, $state, sessionHelper, auth0) {
    // whether the login has error
    $scope.hasError = false;
    $scope.username = '';
    $scope.password = '';

    $scope.accountLogin = function () {
        $scope.hasError = false;
        var $usernameError = $scope.accountLoginForm.username.$error,
            $passwordError = $scope.accountLoginForm.password.$error;
        if ($usernameError.required || $usernameError.pattern) {
            $scope.username = '';
            $scope.hasError = true;
            return;
        }
        if ($passwordError.required || $passwordError.pattern) {
            $scope.password = '';
            $scope.hasError = true;
            return;
        }
        sessionHelper.clear();
        sessionHelper.persist({remember: $scope.remember});

        auth0.signin({
            connection: 'vm-ldap-connection',
            username: $scope.username,
            password: $scope.password,
            state: 'http://arena.cloud.topcoder.com'
        }, function () {
            $scope.hasError = true;
            $scope.$apply();
        });
    };

    $scope.socialLogin = function (connection) {
        auth0.signin({
            connection: connection,
            state: 'http://arena.cloud.topcoder.com'
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
