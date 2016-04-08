'use strict';
const http   = require('http');
const mqtt   = require('mqtt');
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');

const PUBLISH_DATA_INTERVAL = 3000;
const MAX_KEEP_ALIVE_DELAY = 10000;
const CHECK_KEEP_ALIVE_INVERVAL = 1000;
const dataServerOptions = {
    host: 'localhost',
    port: 3001,
    method: 'GET',
    path: '/data'
};

let publishDataInterval = null;
let clients = [];

mqttClient.on('connect', function () {
    console.log('mqtt connected');
    mqttClient.subscribe(['ib-test/keep-alive', 'ib-test/registration']);
});

mqttClient.on('message', function (topic, payload) {
    payload = JSON.parse(payload);

    switch (topic) {
        case 'ib-test/registration':
            console.log('get new client ', payload.clientId);
            setNewClient(payload.clientId);
            if (!publishDataInterval) {
                startPublishData();
            }
            break;

        case 'ib-test/keep-alive':
            console.log('get keep alive', payload.clientId);
            resetKeepAliveInterval(payload.clientId);
            break;
    }
});

setInterval(checkKeepAlive, CHECK_KEEP_ALIVE_INVERVAL);

function setNewClient(id) {
    clients.push({
        id: id,
        keepAliveInterval: 0
    });
}

function removeClient(id) {
    clients = clients.filter((client) => {
        return client.id !== id;
    });
}

function resetKeepAliveInterval(id) {
    var client = clients.find(client => client.id === id);
    if (client) {
        client.keepAliveInterval = 0;
    } else {
        setNewClient(id);
        if (!publishDataInterval) {
            startPublishData();
        }
    }
}

function checkKeepAlive() {
    clients.forEach(client => {
        client.keepAliveInterval += 1000;

        if (client.keepAliveInterval > MAX_KEEP_ALIVE_DELAY) {
            removeClient(client.id);
        }
    });

    if (!clients.length && publishDataInterval) {
        stopPublishData();
    }
}

function startPublishData() {
    console.log('start publish');
    getDataAndPublish();
    publishDataInterval = setInterval(getDataAndPublish, PUBLISH_DATA_INTERVAL);

    function getDataAndPublish() {
        getData(dataServerOptions)
            .then((data) => {
                clients.forEach(client => {
                    data.id = client.id;
                    console.log(`mqtt publish ${client.id} ${JSON.stringify(data)}`);
                    mqttClient.publish(`ib-test/${client.id}/data`, JSON.stringify(data));
                });
            })
            .catch((error) => {
                console.error(`Can't get data ${error}`);
            });
    }
}

function stopPublishData(){
    console.log('stop publish');
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