/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
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
 * Changes in version 1.15 (PoC Assembly - Share Member Status To Facebook and Twitter):
 * - Added facebook library and twitter directive.
 * - Updated main.config to initialize Facebook library API ID.
 *
 * Changes in version 1.16 (PoC Assembly - Invite friends To Participate On A Match From Facebook and Twitter):
 * - Added angular-facebook module and related config.
 *
 * Changes in version 1.17 (F2F Web Arena - Match Clock Visibility)
 * - Added new directory codingTime
 * - Added new controller userCodingTimeCtrl
 *
 * Changes in version 1.18 (Module Assembly - Web Arena UI - Contest Management and Problem Assignment v1.0)
 * - Added contestManagementCtrl
 *
 * Changes in version 1.19 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Initialized leaderboard to the empty array.
 * - Updated routing to user.viewCode and user.contest including the last view and page visited
 *   to support better forward/back navigation.
 *
 * Changes in version 1.20 (Module Assembly - Practice Problem Listing Page):
 * - Updated to include resources for Practice Problem List page.
 *
 * Changes in version 1.21 (Module Assembly - Web Arena - Code With Practice Problem)
 * - Added user.practiceCode state.

 * Changes in version 1.22 (Module Assembly - Web Arena UI - Match Configurations
 * - Added controllers -- contestTermsConfigCtrl, contestScheduleConfigCtrl, registrationQuestionsCtrl, manageQuestionCtrl, manageAnswerCtrl
 * - Added Directives -- contestTermsConfig, contestScheduleConfig, registrationQuestions, manageQuestion, manageAnswer
 *
 * Changes in version 1.23 (PoC Assembly - Web Arena - Match Schedule Page)
 * - Added resources for match schedule page.
 *
 * Changes in version 1.24 (UI Prototype - Web Arena - Challenges Advertising Widget)
 * - Added challengesAdvertisingCtrl controller
 * - Added challengesAdvertiser directive
 *
 * Changes in version 1.25 (Web Arena Deep Link Assembly v1.0):
 * - Added Member and Register states
 * - Added Deep Linking logic
 *
 * Changes in version 1.26 (Web Arena Plugin API Part 1):
 * - Added arena global object for plugin api.
 *
 * Changes in version 1.27 (Web Arena Plugin API Part 2):
 * - Added more implementations for plugin api.
 *
 * Changes in version 1.28 (Web Arena SRM Problem Deep Link Assembly):
 * - Added resolver enterCompetingRoom to Coding state. Now enter request will be sent before opening problem
 * - Added ng-clip third party library to enable copy link functionality
 * - Enabled deep-linking for SRM Problems (user.coding state)
 *
 * Changes in version 1.29 (Add Settings Panel for Chat Widget)
 * - Added directives for chat area widget settings
 *
 * Changes in version 1.30 (Web Arena - Scrolling Issues Fixes):
 * - Updated CodeMirror to latest version and added scrollbar plugin
 *
 * Changes in version 1.31 (Web Arena - Recovery From Lost Connection)
 * - Added logic to recovery from lost connection.
 *
 * Changes in version 1.32 (Web Arena - Fix Empty Problem Statement Arena Issue):
 * - Added new library perfect-scrollbar to fix scrolling issues
 *
 * Changes in version 1.33 (Web Arena Keyboard shortcuts):
 * - Added hot keys module and related configuration.
 *
 * @author tangzx, dexy, amethystlei, ananthhh, flytoj2ee, Helstein, TCSASSEMBLER
 * @version 1.33
 */
'use strict';
/*jshint -W097*/
/*jshint strict:false*/
/*global arena:true */
/*global require*/
require('./../../thirdparty/jquery/jquery');
require('./../../bower_components/angular/angular');
require('./../../bower_components/angular-resource/angular-resource');
require('./../../bower_components/angular-sanitize/angular-sanitize');
require('./../../bower_components/angular-themer');
require('./../../bower_components/angular-ui-angular/angular-cookies.min.js');
require('./../../bower_components/angular-ui-router/release/angular-ui-router');
require('./../../bower_components/angular-bootstrap/ui-bootstrap-tpls');
global.CodeMirror = require('./../../bower_components/codemirror/lib/codemirror');
require('./../../bower_components/angular-ui-codemirror/ui-codemirror');
require('./../../bower_components/codemirror/mode/clike/clike');
require('./../../bower_components/codemirror/mode/vb/vb');
require('./../../bower_components/codemirror/mode/python/python');
require('./../../bower_components/codemirror/addon/fold/foldcode');
require('./../../bower_components/codemirror/addon/fold/foldgutter');
require('./../../bower_components/codemirror/addon/fold/brace-fold');
require('./../../bower_components/codemirror/addon/fold/comment-fold');
require('./../../bower_components/codemirror/addon/fold/indent-fold');
require('./../../bower_components/codemirror/addon/scroll/simplescrollbars');
require('./../../bower_components/codemirror/addon/search/match-highlighter');
require('./../../bower_components/codemirror/addon/search/searchcursor');
require('./../../bower_components/codemirror/addon/search/search');
require('./../../bower_components/angular-timer/dist/angular-timer');
require('./../../bower_components/jquery-ui/ui/jquery-ui.js');
require('./../../bower_components/angular-ui-calendar/src/calendar.js');
require('./../../bower_components/fullcalendar/fullcalendar.js');
require('./../../bower_components/angulartics/dist/angulartics.min');
require('./../../bower_components/angulartics/dist/angulartics-ga.min');
require('./../../bower_components/angular-table/dist/ng-table.min.js');
require('./../../bower_components/angular-facebook/lib/angular-facebook');
require('./../../bower_components/angular-hotkeys/build/hotkeys.min.js');
require('./../../thirdparty/jquery.qtip/jquery.qtip.min.js');
require('./../../thirdparty/ng-scrollbar/dist/ng-scrollbar.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-transition.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-alert.js');
require('./../../thirdparty/bootstrap-notify/js/bootstrap-notify.js');
require('./../../thirdparty/ng-scrollbar/dist/ng-customscrollbar.js');
require('./../../thirdparty/perfect-scrollbar/perfect-scrollbar.js');
require('./../../thirdparty/perfect-scrollbar/angular-perfect-scrollbar.js');
require('./../../bower_components/angular-local-storage/dist/angular-local-storage.js');
require('./../../thirdparty/ng-clip/ngClip.js');
require('./../../thirdparty/ng-clip/ZeroClipboard.js');
require('./../../bower_components/bootstrap-switch/dist/js/bootstrap-switch');
require('./../../bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch');

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
controllers.contestManagementCtrl = require('./controllers/contestManagementCtrl');
controllers.activeUsersCtrl = require('./controllers/activeUsersCtrl');
controllers.overviewLeaderboardCtrl = require('./controllers/overviewLeaderboardCtrl');
controllers.contestTermsConfigCtrl = require('./controllers/contestTermsConfigCtrl');
controllers.contestScheduleConfigCtrl = require('./controllers/contestScheduleConfigCtrl');
controllers.registrationQuestionsCtrl = require('./controllers/registrationQuestionsCtrl');
controllers.manageQuestionCtrl = require('./controllers/manageQuestionCtrl');
controllers.manageAnswerCtrl = require('./controllers/manageAnswerCtrl');
controllers.userCodingTimeCtrl = require('./controllers/userCodingTimeCtrl');
controllers.practiceProblemListCtrl = require('./controllers/practiceProblemListCtrl');
controllers.matchScheduleCtrl = require('./controllers/matchScheduleCtrl');
controllers.memberFeedbackCtrl = require('./controllers/memberFeedbackCtrl');
controllers.leaderboardCtrl = require('./controllers/leaderboardCtrl');
controllers.challengesAdvertisingCtrl = require('./controllers/challengesAdvertisingCtrl');

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
directives.twitter = require('./directives/twitter');
directives.codingTime = require('./directives/codingTime');
directives.contestTermsConfig = require('./directives/contestTermsConfig');
directives.contestScheduleConfig = require('./directives/contestScheduleConfig');
directives.registrationQuestions = require('./directives/registrationQuestions');
directives.manageQuestion = require('./directives/manageQuestion');
directives.manageAnswer = require('./directives/manageAnswer');
directives.preloader = require('./directives/preloader');
directives.memberFeedback = require('./directives/memberFeedback');
directives.leaderboard = require('./directives/leaderboard');
directives.challengesAdvertiser = require('./directives/challengesAdvertiser');
directives.ngScrollbarAutoscroll = require('./directives/ngScrollbarAutoscroll');
directives.chatSettings = require('./directives/chatSettings');
directives.toggleSetting = require('./directives/toggleSetting');

/*global $ : false, angular : false, twttr : true */
/*jslint nomen: true, browser: true */

////////////////////////////
//    MAIN APP MODULE     //
////////////////////////////

// WARNING: ALL dependency injections must be explicitly declared for release js minification to work!!!!!
// SEE: http://thegreenpizza.github.io/2013/05/25/building-minification-safe-angular.js-applications/ for explanation.

var main = angular.module('angularApp', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngSanitize', 'timer', 'ui.codemirror', 'ui.calendar', 'ngScrollbar', 'ngCustomScrollbar', 'angular-themer', 'ngCookies', 'angulartics', 'angulartics.google.analytics', 'ngTable', 'LocalStorageModule', 'facebook', 'ngClipboard', 'frapontillo.bootstrap-switch', 'perfect_scrollbar', 'cfp.hotkeys']);

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
main.factory('keyboardManager', factories.keyboardManager);

/////////////
// FILTERS //
main.filter('showByMonth', filters.showByMonth);
main.filter('startFrom', filters.startFrom);
main.filter('highlight', filters.highlight);
main.filter('practiceProblemFilter', filters.practiceProblemFilter);

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
main.controller('contestManagementCtrl', controllers.contestManagementCtrl);
main.controller('activeUsersCtrl', controllers.activeUsersCtrl);
main.controller('overviewLeaderboardCtrl', controllers.overviewLeaderboardCtrl);
main.controller('userCodingTimeCtrl', controllers.userCodingTimeCtrl);
main.controller('practiceProblemListCtrl', controllers.practiceProblemListCtrl);
main.controller('contestTermsConfigCtrl', controllers.contestTermsConfigCtrl);
main.controller('contestScheduleConfigCtrl', controllers.contestScheduleConfigCtrl);
main.controller('registrationQuestionsCtrl', controllers.registrationQuestionsCtrl);
main.controller('manageQuestionCtrl', controllers.manageQuestionCtrl);
main.controller('manageAnswerCtrl', controllers.manageAnswerCtrl);
main.controller('matchScheduleCtrl', controllers.matchScheduleCtrl);
main.controller('memberFeedbackCtrl', controllers.memberFeedbackCtrl);
main.controller('leaderboardCtrl', controllers.leaderboardCtrl);
main.controller('challengesAdvertisingCtrl', controllers.challengesAdvertisingCtrl);

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
main.directive('twitter', directives.twitter);
main.directive('codingTime', directives.codingTime);
main.directive('contestTermsConfig', directives.contestTermsConfig);
main.directive('contestScheduleConfig', directives.contestScheduleConfig);
main.directive('registrationQuestions', directives.registrationQuestions);
main.directive('manageQuestion', directives.manageQuestion);
main.directive('manageAnswer', directives.manageAnswer);
main.directive('preloader', directives.preloader);
main.directive('memberFeedback', directives.memberFeedback);
main.directive('leaderboard', directives.leaderboard);
main.directive('challengesAdvertiser', directives.challengesAdvertiser);
main.directive('ngScrollbarAutoscroll', directives.ngScrollbarAutoscroll);
main.directive('chatSettings', directives.chatSettings);
main.directive('toggleSetting', directives.toggleSetting);

//////////////////////////////////////
// ROUTING AND ROUTING INTERCEPTORS //

main.config([ '$stateProvider', '$urlRouterProvider', 'themerProvider', '$httpProvider', 'FacebookProvider', 'ngClipProvider', function ($stateProvider, $urlRouterProvider, themerProvider, $httpProvider, FacebookProvider, ngClipProvider) {
    if (config.staticFileHost === 'undefined') {
        config.staticFileHost = "";
    }
// theme selector starts
    var styles = [{
            key : 'DARK',
            label : 'Dark Theme',
            href : config.staticFileHost + '/css/bundle.css'
        }];
    FacebookProvider.init(config.facebookApiId);

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
    ngClipProvider.setPath(config.staticFileHost + "/data/ZeroClipboard.swf");

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
        .state('user.member', {
            url: '/dashboard/{memberName}',
            data: {
                pageTitle: "Dashboard",
                pageMetaKeywords: "dashboard"
            },
            templateUrl: 'partials/user.dashboard.html',
            resolve: {
                enterRoom: resolvers.enterLobbyRoom
            }
        })
        .state('user.register', {
            url: '/dashboard/register/{contestId}',
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
            controller: 'userCodingCtrl',
            resolve: {
                enterRoom: resolvers.enterCompetingRoom
            }
        })
        .state('user.viewCode', {
            url: '/viewCode/{roundId}/{componentId}/{divisionId}/{roomId}/{defendant}/{page}',
            data: {
                pageTitle: "View Code",
                pageMetaKeywords: "code,arena"
            },
            templateUrl: 'partials/user.coding.html',
            controller: 'userCodingCtrl'
        })
        .state('user.practiceCode', {
            url: '/practiceCode/{roundId}/{componentId}/{problemId}/{divisionId}/{roomId}',
            data: {
                pageTitle: "Practice",
                pageMetaKeywords: "practice,code,arena"
            },
            templateUrl: 'partials/user.coding.html',
            controller: 'userCodingCtrl'
        })
        .state('user.defaultContest', {
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
        .state('user.contest', {
            url: '/contests/{contestId}/{viewOn}',
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
                pageTitle: "Match",
                pageMetaKeywords: "match"
            },
            templateUrl: 'partials/user.contest.detail.html',
            controller: 'userContestDetailCtrl'
        })
        .state('user.practiceProblemList', {
            url: '/practiceProblemList',
            data: {
                pageTitle: 'Practice Problems',
                pageMetaKeywords: "practice problems"
            },
            templateUrl: 'partials/user.practiceProblemList.html',
            controller: 'practiceProblemListCtrl'
        })
        .state('user.matchSchedule', {
            url: '/matchSchedule',
            data: {
                pageTitle: 'Match Schedule',
                pageMetaKeywords: "match schedule"
            },
            templateUrl: 'partials/user.matchSchedule.html',
            controller: 'matchScheduleCtrl'
        })
        .state('user.contestManagement', {
            url: '/contestManagement',
            data: {
                pageTitle: "Manage Contests",
                pageMetaKeywords: "contestManagement"
            },
            templateUrl: 'partials/user.contest.management.html',
            controller: 'contestManagementCtrl'
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


    if (!arena) {
        arena = {};
    }

    arena = (function arena() {
        var events = {};
        return {
            /**
             * Trigger the event.
             * @param event - the event name
             * @param param - the parameters
             */
            trigger : function (event, param) {
                if (event && events[event]) {
                    if (typeof (events[event]) === "function") {
                        events[event](param);
                    } else {
                        console.log('Failed to trigger ' + event);
                    }
                }
            },
            /**
             * Register the event. It could accept a data parameter in callback method.
             * @param event - the event name
             * @param method - the callback method
             */
            on: function (event, method) {
                if (helper.PLUGIN_EVENT[event] && (typeof method === "function")) {
                    events[event] = method;
                } else {
                    console.log('The event name is invalid.');
                }
            },
            /**
             * Get the registered event.
             * @param event - the event name
             * @returns {*} - the callback method if event exists
             */
            getEvent: function (event) {
                return events[event];
            },
            /**
             * Get lobby rooms.
             * @returns {Array} the rooms.
             */
            getRooms: function () {
                var array = [];
                angular.forEach($rootScope.lobbyMenu, function (lobby) {
                    var tmp = {};
                    tmp[lobby.roomID] = lobby;
                    array.push(tmp);
                });
                return array;

            },
            /**
             * The ready trigger event.
             * @param method - the trigger event.
             */
            ready: function (method) {
                if (typeof method === "function") {
                    events[helper.PLUGIN_EVENT.ready] = method;
                    // if user already login, trigger the event, if not, it'll refresh the page in login
                    if ($rootScope.isLoggedIn) {
                        method();
                    }
                } else {
                    console.log('The event method is invalid.');
                }
            }
        };
    }());

    arena.editor = (function editor() {
        var events = {};

        return {
            /**
             * Trigger the event.
             * @param event - the event name
             * @param param - the parameters
             */
            trigger : function (event, param) {
                if (event && events[event]) {
                    if (typeof events[event] === "function") {
                        events[event](param);
                    } else {
                        console.log('Failed to trigger ' + event);
                    }
                }
            },
            /**
             * Register the event. It could accept a data parameter in callback method.
             * @param event - the event name
             * @param method - the callback method
             */
            on: function (event, method) {
                if (helper.PLUGIN_EVENT[event] && (typeof method === "function")) {
                    events[event] = method;
                } else {
                    console.log('The event name is invalid.');
                }
            },
            /**
             * Get the registered event.
             * @param event - the event name
             * @returns {*} - the callback method if event exists
             */
            getEvent: function (event) {
                return events[event];
            },
            /**
             * Get the code in editor.
             * @returns {$rootScope.codeForPlugin|*} the code value.
             */
            getCode : function () {
                return $rootScope.codeForPlugin;
            },
            /**
             * Get the problem object in editor.
             * @returns {$rootScope.problemForPlugin|*} - the problem object.
             */
            getProblem : function () {
                return $rootScope.problemForPlugin;
            },
            /**
             * Get all test cases objects.
             * @returns {Array} - the test cases objects.
             */
            getTestCases : function () {
                var res = [];
                res = res.concat($rootScope.userTests);
                res = res.concat($rootScope.defaultTestCasesForPlugin);
                return res;
            },
            /**
             * Set the given code to editor.
             * @param code - the code value.
             */
            setCode : function (code) {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.setCodeFromPlugin, code);
            },
            /**
             * Trigger the search in editor.
             * @param text - the search text.
             */
            search : function (text) {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.searchFromPlugin, text);
            },
            /**
             * Set language to editor.
             * @param languageName - the language name.
             */
            setLanguage : function (languageName) {
                languageName = languageName ? languageName.toLowerCase() : '';
                if (languageName === 'java' || languageName === 'c++' || languageName === 'c#' ||
                        languageName === 'vb.net' || languageName === 'python') {
                    $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.setLanguageFromPlugin, languageName);
                } else {
                    console.log('The language name is invalid.');
                }

            },
            /**
             * Compile the code.
             */
            compile : function () {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.compileFromPlugin, null);
            },
            /**
             * Submit the code.
             */
            submitSolution : function () {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.submitFromPlugin, null);
            },
            /**
             * Run all test cases.
             */
            runAllTests : function () {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.runAllTestCasesFromPlugin, null);
            },
            /**
             * Run the test case by name.
             * @param name - the test case name.
             */
            runTest : function (name) {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.runTestCaseFromPlugin, name);
            },
            /**
             * Set the given test cases to test panel.
             * @param testCases - the test cases array
             */
            setTestCases : function (testCases) {
                $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.setTestCasesFromPlugin, testCases);
            },
            /**
             * Add trigger event for editor.
             * @param method - the trigger event.
             */
            ready: function (method) {
                if (typeof method === "function") {
                    events[helper.PLUGIN_EVENT.ready] = method;
                } else {
                    console.log('The event method is invalid.');
                }
            }
        };
    }());

    /**
     * Get contest phase.
     *
     * @param contest the contest object
     * @param phaseTypeId - the phase type id
     * @returns {*} the phase
     */
    function getPhase(contest, phaseTypeId) {
        var i;
        if (!contest.phases) {
            return null;
        }
        for (i = 0; i < contest.phases.length; i += 1) {
            if (contest.phases[i].phaseType === phaseTypeId) {
                return contest.phases[i];
            }
        }
        return null;
    }
    /**
     * Checks whether the registration phase is open.
     * @param contest the contest object
     * @returns {boolean} the result
     */
    function isRegistrationOpen(contest) {
        if (!contest) {
            return false;
        }
        var phase = getPhase(contest, helper.PHASE_TYPE_ID.RegistrationPhase);
        if (!phase) {
            return false;
        }
        return phase.startTime <= $rootScope.now && $rootScope.now <= phase.endTime;
    }

    /**
     * Get round by id.
     * @param roundId - the round id
     * @returns {*} the round object
     */
    function getRound(roundId) {
        var tmp = null;
        angular.forEach($rootScope.roundData, function (contest) {
            if (contest.roundID === roundId) {
                tmp = contest;
            }
        });
        return tmp;
    }

    arena.member = (function member() {
        return {
            /**
             * Get user info.
             * @returns {*} the user info
             */
            getInfo : function () {
                return sessionHelper.getUserInfo();
            },
            /**
             * Get user status.
             * @returns user status
             */
            getStatus : function () {
                var tmp = {lastLogin : sessionHelper.getUserInfo().lastLogin, currentlyLoggedIn: $rootScope.isLoggedIn,
                    currentRoom : $rootScope.currentRoomInfo, registrationStatus: []};

                angular.forEach($rootScope.roundData, function (contest) {
                    if (isRegistrationOpen(contest)) {
                        tmp.registrationStatus.push({roundID: contest.roundID, contestName: contest.contestName,
                            roundName: contest.roundName, isRegistrationOpen: true, registered: contest.isRegistered});
                    } else {
                        tmp.registrationStatus.push({roundID: contest.roundID, contestName: contest.contestName,
                            roundName: contest.roundName, isRegistrationOpen: false});
                    }

                });
                return tmp;
            },
            /**
             * Logout the user.
             */
            logout : function () {
                if ($rootScope.isLoggedIn) {
                    $state.go(helper.STATE_NAME.Logout);
                } else {
                    console.log('User is not logged in.');
                }
            }
        };
    }());


    arena.match = (function match() {
        var events = {};
        return {
            /**
             * Get matches.
             * @returns {Array} the matches
             */
            getMatches : function () {
                var array = [];
                angular.forEach($rootScope.roundData, function (contest) {
                    var tmp = {};
                    tmp[contest.roundID] = contest;
                    array.push(tmp);
                });
                return array;
            },
            /**
             * Trigger event.
             * @param event the event name
             * @param roundId the round id
             * @param param the parameter
             */
            trigger : function (event, roundId, param) {
                if (event && events[roundId + event]) {
                    if (typeof (events[roundId + event]) === "function") {
                        events[roundId + event](param);
                    } else {
                        console.log('Failed to trigger ' + event);
                    }
                }
            },
            /**
             * Register the trigger event.
             * @param event the event name
             * @param roundId the round id
             * @param method the trigger method
             */
            on: function (event, roundId, method) {
                var tmp = getRound(roundId);
                if (tmp === null) {
                    console.log('The round id is invalid.');
                } else {
                    if (helper.PLUGIN_MATCHES_EVENT[event] && (typeof method === "function")) {
                        events[roundId + event] = method;
                    } else {
                        console.log('The event name is invalid.');
                    }
                }
            },
            /**
             * Get event.
             * @param event the event name
             * @param roundId the round id
             * @returns {*} the event method
             */
            getEvent: function (event, roundId) {
                return events[roundId + event];
            },
            /**
             * Register the contest.
             * @param roundId the round id.
             * @param callback the callback method after open registration dialog.
             */
            register : function (roundId, callback) {

                if (callback) {
                    if (typeof callback !== "function") {
                        console.log('Invalid callback paramter.');
                        return;
                    }
                }

                var tmp = getRound(roundId);
                if (tmp === null) {
                    console.log('Invalid round id paramter.');
                } else {
                    if (isRegistrationOpen(tmp)) {
                        if (tmp.isRegistered) {
                            console.log('You already registered in this match.');
                        } else {
                            $rootScope.$broadcast(helper.BROADCAST_PLUGIN_EVENT.registerFromPlugin, roundId, callback);
                        }
                    } else {
                        console.log('Registration phase already closed.');
                    }
                }
            }
        };
    }());

    arena.matches = {};
    arena.matches.rounds = (function rounds() {

        return {
            /**
             * Get round rooms.
             * @param roundId the round id
             * @returns {Array} the round rooms
             */
            getRooms: function (roundId) {
                var array = [], tmp = getRound(roundId), room, r;
                if (tmp === null) {
                    console.log('Invalid round id paramter.');
                } else {
                    if (tmp.adminRoom) {
                        room = {};
                        room[tmp.adminRoom.roomID] = tmp.adminRoom;
                        array.push(room);
                    }
                    if (tmp.coderRooms) {
                        angular.forEach(tmp.coderRooms, function (room) {
                            r = {};
                            r[room.roomID] = room;
                            array.push(r);
                        });
                    }
                }
                return array;
            },
            /**
             * The rooms object.
             */
            rooms : (function rooms() {
                var events = {};
                return {
                    /**
                     * Trigger the event
                     * @param event the event name
                     * @param roomId the room id
                     * @param param the parameter
                     */
                    trigger : function (event, roomId, param) {
                        if (event && events[roomId + event]) {
                            if (typeof (events[roomId + event]) === "function") {
                                events[roomId + event](param);
                            } else {
                                console.log('Failed to trigger ' + event);
                            }
                        }
                    },
                    /**
                     * Register the event.
                     * @param event the event name
                     * @param roomId the room id
                     * @param method the event method
                     */
                    on: function (event, roomId, method) {
                        var tmp = null;
                        angular.forEach($rootScope.lobbyMenu, function (lobby) {
                            if (lobby.roomID === roomId) {
                                tmp = lobby;
                            }
                        });
                        if (tmp === null && $rootScope.roundData) {
                            angular.forEach($rootScope.roundData, function (contest) {
                                if (contest.coderRooms) {
                                    angular.forEach(contest.coderRooms, function (r) {
                                        if (r.roomID === roomId) {
                                            tmp = r;
                                        }
                                    });
                                }

                                if (contest.adminRoom && (contest.adminRoom.roomID === roomId)) {
                                    tmp = contest.adminRoom;
                                }
                            });
                        }

                        if (tmp === null) {
                            console.log('The room id is invalid.');
                        } else {
                            if (helper.PLUGIN_ROOMS_EVENT[event] && (typeof method === "function")) {
                                events[roomId + event] = method;
                            } else {
                                console.log('The event name is invalid.');
                            }
                        }
                    },
                    /**
                     * Get event.
                     * @param event the event name
                     * @param roomId the room id
                     * @returns {*} the event method
                     */
                    getEvent: function (event, roomId) {
                        return events[roomId + event];
                    },
                    /**
                     * Enter the round.
                     * @param roundId the round id
                     * @param roomId the room id
                     * @param callback the callback method
                     */
                    enter: function (roundId, roomId, callback) {
                        var tmp = getRound(roundId), room, empty = '';

                        if (tmp === null) {
                            console.log('The round id is invalid.');
                        } else {
                            room = null;
                            if (tmp.coderRooms) {
                                angular.forEach(tmp.coderRooms, function (r) {
                                    if ((r.roomID + empty) === (roomId + empty)) {
                                        room = r;
                                    }
                                });
                            }

                            if (room === null && tmp.adminRoom && (tmp.adminRoom.roomID === roomId)) {
                                room = tmp.adminRoom;
                            }

                            if (room === null) {
                                console.log('The room id is invalid.');
                            } else {
                                $rootScope.competingRoomID = roomId;
                                // requests will be sent by the resolvers
                                $state.go(helper.STATE_NAME.Contest, {
                                    contestId: roundId
                                }, {reload: true});

                                if (callback) {
                                    callback();
                                }
                            }
                        }
                    }
                };
            }())
        };
    }());

    arena.leaderboard  = (function leaderboard() {
        var events = {};
        return {
            /**
             * Trigger the event.
             * @param event the event name
             * @param roundId the round id
             * @param param the parameter
             */
            trigger : function (event, roundId, param) {
                if (event && events[roundId + event]) {
                    if (typeof (events[roundId + event]) === "function") {
                        events[roundId + event](param);
                    } else {
                        console.log('Failed to trigger ' + event);
                    }
                }
            },
            /**
             * Register the event.
             * @param event the event name
             * @param roundId the round id
             * @param method the event method
             */
            on: function (event, roundId, method) {
                var tmp = getRound(roundId);

                if (tmp === null) {
                    console.log('The round id is invalid.');
                } else {
                    if (helper.PLUGIN_LEADER_BOARD_EVENT[event] && (typeof method === "function")) {
                        events[roundId + event] = method;
                    } else {
                        console.log('The event name is invalid.');
                    }
                }
            },
            /**
             * Get event.
             * @param event the event name.
             * @param roundId the round id.
             * @returns {*} the event method.
             */
            getEvent: function (event, roundId) {
                return events[roundId + event];
            }
        };
    }());

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
    $rootScope.forcedLogout = false;
    $rootScope.startSyncResponse = false;
    $rootScope.lastServerActivityTime = new Date().getTime();
    $rootScope.leaderboard = [];
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        //use whitelist approach
        var allowedStates = [helper.STATE_NAME.Anonymous, helper.STATE_NAME.AnonymousHome, helper.STATE_NAME.LoggingIn, helper.STATE_NAME.Logout],
            publicState = false,
            deepLinks = [helper.STATE_NAME.DefaultContest, helper.STATE_NAME.Contest, helper.STATE_NAME.Member, helper.STATE_NAME.PracticeCode, helper.STATE_NAME.Coding],
            isDeepLink = false,
            deepLink = {};

        angular.forEach(deepLinks, function (deepLink) {
            isDeepLink = isDeepLink || (toState.name === deepLink);
        });

        angular.forEach(allowedStates, function (allowedState) {
            publicState = publicState || (toState.name === allowedState);
        });
        if (!publicState && !$rootScope.isLoggedIn) {
            event.preventDefault();
            // Store deep link to session
            if (isDeepLink) {
                deepLink = {};
                deepLink.state = toState.name;
                switch (toState.name) {
                case helper.STATE_NAME.DefaultContest:
                case helper.STATE_NAME.Contest:
                    deepLink.contestId = toParams.contestId;
                    break;
                case helper.STATE_NAME.Member:
                    deepLink.memberName = toParams.memberName;
                    break;
                case helper.STATE_NAME.PracticeCode:
                    deepLink.roundId = toParams.roundId;
                    deepLink.componentId = toParams.componentId;
                    deepLink.problemId = toParams.problemId;
                    deepLink.divisionId = toParams.divisionId;
                    deepLink.roomId = toParams.roomId;
                    break;
                case helper.STATE_NAME.Coding:
                    deepLink.roundId = toParams.roundId;
                    deepLink.problemId = toParams.problemId;
                    deepLink.divisionId = toParams.divisionId;
                    break;
                }
                sessionHelper.setDeepLink(deepLink);
            }
            $state.go(helper.STATE_NAME.AnonymousHome);
        }
        // Move user to deep link, if stored
        if (sessionHelper.getDeepLink() && $rootScope.isLoggedIn) {
            deepLink = sessionHelper.getDeepLink();
            if (deepLink.state === helper.STATE_NAME.DefaultContest || deepLink.state === helper.STATE_NAME.Contest) {
                sessionHelper.setDeepLink({});
                event.preventDefault();
                $state.go(deepLink.state, {
                    contestId: deepLink.contestId
                }, {reload: true});
            } else if (deepLink.state === helper.STATE_NAME.Member) {
                sessionHelper.setDeepLink({});
                event.preventDefault();
                $state.go(deepLink.state, {
                    memberName: deepLink.memberName
                }, {reload: true});
            } else if (deepLink.state === helper.STATE_NAME.PracticeCode) {
                sessionHelper.setDeepLink({});
                event.preventDefault();
                $state.go(deepLink.state, {
                    roundId : deepLink.roundId,
                    componentId : deepLink.componentId,
                    problemId: deepLink.problemId,
                    divisionId : deepLink.divisionId,
                    roomId : deepLink.roomId
                }, {reload: true});
            } else if (deepLink.state === helper.STATE_NAME.Coding) {
                sessionHelper.setDeepLink({});
                event.preventDefault();
                $state.go(deepLink.state, {
                    roundId : deepLink.roundId,
                    problemId : deepLink.problemId,
                    divisionId : deepLink.divisionId
                }, {reload: true});
            }
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
            if (!$rootScope.reconnected) {
                $rootScope.connected = true;
            }
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
     * Get current state.
     * @returns {*} the state instance.
     */
    $rootScope.currentState = function () {
        return $state;
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

    $rootScope.twitterLoaded = false;
    /**
     * Loads the Twitter library.
     * @since 1.14
     */
    $rootScope.loadTwitterLibrary = function () {
        $.getScript('//platform.twitter.com/widgets.js', function () {
            $rootScope.twitterLoaded = true;
        });
    };
    $rootScope.loadTwitterLibrary();
}]);
