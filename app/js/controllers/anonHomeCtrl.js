'use strict';

var anonHomeCtrl = ['$scope', '$state', 'sessionHelper', function ($scope, $state, sessionHelper) {
    // whether the login has error
    $scope.hasError = false;
    $scope.username = '';
    $scope.password = '';

    $scope.accountLogin = function () {
        //creds below would be a parameter for this function
        //auth0.login(mapCreds(creds), errCb);
        $scope.hasError = false;
        var $usernameError = $scope.accountLoginForm.username.$error,
            $passwordError = $scope.accountLoginForm.password.$error;
        if ($usernameError.required || $usernameError.pattern) {
            $scope.username = '';
            $scope.hasError = true;
        }
        if ($passwordError.required || $passwordError.pattern) {
            $scope.password = '';
            $scope.hasError = true;
        }

        if (!$scope.hasError) {
            sessionHelper.username = $scope.username;
            $state.go('loggingin');
        }
    };

    $scope.socialLogin = function () {
        //In real app you would do something like:
        //auth0.login({connection: connection});
        //where connection is the parameter for this function
        sessionHelper.username = 'long_username_5555';
        $state.go('loggingin');
    };

    $scope.accountSignup = function () {
        //creds below would be a parameter for this function
        //auth0.signup(mapCreds(creds), errCb);
        sessionHelper.username = 'long_username_5555';
        $state.go('loggingin');
    };
}];

module.exports = anonHomeCtrl;