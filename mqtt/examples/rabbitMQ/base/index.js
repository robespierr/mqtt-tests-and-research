var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883'); //1883 default mqtt-plugin port

client.on('connect', function () {
    console.log('connect');
    client.subscribe('presence'); //'presence' is a topic
    client.publish('presence', 'Hello mqtt');
});

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    client.end();
});