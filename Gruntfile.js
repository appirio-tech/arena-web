/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
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
 * @author amethystlei, flytoj2ee
 * @version 1.3
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
                        { match : 'WEB_SOCKET_URL', replacement: process.env.WEB_SOCKET_URL },
                        { match : 'API_DOMAIN', replacement: process.env.API_DOMAIN },
                        { match : 'SSO_KEY', replacement: process.env.SSO_KEY },
                        { match : 'STATIC_FILE_HOST', replacement: process.env.STATIC_FILE_HOST },
                        { match : 'GOOGLE_ANALYTICS_TRACKING_ID', replacement: process.env.GOOGLE_ANALYTICS_TRACKING_ID },
                        { match : 'CONNECTION_TIMEOUT', replacement: process.env.CONNECTION_TIMEOUT },
                        { match : 'MEMBER_PHOTO_HOST', replacement: process.env.MEMBER_PHOTO_HOST },
                        { match : 'JWT_TOKEN', replacement: process.env.JWT_TOKEN },
                        { match : 'CHAT_LENGTH', replacement: process.env.CHAT_LENGTH },
                        { match : 'LOCAL_STORAGE_EXPIRE_TIME', replacement: process.env.LOCAL_STORAGE_EXPIRE_TIME }
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
                        { match : 'GOOGLE_ANALYTICS_TRACKING_ID', replacement: process.env.GOOGLE_ANALYTICS_TRACKING_ID }
                    ]
                },
                files: [
                    { expand: true, cwd: 'app/', src: '**/*.html', dest: 'build/' },
                    { expand: true, cwd: 'app/data', src: '**/*.json', dest: 'build/data' }
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
                    'bower_components/codemirror/lib/codemirror.css',
                    'bower_components/codemirror/addon/fold/foldgutter.css',
                    'bower_components/fullcalendar/fullcalendar.css',
                    'thirdparty/jquery.qtip/jquery.qtip.min.css',
                    'thirdparty/ng-scrollbar/dist/ng-scrollbar.min.css',
                    'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                    'app/css/notifications.css',
                    'app/css/app.css',
                    'app/css/local.css',
                    'app/css/dark/topcoder.css',
                    'app/css/dark/darkTheme.css'
                ],
                // Compile to a single file to add a script tag for in your HTML
                dest: 'build/css/bundle.css'
            },
            light: {
                files: {
                    'build/css/bundle-light.css': [
                        'app/css/bootstrap.min.css',
                        'bower_components/codemirror/lib/codemirror.css',
                        'bower_components/codemirror/addon/fold/foldgutter.css',
                        'bower_components/fullcalendar/fullcalendar.css',
                        'thirdparty/jquery.qtip/jquery.qtip.min.css',
                        'thirdparty/ng-scrollbar/dist/ng-scrollbar.min.css',
                        'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                        'app/css/notifications.css',
                        'app/css/app.css',
                        'app/css/local.css',
                        'app/css/light/topcoder.css',
                        'app/css/light/lightTheme.css'
                    ]
                }
            },
            orange: {
                files: {
                    'build/css/bundle-orange.css': [
                        'app/css/bootstrap.min.css',
                        'bower_components/codemirror/lib/codemirror.css',
                        'bower_components/codemirror/addon/fold/foldgutter.css',
                        'bower_components/fullcalendar/fullcalendar.css',
                        'thirdparty/jquery.qtip/jquery.qtip.min.css',
                        'thirdparty/ng-scrollbar/dist/ng-scrollbar.min.css',
                        'thirdparty/bootstrap-notify/css/bootstrap-notify.css',
                        'app/css/notifications.css',
                        'app/css/app.css',
                        'app/css/local.css',
                        'app/css/orange/topcoder.css',
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
                src: ['**/*.html', 'img/**', 'fonts/**', 'data/**', 'robots.txt'],
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

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['clean:build', 'replace:build', 'browserify:build', 'cssmin:dark', 'cssmin:light', 'cssmin:orange', 'copy:build', 'replace:cdn']);
    grunt.registerTask('build', ['clean:build', 'replace:build', 'browserify:build', 'cssmin:dark', 'cssmin:light', 'cssmin:orange', 'copy:build', 'replace:cdn']);
    //release tasks work out of build directory - build must be run first!
    grunt.registerTask('release', ['clean:release', 'uglify:release', 'copy:release']);
    grunt.registerTask('heroku', ['build']);

    grunt.registerTask('deploy-cdn', ['s3:deploy']);

    grunt.registerTask('deploy-compress', ['compress:deploy']);

    grunt.registerTask('jslint', ['jshint:all']);
};
