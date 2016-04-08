const StompJS = require('stompjs');
const stompClient = StompJS.overTCP('localhost', 61613);

stompClient.connect('guest', 'guest',
    () => {
        console.log('connect to stomp');

        const payload = {
            message: 'Hello, STOMP'
        };

        stompClient.send("/queue/test", {}, JSON.stringify(payload));

        stompClient.subscribe("/queue/test", data => {
            const payload = JSON.parse(data.body);
            console.log('Subscribe: ', payload);
        });
    },
    error => {
        console.log(`connection error ${error}`);
    }
);