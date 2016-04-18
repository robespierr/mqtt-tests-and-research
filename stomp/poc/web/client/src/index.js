const StompJS = require('stompjs');
const SockJS = require('sockjs-client');
const React = require('react/addons');
const STOMP_BROKER_URL = 'http://127.0.0.1:15674/stomp';
const STOMP_PUBLISH_KEEP_ALIVE_DELAY = 9000;
const clientId = new URLSearchParams(location.search.slice(1)).get('clientId');

const Application = React.createClass({
    displayName: 'Application',

    getInitialState() {
        return {
            stompClient: undefined,
            stompIsConnected: false,
            stompKeepAliveInterval: undefined,
            stompMessages: []
        };
    },

    componentWillMount() {
        this._stompOpenConnection(STOMP_BROKER_URL, () => {
            this._stompSubscribe(`/topic/ib-test.data.${clientId}`, stompCallbackDecorator(this._stompOnData));
            this._stompPublish('/topic/ib-test.registration', {clientId: clientId});
        });
    },

    componentDidMount() {

    },

    componentWillUnmount() {
        this._stompCloseConnection();
    },

    render() {
        return (
            <div className="container">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-heading clearfix">
                            <h1 className="panel-title pull-left">Stomp messages</h1>
                            <div className="pull-right">
                                <button className="btn btn-default" onClick={this._clearStompMessages}>Clear</button>&nbsp;
                                <button className="btn btn-danger" onClick={this._stompStopPublishKeepAlive}>Stop keep alive</button>&nbsp;
                                <button className="btn btn-success" onClick={() => { this._stompStartPublishKeepAlive(); }}>Start keep alive</button>
                            </div>
                        </div>
                        <div className="panel-body">
                            {
                                this._renderMessages()
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    _renderMessages() {
        if (!this.state.stompIsConnected) {
            return 'Connecting...';
        }

        return (
            this.state.stompMessages.length ?
                this.state.stompMessages.map((message, index) => { return <p key={index}>Stomp message: {message.value}, clientId: {message.id}</p>; })
                :
                'Waiting for messages...'
        );
    },

    _stompOpenConnection(stompBrokerUrl, onConnect) {
        const stompClient = StompJS.over(new SockJS(stompBrokerUrl));
        stompClient.debug = false;

        stompClient.connect('guest', 'guest',
            () => {
                console.log('connected to stomp');

                this.setState({
                    stompIsConnected: true,
                    stompClient: stompClient
                });

                onConnect();
            },
            error => {
                console.log(`connection error ${error}`);
            }
        );
    },

    _stompStartPublishKeepAlive(delay) {
        delay = delay || STOMP_PUBLISH_KEEP_ALIVE_DELAY;
        this._stompPublish('/topic/ib-test.keep-alive', {clientId: clientId});

        const interval = setInterval(() => {
            this._stompPublish('/topic/ib-test.keep-alive', {clientId: clientId})
        }, delay);

        this.setState({
            stompKeepAliveInterval: interval
        });
    },

    _stompStopPublishKeepAlive() {
        if (!this.state.stompKeepAliveInterval) {
            return;
        }
        clearInterval(this.state.stompKeepAliveInterval);
        this.setState({
            stompKeepAliveInterval: null
        });
    },

    _stompCloseConnection() {
        this.state.stompClient.disconnect();
        this._stompStopPublishKeepAlive();
    },

    _stompSubscribe(topic, callback) {
        this.state.stompClient.subscribe(topic, callback);
    },

    _stompPublish(topic, payload) {
        payload = JSON.stringify(payload);
        console.log(`publish ${topic} : ${payload}`);
        this.state.stompClient.send(topic, {}, payload);
    },

    _stompOnData(payload) {
        this.setState({
            stompMessages: React.addons.update(this.state.stompMessages, {
                $push: [{
                    id: payload.id,
                    value: payload.value
                }]
            })
        });
    },

    _clearStompMessages() {
        this.setState({
            stompMessages: []
        });
    }
});

React.render(<Application/>, document.getElementById('app'));

function stompCallbackDecorator(callback) {
    return payload => {
        callback(JSON.parse(payload.body));
    };
}
