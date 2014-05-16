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
                dest: 'arena/web-v<%= pkg.version %>/'
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
                        { match : 'CALLBACK_URL', replacement: process.env.CALLBACK_URL },
                        { match : 'WEB_SOCKET_URL', replacement: process.env.WEB_SOCKET_URL },
                        { match : 'API_DOMAIN', replacement: process.env.API_DOMAIN },
                        { match : 'SSO_KEY', replacement: process.env.SSO_KEY }
                    ]
                },
                files : [
                    { src: 'app/js/config.def.js', dest: 'app/js/config.js' }
                ]
            },
            cdn: {
                options: {
                    patterns: [
                        { match : 'STATIC_FILE_HOST', replacement: process.env.STATIC_FILE_HOST }
                    ]
                },
                files: [
                    { expand: true, cwd: 'app/', src: '**/*.html', dest: 'build/' }
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
            build: {
                src: [
                    'app/css/bootstrap.min.css',
                    'app/css/app.css',
                    'app/css/local.css',
                    'app/css/topcoder.css',
                    'bower_components/codemirror/lib/codemirror.css',
                    'bower_components/codemirror/addon/fold/foldgutter.css',
                    'bower_components/fullcalendar/fullcalendar.css',
                    'thirdparty/jquery.qtip/jquery.qtip.min.css',
                    'thirdparty/ng-scrollbar/dist/ng-scrollbar.min.css'
                ],
                // Compile to a single file to add a script tag for in your HTML
                dest: 'build/css/bundle.css'
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
                    { src: './build/**' }
                ]
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

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['clean:build', 'replace:build', 'browserify:build', 'cssmin:build', 'copy:build', 'replace:cdn']);
    grunt.registerTask('build', ['clean:build', 'replace:build', 'browserify:build', 'cssmin:build', 'copy:build', 'replace:cdn']);
    //release tasks work out of build directory - build must be run first!
    grunt.registerTask('release', ['clean:release', 'uglify:release', 'copy:release']);
    grunt.registerTask('heroku', ['build']);

    grunt.registerTask('deploy-cdn', ['s3:deploy']);

    grunt.registerTask('deploy-compress', ['compress:deploy']);
};
