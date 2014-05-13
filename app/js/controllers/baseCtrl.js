'use strict';
//for header
var baseCtrl = ['$scope', '$http', 'appHelper', function ($scope, $http, appHelper) {
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
}];

module.exports = baseCtrl;