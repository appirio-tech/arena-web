'use strict';

var userCodingCtrl = ['$scope', '$http', '$stateParams', '$state',
    function ($scope, $http, $stateParams, $state) {
        $scope.problem = {};
        $scope.$on('editor-loaded', function () {
            $http.get('data/problem-' + $stateParams.problemId + '.json').
                success(function (data) {
                    // set problem data
                    $scope.problem.statement = data.statement;
                    $scope.problem.className = data.class;
                    $scope.problem.methodName = data.method;
                    $scope.problem.argTypes = data.argTypes;
                    $scope.problem.returnType = data.returnType;
                    $scope.problem.supportedLanguages = data.supportedLanguages;

                    // set page title to problem name
                    $state.current.data.pageTitle = 'Problem: ' + data.name;

                    // set user data
                    $scope.userData = data.userData;
                    // broadcast problem-load message to child states.
                    $scope.$broadcast('problem-loaded');
                });
        });
    }];

module.exports = userCodingCtrl;