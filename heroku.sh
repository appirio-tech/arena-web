#!/bin/bash

#Initially, all actions are false
HEROKU_PUSH='n'
HEROKU_LAUNCH='n'
HEROKU_CONFIG='n'

for var in "$@"
do
	if [ "$var" == "push" ]; then HEROKU_PUSH='y'; fi
	if [ "$var" == "launch" ]; then HEROKU_LAUNCH='y'; fi
	if [ "$var" == "config" ]; then HEROKU_CONFIG='y'; fi
done

#Set configuration variables
if [ $HEROKU_CONFIG == "y" ]
then
    echo "INFO: Set environment variables"

    #Set your environment variables here
    #Example:
    #heroku config:set NODE_ENV=production
fi

#Upload the code to heroku
if [ $HEROKU_PUSH == "y" ]
then
    echo "INFO: Push app to the master"
    git push heroku master
fi

#Start Dyno for 1 instance
if [ $HEROKU_LAUNCH == "y" ]
then
    echo "INFO: Start 1 Dyno"
    heroku ps:scale web=1
fi
