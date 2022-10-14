Arena Web
=========

## Overview ##

[topcoder] Arena for Single Round Match contests. Lightweight html/css/js interface built on angular and bootstrap. Single-page, responsive design approach.

### Prerequisites

  - Node 10
## Getting Setup ##

To develop arena-web you'll need npm (installed as part of [node](http://nodejs.org)). Then globally install [bower](http://bower.io) and the [grunt-cli](http://gruntjs.com/getting-started):

Please execute following under root account or use `sudo`

```
npm install -g bower
npm install -g grunt-cli
```

Then clone this repo. Then to get all dependencies simply run:
```
npm install
```

## App Structure ##

Do all development in the `app` directory. Within that directory:

- Put custom css in `css/app.css`
- Put all images in `img/`
- Put all javascript code in `js` using whatever structure you want, but be sure everything is linked to `js/app.js`. This file is the main entry point for the app.

## Configuration ##

Even though this is a client-side app, we still try to follow [12factor](http://12factor.net/config). As such as configuration variables are expected to be set as environment variables. The values will be substituted into the `app/js/config.js` file on build.

## Build and Release ##

Source the environment variables:
```
source config/dev-local.sh
```

To build the client side app run:
```
grunt
```
This will perform the following tasks:

1. Clean the `build` directory.
1. Populate `config.js` with the environment variables.
1. Package all the JS code into a single file using [Browserify](http://browserify.org/) and put it in `build/js/bundle.js`.
1. Package and minify all css code into a single file using the [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) grunt plugin, and put it in `build/css/bundle.css`.
1. Copy all html and image file over to `build`.

To release the app run:
```
grunt release
```
Release is similar to build, but it works out of the `build` directory and minifies all the javascript. It copies everything to `release`.

To use jslint validate the js files:
```
grunt jslint
```
This will validate all js files by grunt-contrib-jshint .


## Run the App ##

[http-server](https://npmjs.org/package/http-server), a simple static webserver, is one of the dev dependencies. To serve the app from the `build` directory on port 3000 on localhost simply use:
```
npm start
```

## Verify Locally ##

  1. Start arena services:

     - Clone https://github.com/appirio-tech/arena-vm
     - Checkout **`dev-master`** branch
     - Follow its **`docs/local-deploy.md`** to start arena services

  2. Start arena web:

     ```bash
     source config/dev-local.sh \
       && grunt \
       && cp app/index.html.local build/index.html \
       && npm start
     ```

     Notice the step **`cp app/index.html.local build/index.html`**. The **`app/index.html.local`** file will setup SSO login for user locally and thus able to login to arena docker services. It can setup for any user exists in **`user`** table in the informix docker.

     To switch to a different user, just need to change the **`userId`** at line 23:

     ```javascript
     // Change the userId as wanted.
     // For example, if want to test admin functionality, change it to 132456 (heffan)
     // If want to test competitor fuctionality, change it to 124766 (twight)
     var userId = "124766"; 
     ```

  3. Open http://localhost:3000 in browser. Refer to https://youtu.be/85yy3Qohijs for details.



