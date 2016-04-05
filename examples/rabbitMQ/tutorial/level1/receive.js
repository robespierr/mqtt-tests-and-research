var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, connection) {
    connection.createChannel(function(err, channel) {
        var q = 'hello';

        channel.assertQueue(q, {durable: false});
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        channel.consume(q, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
        }, {noAck: true});
    });
});