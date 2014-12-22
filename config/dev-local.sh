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

# Facebook API client ID
export FACEBOOK_API_ID=652496988181876

# Message template to post conestant status to Facebook and Twitter
export SOCIAL_STATUS_TEMPLATE='I have participated in __MATCHES__ in #topcoder arena. My current rating is __RATING__.'
# The url of the Web Arena used in posting to Facebook and Twitter
export SOCIAL_ARENA_URL=https://arena.topcoder.com
# The Web Arena description used in posting to Facebook wall
export SOCIAL_ARENA_DESCRIPTION='Algorithm matches for big brains. Solve these and bragging rights are yours.'
# The Web Arena Title used in posting to Facebook wall
export SOCIAL_ARENA_TITLE='TopCoder Arena'

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
export SPINNER_TIMEOUT=10000

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

# The TopCoder host name
export TC_HOSTNAME=http://www.topcoder.com

# The max live leaderboard number
export MAX_LIVE_LEADERBOARD=200