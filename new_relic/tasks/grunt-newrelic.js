"use strict";

module.exports = function(grunt) {
  
    grunt.registerTask("newrelic", "generate a newrelic.js file", function() {
        var environment;

        try {
            var target = grunt.config.get('newrelic'),
                config_path = target.browser["development"], 
                applicationID = 'applicationID : "' + config_path.applicationID + '"',
                license_key = 'license_key : "' + config_path.licenseKey + '"';
        }
        catch(e) {
            grunt.log.ok("Unable to load configuration file %s", config_path);
        }

        try {
            var newrelic_file = grunt.file.read("./new_relic/newrelic.js")
                    .replace("licenseKey:license_key" , license_key)
                    .replace("applicationID:applicationID", applicationID)
        }
        catch(e) {
            grunt.log.ok("Unable to load newrelic.js from %s", "./new_relic/newrelic.js");
        }

        try {
            grunt.file.write("./app/js/newrelic.js", newrelic_file);
            grunt.log.ok("newrelic.js saved to root");
        }
        catch(e) {
            grunt.log.ok("Unable to write newrelic.js");
        }   
    });
};
