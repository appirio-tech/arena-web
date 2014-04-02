'use strict';
require('./../../thirdparty/jquery/jquery');
require('./../../bower_components/angular/angular');
require('./../../bower_components/angular-resource/angular-resource');
require('./../../bower_components/angular-sanitize/angular-sanitize');
require('./../../bower_components/angular-ui-router/release/angular-ui-router');
var resolvers = require('./resolvers');
var factories = require('./factories');
var controllers = require('./controllers');
var directives = require('./directives');
require('./../../bower_components/angular-ui-bootstrap/ui-bootstrap-tpls-0.9.0');
/*global $ : false, angular : false */
/*jslint nomen: true, browser: true */


$(document).ready(function () {
    var fromTop = $(window).scrollTop();
    $(".hero .header").toggleClass("clean", (fromTop < 60));

    $(window).on("scroll", function () {
        fromTop = $(window).scrollTop();
        $(".hero .header").toggleClass("clean", (fromTop < 60));
    });
});



////////////////////////////
//    MAIN APP MODULE     //
////////////////////////////

// WARNING: ALL dependency injections must be explicitly declared for release js minification to work!!!!!
// SEE: http://thegreenpizza.github.io/2013/05/25/building-minification-safe-angular.js-applications/ for explanation.

var main = angular.module('angularApp', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngSanitize']);

///////////////
// FACTORIES //

main.factory('API', factories.API);
main.factory('sessionHelper', factories.sessionHelper);
main.factory('dashboardHelper', factories.dashboardHelper);


/////////////////
// CONTROLLERS //

main.controller('anonHomeCtrl', controllers.anonHomeCtrl);
main.controller('errorCtrl', controllers.errorCtrl);
main.controller('userProfileCtrl', controllers.userProfileCtrl);
main.controller('userDashboardCtrl', controllers.userDashboardCtrl);
main.controller('leaderboardUsersCtrl', controllers.leaderboardUsersCtrl);
main.controller('activeContestsCtrl', controllers.activeContestsCtrl);


/////////////////
// DIRECTIVES //

main.directive('leaderboardusers', directives.leaderboardusers);
main.directive('activecontests', directives.activecontests);

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
            templateUrl: 'partials/base.html'
        })
        .state('user.dashboard', {
            url: '/dashboard',
            data: {
                pageTitle: "Application Dashboard",
                pageMetaKeywords: "dashboard"
            },
            templateUrl: 'partials/user.dashboard.html',
            controller: 'userDashboardCtrl'
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
                finishLogin: resolvers.finishLogin,
                alreadyLoggedIn : resolvers.alreadyLoggedIn
            }
        });
}]);

main.run(['$rootScope', '$state', 'sessionHelper', function ($rootScope, $state, sessionHelper) {
    //consider exposing states and state params to all templates
    $rootScope.$state = $state;

    $rootScope.$on('$stateChangeStart', function (event, toState) {
        //use whitelist approach
        var allowedStates = ['anon', 'anon.home', 'loggingin', 'user.logout'],
            publicState = false;

        angular.forEach(allowedStates, function (allowedState) {
            publicState = publicState || (toState.name === allowedState);
        });

        if (!publicState && !sessionHelper.isLoggedIn()) {
            event.preventDefault();
            $state.go('anon.home');
        }
        //expose this for the base.html template
        $rootScope.loggedIn = sessionHelper.isLoggedIn;
        $rootScope.username = sessionHelper.getUsername;
    });
}]);
