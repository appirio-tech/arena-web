/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
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
 * Changes in version 1.12 (Module Assembly - Web Arena - Code With Practice Problem)
 *  - Added checking logic for practice code state.
 *
 * Changes in version 1.13 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the coding editor and the test report.
 *
 * Changes in version 1.14 (Module Assembly - Web Arena Bug Fix 14.10 - 2):
 * - Fixed the go to line issue.
 *
 * Changes in version 1.15 (Web Arena Plugin API Part 1):
 * - Added plugin logic for coding editor panel.
 *
 * Changes in version 1.16 (Module Assembly - Web Arena - Add Save Feature to Code Editor):
 * - Added logic to cache the code to local storage.
 *
 * Changes in version 1.17 (Web Arena - Run System Testing Support For Practice Problems):
 * - Added logic to support running practice system test.
 *
 * Changes in version 1.18 (Scrolling Issues Fixes Assembly):
 * - Changed CodeMirror scrollbar style.
 *
 * Changes in version 1.19 (Web Arena - Recovery From Lost Connection)
 * - Fixed the undefined test data issue.
 *
 * Changes in version 1.20 (Web Arena - Show Code Image Instead of Text in Challenge Phase)
 * - Enable code editor if the user is the owner of the code during challenge phase.
 *
 * Changes in version 1.21 (Web Arena - Replace Code Mirror With Ace Editor):
 * - Replaced codemirror editor logic with ace editor logic.
 * - Added getEditorTheme function.
 *
 * @author tangzx, amethystlei, flytoj2ee, Helstein, onsky, MonicaMuranyi
 * @version 1.21
 */
'use strict';
/*global require, module, angular, document, $, window */
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*jslint unparam: true*/
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');
var config = require('../config');

/**
 * The main controller for coding editor.
 *
 * @type {*[]}
 */
var userCodingEditorCtrl = ['$rootScope', '$scope', '$window', 'appHelper', 'socket', '$timeout', 'sessionHelper',
    function ($rootScope, $scope, $window, appHelper, socket, $timeout, sessionHelper) {
        /**
         * The language configs.
         *
         * @type {{name: string, id: number, langKey: string}[]}
         */
        var aceEditorLangConfigs = [
            {
                name: 'Java',
                id: 1,
                langKey: 'java'
            },
            {
                name: 'C++',
                id: 3,
                langKey: 'c_cpp'
            },
            {
                name: 'C#',
                id: 4,
                langKey: 'csharp'
            },
            {
                name: 'VB.NET',
                id: 5,
                langKey: 'vbscript'
            },
            {
                name: 'Python',
                id : 6,
                langKey: 'python'
            }
        ],
            userInputDisabled = false,
            modalTimeoutPromise = null,
            aceVerticalScrollbar,
            /**
             * Close the dropdown.
             * @param elem - the drop down element.
             */
            closeDropdown = function (elem) {
                $timeout(function () {
                    var isOpen = elem.hasClass('open');
                    if (isOpen) {
                        elem.removeClass('open');
                    }
                }, 1);
            },
            /**
             * Retrieves the editor theme to be used.
             * @return the path of the editor theme.
             */
            getEditorTheme = function () {
                return 'ace/theme/' + helper.CODE_EDITOR_THEME[$scope.themeInUse];
            };

        $scope.gotoLine = "";
        $scope.searchText = "";

        /**
         * Handle the "Enter" key press for search input.
         * Find the next occurence and highlight it.
         *
         * @param keyEvent - the key event.
         */
        $('.findInput').keypress(function (keyEvent) {
            if (keyEvent.charCode === 13) {
                $timeout(function () {
                    $scope.findNextOccurence();
                }, 10);
            }
        });

        /**
         * Search by text.
         */
        $scope.searchByText = function () {
            if ($scope.aceEditorInstance) {
                var occurences = $scope.aceEditorInstance.findAll($scope.searchText);
                if (!$scope.searchText || occurences < 1) {
                    $scope.aceEditorInstance.find($scope.searchText);
                    $scope.aceEditorInstance.clearSelection();
                }
            }
        };

        /**
         * Find the next occurence of the current search term
         */
        $scope.findNextOccurence = function () {
            if ($scope.aceEditorInstance) {
                $scope.aceEditorInstance.find($scope.searchText);
            }
        };

        /**
         * Go to line.
         */
        $scope.jumpToLine = function () {
            var tmp = parseInt($scope.gotoLine, 10);
            if ((tmp < 1) || isNaN(tmp)) {
                $scope.openModal({
                    title: 'Warning',
                    message: 'Please input number great than 0 in go to line field.',
                    enableClose: true
                });
            } else {
                if ($scope.aceEditorInstance) {
                    $scope.aceEditorInstance.clearSelection();
                    $scope.aceEditorInstance.gotoLine(tmp);
                    $scope.aceEditorInstance.scrollToLine(tmp, true);
                    $scope.aceEditorInstance.focus();
                }
            }
        };

        setTimeout(function () {
            $(window).scrollTop(0);
        }, 0);

        /**
         * Handle the input goto line event.
         * @param keyEvent - the key event.
         */
        $scope.inputGotoText = function (keyEvent) {
            if (keyEvent.which === 13) {
                $scope.jumpToLine();
            }
        };

        /**
         * Enable editor.
         *
         * @param enable whether enable
         */
        function enableEditor(enable) {
            if ($scope.aceEditorInstance) {
                $scope.aceEditorInstance.setReadOnly(enable === false && $scope.defendant === $rootScope.username() ? true : false);
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
            if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
                userInputDisabled = false;
                $scope.isSaving = false;
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
            if ($scope.currentStateName() !== helper.STATE_NAME.Coding && $scope.currentStateName() !== helper.STATE_NAME.PracticeCode) {
                // disable when it is not in the state user.coding or user.practiceCode
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
            var elem = angular.element('ul.editorDropDown > li.dropdown');
            if (elem) {
                closeDropdown(elem);
            }
        };

        // init language settings
        $scope.languages = angular.copy(aceEditorLangConfigs);
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
            var elem = angular.element('ul.languageDropDown > li.dropdown');
            if (elem) {
                closeDropdown(elem);
            }
        };

        // init show/hide line number settings
        $scope.showLineNumber = true;
        // init code content & other code related fields
        $scope.code = '';

        // test fields
        $scope.testCompleted = false;
        $scope.isTesting = false;
        $scope.caseIndex = null;

        if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
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
            // save the language id to local
            appHelper.setCodeToLocalStorage($rootScope.username(), $scope.roundID, $scope.problemID, $scope.componentID,
                $scope.lang($scope.langIdx).id, $scope.aceEditorInstance.getValue());
        };

        // At first load, it loads the code content, it's not changed the code.
        $scope.firstLoadCode = true;

        /**
         * The ace editor config.
         *
         * @type {{
         *          useWrapMode: boolean,
         *          showGutter: boolean,
         *          useSoftTabs: boolean,
         *          mode: string,
         *          advanced: Object,
         *          rendererOptions: Object,
         *          onLoad: function
         *          onChange: function
         *          }}
         */
        $scope.aceEditorOptions = {
            useWrapMode : true,
            showGutter: true,
            useSoftTabs: true,
            mode: $scope.lang($scope.langIdx).langKey,
            rendererOptions: {
                fontSize: 14,
                showPrintMargin: false,
                displayIndentGuides: false
            },
            /**
             * Triggered after the editor is loaded.
             *
             * @param aceEditorInstance the editor instance.
             */
            onLoad : function (aceEditorInstance) {
                var aceEditorSession, aceEditorRenderer, theme, scrollTimeout;
                // Integrate perfect scrollbar in editor
                aceVerticalScrollbar = $(".ace_scrollbar-v");
                aceVerticalScrollbar.perfectScrollbar();
                aceVerticalScrollbar.on("scroll", function () {
                    aceVerticalScrollbar.css({"z-index": "6"});
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(function () {
                        aceVerticalScrollbar.css({"z-index": "1"});
                    }, 200);
                });

                $scope.aceEditorInstance = aceEditorInstance;
                aceEditorSession = aceEditorInstance.getSession();
                aceEditorRenderer = aceEditorInstance.renderer;
                aceEditorRenderer.setScrollMargin(0, 1, 0, 0);

                theme = getEditorTheme();

                // When the arena theme changes, change the editor theme
                $scope.$watch('themePanelOpen', function () {
                    if (theme !== $scope.themeInUse) {
                        aceEditorInstance.setTheme(getEditorTheme());
                    }
                });

                $scope.settingChanged = function () {
                    aceEditorSession.setMode('ace/mode/' + $scope.lang($scope.langIdx).langKey);
                    aceEditorRenderer.$gutterLayer.setShowLineNumbers($scope.showLineNumber);
                    aceEditorRenderer.$loop.schedule(aceEditorRenderer.CHANGE_GUTTER);
                    $scope.settingsOpen = false;
                };
            },
            /**
             * Triggered when the editor changes.
             */
            onChange : function () {

                if (!aceVerticalScrollbar.hasClass("ps-active-y")) {
                    // Show scrollbar initially (only executed once, when the editor is loaded)
                    aceVerticalScrollbar.perfectScrollbar('update');
                }
                var cursorPos;
                if ($scope.firstLoadCode || $scope.resizeCodeEditor) {
                    $scope.firstLoadCode = false;
                    $scope.updatedCodeAfterSubmit = false;
                    $scope.resizeCodeEditor = false;
                } else {
                    $scope.contentDirty = true;
                    $scope.updatedCodeAfterSubmit = true;
                    if (($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode)) {
                        appHelper.setCodeToLocalStorage($rootScope.username(), $scope.roundID, $scope.problemID, $scope.componentID,
                            $scope.lang($scope.langIdx).id, $scope.aceEditorInstance.getValue());
                    }
                }
                // Fix the visibility of the last editor line
                cursorPos = $scope.aceEditorInstance.getCursorPosition().row;
                if (cursorPos !== 0 && cursorPos === $scope.aceEditorInstance.getLastVisibleRow()) {
                    $scope.aceEditorInstance.scrollPageDown();
                }
            }
        };

        /**
         * Clear the editor.
         */
        $scope.clearEditor = function () {
            if (userInputDisabled || $scope.disableSubmit()) {
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
                $scope.aceEditorInstance.setValue('');
                $scope.aceEditorInstance.focus();

                enableUserInput();
            });
        };

        /**
         * Return the disable submit link flag.
         * @returns {boolean} - the disable flag.
         */
        $scope.disableSubmit = function () {
            return (!$scope.aceEditorInstance) || $scope.aceEditorInstance.getValue().trim() === '';
        };

        /**
         * Save code.
         */
        $scope.saveCode = function () {
            if ($scope.contentDirty) {
                $scope.openModal({
                    title: 'Saving',
                    message: 'Please wait for saving code.',
                    enableClose: false
                });

                $scope.isSaving = true;
                $scope.contentDirty = false;
                var code = $scope.aceEditorInstance.getValue();
                socket.emit(helper.EVENT_NAME.SaveRequest, {
                    componentID: $scope.componentID,
                    language: $scope.lang($scope.langIdx).id,
                    code: code
                });
                if (modalTimeoutPromise) {
                    $timeout.cancel(modalTimeoutPromise);
                }
                modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
            }
        };

        $scope.isSaving = false;
        /**
         * Auto save the code.
         */
        $scope.autoSaveCode = function () {
            if ($scope.contentDirty && !$scope.isSaving) {
                $scope.isSaving = true;
                $scope.contentDirty = false;
                var code = $scope.aceEditorInstance.getValue();
                socket.emit(helper.EVENT_NAME.SaveRequest, {
                    componentID: $scope.componentID,
                    language: $scope.lang($scope.langIdx).id,
                    code: code
                });
            }

            $rootScope.autoSavingCodePromise = $timeout($scope.autoSaveCode, config.autoSavingCodeInterval);
        };
        // Only trigger auto save code logic in coding and practice code mode
        if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
            $scope.autoSaveCode();
        }

        // init code compiled false
        $scope.codeCompiled = false;
        /**
         * Compile solution.
         */
        $scope.compileSolution = function () {
            if (userInputDisabled || !$scope.problemLoaded) {
                return;
            }
            /**
             * Get source code from ace editor.
             *
             * @type {string}
             */
            var code = $scope.aceEditorInstance.getValue();

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

            $scope.contentDirty = false;
            socket.emit(helper.EVENT_NAME.CompileRequest, {
                componentID: $scope.componentID,
                language: $scope.lang($scope.langIdx).id,
                code: code
            });
            if (modalTimeoutPromise) {
                $scope.codeCompiled = false;
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
                    $scope.contentDirty = false;
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
            } else if (!$scope.codeCompiled) {
                $scope.openModal({
                    title: 'Warning',
                    message: 'You can\'t submit unless you have successfully compiled first.',
                    buttons: ['Close'],
                    enableClose: true
                }, submitHandler);
            } else {
                submitHandler();
            }
        };

        // Handle the submit result response
        socket.on(helper.EVENT_NAME.SubmitResultsResponse, function (data) {

            appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.solutionSubmitted, data);

            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            enableUserInput();
            $scope.openModal({
                title: 'Submission Results',
                message: data.message,
                enableClose: true
            });

            if (data.message.indexOf('was successful for') !== -1) {
                $scope.submittedCode = true;
                $scope.updatedCodeAfterSubmit = false;
                $scope.submittedTime = Date.now();
            }
        });

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

            if (data.title === helper.POP_UP_TITLES.SaveResults
                    || data.title === helper.POP_UP_TITLES.CompileResult
                    || data.title === helper.POP_UP_TITLES.MultipleSubmission) {
                //success to save code in server, remove local cache code.
                appHelper.removeCodeFromLocalStorage($rootScope.username(), $scope.roundID, $scope.problemID, $scope.componentID);
                $scope.isSaving = false;
            }
            if (data.title === helper.POP_UP_TITLES.SaveResults) {
                $scope.savedTime = Date.now();
            }

            if (data.title !== helper.POP_UP_TITLES.Error &&
                    data.title !== helper.POP_UP_TITLES.CompileResult &&
                    data.title !== helper.POP_UP_TITLES.TestResults &&
                    data.title !== helper.POP_UP_TITLES.MultipleSubmission &&
                    data.title !== helper.POP_UP_TITLES.ChallengeResults) {
                // only handle these responses for now
                return;
            }
            if (data.title === helper.POP_UP_TITLES.ChallengeResults) {
                if (data.message.indexOf('Your challenge of') === 0 && data.message.indexOf(' was unsuccessful.') !== -1) {
                    appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.challengeFailed, data);
                } else {
                    appHelper.triggerPluginEvent(helper.PLUGIN_EVENT.challengeSucceeded, data);
                }
            }
            if (data.title === helper.POP_UP_TITLES.CompileResult) {
                appHelper.triggerPluginEditorEvent(helper.PLUGIN_EVENT.solutionCompiled, data);
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
                $scope.aceEditorInstance.focus();
            }, function () {
                $scope.aceEditorInstance.focus();
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
                $scope.codeCompiled = true;
                $scope.compiledTime = Date.now();
            }
        });

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
            if ($scope.userData && $scope.userData.tests) {
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
            }
            if (angular.isUndefined($rootScope.userTests)) {
                $rootScope.userTests = [{}];
            }
            $rootScope.userTests.forEach(function (testCase) {
                testCase.checked = false;
            });
            $scope.customChecked = false;
            $scope.customTest = [];
            angular.forEach($scope.problem.allArgTypes, function (arg) {
                $scope.customTest.push({
                    value: ''
                });
            });

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
                if ($scope.userData && $scope.userData.tests) {
                    for (i = 0; i < $scope.userData.tests.length; i += 1) {
                        if (!$scope.userData.tests[i].checked) {
                            return false;
                        }
                    }
                }
                for (i = 0; i < $rootScope.userTests.length; i += 1) {
                    if (!$rootScope.userTests[i].checked) {
                        return false;
                    }
                }
                if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
                    if ($scope.userData.tests.length === 0 && $rootScope.userTests.length === 0) {
                        return false;
                    }
                }
                return ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode)
                    || !!$scope.customChecked;
            };

            /**
             * Checks whether the select all check should be disable.
             * @returns {boolean} the checked result.
             */
            $scope.isSelectedAllDisable = function () {
                if ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
                    if ((!$scope.userData || $scope.userData.tests.length === 0) && $rootScope.userTests.length === 0) {
                        return true;
                    }
                }
                return false;
            };

            // set the code written by the user
            var tmp = appHelper.getCodeFromLocalStorage($rootScope.username(), $scope.roundID, $scope.problemID, $scope.componentID);
            if (tmp !== null && ($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode)) {
                $scope.code = tmp.code;
                $scope.languageID = tmp.languageID;
                $scope.contentDirty = true;
            } else {
                if ($scope.userData && $scope.userData.code) {
                    $scope.code = $scope.userData.code;
                } else {
                    $scope.code = '';
                }
                $scope.contentDirty = false;
            }

            // load supported languages from config.
            // $scope.problem.supportedLanguages was set in the parent controller
            if ($scope.problem.supportedLanguages && $scope.problem.supportedLanguages.length > 0) {
                $scope.languages.length = 0;
                aceEditorLangConfigs.forEach(function (config) {
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

            $scope.submittedCode = false;
            $scope.updatedCodeAfterSubmit = false;

            /**
             * Check whether to show running practice system test link.
             * @returns {boolean} the checked result
             */
            $scope.isShowRunPracticeSystemTest = function () {
                if ($scope.currentStateName() === helper.STATE_NAME.PracticeCode) {
                    return true;
                }

                return false;
            };

            $scope.numContestRequests = 0;

            /**
             * Run practice system test.
             */
            $scope.runPracticeSystemTest = function () {
                if (!$scope.submittedCode) {
                    return;
                }

                /**
                 * Run system test handler.
                 */
                var runSystemTestHandler = function () {
                    $scope.numContestRequests = 1;
                    disableUserInput();
                    socket.emit(helper.EVENT_NAME.PracticeSystemTestRequest, {
                        componentIds: [$scope.componentID],
                        roomID: $scope.practiceRoomId
                    });
                };
                if ($scope.updatedCodeAfterSubmit) {
                    $scope.openModal({
                        title: 'Warning',
                        message: 'You have made a change to your code since the last time you submitted.' +
                            ' System test result will be based on last submitted code. Do you want to continue with Running System Tests?',
                        buttons: ['Yes', 'No'],
                        enableClose: true
                    }, runSystemTestHandler);
                } else {
                    runSystemTestHandler();
                }
            };

            // The response which returned total system test case count
            socket.on(helper.EVENT_NAME.PracticeSystemTestResponse, function (data) {
                $scope.numContestRequests = data.testCaseCountByComponentId[$scope.componentID];
            });

            // The response which returned system test results
            socket.on(helper.EVENT_NAME.PracticeSystemTestResultResponse, function (data) {
                if (data.resultData.succeeded === false) {
                    $scope.numContestRequests = 0;
                    //popup error dialog
                    $scope.openModal({
                        title: 'Result',
                        message: '',
                        showError: true,
                        buttons: ['Try Again'],
                        enableClose: true
                    }, null, null, 'popupSystemTestResultBase.html');
                    enableUserInput();
                } else {
                    $scope.numContestRequests = $scope.numContestRequests - 1;
                    if ($scope.numContestRequests === 0) {
                        // popup success dialog
                        $scope.openModal({
                            title: 'Result',
                            message: '',
                            showError: false,
                            buttons: ['OK'],
                            enableClose: true
                        }, null, null, 'popupSystemTestResultBase.html');
                        enableUserInput();
                    }
                }
            });

            // set line number visibility
            // comment out for now, there is no line number data
            // $scope.showLineNumber = $scope.userData.showLineNumber ? true : false;

            $scope.settingChanged();
            // enable the editior only when it is at the state helper.STATE_NAME.Coding or PracticeCode.
            enableEditor($scope.currentStateName() === helper.STATE_NAME.Coding || $scope.currentStateName() === helper.STATE_NAME.PracticeCode);
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
        $scope.errorBar = document.getElementsByClassName('errorBar')[0];
        /**
         * Rebuild the error bar.
         */
        /*$scope.sharedObj.rebuildErrorBar = function () {
            // comment out error part for now
            var errorBarHeight = appHelper.getRenderedHeight($scope.errorBar),
                messageHeight = 22;
            if (Math.floor(errorBarHeight / messageHeight) !== $scope.lineNumbers) {
                $scope.lineNumbers = Math.floor(errorBarHeight / messageHeight);
                $scope.errorMessages = $scope.range($scope.lineNumbers);
                $scope.updateErrorMessages(true);
            }
            angular.element($scope.errorBar).css('height',
                    (appHelper.getRenderedHeight($scope.cmElem) - 1) + 'px');
        };*/

        /**
         * Cache the code for plugin api.
         */
        $scope.$watch('code', function (newVal, oldVal) {
            $rootScope.codeForPlugin = $scope.code;
        });
        /**
         * Cache the problem object for plugin api.
         */
        $scope.$watch('problem', function (newVal, oldVal) {
            $rootScope.problemForPlugin = $scope.problem;
        });
        /**
         * Set code from plugin.
         */
        $scope.$on(helper.BROADCAST_PLUGIN_EVENT.setCodeFromPlugin, function (event, data) {
            $scope.code = data;
            $scope.aceEditorInstance.setValue(data);
        });
        /**
         * Search the text from plugin.
         */
        $scope.$on(helper.BROADCAST_PLUGIN_EVENT.searchFromPlugin, function (event, data) {
            $scope.searchText = data;
            $timeout(function () {
                $scope.findNextOccurence();
            }, 10);
        });

        /**
         * Set language from plugin.
         */
        $scope.$on(helper.BROADCAST_PLUGIN_EVENT.setLanguageFromPlugin, function (event, languageName) {
            angular.forEach($scope.languages, function (language, i) {
                if (language.name.toLowerCase() === languageName.toLowerCase()) {
                    $scope.langIdx = i;
                    updateArgTypeAndMethod($scope.lang($scope.langIdx).id);
                }
            });
        });

        /**
         * Compile the code.
         */
        $scope.$on(helper.BROADCAST_PLUGIN_EVENT.compileFromPlugin, function (event) {
            $scope.compileSolution();
        });
        /**
         * Submit the code.
         */
        $scope.$on(helper.BROADCAST_PLUGIN_EVENT.submitFromPlugin, function (event) {
            $scope.submitSolution();
        });
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
