#!/bin/bash

# Set environment variables that will be used by grunt.
# The idea here is to still conform to 12factor.net/config even though this is
# a client side app and environment variables are not accessible. These
# values will be copied by grunt into the config.js

export NODE_ENV=development

# Currently arena-web does not use an API backend. If we do end up
# adding in calls from TC api we will need this value any setup where the
# API is on different domain than where the client was served...
export API_DOMAIN=http://localhost:8081

export AUTH0_CONNECTION=vm-ldap-connection
export AUTH0_DOMAIN=sma.auth0.com
export AUTH0_CLIENT_ID=CMaBuwSnY0Vu68PLrWatvvu3iIiGPh7t
export CALLBACK_URL=http://localhost:3000/reg2/callback.action

# web socket server url
export WEB_SOCKET_URL=http://localhost:7443

# the cookie key of sso token
export SSO_KEY=tcsso

# the HTTP server port
export PORT=3000

export STATIC_FILE_HOST="http://localhost:$PORT"

export AWS_ACCESS_KEY_ID=
export AWS_ACCESS_KEY=
export AWS_BUCKET=
export AWS_FOLDER='arena/md/web-v<%= pkg.version %>/'

export GOOGLE_ANALYTICS_TRACKING_ID=

# the connection timeout to web socket
export CONNECTION_TIMEOUT=30000

# the member photo host
export MEMBER_PHOTO_HOST=http://apps.topcoder.com

export JWT_TOKEN=tcjwt
export CHAT_LENGTH=400
export LOCAL_STORAGE_EXPIRE_TIME=1800

# Facebook API client ID
export FACEBOOK_API_ID=652496988181876

# Message template to post contestant status to Facebook and Twitter
export SOCIAL_STATUS_TEMPLATE='I have participated in __MATCHES__ in #topcoder arena. My current rating is __RATING__.'
# The url of the Web Arena used in posting to Facebook and Twitter
export SOCIAL_ARENA_URL=https://arena.topcoder.com
# The Web Arena description used in posting to Facebook wall
export SOCIAL_ARENA_DESCRIPTION='Algorithm matches for big brains. Solve these and bragging rights are yours.'
# The Web Arena Title used in posting to Facebook wall
export SOCIAL_ARENA_TITLE='TopCoder Arena'

# Message template to post contestant SRM results to Facebook and Twitter
export SOCIAL_SRM_RESULTS_STATUS_TEMPLATE='I was #__POSITION__ with __POINTS__ in the __SRM__NAME__ at the #topcoder Arena'
# The SRM results title used in posting to Facebook wall
export SOCIAL_SRM_RESULTS_STATUS_TITLE='__HANDLE__ shared his SRM results!'
# The SRM results caption used in posting to Facebook wall
export SOCIAL_SRM_RESULTS_STATUS_CAPTION='Join topcoder now!'
# The SRM results picture url used in posting to Facebook wall
export SOCIAL_SRM_RESULTS_STATUS_PICTURE_URL='https://dl.dropboxusercontent.com/u/14772132/arena-picture.png'

export TWEET_TEXT='I am about to participate in a #topcoder arena match, and I am challenging you! To register for the match click arena.topcoder.com.'
export TWEET_URL=arena.topcoder.com
export FACEBOOK_LINK=arena.topcoder.com

export DIVISION_LEADERBOARD_LIMIT=14

# The number of top coders shown in Match Summary widget
export SUMMARY_TOPCODER_COUNT=4

export PRACTICE_PROBLEM_LIST_PAGE_SIZE=10

export REGISTRATION_URL='http://tcqa1.topcoder.com/?action=callback'
export PW_RESET_URL='http://tcqa1.topcoder.com/password-recovery/'

# The time (in ms) after which the loading spinner times out if there is no activity.
export SPINNER_TIMEOUT=90000

# Google Docs Spreadsheet URL for saving feedbacks and its maxlength
export FEEDBACK_SPREADSHEET_URL=https://script.google.com/macros/s/AKfycbxSDbXXaz5y1wDKWa_XToU2yyi0yAvAobXh8vF2WuT3VrFd14YN/exec
export FEEDBACK_MAXLENGTH=10000

# shortcut configuration
export KEYBOARD_SHORTCUT='shift+tab'

# The time (in ms) to hide the entering / leaving icons in chat area
export CHAT_ICON_DISAPPEAR_TIME=3000

# Time interval between challenge changes in challenge advertising widget (milliseconds)
export CHALLENGE_ADVERTISING_INTERVAL=5000

# The time interval between updates of challenge advertising data from TC-API server (in ms)
export CHALLENGE_ADVERTISING_UPDATE=300000

# The time interval between updates of leaderboard summay (in ms)
export LEADERBOARD_REFRESH_TIME_GAP=1000

# The TopCoder host name
export TC_HOSTNAME=https://www.topcoder-dev.com

# The max live leaderboard number
export MAX_LIVE_LEADERBOARD=200

#The New Relic Browser KEY
export NEWRELIC_BROWSER_APPLICATIONID='4447207'
export NEWRELIC_BROWSER_LICENSCEKEY='28fb2fc79c'
#The New Relic Server KEY
export NEWRELIC_SERVER_APPNAME='testserver'
export NEWRELIC_SERVER_LICENSE_KEY='8f1eb71c599e28fb2b02e7e521488cbabb97174f'
export NEWRELIC_SERVER_LOGGING_LEVEL='trace'

# Time interval for auto saving code (milliseconds)
export AUTO_SAVING_CODE_INTERVAL=30000

# The number of top coders shown in Active Matches Summary widget
export ACTIVE_MATCHES_SUMMARY_TOPCODER_COUNT=3

# The file name of the sponsor logo images. The files must be at app/img/{theme}/
export SPONSOR_LOGO=../img/dark/company_logo.png
export SPONSOR_LOGO_SMALL=../img/dark/company_logo_small.png
export SPONSOR_LOGO_LIGHT=../img/light/company_logo.png
export SPONSOR_LOGO_SMALL_LIGHT=../img/light/company_logo_small.png
export SPONSOR_LOGO_ORANGE=../img/orange/company_logo.png
export SPONSOR_LOGO_SMALL_ORANGE=../img/orange/company_logo_small.png
export SPONSOR_URL=https://www.appirio.com
