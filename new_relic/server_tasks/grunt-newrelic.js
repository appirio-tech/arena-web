"use strict";

module.exports = function(grunt) {
  grunt.registerTask("servernewrelic", "generate a newrelic.js file", function(environment) {

    var environment;

    if (process.env.NODE_ENV == null) {
        environment = "development"
    }else{
        environment = process.env.NODE_ENV
    }

    try {
        var target = grunt.config.get('newrelic'),
            config_path = target.server[environment],
            app_name = "app_name : ['" + environment  + "-" + config_path.APP_NAME + "']",
            license_key = "license_key : '" + config_path.LICENSE_KEY + "'",
            logging_level = "level : " + config_path.LOGGING_LEVEL + "'";
        
    }
    catch(e) {
        grunt.log.ok("Unable to load configuration file %s", config_path);
    }

    try {
        var newrelic_file = grunt.file.read("./new_relic/server_tasks/server_newrelic.js")
                .replace("app_name : ['My Application']", app_name)
                .replace("license_key : 'license key here'", license_key)
                .replace("trace : 'trace'", logging_level);
    }
    catch(e) {
        grunt.log.ok("Unable to load newrelic.js from %s", "node_modules/newrelic/newrelic.js");
    }

    try {
        grunt.file.write("./app/js/server_newrelic.js", newrelic_file);
        grunt.log.ok("newrelic.js saved to root");
    }
    catch(e) {
        grunt.log.ok("Unable to write newrelic.js");
    }
  });
};