'use strict';

var userCodingCtrl = ['$scope', '$http', '$stateParams', '$state',
    function ($scope, $http, $stateParams, $state) {
        $scope.problem = {};
        // shared between children scopes
        $scope.sharedObj = {};
        $scope.topStatus = 'normal';
        $scope.bottomStatus = 'normal';
        $scope.getTopStatus = function () {
            return $scope.topStatus;
        }
        $scope.getBottomStatus = function () {
            return $scope.bottomStatus;
        }
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
            $scope.cmElem = document.getElementsByClassName('CodeMirror')[0];
        });
        $scope.collapseOther = function (target) {
            // origin height of top-content: 169(with 1px padding)
            // origin height of bottom-content: 516
            // origin height of codemirror: 475
            var windowWidth = window.innerWidth;
            if ((target === 'top-content' && $scope.topStatus === 'expand') || 
                (target === 'bottom-content' && $scope.bottomStatus === 'expand')) {
                //return to normal status 
                $('#top-content').css({
                    height: 169 + 'px'
                });
                if (windowWidth <= 502) {
                    $('#bottom-content').css({
                        height: (516 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#bottom-content').css({
                        height: (516 + 30) + 'px'
                    });
                } else {
                    $('#bottom-content').css({
                        height: 516 + 'px'
                    });
                }
                $('#codeArea').css({
                    height: 475 + 'px'
                });
                $scope.topStatus = 'normal';
                $scope.bottomStatus = 'normal';
                $scope.cmElem.CodeMirror.refresh();
                $scope.sharedObj.rebuildErrorBar();
            } else if (target === 'top-content') {
                // expand top-content and collapse bottom-content with codemirror
                if (windowWidth <= 502) {
                    $('#top-content').css({
                        height: (685 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#top-content').css({
                        height: (685 + 30) + 'px'
                    });
                } else {
                    $('#top-content').css({
                        height: 685 + 'px'
                    });
                }
                $('#bottom-content').css({
                    height: 0 + 'px'
                });
                $('#codeArea').css({
                    height: 0 + 'px'
                });
                $scope.topStatus = 'expand';
                $scope.bottomStatus = 'normal';
            } else if (target === 'bottom-content') {
                // expand bottom-content and collapse top one
                $('#top-content').css({
                    height: 1 + 'px'
                });
                if (windowWidth <= 502) {
                    $('#bottom-content').css({
                        height: (684 + 60) + 'px'
                    });
                } else if (windowWidth <= 741) {
                    $('#bottom-content').css({
                        height: (684 + 30) + 'px'
                    });
                } else {
                    $('#bottom-content').css({
                        height: 684 + 'px'
                    });
                }
                $('#codeArea').css({
                    height: 643 + 'px'
                });
                $scope.bottomStatus = 'expand';
                $scope.topStatus = 'normal';
                $scope.cmElem.CodeMirror.refresh();
                $scope.sharedObj.rebuildErrorBar();
            }
        };
    }];

module.exports = userCodingCtrl;