var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org'); //mqtt://test.mosquitto.org - broker

client.on('connect', function () {
    client.subscribe(['presence', 'topic 2']);
    startPublish(['presence', 'topic 2']);
});

client.on('message', function (topic, payload) {
    // message is Buffer
    console.log(topic + ': ' + payload.message.toString());

    if (payload.isEnd) {
        closeConnection();
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