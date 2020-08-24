const https = require('https');
const fs = require('fs');
// const { MqttClient } = require('mqtt');
// var test = require('./getInfo.js').test;
var wildcard = require('socketio-wildcard')();

// const {
//     mqttConnector
// } = require('./getInfo')

// var outputMqtt = new test();
// outputMqtt.connect()

class SocketHandler {
    constructor() {
        this.socketClient = null;
    }

    connect() {
        // console.log("Socket.IO started on port 1920")
        // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
        this.socketClient = require("socket.io")
            .listen(
                https.createServer({
                    key: fs.readFileSync("/etc/letsencrypt/live/anysensor.dasstec.ro/privkey.pem"),
                    cert: fs.readFileSync("/etc/letsencrypt/live/anysensor.dasstec.ro/fullchain.pem"),
                    requestCert: false,
                    rejectUnauthorized: false,
                })
                .listen(1920, console.log("Socket.IO started on port 1920")));

        this.socketClient.use(wildcard)

        this.socketClient.on('connection', function (socket) {
            console.log("New Socket.IO connection id:", socket.id)
        })
    }

    listenMessage(topicToListen, topicToSend=null) {
        console.log("Socket.IO server listen on:", topicToListen)
        this.socketClient.on('connection', function (socket) {
            socket.on(topicToListen, function (msg) {
                // if backend recieves front frontend a message on topicToListen 'start/stop'
                console.log(topicToListen, msg)
                // mqttClient.sendMessage('start/stop', msg.toString());
            });
        })
    }

    // listenEverything() {
    //     socket.on('*', function (data) {
    //         // anything sent from client to nodejs via socket.io will be console.log on nodejs terminal
    //         console.log("Socket.IO listen anytopic:", data)
    //         // MqttHandler.sendMessage
            
    //     })
    // }

    // Sends a message to client
    sendMessageOnSocket(topic, message) {
        // console.log("sendMessageOnSocket:", topic, message)
        // this.socketClient.on('connection', function(socket){
        this.socketClient.emit(topic, message);
        // this.socketClient.emit("noriel/scale", {
        //     weight: randomIntFromInterval(20,50).toFixed(2),
        //     barcode: "barcode_dummy"
        // })
        // })
    }
}

module.exports = SocketHandler;