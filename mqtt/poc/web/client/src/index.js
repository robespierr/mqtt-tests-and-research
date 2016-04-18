const mqtt = require('mqtt');
const React = require('react/addons');
const MQTT_BROKER_URL = 'ws://test.mosquitto.org:8080/mqtt';
const MQTT_PUBLISH_KEEP_ALIVE_DELAY = 9000;
const clientId = new URLSearchParams(location.search.slice(1)).get('clientId');

const Application = React.createClass({
    displayName: 'Application',

    getInitialState() {
        return {
            mqttClient: undefined,
            mqttIsConnected: false,
            mqttKeepAliveInterval: undefined,
            mqttMessages: []
        };
    },

    componentWillMount() {
        this._mqttOpenConnection(MQTT_BROKER_URL, () => {
            this._mqttSubscribe(`ib-test/data/${clientId}`);
            this._mqttPublish('ib-test/registration', {clientId: clientId});
        });
    },

    componentDidMount() {

    },

    componentWillUnmount() {
        this._mqttCloseConnection();
    },

    render() {
        return (
            <div className="container">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-heading clearfix">
                            <h1 className="panel-title pull-left">MQTT messages</h1>
                            <div className="pull-right">
                                <button className="btn btn-default" onClick={this._clearMqttMessages}>Clear</button>&nbsp;
                                <button className="btn btn-danger" onClick={this._mqttStopPublishKeepAlive}>Stop keep alive</button>&nbsp;
                                <button className="btn btn-success" onClick={() => { this._mqttStartPublishKeepAlive(); }}>Start keep alive</button>
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
        if (!this.state.mqttIsConnected) {
            return 'Connecting...';
        }

        return (
            this.state.mqttMessages.length ?
                this.state.mqttMessages.map((message, index) => { return <p key={index}>Mqtt message: {message.value}, clientId: {message.id}</p>; })
                :
                'Waiting for messages...'
        );
    },

    _mqttOpenConnection(mqttBrokerUrl, onConnect) {
        const mqttClient = mqtt.connect(mqttBrokerUrl);

        mqttClient.on("connect", () => {
            this.setState({
                mqttIsConnected: true
            });

            onConnect();
        });

        mqttClient.on("message", this._mqttHandleMessage);

        this.setState({
            mqttClient: mqttClient
        });
    },

    _mqttStartPublishKeepAlive(delay) {
        delay = delay || MQTT_PUBLISH_KEEP_ALIVE_DELAY;
        this._mqttPublish('ib-test/keep-alive', {clientId: clientId});

        const interval = setInterval(() => {
            this._mqttPublish('ib-test/keep-alive', {clientId: clientId})
        }, delay);

        this.setState({
            mqttKeepAliveInterval: interval
        });
    },

    _mqttStopPublishKeepAlive() {
        if (!this.state.mqttKeepAliveInterval) {
            return;
        }
        clearInterval(this.state.mqttKeepAliveInterval);
        this.setState({
            mqttKeepAliveInterval: null
        });
    },

    _mqttCloseConnection() {
        this.state.mqttClient.end();
        this._mqttStopPublishKeepAlive();
    },

    _mqttSubscribe(topic) {
        this.state.mqttClient.subscribe(topic);
    },

    _mqttPublish(topic, payload) {
        payload = JSON.stringify(payload);
        console.log(`publish ${topic} : ${payload}`);
        this.state.mqttClient.publish(topic, payload);
    },

    _mqttHandleMessage(topic, payload) {
        payload = JSON.parse(payload);
        this.setState({
            mqttMessages: React.addons.update(this.state.mqttMessages, {
                $push: [{
                    id: payload.id,
                    value: payload.value
                }]
            })
        });
    },

    _clearMqttMessages() {
        this.setState({
            mqttMessages: []
        });
    }
});

React.render(<Application/>, document.getElementById('app'));
