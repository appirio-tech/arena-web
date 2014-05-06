#!/bin/bash

# Set environment variables that will be used by grunt.
# The idea here is to still conform to 12factor.net/config even though this is 
# a client side app and environment variables are not accessible. These
# values will be copied by grunt into the config.js 

export NODE_ENV=development
# Set this value if the API you are calling is hosted in a different
# domain from where the front end app is served. Be sure the API allows CORS.
export API_DOMAIN=

export PORT=3000

export AWS_ACCESS_KEY_ID=
export AWS_ACCESS_KEY=
export AWS_BUCKET=
