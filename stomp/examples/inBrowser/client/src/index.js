const StompJS = require('stompjs');
const SockJS = require('sockjs-client');

const ws = new SockJS('http://127.0.0.1:15674/stomp');
let client = StompJS.over(ws);

client.connect('guest', 'guest',
    () => {
        console.log('connect to stomp');

        client.send("/queue/test", {priority: 9}, "Hello, STOMP");

        client.subscribe("/queue/test", message => {
            console.log('Subscribe: ', message.body);
        });
    },
    error => {
        console.log(`connection error ${error}`);
    }
);
