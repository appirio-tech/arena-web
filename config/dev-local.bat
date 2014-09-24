:: Set environment variables that will be used by grunt.
:: The idea here is to still conform to 12factor.net/config even though this is
:: a client side app and environment variables are not accessible. These
:: values will be copied by grunt into the config.js

set NODE_ENV=development
:: Set this value if the API you are calling is hosted in a different
:: domain from where the front end app is served. Be sure the API allows CORS.
set AUTH0_CONNECTION=vm-ldap-connection
set AUTH0_DOMAIN=sma.auth0.com
set AUTH0_CLIENT_ID=CMaBuwSnY0Vu68PLrWatvvu3iIiGPh7t
set CALLBACK_URL=https://tc.cloud.topcoder.com/reg2/callback.action


:: web socket server url
set WEB_SOCKET_URL=http://tc.cloud.topcoder.com:5037

:: the cookie key of sso token
set SSO_KEY=tcsso_vm

:: the HTTP server port
set PORT=3000

set STATIC_FILE_HOST=http://arena.cloud.topcoder.com:%PORT%

set AWS_ACCESS_KEY_ID=
set AWS_ACCESS_KEY=
set AWS_BUCKET=
set AWS_FOLDER=arena\md\web-v0.0.2\

:: the connection timeout to web socket
set CONNECTION_TIMEOUT=30000

:: the member photo host
set MEMBER_PHOTO_HOST=http://apps.topcoder.com

set API_DOMAIN=http://tc.cloud.topcoder.com:8081/v2
set JWT_TOKEN=tcjwt_vm

set CHAT_LENGTH=400
set LOCAL_STORAGE_EXPIRE_TIME=1800