#!/bin/bash

# Set environment variables that will be used by grunt.
# The idea here is to still conform to 12factor.net/config even though this is 
# a client side app and environment variables are not accessible. These
# values will be copied by grunt into the config.js 

export NODE_ENV=development
# Set this value if the API you are calling is hosted in a different
# domain from where the front end app is served. Be sure the API allows CORS.
export API_DOMAIN=sma.auth0.com
export AUTH0_CLIENT_ID=CMaBuwSnY0Vu68PLrWatvvu3iIiGPh7t
export CALLBACK_URL=https://tc.cloud.topcoder.com/reg2/callback.action

# web socket server url
export WEB_SOCKET_URL=https://tc.cloud.topcoder.com:5037

# the cookie key of sso token
export SSO_KEY=tcsso_vm

# To make sure the auth0 works fine, the arena web should listen on 80 port
# you may need the root privilege to do that.
export PORT=80
