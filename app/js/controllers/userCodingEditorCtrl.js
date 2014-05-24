'use strict';
/*global CodeMirror, module */

var userCodingEditorCtrl = ['$scope', '$window', '$timeout', 'appHelper', '$http',
    function ($scope, $window, $timeout, appHelper, $http) {
        var indentRangeFinder = {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
            },
            braceRangeFinder = {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            cmLangConfigs = [
                {name: 'Java', langKey: 'text/x-java', langGutter: braceRangeFinder},
                {name: 'C++', langKey: 'text/x-c++src', langGutter: braceRangeFinder},
                {name: 'C#', langKey: 'text/x-csharp', langGutter: braceRangeFinder},
                {name: 'VB.NET', langKey: 'text/x-vb', langGutter: indentRangeFinder},
                {name: 'Python', langKey: 'text/x-python', langGutter: indentRangeFinder}
            ];

        $scope.$window = $window;
        $scope.range = appHelper.range;
        // hide/show settings panel
        $scope.settingsBackup = {};
        $scope.settingsOpen = false;
        $scope.toggleSettings = function () {
            $scope.settingsOpen = !$scope.settingsOpen;
            if ($scope.settingsOpen) {
                // backup data
                $scope.settingsBackup.langIdx = $scope.langIdx;
                $scope.settingsBackup.themeIdx = $scope.themeIdx;
                $scope.settingsBackup.showLineNumber = $scope.showLineNumber;
            } else {
                // revert data when 'close' instead of 'OK' is clicked.
                $scope.langIdx = $scope.settingsBackup.langIdx;
                $scope.themeIdx = $scope.settingsBackup.themeIdx;
                $scope.showLineNumber = $scope.settingsBackup.showLineNumber;
            }
        };
        // hide/show test panel
        $scope.testOpen = false;
        $scope.toggleTest = function () {
            $scope.testOpen = !$scope.testOpen;
        };
        // init theme settings
        $scope.themes = [
            {name: 'Standard', themeKey: 'topcoder'}
        ];
        $scope.themeIdx = 0;
        $scope.theme = function (themeIdx) {
            return $scope.themes[themeIdx];
        };
        $scope.getThemeName = function (themeIdx) {
            return $scope.theme(themeIdx).name;
        };
        $scope.setThemeIdx = function (themeIdx) {
            $scope.themeIdx = themeIdx;
        };

        // init language settings
        $scope.languages = [{name: 'Language'}];
        $scope.langIdx = 0;
        $scope.lang = function (langIdx) {
            return $scope.languages[langIdx];
        };
        $scope.getLangName = function (langIdx) {
            return $scope.lang(langIdx).name;
        };
        $scope.setLangIdx = function (langIdx) {
            $scope.langIdx = langIdx;
        };

        // init show/hide line number settings
        $scope.showLineNumber = true;
        // init code content
        $scope.code = '';
        // set the ui-codemirror option
        $scope.lineNumbers = 21;
        $scope.errorMessages = $scope.range($scope.lineNumbers);
        $scope.errorBar = document.getElementsByClassName('errorBar')[0];
        $scope.sharedObj.rebuildErrorBar = function () {
            var errorBarHeight = appHelper.getRenderedHeight($scope.errorBar),
                messageHeight = 22;
            if (Math.floor(errorBarHeight / messageHeight) !== $scope.lineNumbers) {
                $scope.lineNumbers = Math.floor(errorBarHeight / messageHeight);
                $scope.errorMessages = $scope.range($scope.lineNumbers);
                $scope.updateErrorMessages(true);
            }
            angular.element($scope.errorBar).css('height',
                (appHelper.getRenderedHeight($scope.cmElem) - 1) + 'px');
        };
        $scope.clearErrorMessages = function () {
            var i;
            for (i = 0; i < $scope.errorMessages.length; i++) {
                $scope.errorMessages[i] = '';
            }
        };
        $scope.getErrorMessage = function (index) {
            return $scope.errorMessages[index];
        };
        $scope.updateErrorMessages = function (refresh) {
            var editorVisible = $scope.$window.document.getElementsByClassName('CodeMirror-scroll')[0],
                i,
                j = 0;
            // render error messages from 'topLine'
            $scope.topLine = Math.floor(editorVisible.scrollTop / 22 + 0.49999) + 1;
            for (i = 0; i < $scope.errorMessages.length; i++) {
                $scope.errorMessages[i] = '';
                while (j < $scope.errors.length && $scope.topLine + i >= $scope.errors[j].line) {
                    if ($scope.topLine + i === $scope.errors[j].line &&
                            $scope.errors[j].line <= $scope.cm.lineCount()) {
                        // set message if it is the correct line
                        $scope.errorMessages[i] = $scope.errors[j].message;
                    }
                    ++j;
                }
            }
            if (refresh) {
                //$scope.$apply();
            }
        };

        $scope.clearErrorMessages();
        $scope.errors = [];

        $scope.cmOption = {
            theme: 'topcoder',
            lineNumbers: true,
            lineWrapping : true,
            mode: $scope.lang($scope.langIdx).langKey,
            foldGutter: $scope.lang($scope.langIdx).langGutter,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            onLoad : function (_cm) {
                $scope.cm = _cm;
                $scope.settingChanged = function () {
                    _cm.setOption('mode', $scope.lang($scope.langIdx).langKey);
                    _cm.setOption('theme', $scope.theme($scope.themeIdx).themeKey);
                    _cm.setOption('lineNumbers', $scope.showLineNumber);
                    _cm.setOption('foldGutter', $scope.lang($scope.langIdx).langGutter);
                    // HACK: reset the gutters to keep line numbers at the left of foldgutter.
                    if ($scope.showLineNumber) {
                        _cm.setOption('gutters', ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
                    } else {
                        _cm.setOption('gutters', ["CodeMirror-foldgutter"]);
                    }
                    $scope.settingsOpen = false;
                };
                _cm.on('change', function () {
                    $scope.contentDirty = true;
                });
                _cm.on('scroll', function () {
                    $scope.updateErrorMessages(true);
                });
                // tell the parent controller that the editor is loaded
                $scope.$emit('editor-loaded');
            }
        };

        // when the problem is loaded in the parent controller userCodingCtrl
        $scope.$on('problem-loaded', function () {
            // set tests
            $scope.tests = $scope.userData.tests;
            // init testcase checkboxes
            $scope.tests.forEach(function (testCase) {
                testCase.checked = false;
                testCase.params.forEach(function (param) {
                    if (param.complexType) {
                        param.created = false;
                    }
                });
            });
            $scope.selectAll = function ($event) {
                var checkbox = $event.target,
                    action = checkbox.checked;
                $scope.tests.forEach(function (testCase) {
                    testCase.checked = action;
                });
            };
            $scope.isSelectedAll = function () {
                var i;
                for (i = 0; i < $scope.tests.length; i++) {
                    if (!$scope.tests[i].checked) {
                        return false;
                    }
                }
                return true;
            };
            $scope.runTests = function () {
                $timeout(function () {
                    $scope.testCompleted = true;
                    $scope.isTesting = false;
                    $http.get('data/test-results.json').success(function (data) {
                        var i;
                        for (i = 0; i < data.length; i++) {
                            $scope.tests[i].passed = data[i];
                        }
                    });
                }, 3000);
                $scope.isTesting = true;
                $scope.testCompleted = false;
            };
            // set the code written by the user
            $scope.code = $scope.userData.code;
            $scope.contentDirty = true;

            // load supported languages from config.
            // $scope.problem.supportedLanguages was set in the parent controller
            $scope.languages.length = 0;
            cmLangConfigs.forEach(function (config) {
                var i;
                for (i = 0; i < $scope.problem.supportedLanguages.length; i++) {
                    if (config.name.toLowerCase() === $scope.problem.supportedLanguages[i].toLowerCase()) {
                        $scope.languages.push(config);
                        break;
                    }
                }
            });
            if ($scope.languages.length === 0) {
                $scope.languages.push({name: 'Language'});
            }

            function setIndex(data, name, defaultValue) {
                var i;
                for (i = 0; i < data.length; i++) {
                    if (data[i].name.toLowerCase() === name.toLowerCase()) {
                        return i;
                    }
                }
                return defaultValue;
            }
            // set preferred language
            $scope.langIdx = setIndex($scope.languages, $scope.userData.langName, $scope.langIdx);
            // set preferred theme
            $scope.themeIdx = setIndex($scope.themes, $scope.userData.themeName, $scope.themeIdx);

            // set line number visibility
            $scope.showLineNumber = $scope.userData.showLineNumber ? true : false;

            // set auto-compile option
            $scope.autoCompile = $scope.userData.autoCompile ? true : false;
            $scope.compile = function () {
                // in the real app, code should be compiled in the server side
                $http.get('data/compile-errors.json').success(function (data) {
                    $scope.errors = data;
                    $scope.updateErrorMessages(false);
                });
            };
            $scope.autoCompileDevel = function () {
                if ($scope.autoCompile && $scope.contentDirty) {
                    // auto-compile
                    $scope.compile();
                    $scope.contentDirty = false;
                }
                $timeout($scope.autoCompileDevel, 5000);
            };
            $scope.autoCompileDevel();

            // set auto-save option
            $scope.autoSave = $scope.userData.autoSave ? true : false;
            // settingChanged has been defined as editor is loaded before the problems is loaded.
            $scope.settingChanged();
        });
        $scope.testCompleted = false;
        $scope.isTesting = false;
    }];

module.exports = userCodingEditorCtrl;