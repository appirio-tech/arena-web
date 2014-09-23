/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provide the main app configurations.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Coding IDE Part 1):
 * - Added userPreferences to root scope.
 * - Updated coding page state parameters.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI Fix):
 * - Added listeners for socket disconnection and error.
 * - Added listeners on $window for online/offline events.
 * - Added online and userInfo fields to root scope.
 * - Added helper.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to resolve required data for pages that contain chat widgets.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Challenge Phase):
 * - Added state user.viewCode for code viewing pages.
 * - Added function $rootScope.currentStateName for all the scopes to easily know the current state.
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated page titles.
 * - Removed $rootScope.timezone as it is no longer used.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Rating Indicator):
 * - Updated to include the directive for rating indicator.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Added directory for fixing firefox auto fill problem
 * - Helper to identify whether user belongs to room
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Updated to include the code mirror add-on.
 * - Updated to set reconnect logic.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Rooms Tab):
 * - Updated to include the start from filter.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena UI - Test Panel Update for Batch Testing):
 * - Updated to include resources for test panel and test report.
 *
 * Changes in version 1.11 (Module Assembly - Web Arena UI - Contest Creation Wizard):
 * - Removed the $httpProvider setting.
 *
 * Changes in version 1.12 (Module Assembly - Dashboard - Active Users and Leaderboard Panel):
 * - Updated to include resources for Active Users and Leaderboard Panel.
 *
 * Changes in version 1.13 (Module Assembly - Web Arena Bug Fix 20140909):
 * - Added custom scroll bar.
 *
 * Changes in version 1.14 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Added angular-local-storage component.
 *
 * @author tangzx, dexy, amethystlei, ananthhh, flytoj2ee
 * @version 1.14
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global require*/
require('./../../thirdparty/jquery/jquery');
require('./../../bower_components/angular/angular');
require('./../../bower_components/angular-resource/angular-resource');
require('./../../bower_components/angular-sanitize/angular-sanitize');
require('./../../bower_components/angular-themer');
require('./../../bower_components/angular-ui-angular/angular-cookies.min.js');
require('./../../bower_components/angular-ui-router/release/angular-ui-router');
require('./../../bower_components/angular-bootstrap/ui-bootstrap-tpls');
require('./../../bower_components/codemirror/lib/codemirror');
require('./../../bower_components/angular-ui-codemirror/ui-codemirror');
require('./../../bower_components/codemirror/mode/clike/clike');
require('./../../bower_components/codemirror/mode/vb/vb');
require('./../../bower_components/codemirror/mode/python/python');
require('./../../bower_components/codemirror/addon/fold/foldcode');
require('./../../bower_components/codemirror/addon/fold/foldgutter');
require('./../../bower_components/codemirror/addon/fold/brace-fold');
require('./../../bower_components/codemirror/addon/fold/comment-fold');
require('./../../bower_components/codemirror/addon/fold/indent-fold');
require('./../../bower_components/codemirror/addon/search/match-highlighter');
require('./../../bower_components/codemirror/addon/search/searchcursor');
require('./../../bower_components/codemirror/addon/search/search');
require('./../../bower_components/angular-timer/dist/angular-timer');
require('./../../bower_components/jquery-ui/ui/jquery-ui.js');
require('./../../bower_components/angular-ui-calendar/src/calendar.js');
require('./../../bower_components/fullcalendar/fullcalendar.js');
require('./../../bower_components/angulartics/dist/angulartics.min');
require('./../../bower_components/angulartics/dist/angulartics-ga.min');
require('./../../bower_components/angular-table/ng-table.min.js');
require('./../../thirdparty/jquery.qtip/jquery.qtip.min.js');
require('./../../thirdparty/ng-scrollbar/dist/ng-scrollbar.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-transition.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-alert.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-notify.js');
require('./../../thirdparty/ng-scrollbar/dist/ng-customscrollbar.js');
require('./../../bower_components/angular-local-storage/angular-local-storage.js');

var config = require('./config.js');

var resolvers = require('./resolvers'),
    factories = require('./factories'),
    filters = require('./filters'),
    controllers = {},
    directives = {},
    // from directives.js originally, keep it for future use?
    defaultOptions = {
        slideInput                      : true,
        labelStartTop                   : '',
        labelEndTop                     : '',
        transitionDuration              : 0.3,
        transitionEasing                : 'ease-in-out',
        labelClass                      : 'floating-label',
        typeMatches                     : /text|password|email|number|search|url/
    },
    helper = require('./helper');

// load controllers
controllers.anonHomeCtrl = require('./controllers/anonHomeCtrl');
controllers.errorCtrl = require('./controllers/errorCtrl');
controllers.userProfileCtrl = require('./controllers/userProfileCtrl');
controllers.leaderboardUsersCtrl = require('./controllers/leaderboardUsersCtrl');
controllers.activeContestsCtrl = require('./controllers/activeContestsCtrl');
controllers.chatAreaCtrl = require('./controllers/chatAreaCtrl');
controllers.userCodingCtrl = require('./controllers/userCodingCtrl');
controllers.userCodingEditorCtrl = require('./controllers/userCodingEditorCtrl');
controllers.userContestCtrl = require('./controllers/userContestCtrl');
controllers.contestCountdownCtrl = require('./controllers/contestCountdownCtrl');
controllers.contestStatsCtrl = require('./controllers/contestStatsCtrl');
controllers.resizerCtrl = require('./controllers/resizerCtrl');
controllers.connectionStatusCtrl = require('./controllers/connectionStatusCtrl');
controllers.tcTimeCtrl = require('./controllers/tcTimeCtrl');
controllers.overviewCtrl = require('./controllers/overviewCtrl');
controllers.baseCtrl = require('./controllers/baseCtrl');
controllers.contestPlanCtrl = require('./controllers/contestPlanCtrl');
controllers.messageArenaCtrl = require('./controllers/messageArenaCtrl');
controllers.notificationsCtrl = require('./controllers/notificationsCtrl');
controllers.contestSummaryCtrl = require('./controllers/contestSummaryCtrl');
controllers.userContestDetailCtrl = require('./controllers/userContestDetailCtrl');
controllers.testPanelCtrl = require('./controllers/testPanelCtrl');
controllers.activeUsersCtrl = require('./controllers/activeUsersCtrl');
controllers.overviewLeaderboardCtrl = require('./controllers/overviewLeaderboardCtrl');

// load directives
directives.leaderboardusers = require('./directives/leaderboardusers');
directives.activecontests = require('./directives/activecontests');
directives.chatarea = require('./directives/chatarea');
directives.codingproblem = require('./directives/codingproblem');
directives.codingeditor = require('./directives/codingeditor');
directives.contestcountdown = require('./directives/contestcountdown');
directives.conteststats = require('./directives/conteststats');
directives.resizer = require('./directives/resizer');
directives.connectionstatus = require('./directives/connectionstatus');
directives.topcodertime = require('./directives/topcodertime');
directives.overview = require('./directives/overview');
directives.contestPlan = require('./directives/contestPlan');
directives.messageArena = require('./directives/messageArena');
directives.pastNotifications = require('./directives/pastNotifications');
directives.contestSummary = require('./directives/contestSummary');
directives.ratingIndicator = require('./directives/ratingIndicator');
directives.autoFillFix = require('./directives/autoFillFix');
directives.testPanel = require('./directives/testPanel');
directives.testReport = require('./directives/testReport');
directives.qTip = require('./directives/qTip.js');
directives.sglclick = require('./directives/sglclick');
directives.activeUser = require('./directives/activeUser');
directives.overviewLeaderboard = require('./directives/overviewLeaderboard');

/*global $ : false, angular : false */
/*jslint nomen: true, browser: true */

////////////////////////////
//    MAIN APP MODULE     //
////////////////////////////

// WARNING: ALL dependency injections must be explicitly declared for release js minification to work!!!!!
// SEE: http://thegreenpizza.github.io/2013/05/25/building-minification-safe-angular.js-applications/ for explanation.

var main = angular.module('angularApp', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngSanitize', 'timer', 'ui.codemirror', 'ui.calendar', 'ngScrollbar', 'ngCustomScrollbar', 'angular-themer', 'ngCookies', 'angulartics', 'angulartics.google.analytics', 'ngTable', 'LocalStorageModule']);

///////////////
// FACTORIES //

main.factory('API', factories.API);
main.factory('sessionHelper', factories.sessionHelper);
main.factory('auth0', factories.auth0);
main.factory('socket', factories.socket);
main.factory('cookies', factories.cookies);
main.factory('appHelper', factories.appHelper);
main.factory('connectionService', factories.connectionService);
main.factory('tcTimeService', factories.tcTimeService);
main.factory('notificationService', factories.notificationService);

/////////////
// FILTERS //
main.filter('showByMonth', filters.showByMonth);
main.filter('startFrom', filters.startFrom);

/////////////////
// CONTROLLERS //
main.controller('anonHomeCtrl', controllers.anonHomeCtrl);
main.controller('errorCtrl', controllers.errorCtrl);
main.controller('userProfileCtrl', controllers.userProfileCtrl);
main.controller('leaderboardUsersCtrl', controllers.leaderboardUsersCtrl);
main.controller('activeContestsCtrl', controllers.activeContestsCtrl);
main.controller('chatAreaCtrl', controllers.chatAreaCtrl);
main.controller('userCodingCtrl', controllers.userCodingCtrl);
main.controller('userCodingEditorCtrl', controllers.userCodingEditorCtrl);
main.controller('userContestCtrl', controllers.userContestCtrl);
main.controller('contestCountdownCtrl', controllers.contestCountdownCtrl);
main.controller('contestStatsCtrl', controllers.contestStatsCtrl);
main.controller('resizerCtrl', controllers.resizerCtrl);
main.controller('connectionStatusCtrl', controllers.connectionStatusCtrl);
main.controller('tcTimeCtrl', controllers.tcTimeCtrl);
main.controller('overviewCtrl', controllers.overviewCtrl);
main.controller('contestPlanCtrl', controllers.contestPlanCtrl);
main.controller('baseCtrl', controllers.baseCtrl);
main.controller('messageArenaCtrl', controllers.messageArenaCtrl);
main.controller('notificationsCtrl', controllers.notificationsCtrl);
main.controller('contestSummaryCtrl', controllers.contestSummaryCtrl);
main.controller('userContestDetailCtrl', controllers.userContestDetailCtrl);
main.controller('testPanelCtrl', controllers.testPanelCtrl);
main.controller('activeUsersCtrl', controllers.activeUsersCtrl);
main.controller('overviewLeaderboardCtrl', controllers.overviewLeaderboardCtrl);

/////////////////
// DIRECTIVES //

main.directive('leaderboardusers', directives.leaderboardusers);
main.directive('activecontests', directives.activecontests);
main.directive('chatarea', directives.chatarea);
main.directive('codingproblem', directives.codingproblem);
main.directive('codingeditor', directives.codingeditor);
main.directive('contestcountdown', directives.contestcountdown);
main.directive('conteststats', directives.conteststats);
main.directive('resizer', directives.resizer);
main.directive('connectionstatus', directives.connectionstatus);
main.directive('topcodertime', directives.topcodertime);
main.directive('overview', directives.overview);
main.directive('contestPlan', directives.contestPlan);
main.directive('messageArena', directives.messageArena);
main.directive('pastNotifications', directives.pastNotifications);
main.directive('contestSummary', directives.contestSummary);
main.directive('ratingIndicator', directives.ratingIndicator);
main.directive('autoFillFix', directives.autoFillFix);
main.directive('testPanel', directives.testPanel);
main.directive('testReport', directives.testReport);
main.directive('qTip', directives.qTip);
main.directive('sglclick', directives.sglclick);
main.directive('activeuser', directives.activeUser);
main.directive('overviewleaderboard', directives.overviewLeaderboard);

//////////////////////////////////////
// ROUTING AND ROUTING INTERCEPTORS //

main.config([ '$stateProvider', '$urlRouterProvider', 'themerProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, themerProvider, $httpProvider) {
    if (config.staticFileHost === 'undefined') {
        config.staticFileHost = "";
    }
// theme selector starts
    var styles = [{
            key : 'DARK',
            label : 'Dark Theme',
            href : config.staticFileHost + '/css/bundle.css'
        }];

    themerProvider.setStyles(styles);
    themerProvider.setSelected(styles[0].key);

    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    //disable ajax request caching
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';

    //default is homepage not logged in
    $urlRouterProvider.otherwise('/a/home');

    //setup state machine logic (routing) for the entire app
    $stateProvider
        .state('user', {
            abstract : true,
            url : '/u',
            templateUrl: 'partials/base.html',
            controller: 'baseCtrl'
        })
        .state('user.dashboard', {
            url: '/dashboard',
            data: {
                pageTitle: "Dashboard",
                pageMetaKeywords: "dashboard"
            },
            templateUrl: 'partials/user.dashboard.html',
            resolve: {
                enterRoom: resolvers.enterLobbyRoom
            }
        })
        .state('user.coding', {
            url: '/coding/{roundId}/{problemId}/{divisionId}',
            data: {
                pageTitle: "Coding Page",
                pageMetaKeywords: "coding"
            },
            templateUrl: 'partials/user.coding.html',
            controller: 'userCodingCtrl'
        })
        .state('user.viewCode', {
            url: '/viewCode/{roundId}/{componentId}/{divisionId}/{roomId}/{defendant}',
            data: {
                pageTitle: "View Code",
                pageMetaKeywords: "code,arena"
            },
            templateUrl: 'partials/user.coding.html',
            controller: 'userCodingCtrl'
        })
        .state('user.contest', {
            url: '/contests/{contestId}',
            data: {
                pageTitle: "Contest",
                pageMetaKeywords: "contest"
            },
            templateUrl: 'partials/user.contest.html',
            controller: 'userContestCtrl',
            resolve: {
                enterRoom: resolvers.enterCompetingRoom
            }
        })
        .state('user.contestSummary', {
            url: '/contests/{contestId}/{divisionId}/summary/{viewOn}',
            data: {
                pageTitle: "Contest",
                pageMetaKeywords: "contest"
            },
            templateUrl: 'partials/user.contest.detail.html',
            controller: 'userContestDetailCtrl'
        })
        .state('user.profile', {
            url: '/profile',
            templateUrl: 'partials/user.profile.html',
            data: {
                pageTitle: "User Profile",
                pageMetaKeywords: "profile"
            }
        })
        .state('user.profile.details', {
            url: '/details',
            templateUrl: 'partials/user.profile.details.html',
            data: {
                pageTitle: "User Profile",
                pageMetaKeywords: "profile"
            },
            controller: 'userProfileCtrl'
        })
        .state('user.profile.privacy', {
            url: '/privacy',
            templateUrl: 'partials/user.profile.privacy.html',
            data: {
                pageTitle: "Privacy Settings",
                pageMetaKeywords: "privacy"
            },
            controller: 'userProfileCtrl'
        })
        .state('user.profile.terms', {
            url: '/terms',
            templateUrl: 'partials/user.profile.terms.html',
            data: {
                pageTitle: "Terms & Conditions",
                pageMetaKeywords: "terms"
            },
            controller: 'userProfileCtrl'
        })
        .state('user.logout', {
            url: '/logout',
            template: 'You are now logged out.',
            resolve: {
                logout : resolvers.logout
            }
        })
        .state('anon', {
            abstract : true,
            url : '/a',
            templateUrl : 'partials/base.html',
            data: {
                pageTitle: "Empty Page"
            }
        })
        .state('anon.home', {
            url: '/home',
            templateUrl: 'partials/anon.home.html',
            controller: 'anonHomeCtrl',
            resolve : {
                alreadyLoggedIn : resolvers.alreadyLoggedIn
            },
            data: {
                pageTitle: "Login Page",
                pageMetaKeywords: "Login Page"
            }
        })
        .state('loggingin', {
            //eg for auth0
            //url: '/access_token={accessToken}&id_token={idToken}&token_type={tokenType}',
            url: '/loggingin',
            template: 'Completing login... One moment please...',
            data: {
                pageTitle: "Logging In",
                pageMetaKeywords: "login"
            },
            resolve: {
                finishLogin: resolvers.finishLogin
            }
        });
}]);

main.run(['$rootScope', '$state', 'sessionHelper', 'socket', '$window', 'tcTimeService', '$cookies', 'themer', function ($rootScope, $state, sessionHelper, socket, $window, tcTimeService, $cookies, themer) {
    // setting defaut theme before json gets loaded
    if ($cookies.themeInUse !== null && $cookies.themeInUse !== undefined) {
        themer.styles[0].key = $cookies.themeInUse;
        themer.styles[0].label = $cookies.themeLabel;
        themer.styles[0].href = $cookies.themeHref;
    }
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.online = true;
        });
    }, false);
    //consider exposing states and state params to all templates
    $rootScope.$state = $state;
    $rootScope.connectionID = undefined;
    $rootScope.startSyncResponse = false;
    $rootScope.lastServerActivityTime = new Date().getTime();
    $rootScope.$on('$stateChangeStart', function (event, toState) {
        //use whitelist approach
        var allowedStates = [helper.STATE_NAME.Anonymous, helper.STATE_NAME.AnonymousHome, helper.STATE_NAME.LoggingIn, helper.STATE_NAME.Logout],
            publicState = false;

        angular.forEach(allowedStates, function (allowedState) {
            publicState = publicState || (toState.name === allowedState);
        });

        if (!publicState && !$rootScope.isLoggedIn) {
            event.preventDefault();
            $state.go(helper.STATE_NAME.AnonymousHome);
        }
        //expose this for the base.html template
        $rootScope.loggedIn = function () {
            return $rootScope.isLoggedIn;
        };
        $rootScope.username = sessionHelper.getUsername;
        $rootScope.userInfo = sessionHelper.getUserInfo;
        $rootScope.userPreferences = sessionHelper.getUserPreferences;
        $rootScope.timeService = tcTimeService;
        $rootScope.keepAliveTimeout = helper.KEEP_ALIVE_TIMEOUT;

        $rootScope.reconnected = false;

        socket.on(helper.EVENT_NAME.SocketConnected, function () {
            $rootScope.connected = true;
            $rootScope.$broadcast(helper.EVENT_NAME.Connected, {});
        });
        socket.on(helper.EVENT_NAME.SocketDisconnected, function () {
            $rootScope.connected = false;
            $rootScope.$broadcast(helper.EVENT_NAME.Disconnected, {});
        });
        socket.on(helper.EVENT_NAME.SocketConnectionFailed, function () {
            $rootScope.connected = false;
            $rootScope.$broadcast(helper.EVENT_NAME.Disconnected, {});
        });
        socket.on(helper.EVENT_NAME.SocketError, function () {
            $rootScope.$broadcast(helper.EVENT_NAME.SocketError, {});
        });

        socket.on(helper.EVENT_NAME.SocketReconnect, function () {
            // get reconnect, but it should login again, keep connected flag to false here.
            // $rootScope.connected = true;
            $rootScope.reconnected = true;
        });
    });

    /**
     * Check if the client suppports touch screen.
     *
     * @returns {boolean} true if the client supports touch screen.
     */
    function isTouchSupported() {
        var msTouchEnabled = window.navigator.msMaxTouchPoints,
            generalTouchEnabled = document.createElement('div').hasOwnProperty('ontouchstart');
        if (msTouchEnabled || generalTouchEnabled) {
            return true;
        }
        return false;
    }
    $rootScope.isTouchDevice = isTouchSupported();

    /**
     * Get the current state name, can be used in any scope without injecting the state service.
     *
     * @returns {string} the current state name
     */
    $rootScope.currentStateName = function () {
        return $state.current.name;
    };

    /**
     * This function returns the css class of rating value.
     *
     * @param {number} rating the rating
     * @returns {string} the CSS class to show different colors
     */
    $rootScope.getRatingClass = function (rating) {
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

}]);
