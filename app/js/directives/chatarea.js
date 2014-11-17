/*jshint -W097*/
/*jshint strict:false*/
'use strict';
/*global module*/
// the directive for 'chat area widget'
var chatarea = [function () {
    /*jslint unparam:false*/
    return {
        restrict: 'A',
        templateUrl: 'partials/user.chat.area.html',
        controller: 'chatAreaCtrl',
        link: function (scope, element, attrs, chatCtrl) {
            /*jslint unparam:true*/
            chatCtrl.init(attrs.registrants); // init the chat widget. if registrants attribute exist, show it.
            scope.coding = attrs.hasOwnProperty('chatareaCoding');
        }
    };
}];
module.exports = chatarea;