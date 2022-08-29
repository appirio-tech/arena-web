#!/bin/bash
set -eo pipefail
UPDATE_CACHE=""

docker build -f docker/Dockerfile-Build -t $APPNAME:latest \
--build-arg APPNAME=$APPNAME \
--build-arg APPENV=$APPENV .

docker create --name app $APPNAME:latest
docker cp app:/$APPNAME/build.zip .
unzip build.zip -d build

