'use strict';
// the directive for 'chat area widget'
var chatarea = [function(){
    return {
        restrict: 'A',
        templateUrl: 'partials/user.chat.area.html',
        controller: 'chatAreaCtrl',
        link: function(scope, element, attrs, chatCtrl){
            chatCtrl.init(attrs.registrants); // init the chat widget. if registrants attribute exist, show it.
        }
    };
}];
module.exports = chatarea;