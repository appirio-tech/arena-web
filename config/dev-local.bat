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

:: Facebook API client ID
set FACEBOOK_API_ID=652496988181876

:: Message template to post conestant status to Facebook and Twitter
set SOCIAL_STATUS_TEMPLATE=I have participated in __MATCHES__ in #topcoder arena. My current rating is __RATING__.
:: The url of the Web Arena used in posting to Facebook and Twitter
set SOCIAL_ARENA_URL=https://arena.topcoder.com
:: The Web Arena description used in posting to Facebook wall
set SOCIAL_ARENA_DESCRIPTION=Algorithm matches for big brains. Solve these and bragging rights are yours.
:: The Web Arena Title used in posting to Facebook wall
set SOCIAL_ARENA_TITLE=TopCoder Arena

set TWEET_TEXT=I am about to participate in a #topcoder arena match, and I am challenging you! To register for the match click arena.topcoder.com.
set TWEET_URL=arena.topcoder.com
set FACEBOOK_LINK=arena.topcoder.com

set DIVISION_LEADERBOARD_LIMIT=20

:: The number of top coders shown in Match Summary widget
set SUMMARY_TOPCODER_COUNT=4

set PRACTICE_PROBLEM_LIST_PAGE_SIZE=10

set REGISTRATION_URL=http://tcqa1.topcoder.com/?action=callback

:: The time (in ms) after which the loading spinner times out if there is no activity.
set SPINNER_TIMEOUT=10000

:: Google Docs Spreadsheet URL for saving feedbacks and its maxlength
set FEEDBACK_SPREADSHEET_URL=https://script.google.com/macros/s/AKfycbxSDbXXaz5y1wDKWa_XToU2yyi0yAvAobXh8vF2WuT3VrFd14YN/exec
set FEEDBACK_MAXLENGTH=10000

:: keyboard shortcut configuration
set KEYBOARD_SHORTCUT=shift+tab

:: The time (in ms) to hide the entering / leaving icons in chat area
set CHAT_ICON_DISAPPEAR_TIME=3000

:: Time interval between challenge changes in challenge advertising widget (milliseconds)
set CHALLENGE_ADVERTISING_INTERVAL=5000

:: The time interval between updates of challenge advertising data from TC-API server (in ms)
set CHALLENGE_ADVERTISING_UPDATE=300000

:: The TopCoder host name
set TC_HOSTNAME=http://www.topcoder.com

:: The max live leaderboard number
set MAX_LIVE_LEADERBOARD=200