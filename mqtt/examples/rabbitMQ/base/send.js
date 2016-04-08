var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883'); //1883 default mqtt-plugin port

client.on('connect', function () {
    console.log('connect');
    client.publish('presence', 'Hello mqtt');
});