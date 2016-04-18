'use strict';
const http = require('http');
const StompJS = require('stompjs');
const stompClient = StompJS.overTCP('localhost', 61613);

const PUBLISH_DATA_INTERVAL = 3000;
const MAX_KEEP_ALIVE_DELAY = 10000;
const CHECK_KEEP_ALIVE_INTERVAL = 1000;
const dataServerOptions = {
    host: 'localhost',
    port: 3001,
    method: 'GET',
    path: '/data'
};

let publishDataInterval = null;
let clients = [];

stompClient.connect('guest', 'guest',
    () => {
        console.log('stomp connected');

        stompClient.subscribe('/topic/ib-test.registration', stompCallbackDecorator(onRegister));
        stompClient.subscribe('/topic/ib-test.keep-alive', stompCallbackDecorator(onKeepAlive));
    },
    error => {
        console.log(`connection error ${error}`);
    }
);

setInterval(checkKeepAlive, CHECK_KEEP_ALIVE_INTERVAL);

function onRegister(payload) {
    const client = clients.find(client => client.id === payload.clientId);

    if (!client) {
        setNewClient(payload.clientId);
    } else {
        resetKeepAliveInterval(client);
    }

    if (!publishDataInterval) {
        startPublishData();
    }
}

function onKeepAlive(payload) {
    console.log('get keep alive', payload.clientId);
    var client = clients.find(client => client.id === payload.clientId);

    if (client) {
        resetKeepAliveInterval(client);
    } else {
        console.error('Undefined client');
    }
}

function setNewClient(id) {
    console.log('Set new client', id);
    clients.push({ //add alive sign
        id: id,
        keepAliveInterval: 0,
        isAlive: true
    });

    if (!publishDataInterval) {
        startPublishData();
    }
}

function removeClient(id) {
    clients = clients.filter((client) => {
        return client.id !== id;
    });
}

function resetKeepAliveInterval(client) {
    client.keepAliveInterval = 0;
    client.isAlive = true;

    if (!publishDataInterval) {
        startPublishData();
    }
}

function checkKeepAlive() {
    clients.forEach(client => {
        client.keepAliveInterval += 1000;

        if (client.keepAliveInterval > MAX_KEEP_ALIVE_DELAY) {
            client.isAlive = false;
        }
    });

    if (!clients.filter(client => client.isAlive).length && publishDataInterval) {
        stopPublishData();
    }
}

function startPublishData() {
    console.log('start sending');
    getDataAndPublish();
    publishDataInterval = setInterval(getDataAndPublish, PUBLISH_DATA_INTERVAL);

    function getDataAndPublish() {
        getData(dataServerOptions)
            .then((data) => {
                clients.filter(client => client.isAlive).forEach(client => {
                    data.id = client.id;
                    console.log(`stomp send ${client.id} ${JSON.stringify(data)}`);
                    stompClient.send(`/topic/ib-test.data.${client.id}`, {}, JSON.stringify(data));
                });
            })
            .catch((error) => {
                console.error(`Can't get data ${error}`);
            });
    }
}

function stopPublishData(){
    console.log('stop sending');
    clearInterval(publishDataInterval);
    publishDataInterval = null;
}

function getData(options) {
    console.log(`request ${options.method}: ${options.host}:${options.port}${options.path}`);

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            res.on('data', (data) => {
                data = JSON.parse(data);
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function stompCallbackDecorator(callback) {
    return payload => {
        callback(JSON.parse(payload.body));
    };
}