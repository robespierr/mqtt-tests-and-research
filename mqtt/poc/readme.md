# MQTT proof of concept

### Overview

This proof-of-concept app implements prospective schema for using MQTT in API and React application.
So there are three main parts:
- data server (./mqtt/poc/data) - emulation of some internal service (rmi or other), which for now just answer with some random number
- API - code that publish data from data server to broker and handle messages for register clients and keep them alive
- web application - final client, which send request for register, subscribe on data and publish keep-alive

Here cool picture, which can describe it more clearly:

<pre>
                                  --------                   --------                -------
     (*|*)   ----keep-alive----> |        | --keep-alive--> |        |              |        |                
    [client] ----register------> |  MQTT  | --register----> |  API   | <***data***> |  Data  |                
      / \    <---data/id-------- | broker | <--data/id----- |        |              | server |                
                                  ________                   ________                ________                
    
    -->(broker) publish
    <--(broker) subscribe
    <***> pulling by http or other protocol
</pre>

### Start

***Start data server***

    node ./mqtt/poc/data

***Start web server***

    node ./mqtt/poc/web

***Start API***

    node ./mqtt/poc/api

Go to http://localhost:3000/?clientId=1 for register client with id=1 and subscribe on data channel for this user
Start keep-alive session by "Start keep-alive" button for continue to get messages or "Stop keep-alive" for stop it.
Open this url in other tab and check the same messages.
Open other tab with another clientId and feel the difference.