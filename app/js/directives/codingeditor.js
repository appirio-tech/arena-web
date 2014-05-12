'use strict';
// the directive for the editor in the coding arena
var codingeditor = [function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/user.coding.editor.html',
        controller: 'userCodingEditorCtrl'
    };
}];
module.exports = codingeditor;