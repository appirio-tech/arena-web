#!/bin/bash

# Set environment variables that will be used by grunt.
# The idea here is to still conform to 12factor.net/config even though this is 
# a client side app and environment variables are not accessible. These
# values will be copied by grunt into the config.js 

export NODE_ENV=development

# Currently arena-web does not use an API backend. If we do end up 
# adding in calls from TC api we will need this value any setup where the 
# API is on different domain than where the client was served...
export API_DOMAIN=http://tc.cloud.topcoder.com:8081/v2

export AUTH0_CONNECTION=vm-ldap-connection
export AUTH0_DOMAIN=sma.auth0.com
export AUTH0_CLIENT_ID=CMaBuwSnY0Vu68PLrWatvvu3iIiGPh7t
export CALLBACK_URL=https://tc.cloud.topcoder.com/reg2/callback.action

# web socket server url
export WEB_SOCKET_URL=http://tc.cloud.topcoder.com:5037

# the cookie key of sso token
export SSO_KEY=tcsso_vm

# the HTTP server port
export PORT=3000

export STATIC_FILE_HOST="http://arena.cloud.topcoder.com:$PORT"

export AWS_ACCESS_KEY_ID=
export AWS_ACCESS_KEY=
export AWS_BUCKET=
export AWS_FOLDER='arena/md/web-v<%= pkg.version %>/'

export GOOGLE_ANALYTICS_TRACKING_ID=

# the connection timeout to web socket
export CONNECTION_TIMEOUT=30000

# the member photo host
export MEMBER_PHOTO_HOST=http://apps.topcoder.com

export JWT_TOKEN=tcjwt_vm
export CHAT_LENGTH=400
export LOCAL_STORAGE_EXPIRE_TIME=1800