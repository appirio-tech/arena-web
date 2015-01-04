/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive handles the chat settings widget
 *
 * @author Helstein
 * @version 1.0
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global module, $*/
/*jslint unparam: true */
var chatSettings = [function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/user.chat.settings.html',
        link: function ($scope, element) {
        // Initialize qtip tooltip with settings pane as the content
            $('.chat-settings-expand', element).qtip({
                content: {
                    text: $('.settings-panel', element)
                },
                show: {
                    event: 'click'
                },
                hide: {
                    event: 'unfocus'
                },
                position: {
                    my: 'top right',
                    at: 'bottom right',
                    adjust: {
                        x: 44,
                        y: 5
                    }
                },
                style: {
                    classes: 'settings-qtip'
                }
            });
        }
    };
}];
module.exports = chatSettings;