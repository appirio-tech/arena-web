# Use the base image with Node.js
FROM node

ARG APPNAME
ARG APPENV
ENV APPNAME=$APPNAME
ENV APPENV=$APPENV

COPY . /$APPNAME
WORKDIR /$APPNAME

# Install dependencies
RUN npm install -g grunt-cli
RUN npm install bower --save-dev
RUN npm install grunt --save-dev
RUN bower install --allow-root

# Build

RUN . config/tc-$APPENV.sh && grunt && grunt deploy-compress


