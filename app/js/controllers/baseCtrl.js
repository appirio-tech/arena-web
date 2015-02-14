/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the base controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Added pop up modal.
 * - Handle ForcedLogoutResponse, Disconnected, Connected events.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - System Tests):
 * - Added $filter as an injected service.
 * - Added handler for PopUpGenericResponse to partially handle the Phase Change messages.
 * - Added handler for SingleBroadcastResponse.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Defined global popup modals for global usage.
 * - Fixed the issue of showing duplicate modals.
 * - Moved the function for calculating rating colors from chat widget to enable global usage.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Rating Indicator):
 * - Updated rating-purple to rating-blue in $scope.getRatingClass.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Division Summary):
 * - Added $timeout and socket.
 * - Moved waitingCoderInfo, modalTimeoutPromise, setTimeoutModal and showCoderInfo
 *   from chatAreaCtrl
 * - Updated PopUpGenericResponse handler to cover CoderInfo and Incorrect Usage title.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Now show coderinfo and its corresponding response is global
 * - Fixed tooltip overlapping theme problem
 * - Implemented Enter room messages
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Handle the disconnect logic.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Notifications):
 * - Send GetAdminBroadcastsRequest on the start to get all the broadcast messages.
 * - Add notification messages on the phase change, removed pop-up opening.
 * - Removed SingleBroadcastResponse handling since it is handled in resolver to
 *   create notifications instead of pop-ups.
 * - Added showNotificationDetails to the scope to show notification details in the pop-up.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Change the disconnect message.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena UI - Coder History):
 * - Updated the open modal logic to show coder history info.
 *
 * Changes in version 1.11 (Module Assembly - Web Arena UI - Suvery and Questions Support For Contest Registration):
 * - Updated the logic to support registration survey and questions.
 *
 * Changes in version 1.12 (Web Arena UI - Registrants Dialog Improvement):
 * - Updated popupModalController to handle Registrants Modal
 *
 * Changes in version 1.13 (Module Assembly - Web Arena UI - Contest Creation Wizard):
 * - Added create contest logic.
 *
 * Changes in version 1.14 (Module Assembly - Web Arena Bug Fix 20140909):
 * - Changed the popup location for registration modal.
 *
 * Changes in version 1.15 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Added closeDivSummary, openDivSummary, updateDivSummary, updateRoomSummary from userContestDetailCtrl.js
 *   to have global support for room/division leaderboard table.
 * - Added closeLastDivSummary, getDivSummary, getCurrentLeaderboard, formatScore, showResult, getStatusColor
 *   getCoderHistory, isViewable from userContestDetailCtrl.js to $rootScope to have global support
 *   for room/division leaderboard table.
 * - Added handling leaderboard events from userContestDetailCtrl.js.
 *
 * Changes in version 1.16 (Module Assembly - Web Arena Bug Fix 14.10 - 1):
 * - Fixed issues of the Message Arena.
 *
 * Changes in version 1.17 (Module Assembly - Web Arena Bug Fix 14.10 - 2):
 * - Added sort function in problem field of coder history popup.
 * - Fixed notification url issue.
 * - Added the scroll bar for popup modal detail panel.
 *
 * Changes in version 1.18 (Module Assembly - Web Arena - Quick Fixes for Contest Management)
 * - Added handling of PopUpGenericResponse with titles changeRound and loadRound to handle changing and loading round.
 * - Added methods createContest and updateContest to handle creation and updating of the contest.
 * - Updated method createContestWizzard to include roundDataIn if the contest is updated.
 *
 * Changes in version 1.19 (Web Arena Plugin API Part 2):
 * - Fixed some undefined exceptions.
 *
 * Changes in version 1.20 (Module Assembly - Web Arena Max Live Leaderboard Assembly):
 * - Added new variable exceedLeaderBoardLimit.
 *
 * Changes in version 1.20 (Web Arena SRM Problem Deep Link Assembly):
 * - Added copy link functionality in coder info popup
 *
 * Changes in version 1.21 (Web Arena - Leaderboard Performance Improvement):
 * - Added functions leaderboardViewChangeHandler, leaderboardRefreshHandler and
 * injectLeaderboardRefresher to $rootScope to handle the updates of the leaderboards
 * and improve the performance.
 *
 * Changes in version 1.22 (Web Arena - Run System Testing Support For Practice Problems):
 * - Added the custom css for popup dialog.
 * - Fixed the null pointer exception in popup dialog.
 *
 * Changes in version 1.23 (TopCoder Competition Engine - Improve Automated Notification Messages)
 * - If there is no buttons Phase change PopupGenericResponse won't be handled.
 * Because these notifications are already handled based on PhaseDataResponse
 *
 * Changes in version 1.24 (Web Arena - Update Match Summary Tab Within Active Matches Widget):
 * - Added shown match summary in active matches widget logic.
 *
 * Changes in version 1.25 (Web Arena - Recovery From Lost Connection)
 * - Added logic to popup dialog after lost connection.
 *
 * Changes in version 1.26 (Replace ng-scrollbar with prefect-scrollbar):
 * - Fix to support the perfect-scrollbar in notification message pop window
 *
 * Changes in version 1.27 (Web Arena - Replace Code Mirror With Ace Editor):
 * - Reused theme constants from helper.
 *
 * @author dexy, amethystlei, ananthhh, flytoj2ee, xjtufreeman, MonicaMuranyi
 * @version 1.27
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*jslint plusplus: true*/
/*global document, angular:false, $:false, module, window, require*/

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper'),
    /**
     * The object containing configurable constants.
     * @type {exports}
     */
    config = require('../config'),
    contestCreationCtrl = require('./contestCreationCtrl');

/**
 * The base controller.
 *
 * @type {*[]}
 */
var baseCtrl = ['$rootScope', '$scope', '$http', 'appHelper', 'notificationService', '$modal', '$state', 'themer', '$cookies', 'socket', '$timeout', '$window', '$filter', 'sessionHelper', function ($rootScope, $scope, $http, appHelper, notificationService, $modal, $state, themer, $cookies, socket, $timeout, $window, $filter, sessionHelper) {
    var /**
         * The modal controller.
         *
         * @type {*[]}
         */
        popupModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', 'cancel', '$timeout', function ($scope, $modalInstance, data, ok, cancel, $timeout) {
            $scope.title = data.title;
            $scope.message = data.message.replace(/(\r\n|\n|\r)/gm, "<br/>");
            $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
            $scope.enableClose = data.enableClose;
            $scope.coderInfo = data.message;
            $scope.coderInfoLink = data.coderInfoLink;
            $scope.coderHistoryData = data.coderHistoryData;
            $scope.registrants = data.registrants;
            $scope.numCoderRequest = 0;
            $scope.showError = data.showError;

            // define initial sorting order for registrants list
            $scope.registrantPredicate = 'userRating';

            $timeout(function () {
                $scope.$broadcast('popup-message-loaded');
            }, 100);

            var i, j, popupDetailModalCtrl;
            if ($scope.title === 'Event Registration' && !(data.registrantCallBack && data.registrantCallBack === true)) {

                $scope.surveyMessage = data.surveyMessage ? data.surveyMessage.replace(/(\r\n|\n|\r)/gm, "<br/>") : '';
                $timeout(function () {
                    $scope.$broadcast('rebuild:userRegistration');
                }, 100);

                $scope.answerText = "";
                $scope.surveyQuestions = data.surveyQuestions;

                $rootScope.generalQuestions = [];
                $rootScope.eligibilityQuestions = [];
                if (data.surveyQuestions) {
                    for (i = 0; i < data.surveyQuestions.length; i++) {
                        if (data.surveyQuestions[i].questionType === 2) {
                            data.surveyQuestions[i].answers = [];
                            for (j = 0; j < data.surveyQuestions[i].answerText.length; j++) {
                                data.surveyQuestions[i].answers.push('');
                            }
                        } else {
                            data.surveyQuestions[i].answer = "";
                        }

                        if (data.surveyQuestions[i].answerText.length !== 0) {
                            if (data.surveyQuestions[i].eligibleQuestion && data.surveyQuestions[i].eligibleQuestion === true) {
                                $rootScope.eligibilityQuestions.push(data.surveyQuestions[i]);
                            } else {
                                $rootScope.generalQuestions.push(data.surveyQuestions[i]);
                            }
                        }
                    }
                }
            }

            /**
             * rebuild code info bar
             */
            $modalInstance.opened.then(function () {
                $timeout(function () {
                    $scope.$broadcast('rebuild:codeInfo');
                    $scope.$broadcast('rebuild:registrantsList');
                });
            });

            /**
             * OK handler.
             */
            $scope.ok = function () {
                ok();
                if ($scope.title !== 'Event Registration' && $scope.message.indexOf('You have made a change to your code since the last time you compiled. Do you want to continue with the submit?') === -1) {
                    $modalInstance.close();
                }
            };

            /**
             * Cancel handler.
             */
            $scope.cancel = function () {
                cancel();
                $modalInstance.dismiss('cancel');
            };

            $scope.orderField = 'componentValue';

            /**
             * Sort by problem default point.
             */
            $scope.sortByProblemPoint = function () {
                if ($scope.orderField.indexOf('-') === 0) {
                    $scope.orderField = $scope.orderField.substring(1);
                } else {
                    $scope.orderField = '-' + $scope.orderField;
                }
            };

            /**
             * The problem default point sort order.
             * @returns {boolean} the sort order.
             */
            $scope.isSortByProblemPoint = function () {
                return ($scope.orderField.indexOf('-') === 0);
            };

            popupDetailModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', function ($scope, $modalInstance, data, ok) {
                $scope.title = data.title;
                $scope.message = data.detail;
                $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
                $scope.enableClose = true;
                $timeout(function () {
                    $scope.$broadcast('rebuild:popupModalDetail');
                }, 100);

                $scope.ok = function () {
                    ok();
                    $modalInstance.close();
                };
            }];
            /**
             * Open the user history detail modal.
             * @param data - the data value
             * @param handle - the handle function
             * @param finish - the finish function
             */
            $scope.openDetailModal = function (data, handle, finish) {
                $modal.open({
                    templateUrl: 'popupModalDetailBase.html',
                    controller: popupDetailModalCtrl,
                    backdrop: 'static',
                    resolve: {
                        data: function () {
                            return data;
                        },
                        ok: function () {
                            return function () {
                                if (angular.isFunction(handle)) {
                                    handle();
                                }
                            };
                        },
                        cancel: function () {
                            return function () {
                                if (angular.isFunction(finish)) {
                                    finish();
                                }
                            };
                        }
                    }
                });
            };
            /*jslint unparam: true*/
            $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
                if (data.title === helper.POP_UP_TITLES.CoderInfo && $scope.title === helper.POP_UP_TITLES.CoderInfo) {
                    $scope.coderInfo = data.message;
                }
            });
            /*jslint unparam: true*/
        }],
        isDisconnecting = false,
        closeThemeHandler = function (event) {
            // the depth of DOM tree rooted at the element with id 'themePanel'
            var themePanelDOMDepth = 4;
            if (!appHelper.clickOnTarget(event.target, 'themePanel', themePanelDOMDepth)) {
                if (appHelper.clickOnTarget(event.target, 'iconTS', 1)) {
                    event.preventDefault();
                }
                $scope.cancelTheme();
            }
        },
        selTheme,
        waitingCoderInfo = false,
        coderInfoUsername = '',
        modalTimeoutPromise = null,
        phaseChangeRoundId,
        /**
         * Close the division summary.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        closeDivSummary = function (roundID, divisionID) {
            if (angular.isDefined($rootScope.lastDivSummary)) {
                socket.emit(helper.EVENT_NAME.CloseDivSummaryRequest, {
                    roundID: roundID,
                    divisionID: divisionID
                });
            }
        },
        /**
         * Open the division summary.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        openDivSummary = function (roundID, divisionID) {
            socket.emit(helper.EVENT_NAME.DivSummaryRequest, {
                roundID: roundID,
                divisionID : divisionID
            });
            $rootScope.lastDivSummary = {
                roundID: roundID,
                divisionID: divisionID
            };
        },

        /**
         * Update the division summary.
         *
         * @param roundID the round id
         * @param divisionID the division id
         */
        updateDivSummary = function (roundID, divisionID) {
            var il;
            $rootScope.leaderboard = [];
            if (angular.isDefined($rootScope.roundData) && angular.isDefined($rootScope.roundData[roundID])
                    && angular.isDefined($rootScope.roundData[roundID].coderRooms)) {
                angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
                    if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID
                            && angular.isDefined($rootScope.roomData[coderRoom.roomID])
                            && angular.isDefined($rootScope.roomData[coderRoom.roomID].coders)) {
                        angular.forEach($rootScope.roomData[coderRoom.roomID].coders, function (coder) {
                            coder.roomID = coderRoom.roomID;
                        });
                        $rootScope.leaderboard = $rootScope.leaderboard.concat($rootScope.roomData[coderRoom.roomID].coders);
                    }
                });
            }
            if ($rootScope.leaderboard.length > 0) {
                $rootScope.leaderboard.sort(function (coderA, coderB) {
                    return coderB.totalPoints - coderA.totalPoints;
                });
                $rootScope.leaderboard[0].divPlace = 1;
                for (il = 1; il < $rootScope.leaderboard.length; il += 1) {
                    if ($rootScope.leaderboard[il].totalPoints === $rootScope.leaderboard[il - 1].totalPoints) {
                        $rootScope.leaderboard[il].divPlace = $rootScope.leaderboard[il - 1].divPlace;
                    } else {
                        $rootScope.leaderboard[il].divPlace = (il + 1);
                    }
                }
            }
            $rootScope.isDivLoading = false;
            $rootScope.currentlyLoaded = 0;
            angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
                if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID) {
                    if (coderRoom.isLoading) {
                        $rootScope.isDivLoading = true;
                    } else {
                        $rootScope.currentlyLoaded += 1;
                    }
                }
            });
            $rootScope.$broadcast('rebuild:loadingCounter');
            $timeout.cancel($rootScope.ldrbrdTimeoutPromise);
            $rootScope.ldrbrdTimeoutPromise = $timeout(function () {
                $rootScope.$broadcast('rebuild:leaderboardTable');
            }, helper.LEADERBOARD_TABLE_REBUILT_TIMEGAP);
            $rootScope.$broadcast(helper.EVENT_NAME.LeaderboardRefreshed);

            if (!angular.isDefined($rootScope.allLeaderboards)) {
                $rootScope.allLeaderboards = {};
            }
            $rootScope.allLeaderboards[roundID + '-' + divisionID] = $rootScope.leaderboard;
        },
        /**
         * Update the room summary.
         * It only checks if the current opened division summary (if any) should be updated
         * if the room with roomID is updated. It then calls updateDivSummary.
         *
         * @param roomID the room id
         */
        updateRoomSummary = function (roomID) {
            var updatedDivSummary = false;
            if ($rootScope.lastDivSummary !== undefined) {
                if (angular.isDefined($rootScope.roundData) && angular.isDefined($rootScope.lastDivSummary.roundID)
                        && angular.isDefined($rootScope.roundData[$rootScope.lastDivSummary.roundID].coderRooms)) {
                    angular.forEach($rootScope.roundData[$rootScope.lastDivSummary.roundID].coderRooms, function (coderRoom) {
                        if (coderRoom.roomID === roomID
                                && coderRoom.divisionID === Number($rootScope.lastDivSummary.divisionID)
                                && coderRoom.roundID === Number($rootScope.lastDivSummary.roundID)) {
                            coderRoom.isLoading = false;
                            updatedDivSummary = true;
                        }
                    });
                }
            }
            if (updatedDivSummary) {
                updateDivSummary(Number($rootScope.lastDivSummary.roundID), Number($rootScope.lastDivSummary.divisionID));
            }
        },
        /**
         * Update the leaderboard.
         * @param scope the scope where the leaderboard is in
         * @param moveToFirstPage true if the leaderboard should show its first page
         */
        updateLeaderboard = function (scope, moveToFirstPage) {
            var begin;
            if (moveToFirstPage) {
                scope.currentPage = 0;
            }
            begin = scope.currentPage * scope.numOfPage;
            scope.leaderboardFiltered = $filter('filter')($rootScope.leaderboard, scope.currentKeys.lbFilter);
            scope.leaderboardFiltered = $filter('orderBy')(scope.leaderboardFiltered, scope.currentKeys.leaderboardKey);
            scope.leaderboardPageRange = scope.range(scope.leaderboardFiltered, scope.numOfPage);
            scope.leaderboardToShow = scope.leaderboardFiltered.slice(begin, begin + scope.numOfPage);
            if (scope.rebuildScrollbars) {
                $timeout(function () {
                    scope.rebuildScrollbars();
                }, helper.LEADERBOARD_TABLE_REBUILT_TIMEGAP);
            }
        };

    // modal defined in the root scope can be used by other scopes.
    $rootScope.currentModal = null;
    socket.emit(helper.EVENT_NAME.GetAdminBroadcastsRequest, {});

    // used to define if exceeds the leaderboard limit
    $rootScope.exceedLeaderBoardLimit = appHelper.exceedLeaderBoardLimit;

    /**
     * Open modal function.
     *
     * @param data the data
     * @param handle the handler
     * @param finish the finish function
     */
    $scope.openModal = function (data, handle, finish, templateUrl) {
        var cssName = '';
        if ($rootScope.currentModal) {
            $rootScope.currentModal.dismiss('cancel');
            $rootScope.currentModal = undefined;
        }
        if (!templateUrl) {
            templateUrl =  'popupModalBase.html';
        }

        if (templateUrl === 'partials/user.contest.registration.html') {
            cssName = 'marginTop';
        }
        if (templateUrl === 'popupSystemTestResultBase.html') {
            cssName = 'systemTestResult';
        }
        $rootScope.currentModal = $modal.open({
            templateUrl: templateUrl,
            windowClass: cssName,
            controller: popupModalCtrl,
            backdrop: 'static',
            resolve: {
                data: function () {
                    return data;
                },
                ok: function () {
                    return function () {
                        if (angular.isFunction(handle)) {
                            handle();
                        }
                        if (templateUrl !== 'partials/user.contest.registration.html') {
                            $rootScope.currentModal = undefined;
                        }
                    };
                },
                cancel: function () {
                    return function () {
                        if (angular.isFunction(finish)) {
                            finish();
                        }
                        $rootScope.currentModal = undefined;
                    };
                }
            }
        });
    };


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
        waitingCoderInfo = false;
    }

    /**
     * Requests to show coder info.
     *
     * @param {string} name the name of the user
     * @param {string} userType the user type
     */
    $rootScope.showCoderInfo = function (name, userType) {
        if (waitingCoderInfo) {
            return;
        }
        waitingCoderInfo = true;
        coderInfoUsername = name;
        $scope.numCoderRequest = 1;
        if (modalTimeoutPromise) {
            $timeout.cancel(modalTimeoutPromise);
        }
        $scope.openModal({
            title: helper.POP_UP_TITLES.CoderInfo,
            message: " ",
            coderInfoLink: 'http://www.topcoder.com/member-profile/' + coderInfoUsername + '/algorithm/',
            enableClose: true
        }, null, null, 'partials/user.chat.area.coderinfo.html');
        modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
        socket.emit(helper.EVENT_NAME.CoderInfoRequest, {coder: name, userType: userType});
    };
    /*jslint unparam: true*/
    $scope.$on(helper.EVENT_NAME.ForcedLogoutResponse, function (event, data) {
        $rootScope.forcedLogout = true;
        $scope.openModal({
            title: helper.POP_UP_TITLES.ForcedLogout,
            message: helper.POP_UP_MESSAGES.ForcedLogout,
            enableClose: true
        }, null, function () {
            $state.go(helper.STATE_NAME.Logout);
        });
    });
    /**
     * Popup reconnection dialog.
     */
    $scope.popupReconnectDialog = function () {
        $scope.openModal({
            title: helper.POP_UP_TITLES.Reconnect,
            message: helper.POP_UP_MESSAGES.Reconnect,
            enableClose: true,
            buttons: ['Reconnect', 'Ignore']
        }, function () {
            if ($rootScope.reconnected) {
                $rootScope.loginPendingCount = 1;
                socket.emit(helper.EVENT_NAME.SSOLoginRequest, {sso: sessionHelper.getTcsso()});
            }
        });
    };
    // disconnected event
    $scope.$on(helper.EVENT_NAME.Disconnected, function (event, data) {
        if (!isDisconnecting) {
            isDisconnecting = true;
            $rootScope.isClosedDisconnectDialog = false;
            $rootScope.reconnected = false;
            // if already forced logout, it's unnecessary to connect again
            if (!$rootScope.forcedLogout) {
                $scope.openModal({
                    title: helper.POP_UP_TITLES.Disconnected,
                    message: helper.POP_UP_MESSAGES.LostConnection,
                    enableClose: true,
                    buttons: ['OK']
                }, null, function () {
                    // already reconnected, popup dialog to relogin
                    if ($rootScope.reconnected) {
                        $scope.popupReconnectDialog();
                    }

                    $rootScope.isClosedDisconnectDialog = true;
                });
            }
        }
    });
    // connected event
    $scope.$on(helper.EVENT_NAME.Connected, function (event, data) {
        if (isDisconnecting) {
            isDisconnecting = false;
            $rootScope.reconnected = true;

            if ($rootScope.isClosedDisconnectDialog && !$rootScope.forcedLogout) {
                $scope.popupReconnectDialog();
            }
        }
    });

    $scope.$on(helper.EVENT_NAME.EmitInOfflineMode, function (event, data) {
        if ($rootScope.isClosedDisconnectDialog) {
            $scope.openModal({
                title: 'Error',
                message: 'The network is unavailable and it is in offline mode now.',
                enableClose: true,
                buttons: ['Close']
            });
        }
    });
    $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
        var roundName;
        // handle phase change messages
        if (data.title === helper.POP_UP_TITLES.PhaseChange) {
            if (data.buttons) {
                data.enableClose = true;
                roundName = angular.isDefined($rootScope.roundData) && angular.isDefined($rootScope.roomData)
                                && angular.isDefined($rootScope.roomData[data.moveData[1]])
                                && angular.isDefined($rootScope.roundData[$rootScope.roomData[data.moveData[1]].roundID])
                                ? $rootScope.roundData[$rootScope.roomData[data.moveData[1]].roundID].contestName : '';
                angular.forEach($rootScope.roundData, function (round) {
                    angular.forEach(round.coderRooms, function (room) {
                        if (room.roomID === data.moveData[1]) {
                            phaseChangeRoundId = round.roundID;
                        }
                    });
                });
                notificationService.addNotificationMessage({
                    type: 'round',
                    roundName: roundName,
                    time: Date.now(),
                    message: data.message,
                    popUpContent: data.message,
                    action : {
                        question: '',
                        target: '#/u/contests/' + phaseChangeRoundId + '/room'
                    }
                });
            }
            // must reload after adding new messages to support custom scrollbar.
            $scope.$broadcast('reload:messages');
        } else if (data.title === helper.POP_UP_TITLES.CoderInfo) {
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            waitingCoderInfo = false;
            $scope.numCoderRequest = 0;
        } else if (data.title === helper.POP_UP_TITLES.IncorrectUsage) {
            $scope.openModal({
                title: helper.POP_UP_TITLES.IncorrectUsage,
                message: data.message,
                enableClose: true
            });
        } else if (data.title === helper.POP_UP_TITLES.RoundAccessError) {
            $scope.openModal({
                title: helper.POP_UP_TITLES.RoundAccessError,
                message: data.message,
                enableClose: true
            });
        } else if (data.title === helper.POP_UP_TITLES.ChangeRoundError) {
            $scope.openModal({
                title: helper.POP_UP_TITLES.ChangeRoundError,
                message: data.message,
                enableClose: true
            });
        }
    });
    /*jslint unparam: false*/
    // theme selector
    $scope.themesInfo = [];
    $cookies.themeInUse = ($cookies.themeInUse === null || $cookies.themeInUse === undefined) ? helper.ARENA_THEME.DARK.key : $cookies.themeInUse;
    $scope.themeInUse = $scope.themeBackup = $cookies.themeInUse;
    themer.setSelected($scope.themeInUse);
    $scope.themePanelOpen = false;
    $http.get('data/themes.json').success(function (data) {
        $scope.themesInfo = data;
        $cookies.themeInUse = ($cookies.themeInUse === null || $cookies.themeInUse === undefined) ? data.currentKey : $cookies.themeInUse;
        $scope.themeInUse = $scope.themeBackup = $cookies.themeInUse;
        themer.styles.pop();
        var i = 0;
        for (i = 0; i < data.themes.length; i += 1) {
            themer.styles.push(data.themes[i]);
        }
        themer.setSelected($cookies.themeInUse);
    });
    if ($cookies.themeInUse !== null && $cookies.themeInUse !== undefined) {
        selTheme = themer.getSelected();
        $cookies.themeLabel = selTheme.label;
        $cookies.themeHref = selTheme.href;
    }
    $scope.closeThemeSelector = function () {
        $scope.themePanelOpen = false;
        document.removeEventListener('click', closeThemeHandler);
    };
    $scope.cancelTheme = function () {
        $scope.themeInUse = $scope.themeBackup;
        $scope.closeThemeSelector();
    };
    $scope.applyTheme = function () {
        var selectedTheme = themer.getSelected();
        $scope.themeBackup = $cookies.themeInUse = $scope.themeInUse;
        themer.setSelected($scope.themeInUse);
        selectedTheme = themer.getSelected();
        $cookies.themeLabel = selectedTheme.label;
        $cookies.themeHref = selectedTheme.href;
        $scope.closeThemeSelector();
    };
    $scope.openThemeSelector = function (event) {
        $scope.closeQtip();
        if ($scope.themePanelOpen) {
            $scope.cancelTheme();
            return;
        }
        $scope.themeInUse = $scope.themeBackup;
        $scope.themePanelOpen = true;
        // close if clicked outside of the panel
        document.addEventListener('click', closeThemeHandler);
        event.stopPropagation();
    };
    // theme selector ends

    // notification starts
    // indicate whether the notification list is open
    $scope.isReading = false;
    // for child scopes to use notificationService
    $scope.notificationService = notificationService;
    // the notification list is a qtip, see directives/meesageArena.js for details
    $scope.qtipNoti = $('#qtipNoti');
    // close the notification list
    $scope.closeQtip = function () {
        $scope.qtipNoti.qtip('toggle', false);
    };
    window.onresize = function () {
        $scope.closeQtip();
    };
    // notification ends
    // check window size, reset message arena's position
    function checkPosition() {
        if (document.body.clientWidth > 991) {
            $scope.qtipNoti.qtip('api').set({
                'position.my': 'top right',
                'position.at': 'bottom right',
                'position.adjust.x': 46
            });
        }
        if (document.body.clientWidth < 992) {
            $scope.qtipNoti.qtip('api').set({
                'position.my': 'top center',
                'position.at': 'bottom center',
                'position.adjust.x': -2
            });
        }
        if (document.body.clientWidth < 361) {
            $scope.qtipNoti.qtip('api').set({
                'position.adjust.x': -25
            });
        }
        if (document.body.clientWidth < 332) {
            $scope.qtipNoti.qtip('api').set({
                'position.adjust.x': -37
            });
        }
    }
    $scope.onClickMessageArena = function () {
        notificationService.clearUnRead();
        checkPosition();
        // Hide all notifications
        var $notifications = $('.alert');
        $notifications.children('.close').trigger('click');
    };
    $scope.changeNotificationType = function (type) {
        $scope.notificationType = type;
        $scope.$broadcast("rebuild:messages");
    };

    /**
     * Opens pop up with notification details.
     *
     * @param notification the notification being opened
     */
    $scope.showNotificationDetails = function (notification) {
        var okClicked = function () {
                if (angular.isDefined(notification.action) && angular.isDefined(notification.action.target)
                        && notification.action.target.length > 0) {
                    $window.location.href = notification.action.target + "/";
                }
            },
            buttons = ((angular.isDefined(notification.action) && angular.isDefined(notification.action.target)
                    && notification.action.target.length > 0)) ? ['Yes', 'No'] : [];
        $scope.openModal({
            title: helper.NOTIFICATION_TITLES[notification.type],
            message: notification.messageHTML,
            buttons: buttons,
            enableClose: true
        }, okClicked);
    };

    /**
     * Opens contest creation wizard.
     *
     * @param roundData the round data, if it creates new contest roundData should be undefined
     */
    function createContestWizzard(roundData) {
        $rootScope.currentModal = $modal.open({
            templateUrl: '../../../partials/contestCreationWizard.html',
            controller: contestCreationCtrl,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                ok: function () {
                    return function () {
                        $rootScope.currentModal = undefined;
                    };
                },
                cancel: function () {
                    return function () {
                        $rootScope.currentModal = undefined;
                    };
                },
                roundDataIn: function () {
                    return roundData;
                }
            }
        });
    }
    /**
     * Opens contest creation wizard to create new contest.
     *
     * @since 1.18
     */
    $scope.createContest = function () {
        createContestWizzard(undefined);
    };

    /**
     * Updates the existing contest.
     *
     * @param roundData the round data
     *
     * @since 1.18
     */
    $scope.updateContest = function (roundData) {
        createContestWizzard(roundData);
    };

    /**
     * Logout.
     */
    $scope.logout = function () {
        if (appHelper.isExistingCodeInLocalStorage()) {
            $scope.openModal({
                title: 'Warning',
                message: 'Would you like to clear your cache code in browser?',
                buttons: ['Yes', 'No'],
                enableClose: true
            }, function () {
                // clear the cache here
                appHelper.removeCurrentCodeInLocalStorage();
                $state.go(helper.STATE_NAME.Logout);
            }, function () {
                $state.go(helper.STATE_NAME.Logout);
            });
        } else {
            $state.go(helper.STATE_NAME.Logout);
        }
    };

    $rootScope.isDivLoading = false;
    /**
     * Close the last opened division summary.
     */
    $rootScope.closeLastDivSummary = function () {
        if (angular.isDefined($rootScope.lastDivSummary)) {
            closeDivSummary($rootScope.lastDivSummary.roundID, $rootScope.lastDivSummary.divisionID);
        }
        $rootScope.lastDivSummary = undefined;
    };

    $rootScope.notifyCopyLink = function () {
        $('.top-right').notify({
            message: 'Link is ready to be pasted.',
            type: 'copy',
            fadeOut: {
                enabled: true,
                delay: 5000
            }
        }).show();
    };
    /**
     * Get the division summary.
     * It is first sending close div summary for the summary we want to open.
     * NOTE: This is the behavior of the Arena applet.
     *
     * @param roundID the round id
     * @param divisionID the division id
     */
    $rootScope.getDivSummary = function (roundID, divisionID) {
        if (angular.isDefined($rootScope.lastDivSummary) && angular.isDefined(angular.isDefined($rootScope.lastDivSummary.roundID))
                && angular.isDefined($rootScope.lastDivSummary.divisionID)
                && $rootScope.lastDivSummary.roundID === roundID && $rootScope.lastDivSummary.divisionID === divisionID) {
            return;
        }
        $rootScope.closeLastDivSummary();
        $rootScope.currentlyLoaded = 0;
        $rootScope.totalLoading = 0;
        $rootScope.isDivLoading = true;
        $rootScope.leaderboard = [];
        angular.forEach($rootScope.roundData[roundID].coderRooms, function (coderRoom) {
            if (coderRoom.divisionID === divisionID && coderRoom.roundID === roundID) {
                coderRoom.isLoading = true;
                $rootScope.totalLoading += 1;
            }
        });
        if ($rootScope.totalLoading === 0) {
            $rootScope.isDivLoading = false;
        }
        closeDivSummary(roundID, divisionID);
        $timeout(function () {
            openDivSummary(roundID, divisionID);
        }, helper.DIVSUMMARYREQUEST_TIMEGAP);
    };
    /*jslint unparam:true*/
    // Handlers for leaderboard table events
    $rootScope.$on(helper.EVENT_NAME.UpdateCoderComponentResponse, function (event, data) {
        updateRoomSummary(data.roomID);
    });
    $rootScope.$on(helper.EVENT_NAME.UpdateCoderPointsResponse, function (event, data) {
        updateRoomSummary(data.roomID);
    });
    $rootScope.$on(helper.EVENT_NAME.CreateChallengeTableResponse, function (event, data) {
        updateRoomSummary(data.roomID);

        if (!angular.isDefined($rootScope.pendingDivSummary)) {
            $rootScope.loadedAllDivSummary = true;
        }
        if ($rootScope.currentlyLoaded === $rootScope.totalLoading && angular.isDefined($rootScope.pendingDivSummary)) {
            var tmp = $rootScope.pendingDivSummary;
            $rootScope.pendingDivSummary = undefined;
            $rootScope.getDivSummary(tmp.roundID, tmp.viewId);
        }
    });
    /*jslint unparam:false*/
    /**
     * Get the selected leader board.
     *
     * @param viewOn the view which can be 'room', 'divOne', 'divTwo'
     * @param roomID the room id
     * @returns {Array} the leader board
     */
    $rootScope.getCurrentLeaderboard = function (viewOn, roomID) {
        if (angular.isUndefined($rootScope.roomData)
                || angular.isUndefined($rootScope.roomData[roomID])) {
            return [];
        }
        if (viewOn === 'room') {
            return $rootScope.roomData && $rootScope.roomData[roomID] ? $rootScope.roomData[roomID].coders : [];
        }
        if (viewOn === 'divOne' || viewOn === 'divTwo') {
            return angular.isDefined($rootScope.leaderboard) ? $rootScope.leaderboard : [];
        }

        return [];
    };

    /**
     * Get round leaderboard by round id and view.
     * @param roundID the round id.
     * @param viewOn the view
     * @returns {*} the leaderboard result
     */
    $rootScope.getRoundLeaderboard = function (roundID, viewOn) {
        if (!angular.isDefined($rootScope.allLeaderboards)) {
            return [];
        }
        var key = roundID + '-' + helper.VIEW_ID[viewOn];

        if (!angular.isDefined($rootScope.allLeaderboards[key])) {
            return [];
        }

        return $rootScope.allLeaderboards[key];
    };

    /**
     * Get the score for display by dividing 100 and round at two digits after the decimal point.
     *
     * @param score the score multiplied by 100
     * @returns {string} the score for display
     */
    $rootScope.formatScore = function (score) {
        return (score * 0.01).toFixed(2);
    };

    /**
     * Get the result to display on the room/division summary table for a coder component.
     *
     * @param component the coder component object
     * @param showBy 'points' or 'status'
     * @returns {string} the string indicating the coder component
     */
    $rootScope.showResult = function (component, showBy) {
        if (component.status < helper.CODER_PROBLEM_STATUS_ID.NOT_CHALLENGED) {
            // Not submitted, show status
            return helper.CODER_PROBLEM_STATUS_NAME[component.status];
        }
        // show points when:
        // 1) user wants to show by points; or
        // 2) the problem is submitted but not challenged nor system tested
        if (showBy === 'points' || component.status <= helper.CODER_PROBLEM_STATUS_ID.CHALLENGE_FAILED) {
            return $rootScope.formatScore(component.points);
        }
        // show status
        return helper.CODER_PROBLEM_STATUS_NAME[component.status];
    };

    /**
     * Get the css class for the color of the component status.
     *
     * @param component the component
     * @param languageID the id of the language
     * @returns {string} the css class name
     */
    $rootScope.getStatusColor = function (status, languageID) {
        var statusName = helper.CODER_PROBLEM_STATUS_NAME[status],
            className = 'color' + statusName;
        if (statusName === 'Submitted' || statusName === 'Challenged'
                || statusName === 'Failed' || statusName === 'Passed') {
            className += helper.LANGUAGE_NAME[languageID];
        }
        return className;
    };

    /**
     * Get coder history.
     *
     * @param coder - the coder.
     */
    $rootScope.getCoderHistory = function (coder) {
        socket.emit(helper.EVENT_NAME.CoderHistoryRequest, {
            handle: coder.userName,
            userType: coder.userType || 1,
            historyType: -1,
            roomID: coder.roomID || $rootScope.currentRoomInfo.roomID
        });
    };

    /**
     * Check if the code of the component can be viewed by the user.
     *
     * @param phaseType the phase type
     * @param component the component
     * @returns {boolean} true if the component can be viewed
     */
    $rootScope.isViewable = function (phaseType, component) {
        // cannot view when phase is not challenge or after.
        if (phaseType < helper.PHASE_TYPE_ID.ChallengePhase) {
            return false;
        }
        // cannot view if it is not submitted.
        if (component.status < helper.CODER_PROBLEM_STATUS_ID.NOT_CHALLENGED) {
            return false;
        }
        return true;
    };

    /**
     * Views the code after the challenge phase starts.
     *
     * @param phaseType current phase type
     * @param roundID the round id
     * @param divisionID the division id
     * @param componentID the component id
     * @param roomID the room id
     * @param username the name of the coder which solution is opened
     * @param lastPage last page in the navigation ('details', 'contest')
     */
    $rootScope.viewCode = function (phaseType, roundID, divisionID, componentID, roomID, username, lastPage) {
        if (phaseType >= helper.PHASE_TYPE_ID.ChallengePhase) {
            $scope.$state.go(helper.STATE_NAME.ViewCode, {
                roundId: roundID,
                divisionId: divisionID,
                componentId: componentID,
                roomId: roomID,
                defendant: username,
                page: lastPage
            });
        }
    };

    /**
     * Handles the event when the leaderboard's view is changed except for the case the that the
     * username filter is changed.
     *
     * @param scope the $scope where the leaderboard is in
     * @param newValues the new values of the leaderboard settings
     * @param oldValues the old values of the leaderboard settings
     */
    $rootScope.leaderboardViewChangeHandler = function (scope, newValues, oldValues) {
        scope.refresher.addEvent({
            moveToFirstPage: !angular.equals(newValues.currentKeys.lbFilter, oldValues.currentKeys.lbFilter),
            updateNow: true
        });
    };

    /**
     * Handles the event when the leaderboard is going to refresh.
     * @param scope the $scope where the leaderboard is in.
     * @param options the options of the refresh, "updateNow" and "moveToFirstPage" are possible boolean options.
     */
    $rootScope.leaderboardRefreshHandler = function (scope, options) {
        scope.refresher.addEvent(options);
    };

    /**
     * Injects a periodic refresher to a given $scope.
     * @param scope the $scope where the leaderboard is in.
     */
    $rootScope.injectLeaderboardRefresher = function (scope) {
        scope.refresher = {
            counter: 0,
            refreshGap: Number(config.leaderboardRefreshTimeGap),
            scope: scope,
            /**
             * Adds a refresh event with options.
             * @param options the options
             */
            addEvent: function (options) {
                this.counter += 1;
                if (options && options.updateNow) {
                    this.refresh(options);
                }
            },
            /**
             * Refreshes the scope's leaderboard with the given options.
             * @param options the options to use
             */
            refresh: function (options) {
                if (this.counter > 0 || (options && options.updateNow)) {
                    updateLeaderboard(this.scope, options && options.moveToFirstPage);
                    this.counter = 0;
                }
            },
            /**
             * Refreshes the leaderboard periodically.
             */
            refreshPeriodically: function () {
                if (this.stopped) {
                    return;
                }
                this.refresh(false);
                var that = this;
                $timeout(function () {
                    that.refreshPeriodically();
                }, this.refreshGap);
            },
            stop: function () {
                this.stopped = true;
            }
        };
        scope.refresher.refreshPeriodically();
    };

    // Show the coder history.
    socket.on(helper.EVENT_NAME.CoderHistoryResponse, function (data) {
        var i, tmpDate, coderHistoryData = [];

        for (i = 0; i < data.historyData.length; i++) {
            tmpDate = new Date(data.historyData[i].time);

            coderHistoryData.push({"time": $filter('date')(tmpDate, helper.DATE_NOTIFICATION_FORMAT) + ' ' + $rootScope.timeZone,
                "actionDescription": data.historyData[i].actionDescription, "userName": data.historyData[i].coder.userName,
                "userRating": data.historyData[i].coder.userRating,
                "componentValue": data.historyData[i].componentValue, "points": data.historyData[i].points, "detail": data.historyData[i].detail});
        }

        $scope.openModal({
            title: 'Coder History',
            coderHistoryData: coderHistoryData,
            message: ''
        }, null, null, 'partials/user.code.history.html');
    });
}];

module.exports = baseCtrl;
