'use strict';
require('./../../thirdparty/jquery/jquery');
require('./../../bower_components/angular/angular');
require('./../../bower_components/angular-resource/angular-resource');
require('./../../bower_components/angular-sanitize/angular-sanitize');
require('./../../bower_components/angular-ui-router/release/angular-ui-router');
require('./../../bower_components/angular-ui-bootstrap/ui-bootstrap-tpls-0.9.0');
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
require('./../../bower_components/angular-timer/dist/angular-timer');
require('./../../bower_components/jquery-ui/ui/jquery-ui.js');
require('./../../bower_components/angular-ui-calendar/src/calendar.js');
require('./../../bower_components/fullcalendar/fullcalendar.js');
require('./../../thirdparty/jquery.qtip/jquery.qtip.min.js');
require('./../../thirdparty/ng-scrollbar/dist/ng-scrollbar.js');

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
    };

// load controllers
controllers.anonHomeCtrl = require('./controllers/anonHomeCtrl');
controllers.errorCtrl = require('./controllers/errorCtrl');
controllers.userProfileCtrl = require('./controllers/userProfileCtrl');
controllers.leaderboardUsersCtrl = require('./controllers/leaderboardUsersCtrl');
controllers.activeContestsCtrl = require('./controllers/activeContestsCtrl');
controllers.userCodingCtrl = require('./controllers/userCodingCtrl');
controllers.userCodingEditorCtrl = require('./controllers/userCodingEditorCtrl');
controllers.userContestCtrl = require('./controllers/userContestCtrl');
controllers.contestCountdownCtrl = require('./controllers/contestCountdownCtrl');
controllers.contestStatsCtrl = require('./controllers/contestStatsCtrl');
controllers.connectionStatusCtrl = require('./controllers/connectionStatusCtrl');
controllers.tcTimeCtrl = require('./controllers/tcTimeCtrl');
controllers.overviewCtrl = require('./controllers/overviewCtrl');
controllers.baseCtrl = require('./controllers/baseCtrl');
controllers.contestPlanCtrl = require('./controllers/contestPlanCtrl');
controllers.messageArenaCtrl = require('./controllers/messageArenaCtrl');

// load directives
directives.leaderboardusers = require('./directives/leaderboardusers');
directives.activecontests = require('./directives/activecontests');
directives.codingproblem = require('./directives/codingproblem');
directives.codingeditor = require('./directives/codingeditor');
directives.contestcountdown = require('./directives/contestcountdown');
directives.conteststats = require('./directives/conteststats');
directives.connectionstatus = require('./directives/connectionstatus');
directives.topcodertime = require('./directives/topcodertime');
directives.overview = require('./directives/overview');
directives.contestPlan = require('./directives/contestPlan');
directives.messageArena = require('./directives/messageArena');

/*global $ : false, angular : false */
/*jslint nomen: true, browser: true */

////////////////////////////
//    MAIN APP MODULE     //
////////////////////////////

// WARNING: ALL dependency injections must be explicitly declared for release js minification to work!!!!!
// SEE: http://thegreenpizza.github.io/2013/05/25/building-minification-safe-angular.js-applications/ for explanation.

var main = angular.module('angularApp', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngSanitize', 'timer', 'ui.codemirror', 'ui.calendar', 'ngScrollbar']);

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

/////////////////
// CONTROLLERS //
main.controller('anonHomeCtrl', controllers.anonHomeCtrl);
main.controller('errorCtrl', controllers.errorCtrl);
main.controller('userProfileCtrl', controllers.userProfileCtrl);
main.controller('leaderboardUsersCtrl', controllers.leaderboardUsersCtrl);
main.controller('activeContestsCtrl', controllers.activeContestsCtrl);
main.controller('userCodingCtrl', controllers.userCodingCtrl);
main.controller('userCodingEditorCtrl', controllers.userCodingEditorCtrl);
main.controller('userContestCtrl', controllers.userContestCtrl);
main.controller('contestCountdownCtrl', controllers.contestCountdownCtrl);
main.controller('contestStatsCtrl', controllers.contestStatsCtrl);
main.controller('connectionStatusCtrl', controllers.connectionStatusCtrl);
main.controller('tcTimeCtrl', controllers.tcTimeCtrl);
main.controller('overviewCtrl', controllers.overviewCtrl);
main.controller('contestPlanCtrl', controllers.contestPlanCtrl);
main.controller('baseCtrl', controllers.baseCtrl);
main.controller('messageArenaCtrl', controllers.messageArenaCtrl);

/////////////////
// DIRECTIVES //

main.directive('leaderboardusers', directives.leaderboardusers);
main.directive('activecontests', directives.activecontests);
main.directive('codingproblem', directives.codingproblem);
main.directive('codingeditor', directives.codingeditor);
main.directive('contestcountdown', directives.contestcountdown);
main.directive('conteststats', directives.conteststats);
main.directive('connectionstatus', directives.connectionstatus);
main.directive('topcodertime', directives.topcodertime);
main.directive('overview', directives.overview);
main.directive('contestPlan', directives.contestPlan);
main.directive('messageArena', directives.messageArena);

//////////////////////////////////////
// ROUTING AND ROUTING INTERCEPTORS //

main.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
    //add an interceptor to always add authentication to api calls if logged in
    $httpProvider.interceptors.push(['sessionHelper', function (sessionHelper) {
        return {
            request: function (config) {
                if (config.url.match(/api/gi) && sessionHelper.isLoggedIn()) {
                    config.headers.Authorization = 'Bearer ' + sessionHelper.getJwt();
                    if (config.apiDomain) { config.headers.useXDomain = true; }
                }
                return config;
            }
        };
    }]);

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
                pageTitle: "Application Dashboard",
                pageMetaKeywords: "dashboard"
            },
            templateUrl: 'partials/user.dashboard.html'
        })
        .state('user.coding', {
            url: '/coding/{problemId}',
            data: {
                pageTitle: "Coding Arena",
                pageMetaKeywords: "coding,arena"
            },
            templateUrl: 'partials/user.coding.html',
            controller: 'userCodingCtrl'
        })
        .state('user.contest', {
            url: '/contests/{contestId}/{divisionId}',
            data: {
                pageTitle: "Contest",
                pageMetaKeywords: "contest"
            },
            templateUrl: 'partials/user.contest.html',
            controller: 'userContestCtrl'
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
                pageTitle: "Home Page",
                pageMetaKeywords: "Home Page"
            }
        })
        .state('loggingin', {
            //eg for auth0
            //url: '/access_token={accessToken}&id_token={idToken}&token_type={tokenType}',
            url: '/loggingin',
            template: 'Completing login... One moment please...',
            resolve: {
                finishLogin: resolvers.finishLogin
            }
        });
}]);

main.run(['$rootScope', '$state', 'sessionHelper', 'socket', function ($rootScope, $state, sessionHelper, socket) {
    //consider exposing states and state params to all templates
    $rootScope.$state = $state;

    $rootScope.$on('$stateChangeStart', function (event, toState) {
        //use whitelist approach
        var allowedStates = ['anon', 'anon.home', 'loggingin', 'user.logout'],
            publicState = false,
            res = /\(([A-Z]{3})\)/.exec(new Date().toString());

        angular.forEach(allowedStates, function (allowedState) {
            publicState = publicState || (toState.name === allowedState);
        });

        if (!publicState && !$rootScope.isLoggedIn) {
            event.preventDefault();
            $state.go('anon.home');
        }
        //expose this for the base.html template
        $rootScope.loggedIn = function () {
            return $rootScope.isLoggedIn;
        };
        $rootScope.username = sessionHelper.getUsername;
        $rootScope.timezone = res ? res[1] : "";

        socket.on('connect', function () {
            $rootScope.connected = true;
        });
    });
}]);
