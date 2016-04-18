# STOMP proof of concept

### Overview

This proof-of-concept app implements prospective schema for using STOMP in API and React application.
So there are four main parts:
- data server (./stomp/poc/data) - emulation of some internal service (rmi or other), which for now just answer with some random number
- API - code that publish data from data server to broker and handle messages for register clients and keep them alive
- STOMP broker
- web application - final client, which send request for register, subscribe on data and publish keep-alive

Here cool picture, which can describe it more clearly:

<pre>
                                  --------                   --------                -------
     (*|*)   ----keep-alive----> |        | --keep-alive--> |        |              |        |                
    [client] ----register------> | STOMP  | --register----> |  API   | <***data***> |  Data  |                
      / \    <---data.id-------- | broker | <--data.id----- |        |              | server |                
                                  ________                   ________                ________                
    
    -->(broker) send
    <--(broker) subscribe
    <***> pulling by http or other protocol
</pre>

In this app we use RabbitMQ as broker. Make sure that you have it running with rabbitmq_stomp and rabbitmq_web_stomp plugins on default ports 
or change broker URL in API and in client.

### Start

***Start data server***

    node ./stomp/poc/data

***Start web server***

    node ./stomp/poc/web

***Start API***

    node ./stomp/poc/api

Go to http://localhost:3000/?clientId=1 for register client with id=1 and subscribe on data channel for this user
Start keep-alive session by "Start keep-alive" button for continue to get messages or "Stop keep-alive" for stop it.
Open this url in other tab and check the same messages.
Open other tab with another clientId and feel the difference.

If your broker supports MQTT also (as RabbitMQ for example), you can use API from ./mqtt/poc/api with this client. 
Don't forget change broker url there to test it. 