var mqtt = require('mqtt');
var client = mqtt.connect('ws://ib-aaveryanov:15675/ws', {
    protocolId: 'MQIsdp',
    protocolVersion: 3
});

client.on('connect', function () {
    console.log('connect');
    client.subscribe("mqtt/demo");
    startPublish(["mqtt/demo"]);
});

client.on("message", function(topic, payload) {
    payload = JSON.parse(payload);
    var messageNode = document.createTextNode([topic, payload.message].join(": "));
    var endMessageNode = document.createTextNode("End");
    var br = document.createElement('br');

    document.body.appendChild(messageNode);
    document.body.appendChild(br);

    if (payload.isEnd) {
        closeConnection();
        document.body.appendChild(endMessageNode);
    }
});

function startPublish(topics, delay) {
    delay = delay || 1000;
    var counter = 0;

    var interval = setInterval(() => {
        counter++;
        var isEnd = counter === 5;
        var payload = {
            message: `Hello mqtt, counter: ${counter}`,
            count: counter,
            isEnd: isEnd
        };

        topics.forEach((topic) => client.publish(topic, JSON.stringify(payload)));

        if (isEnd) {
            clearInterval(interval);
        }
    }, delay);
}

function closeConnection(cb) {
    console.log('end');
    client.end(cb);
}