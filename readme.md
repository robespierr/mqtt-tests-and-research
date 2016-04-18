# MQTT and STOMP examples for web

## Authors
Team SPb_web

## Overview

There are several simple examples and two proof-of-concept apps for testing MQTT and STOMP on web.
Read full article of this on confluence: //todo put link to article

## Running

### Install Node

***Prerequisites***

https://github.com/TooTallNate/node-gyp#installation gives a good overview.
Just follow instructions there and make sure all tools are in path.

***Ubuntu***

    curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
    sudo apt-get install -y nodejs

***OSX***

    brew install node

***Windows***

Download and run official installer from https://nodejs.org/download.  
Check that node and npm are installed and in path:

    node -v
    npm -v

### Install utils (necessary only for developing)

    npm install -g browserify

### Install dependencies

    npm install

### Install rabbitMQ

Go to http://www.rabbitmq.com/download.html and follow instructions there
For all examples you also have to enable those plugins:
rabbitmq_mqtt
rabbitmq_stomp
rabbitmq_web_stomp

Use next command

    rabbitmq-plugins enable plugin-name

See http://www.rabbitmq.com/plugins.html for full overview

### Start
Start all examples as simple node.js apps.

***Base mqtt example***

    node ./mqtt/examples/base
See result in console

***InBrowser mqtt example***
Open ./mqtt/examples/inBrowser/index.html in browser and see what's going on
Use

    browserify ./mqtt/examples/inBrowser/src/index.js -o ./mqtt/examples/inBrowser/public/index.js
after changes for build.

***Base stomp example***

    node ./stomp/examples/base
See result in console

***InBrowser stomp example***
Open ./stomp/examples/inBrowser/index.html in browser and see what's going on
Use

    browserify ./stomp/examples/inBrowser/src/index.js -o ./stomp/examples/inBrowser/public/index.js
after changes for build.

### Starting POCs: 
See ./mqtt/poc/readme.md for MQTT and ./stomp/poc/readme.md for STOMP

