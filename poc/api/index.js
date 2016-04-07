'use strict';
const http   = require('http');
const mqtt   = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');

const GET_DATA_INTERVAL = 3000;
const MAX_KEEP_ALIVE_DELAY = 10000;
const dataServerOptions = {
    host: 'localhost',
    port: 3001,
    method: 'GET',
    path: '/data'
};

let currentKeepAliveDelay = 0;
let publishDataInterval = null;

client.on('connect', function () {
    console.log('mqtt connected');
    client.subscribe('ib-test/keep-alive');
});

client.on('message', function (topic, payload) {
    payload = JSON.parse(payload);

    switch (topic) {
        case 'ib-test/keep-alive':
            console.log('get keep alive');
            currentKeepAliveDelay = 0;
            if (!publishDataInterval) {
                startPublishData();
            }
            break;
    }
});

setInterval(checkKeepAlive, 1000);

function startPublishData() {
    console.log('start publish');
    getDataAndPublish();
    publishDataInterval = setInterval(getDataAndPublish, GET_DATA_INTERVAL);

    function getDataAndPublish() {
        getData(dataServerOptions)
            .then((data) => {
                console.log(`mqtt publish ${JSON.stringify(data)}`);
                client.publish('ib-test/data', JSON.stringify(data));
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

function checkKeepAlive() {
    currentKeepAliveDelay += 1000;

    if (currentKeepAliveDelay < MAX_KEEP_ALIVE_DELAY || !publishDataInterval) {
        return;
    }

    stopPublishData();
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