'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global document, angular:false, $:false, module, window*/

//for header
var baseCtrl = ['$scope', '$http', 'appHelper', '$timeout', 'notificationService', function ($scope, $http, appHelper, $timeout, notificationService) {
    // theme selector
    $scope.themesInfo = [];
    $scope.themeInUse = $scope.themeBackup = 'default';
    $scope.themePanelOpen = false;
    $http.get('data/themes.json').success(function (data) {
        $scope.themesInfo = data;
        $scope.themeInUse = $scope.themeBackup = data.currentKey;
    });
    var closeThemeHandler = function (event) {
        // the depth of DOM tree rooted at the element with id 'themePanel'
        var themePanelDOMDepth = 4;
        if (!appHelper.clickOnTarget(event.target, 'themePanel', themePanelDOMDepth)) {
            if (appHelper.clickOnTarget(event.target, 'iconTS', 1)) {
                event.preventDefault();
            }
            $scope.cancelTheme();
        }
    };
    $scope.closeThemeSelector = function () {
        $scope.themePanelOpen = false;
        document.removeEventListener('click', closeThemeHandler);
    };
    $scope.cancelTheme = function () {
        $scope.themeInUse = $scope.themeBackup;
        $scope.closeThemeSelector();
    };
    $scope.applyTheme = function () {
        $scope.themeBackup = $scope.themeInUse;
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
}];

module.exports = baseCtrl;