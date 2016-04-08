const StompJS = require('stompjs');
const SockJS = require('sockjs-client');

const ws = new SockJS('http://127.0.0.1:15674/stomp');
const client = StompJS.over(ws);
client.debug = false;

client.connect('guest', 'guest',
    () => {
        console.log('connect to stomp');

        const payload = {
            message: 'Hello, STOMP'
        };

        client.send("/queue/test", {}, JSON.stringify(payload));

        client.subscribe("/queue/test", data => {
            const payload = JSON.parse(data.body);
            console.log('Subscribe: ', payload);
        });
    },
    error => {
        console.log(`connection error ${error}`);
    }
);
