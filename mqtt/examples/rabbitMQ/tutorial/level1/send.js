var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, connection) {
    connection.createChannel(function(err, channel) {
        var q = 'hello';

        channel.assertQueue(q, {durable: false});
        channel.sendToQueue(q, new Buffer('Hello World!'));
        console.log(" [x] Sent 'Hello World!'");
    });
    setTimeout(function() { connection.close(); process.exit(0) }, 500);
});