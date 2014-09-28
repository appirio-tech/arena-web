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
var twitter = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var twitterType = attrs.type || 'share',
                createButton = function () {
                    if ($rootScope.twitterLoaded) {
                        if (twitterType === 'share') {
                            twttr.widgets.createShareButton(attrs.url, element[0], function () { return; }, {
                                count: attrs.count || 'none',
                                text: attrs.message,
                                size: attrs.size || 'small'
                            });
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