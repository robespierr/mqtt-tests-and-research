var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org'); //mqtt://test.mosquitto.org - broker

client.on('connect', function () {
    client.subscribe('presence'); //'presence' is a topic
    client.publish('presence', 'Hello mqtt');
});

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    client.end();
});