/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
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
 * @author dexy, amethystlei
 * @version 1.4
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global document, angular:false, $:false, module, window*/

/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The base controller.
 *
 * @type {*[]}
 */
var baseCtrl = ['$rootScope', '$scope', '$http', 'appHelper', 'notificationService', 'connectionService', '$modal', '$state', 'themer', '$cookies', '$filter', function ($rootScope, $scope, $http, appHelper, notificationService, connectionService, $modal, $state, themer, $cookies, $filter) {
    var /**
         * The modal controller.
         *
         * @type {*[]}
         */
        popupModalCtrl = ['$scope', '$modalInstance', 'data', 'ok', 'cancel', function ($scope, $modalInstance, data, ok, cancel) {
            $scope.title = data.title;
            $scope.message = data.message.replace(/(\r\n|\n|\r)/gm, "<br/>");
            $scope.buttons = data.buttons && data.buttons.length > 0 ? data.buttons : ['Close'];
            $scope.enableClose = data.enableClose;

            /**
             * OK handler.
             */
            $scope.ok = function () {
                ok();
                $modalInstance.close();
            };

            /**
             * Cancel handler.
             */
            $scope.cancel = function () {
                cancel();
                $modalInstance.dismiss('cancel');
            };
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
        selTheme;

    // modal defined in the root scope can be used by other scopes.
    $rootScope.currentModal = null;

    /**
     * Open modal function.
     *
     * @param data the data
     * @param handle the handler
     * @param finish the finish function
     */
    $scope.openModal = function (data, handle, finish) {
        if ($rootScope.currentModal) {
            $rootScope.currentModal.dismiss('cancel');
            $rootScope.currentModal = undefined;
        }

        $rootScope.currentModal = $modal.open({
            templateUrl: 'popupModalBase.html',
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
                        $rootScope.currentModal = undefined;
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
    /*jslint unparam: true*/
    $scope.$on(helper.EVENT_NAME.ForcedLogoutResponse, function (event, data) {
        $scope.openModal({
            title: helper.POP_UP_TITLES.ForcedLogout,
            message: helper.POP_UP_MESSAGES.ForcedLogout,
            enableClose: true
        }, null, function () {
            $state.go(helper.STATE_NAME.Logout);
        });
    });
    $scope.$on(helper.EVENT_NAME.Disconnected, function (event, data) {
        if (!isDisconnecting) {
            isDisconnecting = true;
            $scope.openModal({
                title: helper.POP_UP_TITLES.Disconnected,
                message: helper.POP_UP_MESSAGES.Reconnecting,
                enableClose: true
            }, null, function () {
                isDisconnecting = false;
                if (connectionService.cStatus.status === 'lost') {
                    $state.go(helper.STATE_NAME.Logout);
                }
            });
        }
    });
    $scope.$on(helper.EVENT_NAME.Connected, function (event, data) {
        if (isDisconnecting) {
            isDisconnecting = false;
            if ($rootScope.currentModal !== undefined) {
                $rootScope.currentModal.dismiss('cancel');
            }
            $state.go(helper.STATE_NAME.AnonymousHome);
        }
    });
    $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
        // handle phase change messages
        if (data.title === helper.POP_UP_TITLES.PhaseChange) {
            // handle Phase Change confirmation messages for now.
            // Entering room messages will be handled in the future.
            if (!data.buttons) {
                $scope.openModal({
                    title: helper.POP_UP_TITLES.PhaseChange,
                    message: data.message,
                    enableClose: true
                });
            }
        }
    });
    $scope.$on(helper.EVENT_NAME.SingleBroadcastResponse, function (event, data) {
        var html =
            '<section>' +
            '  <h4>Broadcast Information</h4>' +
            '  <p>Time: ' + $filter('date')(new Date(data.broadcast.time), 'MM/dd/yy HH:mm a') + ' ' + $scope.timeZone + '</p>' +
            '  <p>Round: ' + data.broadcast.roundName + '</p>' +
            '</section>' +
            '<section>' +
            '  <h4>Broadcast Message</h4>' +
            '  <p>' + data.broadcast.message + '</p>' +
            '</section>';
        $scope.openModal({
            title: 'Round Broadcast',
            message: html,
            enableClose: true
        });
    });
    /*jslint unparam: false*/
    // theme selector
    $scope.themesInfo = [];
    $cookies.themeInUse = ($cookies.themeInUse === null || $cookies.themeInUse === undefined) ? 'DARK' : $cookies.themeInUse;
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
    };

    /**
     * This function returns the css class of rating value.
     *
     * @param {number} rating the rating
     * @returns {string} the CSS class to show different colors
     */
    $scope.getRatingClass = function (rating) {
        if (rating >= 2200) {
            return "rating-red";
        }
        if (rating >= 1500) {
            return "rating-yellow";
        }
        if (rating >= 1200) {
            return "rating-blue";
        }
        if (rating >= 900) {
            return "rating-green";
        }
        if (rating >= 1) {
            return "rating-grey";
        }
        if (rating === 0) {
            return "rating-none";
        }
        if (rating < 0) {
            return "rating-admin";
        }
        return "";
    };
}];

module.exports = baseCtrl;