/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles user coding page logic.
 * Currently it can be used for coding and viewing others' code.
 * It is distinguished by states 'user.coding' and 'user.viewCode'.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 1):
 * - Updated to use real data.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Added functions for the submission logic.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to handle PopUpGenericResponse with $scope instead of socket.
 * - Updated modal closing logic to avoid the same popup appearing more than once.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Challenge Phase):
 * - Updated to integrate with challenge related logic.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated to use the global popup modal defined in baseCtrl.js.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - User cannot focus on coding area in readonly mode
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Fixed issues in coding editor.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Added checking condition for rooms in challenge phase.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Fixed issues in coding editor.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Phase I Bug Fix 5):
 * - Updated goto line logic.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena UI - Test Panel Update for Batch Testing):
 * - Updated for test panel and test report logic.
 *
 * Changes in version 1.11 (Module Assembly - Web Arena Bug Fix 20140909):
 * - Fixed the issues in coding editor.
 *
 * @author tangzx, amethystlei, flytoj2ee, TCASSEMBLER
 * @version 1.11
 */
'use strict';
/*global module, CodeMirror, angular, document, $, window */
/*jslint plusplus: true*/
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The main controller for coding editor.
 *
 * @type {*[]}
 */
var userCodingEditorCtrl = ['$rootScope', '$scope', '$window', 'appHelper', 'socket', '$timeout', 'sessionHelper',
    function ($rootScope, $scope, $window, appHelper, socket, $timeout, sessionHelper) {
        var indentRangeFinder = {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
            },
            braceRangeFinder = {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            /**
             * The language configs.
             *
             * @type {{name: string, id: number, langKey: string, langGutter: {rangeFinder: exports.combine}}[]}
             */
            cmLangConfigs = [
                {
                    name: 'Java',
                    id: 1,
                    langKey: 'text/x-java',
                    langGutter: braceRangeFinder
                },
                {
                    name: 'C++',
                    id: 3,
                    langKey: 'text/x-c++src',
                    langGutter: braceRangeFinder
                },
                {
                    name: 'C#',
                    id: 4,
                    langKey: 'text/x-csharp',
                    langGutter: braceRangeFinder
                },
                {
                    name: 'VB.NET',
                    id: 5,
                    langKey: 'text/x-vb',
                    langGutter: indentRangeFinder
                },
                {
                    name: 'Python',
                    id : 6,
                    langKey: 'text/x-python',
                    langGutter: indentRangeFinder
                }
            ],
            userInputDisabled = false,
            modalTimeoutPromise = null;

        $scope.gotoLine = "";
        $scope.markedSearched = [];
        $scope.searchText = "";
        /**
         * Search by text.
         */
        $scope.searchByText = function () {
            var i, cursor;
            if ($scope.cm) {
                // clear the mark
                for (i = 0; i < $scope.markedSearched.length; ++i) {
                    $scope.markedSearched[i].clear();
                }

                $scope.markedSearched.length = 0;
                cursor = $scope.cm.getSearchCursor($scope.searchText);
                while (cursor.findNext()) {
                    $scope.markedSearched.push($scope.cm.markText(cursor.from(), cursor.to(), {className: "searched"}));
                }

            }
        };

        /**
         * Go to line.
         */
        $scope.jumpToLine = function () {
            var tmp = parseInt($scope.gotoLine, 10), t, middleHeight;
            if ((tmp < 1) || isNaN(tmp)) {
                $scope.openModal({
                    title: 'Warning',
                    message: 'Please input number great than 0 in go to line field.',
                    enableClose: true
                });
            } else {
                if ($scope.cm) {
                    t = $scope.cm.charCoords({line: tmp, ch: 0}, "local").top;
                    middleHeight = $scope.cm.getScrollerElement().offsetHeight / 2;
                    $scope.cm.scrollTo(null, t - middleHeight - 5);
                    $scope.cm.setCursor(tmp - 1, 0);
                    $scope.cm.focus();
                }
            }
        };

        setTimeout(function () {
            $(window).scrollTop(0);
        }, 0);

        /**
         * Handle the input search text event.
         * @param keyEvent - the key event.
         */
        $scope.inputSearchText = function (keyEvent) {
            if (keyEvent.which === 13) {
                $timeout(function () {
                    angular.element('#searchByText').trigger('click');
                }, 10);
            }
        };

        /**
         * Handle the input goto line event.
         * @param keyEvent - the key event.
         */
        $scope.inputGotoText = function (keyEvent) {
            if (keyEvent.which === 13) {
                $timeout(function () {
                    angular.element('#gotoByText').trigger('click');
                }, 10);
            }
        };

        /**
         * Enable editor.
         *
         * @param enable whether enable
         */
        function enableEditor(enable) {

            if ($scope.cm) {
                $scope.cm.setOption('readOnly', enable === false ? 'nocursor' : false);
            }
        }

        /**
         * Disable user inputs.
         */
        function disableUserInput() {
            userInputDisabled = true;
            enableEditor(false);
        }

        /**
         * Enable user inputs.
         */
        function enableUserInput() {
            if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                userInputDisabled = false;
                enableEditor();
            }
        }

        /**
         * Replace all.
         *
         * @param find the find str
         * @param replace to replace str
         * @param str the source
         * @returns {*}
         */
        function replaceAll(find, replace, str) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        /**
         * Update arg type and method.
         *
         * @param id the language id.
         */
        function updateArgTypeAndMethod(id) {
            if (id) {
                $scope.problem.argTypeText = $scope.getArgType(id);
                $scope.problem.methodSignature = $scope.getMethodSignature(id);
            }
        }

        /**
         * Set timeout modal.
         */
        function setTimeoutModal() {
            $scope.openModal({
                title: 'Timeout',
                message: 'Sorry, the request is timeout.',
                enableClose: true
            });
            modalTimeoutPromise = null;
            enableUserInput();
        }

        $scope.$window = $window;
        $scope.range = appHelper.range;

        // hide/show settings panel
        $scope.settingsBackup = {};
        $scope.settingsOpen = false;

        /**
         * Toggle settings.
         */
        $scope.toggleSettings = function () {
            if ($scope.currentStateName() !== helper.STATE_NAME.Coding) {
                // disable when it is not in the state user.coding
                return;
            }
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

                updateArgTypeAndMethod($scope.lang($scope.langIdx).id);
            }
        };

        /**
         * Checks whether the user and the defendant in the same room.
         *
         * @returns {boolean} - the checking result.
         */
        $scope.isInSameRoom = function () {
            var flag1 = false,
                flag2 = false;

            // cannot challenge user himself
            if ($scope.defendant === $rootScope.username()) {
                return false;
            }

            angular.forEach($rootScope.roomData[$scope.defendantRoomID].coders, function (member) {
                if (member.userName === $rootScope.username()) {
                    flag1 = true;
                }
                if (member.userName === $scope.defendant) {
                    flag2 = true;
                }
            });
            return flag1 && flag2;
        };

        /**
         * Checks if a user is assigned to a room.
         *
         * @param  {string}  handle the handle to be checked
         * @param  {number}  roomID the room ID
         * @returns {boolean} true if the user is assigned to the room
         */
        $scope.isCoderAssigned = function (handle, roomID) {
            if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                return true;
            }
            if (roomID === undefined) {
                return false;
            }
            var i;
            for (i = 0; i < $scope.roomData[roomID].coders.length; i += 1) {
                if ($scope.roomData[roomID].coders[i].userName === handle) {
                    return true;
                }
            }
            return false;
        };

        // hide/show test panel
        $scope.testOpen = false;

        /**
         * Toggle test panel.
         */
        $scope.toggleTest = function () {
            if (userInputDisabled || !$scope.problemLoaded) {
                return;
            }
            if ($scope.currentStateName() === helper.STATE_NAME.ViewCode) {
                // for challenges, not prior message should be sent.
                $scope.testOpen = !$scope.testOpen;
                return;
            }
            if ($scope.testOpen === false) {
                disableUserInput();
                $scope.openModal({
                    title: 'Retrieving Test Info',
                    message: 'Please wait for test info.',
                    enableClose: false
                });
                if (modalTimeoutPromise) {
                    $timeout.cancel(modalTimeoutPromise);
                }
                modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
                // get test info before open it
                socket.emit(helper.EVENT_NAME.TestInfoRequest, {
                    componentID: $scope.componentID
                });
            } else {
                $scope.testOpen = false;
            }
        };

        // init theme settings
        $scope.themes = [
            {name: 'Standard', themeKey: 'topcoder'}
        ];
        $scope.themeIdx = 0;

        /**
         * Get theme.
         *
         * @param themeIdx the index
         * @returns {*}
         */
        $scope.theme = function (themeIdx) {
            return $scope.themes[themeIdx];
        };

        /**
         * Get the theme name.
         *
         * @param themeIdx the index
         * @returns {Window.name|*}
         */
        $scope.getThemeName = function (themeIdx) {
            return $scope.theme(themeIdx).name;
        };

        /**
         * Set the theme index.
         *
         * @param themeIdx the index
         */
        $scope.setThemeIdx = function (themeIdx) {
            $scope.themeIdx = themeIdx;
        };

        // init language settings
        $scope.languages = angular.copy(cmLangConfigs);
        $scope.langIdx = 0;

        /**
         * Get language.
         *
         * @param langIdx the index.
         * @returns {*}
         */
        $scope.lang = function (langIdx) {
            return $scope.languages[langIdx];
        };

        /**
         * Get language name.
         *
         * @param langIdx
         * @returns {Window.name|*}
         */
        $scope.getLangName = function (langIdx) {
            return $scope.lang(langIdx).name;
        };

        /**
         * Set language index.
         *
         * @param langIdx
         */
        $scope.setLangIdx = function (langIdx) {
            $scope.langIdx = langIdx;

            updateArgTypeAndMethod($scope.lang($scope.langIdx).id);
        };

        // init show/hide line number settings
        $scope.showLineNumber = true;
        // init code content & other code related fields
        $scope.code = '';

        // test fields
        $scope.testCompleted = false;
        $scope.isTesting = false;
        $scope.caseIndex = null;

        if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
            $scope.panelName = 'Test Panel';
        } else if ($scope.currentStateName() === helper.STATE_NAME.ViewCode) {
            $scope.panelName = 'Challenge';
            // find the component object so that when the component is challenged
            // the status can be updated inside the coding editor.
            $scope.component = (function () {
                var result;
                angular.forEach($scope.roomData[$scope.defendantRoomID].coders, function (coder) {
                    if (coder.userName === $scope.defendant) {
                        angular.forEach(coder.components, function (component) {
                            if (component.componentID === $scope.componentID) {
                                result = component;
                            }
                        });
                    }
                });
                return result;
            }());
            // set the page title, maybe it should display in the editor's title
            angular.forEach($scope.roundData[$scope.roundID].problems[$scope.divisionID], function (problem) {
                if (problem.primaryComponent && problem.primaryComponent.componentID === $scope.componentID) {
                    $scope.$state.current.data.pageTitle = $scope.defendant + "'s " +
                        problem.primaryComponent.pointValue + '-point problem (' + $scope.getLangName($scope.langIdx) + ')';
                }
            });
            /**
             * Checks if the current component is successfully challenged.
             *
             * @returns {boolean} true if the current component is successfully challenged.
             */
            $scope.isChallenged = function () {
                return angular.isDefined($scope.component) &&
                    $scope.component.status === helper.CODER_PROBLEM_STATUS_ID.CHALLENGE_SUCCEEDED;
            };
        }

        /**
         * Save the setting.
         */
        $scope.saveSetting = function () {
            $scope.settingChanged();
            socket.emit(helper.EVENT_NAME.SetLanguageRequest, {
                languageID: $scope.lang($scope.langIdx).id
            });
            sessionHelper.setUserLanguagePreference($scope.lang($scope.langIdx).id);
        };

        // At first load, it loads the code content, it's not changed the code.
        $scope.firstLoadCode = true;

        /**
         * The code mirror config.
         *
         * @type {{
         *          theme: string,
         *          lineNumbers: boolean,
         *          lineWrapping: boolean,
         *          mode: (string|cmLangConfigs.langKey),
         *          foldGutter: (braceRangeFinder|*|indentRangeFinder|cmLangConfigs.langGutter),
         *          gutters: string[],
         *          indentUnit: number,
         *          readOnly: boolean,
         *          onLoad: onLoad
         *          }}
         */
        $scope.cmOption = {
            theme: 'topcoder',
            lineNumbers: true,
            lineWrapping : true,
            mode: $scope.lang($scope.langIdx).langKey,
            foldGutter: $scope.lang($scope.langIdx).langGutter,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            indentUnit: 4,
            readOnly: 'nocursor',
            onLoad : function (cmInstance) {
                $scope.cm = cmInstance;
                $scope.settingChanged = function () {
                    cmInstance.setOption('mode', $scope.lang($scope.langIdx).langKey);
                    cmInstance.setOption('theme', $scope.theme($scope.themeIdx).themeKey);
                    cmInstance.setOption('lineNumbers', $scope.showLineNumber);
                    cmInstance.setOption('foldGutter', $scope.lang($scope.langIdx).langGutter);
                    // HACK: reset the gutters to keep line numbers at the left of foldgutter.
                    if ($scope.showLineNumber) {
                        cmInstance.setOption('gutters', ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
                    } else {
                        cmInstance.setOption('gutters', ["CodeMirror-foldgutter"]);
                    }
                    $scope.settingsOpen = false;
                };
                cmInstance.on('change', function () {
                    if ($scope.firstLoadCode) {
                        $scope.contentDirty = false;
                        $scope.firstLoadCode = false;
                    } else {
                        $scope.contentDirty = true;
                        $scope.firstLoadCode = false;
                    }
                });
                // comment out error handle related logic for now
                /*
                cmInstance.on('scroll', function () {
                    $scope.updateErrorMessages(true);
                });
                */
                // tell the parent controller that the editor is loaded
                $scope.$emit('editor-loaded');
            }
        };

        /**
         * Clear the editor.
         */
        $scope.clearEditor = function () {
            if (userInputDisabled) {
                return;
            }
            $scope.openModal({
                title: 'Warning',
                message: 'Are you sure you want to delete your source code?',
                buttons: ['Yes', 'No'],
                enableClose: true
            }, function () {
                disableUserInput();

                $scope.code = '';
                $scope.cm.setValue('');

                enableUserInput();
            });
        };

        /**
         * Return the disable submit link flag.
         * @returns {boolean} - the disable flag.
         */
        $scope.disableSubmit = function () {
            return (!$scope.cm) || $scope.cm.getValue().trim() === '';
        };

        /**
         * Compile solution.
         */
        $scope.compileSolution = function () {
            if (userInputDisabled || !$scope.problemLoaded) {
                return;
            }
            /**
             * Get source code from CodeMirror.
             *
             * @type {string}
             */
            var code = $scope.cm.getValue();

            // This is according to the comment in https://apps.topcoder.com/bugs/browse/BUGHUNTS4WEBBASEDARENA-87
            // Actually we can safely send blank code to the server and will get the same response.
            if (code === '') {
                $scope.openModal({
                    title: 'Error',
                    message: 'You cannot compile blank code.',
                    enableClose: true
                });
                return;
            }

            disableUserInput();

            $scope.openModal({
                title: 'Compiling',
                message: 'Please wait for compiling results.',
                enableClose: false
            });

            socket.emit(helper.EVENT_NAME.CompileRequest, {
                componentID: $scope.componentID,
                language: $scope.lang($scope.langIdx).id,
                code: code
            });
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
        };

        /**
         * Submit the solution.
         */
        $scope.submitSolution = function () {
            if (userInputDisabled || !$scope.problemLoaded || $scope.disableSubmit()) {
                return;
            }
            /**
             * The submit handler.
             */
            var submitHandler = function () {
                $scope.openModal({
                    title: 'Warning',
                    message: 'Would you like to submit your code?',
                    buttons: ['Yes', 'No'],
                    enableClose: true
                }, function () {
                    socket.emit(helper.EVENT_NAME.SubmitRequest, {componentID: $scope.componentID});
                    $scope.testOpen = false;
                });
            };
            if ($scope.contentDirty) {
                $scope.openModal({
                    title: 'Warning',
                    message: 'You have made a change to your code since the last time you compiled. Do you want to continue with the submit?',
                    buttons: ['Yes', 'No'],
                    enableClose: true
                }, submitHandler);
            } else {
                submitHandler();
            }
        };

        // Handle the submit result response
        socket.on(helper.EVENT_NAME.SubmitResultsResponse, function (data) {
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            enableUserInput();
            $scope.openModal({
                title: 'Submission Results',
                message: data.message,
                enableClose: true
            });
        });

        /*jslint unparam: true*/
        /**
         * Handle pop up generic response.
         */
        $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            if ($rootScope.currentModal) {
                $rootScope.currentModal.dismiss('cancel');
                $rootScope.currentModal = undefined;
            }

            var i;
            enableUserInput();

            if (data.title !== helper.POP_UP_TITLES.Error &&
                    data.title !== helper.POP_UP_TITLES.CompileResult &&
                    data.title !== helper.POP_UP_TITLES.TestResults &&
                    data.title !== helper.POP_UP_TITLES.MultipleSubmission &&
                    data.title !== helper.POP_UP_TITLES.ChallengeResults) {
                // only handle these responses for now
                return;
            }
            data.message = replaceAll('<', '&lt;', data.message);
            data.message = replaceAll('>', '&gt;', data.message);

            $scope.openModal({
                title: (data.title !== helper.POP_UP_TITLES.Error ? data.title : 'Error'),
                message: data.message,
                buttons: data.buttons,
                enableClose: true
            }, function () {
                // handles the Multiple Submission response
                if (data.title === helper.POP_UP_TITLES.MultipleSubmission) {
                    // Resubmit the solution
                    socket.emit(helper.EVENT_NAME.GenericPopupRequest, {
                        popupType: data.type1,
                        button: data.buttons.indexOf('Yes'),
                        surveyData: [data.moveData] // the first item should be the component ID to be resubmitted
                    });
                }
            });

            if (angular.isDefined($scope.userData) && angular.isDefined($scope.userData.tests)) {
                // clean test status once get any pop up response
                // as may get error response
                for (i = 0; i < $scope.userData.tests.length; i += 1) {
                    $scope.userData.tests[i].havingResult = false;
                }
            }
            $scope.isTesting = false;

            if (data.title === helper.POP_UP_TITLES.TestResults) {
                $scope.testCompleted = true;
                if (data.message.indexOf('Correct Return Value') === 0) {
                    if ($scope.userData.tests[$scope.caseIndex]) {
                        $scope.userData.tests[$scope.caseIndex].havingResult = true;
                        $scope.userData.tests[$scope.caseIndex].passed = data.message.indexOf('Correct Return Value: Yes') === 0;
                    }
                }
            }
            if (data.title === helper.POP_UP_TITLES.CompileResult && data.type2 === helper.COMPILE_RESULTS_TYPE_ID.SUCCEEDED) {
                // set content dirty to false when compile successfully.
                $scope.contentDirty = false;
            }
        });
        /*jslint unparam: false*/

        /**
         * Handle test info response.
         */
        socket.on(helper.EVENT_NAME.TestInfoResponse, function (data) {
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            enableUserInput();

            if (data.componentID === $scope.componentID) {
                if ($rootScope.currentModal) {
                    $rootScope.currentModal.dismiss('cancel');
                    $rootScope.currentModal = undefined;
                }
                $scope.testOpen = true;
                $rootScope.$broadcast('test-panel-loaded');
            }
        });

        // when the problem is loaded in the parent controller userCodingCtrl
        $scope.$on('problem-loaded', function () {
            // init test case checkboxes
            $scope.userData.tests.forEach(function (testCase) {
                testCase.checked = false;
                testCase.toggle = false;
                testCase.params.forEach(function (param) {
                    if (param.complexType) {
                        param.created = false;
                    }
                });
            });
            $rootScope.userTests.forEach(function (testCase) {
                testCase.checked = false;
            });
            $scope.customChecked = false;
            $scope.customTest = [];
            /*jslint unparam: true*/
            angular.forEach($scope.problem.allArgTypes, function (arg) {
                $scope.customTest.push({
                    value: ''
                });
            });
            /*jslint unparam: false*/

            /**
             * Select all test. Will not happen currently.
             *
             * @param $event the event
             */
            $scope.selectAll = function ($event) {
                var checkbox = $event.target,
                    action = checkbox.checked;
                $scope.userData.tests.forEach(function (testCase) {
                    testCase.checked = action;
                });
                $rootScope.userTests.forEach(function (testCase) {
                    testCase.checked = action;
                });
            };

            /**
             * Gets the connected flag.
             *
             * @returns {$rootScope.connected|*} connected flag.
             */
            $scope.isConnected = function () {
                return $rootScope.connected;
            };

            /**
             * Check whether all test cases are selected.
             *
             * @returns {boolean} whether all test cases are selected
             */
            $scope.isSelectedAll = function () {
                var i;
                for (i = 0; i < $scope.userData.tests.length; i += 1) {
                    if (!$scope.userData.tests[i].checked) {
                        return false;
                    }
                }
                for (i = 0; i < $rootScope.userTests.length; i += 1) {
                    if (!$rootScope.userTests[i].checked) {
                        return false;
                    }
                }
                if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                    if ($scope.userData.tests.length === 0 && $rootScope.userTests.length === 0) {
                        return false;
                    }
                }
                return $scope.currentStateName() === helper.STATE_NAME.Coding || !!$scope.customChecked;
            };

            /**
             * Checks whether the select all check should be disable.
             * @returns {boolean} the checked result.
             */
            $scope.isSelectedAllDisable = function () {
                if ($scope.currentStateName() === helper.STATE_NAME.Coding) {
                    if ($scope.userData.tests.length === 0 && $rootScope.userTests.length === 0) {
                        return true;
                    }
                }
                return false;
            };

            // set the code written by the user
            $scope.code = $scope.userData.code;
            $scope.contentDirty = false;

            // load supported languages from config.
            // $scope.problem.supportedLanguages was set in the parent controller
            if ($scope.problem.supportedLanguages && $scope.problem.supportedLanguages.length > 0) {
                $scope.languages.length = 0;
                cmLangConfigs.forEach(function (config) {
                    var i;
                    for (i = 0; i < $scope.problem.supportedLanguages.length; i += 1) {
                        if (config.id === $scope.problem.supportedLanguages[i].id) {
                            $scope.languages.push(config);
                            break;
                        }
                    }
                });
            }

            // set preferred language
            $scope.langIdx = 0;
            angular.forEach($scope.languages, function (language, i) {
                if (language.id === $scope.languageID) {
                    $scope.setLangIdx(i);
                }
            });

            // set preferred theme, there is no theme data
            $scope.themeIdx = 0;

            // set line number visibility
            // comment out for now, there is no line number data
            // $scope.showLineNumber = $scope.userData.showLineNumber ? true : false;

            $scope.settingChanged();
            // enable the editior only when it is at the state helper.STATE_NAME.Coding.
            enableEditor($scope.currentStateName() === helper.STATE_NAME.Coding);

            // comment out auto-compile & auto-save related code for now
            /*
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
            */
        });

        // comment out error messages related code for now
        // set the ui-codemirror option
        $scope.errorBar = document.getElementsByClassName('errorBar')[0];
        /**
         * Rebuild the error bar.
         */
        $scope.sharedObj.rebuildErrorBar = function () {
            // comment out error part for now
            /*
            var errorBarHeight = appHelper.getRenderedHeight($scope.errorBar),
                messageHeight = 22;
            if (Math.floor(errorBarHeight / messageHeight) !== $scope.lineNumbers) {
                $scope.lineNumbers = Math.floor(errorBarHeight / messageHeight);
                $scope.errorMessages = $scope.range($scope.lineNumbers);
                $scope.updateErrorMessages(true);
            }
            */
            angular.element($scope.errorBar).css('height',
                    (appHelper.getRenderedHeight($scope.cmElem) - 1) + 'px');
        };
        /*
        $scope.lineNumbers = 21;
        $scope.errorMessages = $scope.range($scope.lineNumbers);

        $scope.clearErrorMessages = function () {
            var i;
            for (i = 0; i < $scope.errorMessages.length; i += 1) {
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
            console.log('topline: ' + $scope.topLine);
            for (i = 0; i < $scope.errorMessages.length; i += 1) {
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
        */
    }];

module.exports = userCodingEditorCtrl;
