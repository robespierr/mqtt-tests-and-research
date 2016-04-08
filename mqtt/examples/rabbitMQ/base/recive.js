var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883'); //1883 default mqtt-plugin port

client.subscribe('presence'); //'presence' is a topic
client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
});