/*
 * Copyright (C) 2014-2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * This module defines the grunt tasks used for packaging the application.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated the logics for CSS bundles for different themes.
 *   app/css/app.css contains the layout styles.
 *   app/css/darkTheme.css and app/css/topcoder.css contain the dark theme colors.
 *   app/css/light/lightTheme.css and app/css/topcoder.css contain the light theme colors.
 *   bundle.css wraps app/css/app.css and dark theme related files.
 *   bundle-light.css wraps app/css/app.css and light theme related files.
 * - Fixed JSLint issues.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Contest Creation Wizard):
 * - Added jwt token setting.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Added LOCAL_STORAGE_EXPIRE_TIME setting.
 *
 * Changes in version 1.4 (PoC Assembly - Share Member Status To Facebook and Twitter):
 * - Added Facebook API Client ID to the configuration.
 * - Added additional information to the configuration to handle social network messages.
 *
 * Changes in version 1.5 (PoC Assembly - Invite friends To Participate On A Match From Facebook and Twitter):
 * - Added facebook / twitter related setting.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Match Summary Widget):
 * - Added SUMMARY_TOPCODER_COUNT setting to limit number of coders in match summary leaderboard table.
 *
 * Changes in version 1.7 (Module Assembly - Practice Problem Listing Page):
 * - Added PRACTICE_PROBLEM_LIST_PAGE_SIZE setting.
 *
 * Changes in version 1.8 (Member Feedback Widget Assembly):
 * - Added FEEDBACK_SPREADSHEET_URL setting.
 * - Added FEEDBACK_MAXLENGTH for feedback text
 *
 * Changes in version 1.9 (PoC Assembly - Web Arena - Chat Widget Improvement):
 * - Added CHAT_ICON_DISAPPEAR_TIME setting.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena - Challenges Advertising Widget):
 * - Added TC_HOSTNAME and CHALLENGE_ADVERTISING_UPDATE
 *   to handle showing and updating challenge advertising data.
 *
 * Changes in version 1.11 (Module Assembly - Web Arena Max Live Leaderboard Assembly):
 * - Added MAX_LIVE_LEADERBOARD setting.
 *
 * Changes in version 1.11 (Web Arena - Scrolling Issues Fixes Assembly):
 * - Added CSS files for codemirror's scroll plugin
 *
 * Changes in version 1.12 (Module Assembly - Web Arena - Add Save Feature to Code Editor):
 * - Added AUTO_SAVING_CODE_INTERVAL setting.
 *
 * Changes in version 1.13 (Add Settings Panel for Chat Widget):
 * - Added CSS references for switch widget
 *
 * Changes in version 1.14 (Web Arena - Leaderboard Performance Improvement v1.0):
 * - Added LEADERBOARD_REFRESH_TIME_GAP to improve leaderboard performance.
 * - Fixed lint issues.
 *
 * Changes in version 1.15 (Web Arena - Update Match Summary Tab Within Active Matches Widget):
 * - Added ACTIVE_MATCHES_SUMMARY_TOPCODER_COUNT setting.
 *
 * Changes in version 1.16 (Replace ng-scrollbar with prefect-scrollbar):
 * - Remove CSS references for ng-scrollbar
 *
 * Changes in version 1.17 (Web Arena - Replace Code Mirror With Ace Editor):
 * - Remove CSS references for codemirror
 *
 * @author amethystlei, flytoj2ee, dexy, shubhendus, Helstein, xjtufreeman, MonicaMuranyi
 * @version 1.17
 */
'use strict';
/*global module, process*/
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        s3: {
            options: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_ACCESS_KEY,
                bucket: process.env.AWS_BUCKET,
                access: 'public-read',
                gzip: false
            },
            deploy: {
                cwd: 'build/',
                src: '**',
                dest: process.env.AWS_FOLDER
            }
        },
        clean : {
            build: ['build/'],
            release: ['release/']
        },
        replace : {
            build: {
                options: {
                    patterns: [
                        { match : 'AUTH0_CLIENT_ID', replacement: process.env.AUTH0_CLIENT_ID },
                        { match : 'AUTH0_DOMAIN', replacement: process.env.AUTH0_DOMAIN },
                        { match : 'AUTH0_CONNECTION', replacement: process.env.AUTH0_CONNECTION },
                        { match : 'CALLBACK_URL', replacement: process.env.CALLBACK_URL },
                        { match : 'CHALLENGE_ADVERTISING_INTERVAL', replacement: process.env.CHALLENGE_ADVERTISING_INTERVAL },
                        { match : 'CHALLENGE_ADVERTISING_UPDATE', replacement: process.env.CHALLENGE_ADVERTISING_UPDATE },
                        { match : 'WEB_SOCKET_URL', replacement: process.env.WEB_SOCKET_URL },
                        { match : 'API_DOMAIN', replacement: process.env.API_DOMAIN },
                        { match : 'SSO_KEY', replacement: process.env.SSO_KEY },
                        { match : 'STATIC_FILE_HOST', replacement: process.env.STATIC_FILE_HOST },
                        { match : 'GOOGLE_ANALYTICS_TRACKING_ID', replacement: process.env.GOOGLE_ANALYTICS_TRACKING_ID },
                        { match : 'CONNECTION_TIMEOUT', replacement: process.env.CONNECTION_TIMEOUT },
                        { match : 'MEMBER_PHOTO_HOST', replacement: process.env.MEMBER_PHOTO_HOST },
                        { match : 'JWT_TOKEN', replacement: process.env.JWT_TOKEN },
                        { match : 'CHAT_LENGTH', replacement: process.env.CHAT_LENGTH },
                        { match : 'LOCAL_STORAGE_EXPIRE_TIME', replacement: process.env.LOCAL_STORAGE_EXPIRE_TIME },
                        { match : 'FACEBOOK_API_ID', replacement: process.env.FACEBOOK_API_ID },
                        { match : 'SOCIAL_STATUS_TEMPLATE', replacement: process.env.SOCIAL_STATUS_TEMPLATE },
                        { match : 'SOCIAL_ARENA_URL', replacement: process.env.SOCIAL_ARENA_URL },
                        { match : 'SOCIAL_ARENA_DESCRIPTION', replacement: process.env.SOCIAL_ARENA_DESCRIPTION },
                        { match : 'SOCIAL_ARENA_TITLE', replacement: process.env.SOCIAL_ARENA_TITLE },
                        { match : 'TWEET_TEXT', replacement: process.env.TWEET_TEXT },
                        { match : 'TWEET_URL', replacement: process.env.TWEET_URL },
                        { match : 'FACEBOOK_LINK', replacement: process.env.FACEBOOK_LINK },
                        { match : 'DIVISION_LEADERBOARD_LIMIT', replacement: process.env.DIVISION_LEADERBOARD_LIMIT },
                        { match : 'SUMMARY_TOPCODER_COUNT', replacement: process.env.SUMMARY_TOPCODER_COUNT },
                        { match : 'PRACTICE_PROBLEM_LIST_PAGE_SIZE', replacement: process.env.PRACTICE_PROBLEM_LIST_PAGE_SIZE },
                        { match : 'REGISTRATION_URL', replacement: process.env.REGISTRATION_URL },
                        { match : 'PW_RESET_URL', replacement: process.env.PW_RESET_URL },
                        { match : 'SPINNER_TIMEOUT', replacement: process.env.SPINNER_TIMEOUT },
                        { match : 'FEEDBACK_SPREADSHEET_URL', replacement: process.env.FEEDBACK_SPREADSHEET_URL },
                        { match : 'FEEDBACK_MAXLENGTH', replacement: process.env.FEEDBACK_MAXLENGTH },
                        { match : 'KEYBOARD_SHORTCUT', replacement: process.env.KEYBOARD_SHORTCUT },
                        { match : 'CHAT_ICON_DISAPPEAR_TIME', replacement: process.env.CHAT_ICON_DISAPPEAR_TIME },
                        { match : 'TC_HOSTNAME', replacement: process.env.TC_HOSTNAME },
                        { match : 'MAX_LIVE_LEADERBOARD', replacement: process.env.MAX_LIVE_LEADERBOARD },
                        { match : 'AUTO_SAVING_CODE_INTERVAL', replacement: process.env.AUTO_SAVING_CODE_INTERVAL },
                        { match : 'LEADERBOARD_REFRESH_TIME_GAP', replacement: process.env.LEADERBOARD_REFRESH_TIME_GAP },
                        { match : 'ACTIVE_MATCHES_SUMMARY_TOPCODER_COUNT', replacement: process.env.ACTIVE_MATCHES_SUMMARY_TOPCODER_COUNT }
                    ]
                },
                files : [
                    { src: 'app/js/config.def.js', dest: 'app/js/config.js' }
                ]
            },
            cdn: {
                options: {
                    patterns: [
                        { match : 'STATIC_FILE_HOST', replacement: process.env.STATIC_FILE_HOST },
                        { match : 'GOOGLE_ANALYTICS_TRACKING_ID', replacement: process.env.GOOGLE_ANALYTICS_TRACKING_ID },
                        { match : 'SPONSOR_URL', replacement: process.env.SPONSOR_URL }
                    ]
                },
                files: [
                    { expand: true, cwd: 'app/', src: '**/*.html', dest: 'build/' },
                    { expand: true, cwd: 'app/data', src: '**/*.json', dest: 'build/data' }
                ]
            },
            sponsor: {
                options: {
                    patterns: [
                        { match : 'SPONSOR_LOGO_SMALL', replacement: process.env.SPONSOR_LOGO_SMALL },
                        { match : 'SPONSOR_LOGO', replacement: process.env.SPONSOR_LOGO }
                    ]
                },
                files: [
                    { src: 'build/css/bundle.css', dest: 'build/css/bundle.css' }
                ]
            }
        },
        browserify: {
            build: {
                // A single entry point for our app
                src: 'app/js/app.js',
                // Compile to a single file to add a script tag for in your HTML
                dest: 'build/js/bundle.js'
            }
        },
        cssmin: {
            dark: {
                src: [
                    'app/css/bootstrap.min.css',
                    'bower_components/fullcalendar/fullcalendar.css',
                    'bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css',
                    'thirdparty/jquery.qtip/jquery.qtip.min.css',
                    'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                    'thirdparty/perfect-scrollbar/perfect-scrollbar.css',
                    'app/css/notifications.css',
                    'app/css/app.css',
                    'app/css/local.css',
                    'app/css/dark/darkTheme.css'
                ],
                // Compile to a single file to add a script tag for in your HTML
                dest: 'build/css/bundle.css'
            },
            light: {
                files: {
                    'build/css/bundle-light.css': [
                        'app/css/bootstrap.min.css',
                        'bower_components/fullcalendar/fullcalendar.css',
                        'bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css',
                        'thirdparty/jquery.qtip/jquery.qtip.min.css',
                        'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                        'thirdparty/perfect-scrollbar/perfect-scrollbar.css',
                        'app/css/notifications.css',
                        'app/css/app.css',
                        'app/css/local.css',
                        'app/css/light/lightTheme.css'
                    ]
                }
            },
            orange: {
                files: {
                    'build/css/bundle-orange.css': [
                        'app/css/bootstrap.min.css',
                        'bower_components/fullcalendar/fullcalendar.css',
                        'bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css',
                        'thirdparty/jquery.qtip/jquery.qtip.min.css',
                        'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                        'thirdparty/perfect-scrollbar/perfect-scrollbar.css',
                        'app/css/notifications.css',
                        'app/css/app.css',
                        'app/css/local.css',
                        'app/css/orange/orangeTheme.css'
                    ]
                }
            }
        },
        uglify: {
            release: {
                src: 'build/js/bundle.js',
                dest: 'release/js/bundle.js'
            }
        },
        copy: {
            build: {
                // This copies all the html and images into the build/ folder. css and js were done already.
                expand: true,
                cwd: 'app/',
                src: ['**/*.html', 'img/**', 'fonts/**', 'data/**', 'robots.txt', 'js/newrelic.js'],
                dest: 'build/'
            },
            release: {
                // This copies all the html, css and images into the release/ folder. js was done already.
                expand: true,
                cwd: 'build/',
                src: ['**/*.html', 'img/**', 'css/**', 'fonts/**', 'data/**', 'robots.txt'],
                dest: 'release/'
            }
        },
        watch: {
            dev: {
                files: ['app/**', '!app/js/config.js'],
                tasks: ['build']
            }
        },
        compress: {
            deploy: {
                options: {
                    archive: './build.zip',
                    mode: 'zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: './build',
                        src: '**'
                    }
                ]
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'app/js/*.js'],
            options: {
                force: true
            }
        },
        newrelic : {
            browser : {
                development : {
                    licenseKey: process.env.NEWRELIC_BROWSER_LICENSCEKEY,
                    applicationID: process.env.NEWRELIC_BROWSER_APPLICATIONID
                }
            },
            server : {
                development : {
                    APP_NAME: process.env.NEWRELIC_SERVER_APPNAME,
                    LICENSE_KEY: process.env.NEWRELIC_SERVER_LICENSE_KEY,
                    LOGGING_LEVEL : process.env.NEWRELIC_SERVER_LOGGING_LEVEL
                }
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-aws');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadTasks('./new_relic/tasks');
    grunt.loadTasks('./new_relic/server_tasks');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['servernewrelic', 'newrelic', 'clean:build', 'replace:build', 'browserify:build', 'cssmin:dark', 'cssmin:light', 'cssmin:orange', 'copy:build', 'replace:cdn', 'replace:sponsor']);
    grunt.registerTask('build', ['servernewrelic', 'newrelic', 'clean:build', 'replace:build', 'browserify:build', 'cssmin:dark', 'cssmin:light', 'cssmin:orange', 'copy:build', 'replace:cdn', 'replace:sponsor']);
    //release tasks work out of build directory - build must be run first!
    grunt.registerTask('release', ['clean:release', 'uglify:release', 'copy:release']);
    grunt.registerTask('heroku', ['build']);

    grunt.registerTask('deploy-cdn', ['s3:deploy']);

    grunt.registerTask('deploy-compress', ['compress:deploy']);

    grunt.registerTask('jslint', ['jshint:all']);
};
