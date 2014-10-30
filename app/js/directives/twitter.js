/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This directive renders twitter button which can be customized.
 * Usage:
 *   - widget is used with an attribute 'twitter'
 *   - attribute 'type': if not specified the share button (with type 'share') will be created
 *     if you want to support other twitter button types (like follow, hashtag, etc)
 *     please see the api documentation: https://dev.twitter.com/web/javascript/creating-widgets
 *     to add their implementation
 *   - if type is 'share' additional attributes are:
 *         - 'url': used as twitter share url
 *         - 'message': the text of the twitter share message
 *         - 'count': type of the counter ('none' is the default)
 *         - 'size': size of the twitter button ('small' is the default)
 * Example:
 *    <span class="tweet-share" twitter data-url="www.topcoder.com" data-message="My message to twitter"
 *        data-type="share" data-size="medium" data-count="horizontal"></span>
 *
 * @author dexy
 * @version 1.0
 */
/*global $: true, twttr: true*/
'use strict';

/**
 * The directive for 'Twitter Widget'.
 *
 * @type {*[]}
 */
/*jslint unparam:true*/
var twitter = ['$rootScope', '$timeout', '$window', function ($rootScope, $timeout, $window) {
    return {
        restrict: 'A',
        scope: {
            message: '@',
            url: '@'
        },
        link: function (scope, element, attrs) {
            var twitterType = attrs.type || 'share',
                createButton = function () {
                    if ($rootScope.twitterLoaded) {
                        if (!scope.message) {
                            scope.$watch('message', function () {
                                createButton();
                            });
                        } else {
                            if (twitterType === 'share') {
                                var html = '<a class="twitter-share-button" href="#" onclick="popUp=window.open(&quot;https://twitter.com/share?text='
                                        + attrs.message + '&url=' + attrs.url + '&count=' + (attrs.count || 'none')
                                        + '&quot;,&quot;popupwindow&quot;,&quot;scrollbar=yes,width=600,height=300&quot;);popUp.focus();return false;"></a>';
                                element.html(html);
                            }
                        }
                    } else {
                        $timeout(createButton, 1000);
                    }
                };
            createButton();
        }
    };
}];
/*jslint unparam:false*/
module.exports = twitter;