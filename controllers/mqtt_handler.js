const mqtt = require('mqtt');
var socketioHandler = require('./socketio_handler.js');
// var appjs = require('../app.js').sess;

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Socket.IO
// =========================================
var socketioClient = new socketioHandler();
// socketioClient.connect();
// socketioClient.listenMessage('start/stop')
// socketioClient.sendMessageOnSocket("test topic", {
//     msg: "test msg"
// })
// =========================================
// END Socket.IO

class MqttHandler {
    constructor(loggeduser) {
        this.mqttClient = null;
        this.username = 'ab';
        this.password = 'ab';
        this.clientId = 'ab';
        this.loggedUser = loggeduser;
        // this.socketioClient = socketioClient;
        // this.socketio = socketioClient;
        // this.username = 'norielws';
        // this.password = 'Noriel12';
        // this.clientId = 'norielws';
        // this.io = require('../app.js').socketio;
    }

    connect() {
        // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
        this.mqttClient = mqtt.connect('wss://anysensor.dasstec.ro:9002/mqtt', {
            // port: this.port, 
            // host: this.host,
            clientId: this.clientId,
            username: this.username,
            password: this.password,
            keepalive: 60,
            reconnectPeriod: 1000,
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clean: true,
            encoding: 'utf8',
            rejectUnauthorized: false
        });

        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
            console.log(err);
            this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
            console.log(`Connected to MQTT Broker as`,this.loggedUser);
            
            // When MQTT Broker is connect set Socket.IO to listen msg from client
            socketioClient.listenMessage('socketChannel')
            // socketioClient.listenMessage('*')

            // this.socketio.sendMessageOnSocket("mqtt", {
            //     topic: "topic test",
            //     message: "msg test"
            // })
            
        });

        // mqtt subscriptions
        this.mqttClient.subscribe('#', {
            qos: 0
        });

        var sendLiveWeightDummy = true
        var loggedUser_ = this.loggedUser
        // var socketioClient_ = this.socketioClient

        // When a message arrives, console.log it
        this.mqttClient.on('message', function (topic, message) {
            // console.log(topic, message.toString());

            // whatever Node Server receive from mqtt broker
            // it is sent via socket.io to client
            socketioClient.sendMessageOnSocket("socketChannel", {
                topic,
                message: message.toString()
            })

            // Send Dummy Live Weight
            if(sendLiveWeightDummy) {
                socketioClient.sendMessageOnSocket("socketChannel", {
                    topic: loggedUser_+"/scale",
                    message: {
                        weight: randomIntFromInterval(200,500).toFixed(2),
                        barcode: Date.now()
                    }
                })
                sendLiveWeightDummy = false
            } else {
                sendLiveWeightDummy = true
            }

                
        })

        this.mqttClient.on('close', () => {
            console.log(`mqtt client disconnected`);
        });
    }

    listenMessage(topicToListen, topicToSend=null) {

        // Debug
        if(topicToListen)
            console.log("Listen for topic "+topicToListen+" from MQTT Broker") 

        // When a message arrives, console.log it
        this.mqttClient.on('message', function (topic, message) {
            if(topicToListen && topic == topicToListen) {
                // if topicToListen is set and is the same as topic from mqtt broker
                console.log(topic, message.toString());
            }
        });
    }

    // Sends a mqtt message to topic
    sendMessage(topic, message) {
        this.mqttClient.publish(topic, message);
    }
}

module.exports = MqttHandler;