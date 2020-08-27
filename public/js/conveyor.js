// console.log("conveyor.js")

// fetch("/api/init-mqtt")

// SOCKET.IO
// =================================
//make connection
// var socket = io()
// var socket = io.connect(":1920")

// Client sends a status message to backend
sendMessage("socketChannel", {
    topic: 'gate/' + username,
    message: "status"
})

// The client listens on Socket.IO 
socket.on('socketChannel', (data) => {

    // Live Weight - client receives scale data from backend
    if (data.topic.includes(username + "/scale")) {
        // console.log("live weight:",data.message.weight,data.message.barcode)
        liveWeight(data.message)

        // Sen acknowledge message to server
        // sendMessage("socketChannel",{
        //     topic: 'ack',
        //     message: "I am "+username+"! I updated live weight!"
        // })
    }

    // Live Gate Status
    if (data.topic.includes("gate/" + username)) {
        liveGate(data.message)
    }

})

function liveWeight(payloadJson) {
    var scaleTitle = $(".scale-info h3")
    var barcodeTitle = $(".scale-info p")
    // var payloadJson = JSON.parse(message.payloadString)
    scaleTitle.html(payloadJson.weight + "g")
    barcodeTitle.html(payloadJson.barcode)
}

function liveGate(status) {
    var gate = $(".gate-info")
    var gateTitle = $(".gate-info h3")
    if (status == 0) {
        // gate is closed
        gate.attr("status", "closed")
        document.querySelector(".gate-info").style.background = "#28a745"
        gateTitle.html("Closed")
    } else if (status == 1) {
        // gate is open
        gate.attr("status", "open")
        document.querySelector(".gate-info").style.background = "#dc3545"
        gateTitle.html("Open")
    }
}

// =================================
// END SOCKET.IO

// var firstTimeHere = true

// Async timeout
var timeout_2 = (ms, f) => {
    let sleep = new Promise(resolve => setTimeout(function () {
        f();
        // return resolve
    }, ms))
}

// // MQTT Connection
// var hostname = "89.39.209.2";
// var port = 9002
// var clientId = "norielws";
// var username_mqtt = "norielws";
// var password = "Noriel12";
// var subscription = "#";

// // Create a client instance
// client = new Paho.MQTT.Client(hostname, Number(port), clientId);

// // set callback handlers
// client.onConnectionLost = onConnectionLost;
// client.onMessageArrived = onMessageArrived;

// client.connect({
//     onSuccess: onConnect,
//     // onFailure: ConnectionFailed,
//     keepAliveInterval: 500,
//     userName: username_mqtt,
//     // useSSL: true,
//     password: password
// });

// // called when the client connects
// function onConnect() {
//     // Once a connection has been made, make a subscription and send a message.
//     console.log("onConnect");
//     client.subscribe(subscription);

//     // message = new Paho.MQTT.Message("start");
//     // message.destinationName = "start/stop";
//     // client.send(message);

//     // sendMessage(client, "start/stop", "start")
//     switchConveyor();
//     checkGate();
// }

function sendMessage(topic, msg) {
    // send a status message to get the gate status
    socket.emit(topic, msg)
}

// // called when the client loses its connection
// function onConnectionLost(responseObject) {
//     if (responseObject.errorCode !== 0) {
//         console.log("onConnectionLost:" + responseObject.errorMessage);
//     }
// }

// // called when a message arrives
// function onMessageArrived(message) {
//     console.log("onMessageArrived: " + message.payloadString + " from topic:" + message.destinationName);
//     // console.log()

//     // SCALE
//     if (message.destinationName == 'scale/' + username) {
//         // console.log("LIVE WEIGHT from scale/"+username+": ", message.payloadString)
//         var scaleTitle = $(".scale-info h3")
//         var barcodeTitle = $(".scale-info p")
//         var payloadJson = JSON.parse(message.payloadString)
//         scaleTitle.html(payloadJson.weight + "g")
//         barcodeTitle.html(payloadJson.barcode)
//     }

//     // GATE
//     if (message.destinationName == 'gate/' + username) {
//         // if(message.destinationName == 'gate/'+username && message.payloadString != 'status') {
//         console.log("GATE STATUS from gate/" + username + ": ", message.payloadString)
//         var gate = $(".gate-info")
//         var gateTitle = $(".gate-info h3")

//         if (message.payloadString == 0) {
//             // gate is closed
//             gate.attr("status", "closed")
//             document.querySelector(".gate-info").style.background = "#28a745"
//             // $(".gate-info").css("background","green;")
//             gateTitle.html("Closed")
//         } else {
//             // gate is open
//             gate.attr("status", "open")
//             document.querySelector(".gate-info").style.background = "#dc3545"
//             // $(".gate-info").css("background","red;")
//             gateTitle.html("Open")
//         }
//     }
// }

// get all values of a sensor
let getConveyorStatus = async (sensor) => {
    let response = await fetch("https://anysensor.dasstec.ro/api/conveyor")
    return response.json()
}

// insert status of conveyor into mysql
function insertStatus(status) {
    $.ajax({
        url: "https://anysensor.dasstec.ro/api/conveyor?setStatus=" + status + "",
        type: 'GET'
    });
}

// block input toggle for a 3s after pressed
function blockSwitchButton(timeout) {

    var time = new Date()
    $(".small-box #switch-conveyor").prop('disabled', true)
    $(".small-box #switch-conveyor").parent().append("<div class='switch-disable-time'>" + timeout / 1000 + " sec</div>")
    displayTimeoutAndVanish('.switch-disable-time', timeout)

    timeout_2(timeout, function () {
        // console.log("input toggle release ",new Date()-time)
        $(".small-box #switch-conveyor").prop('disabled', false)
    })
}

function displayTimeoutAndVanish(element, timeout) {
    var el = $(element)
    timeout_ = timeout / 1000
    var x = setInterval(function () {
        timeout_ -= 1
        el.html(timeout_ + " sec")
    }, 1000)

    timeout_2(timeout, function () {
        el.fadeOut(500)
        clearInterval(x);
    })
}

(async () => {
    let status = await getConveyorStatus()

    if (parseInt(status[0].status)) {
        $(".small-box #switch-conveyor").prop('checked', true)
    } else {
        $(".small-box #switch-conveyor").prop('checked', false)
    }

    switchConveyor();

})()

var firstTimeHere = true // this initialize with true when page loads

async function switchConveyor() {
    // console.log("switchConveyor() ", firstTimeHere)
    if ($(".small-box #switch-conveyor").is(':checked')) {
        // green
        $("#conveyor-img").attr('src', 'images/conveyor_' + username + '_start.png')

        // first time is when page is reloaded pass this part
        if (!firstTimeHere) {
            // if ($(".gate-info h3").html() == 'Closed') {
            // if gate is closed start the conveyor
            insertStatus("on");
            blockSwitchButton(30000)
            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "start"
            })
            var timeTest = new Date()
            console.log("Conveyor START command sent!")

            // timeout(5000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(7000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(10000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(13000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(15000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(17000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(20000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })

            // timeout(25000, function () {
            //     console.log("start 2", new Date - timeTest)
            //     sendMessage("start/stop", "start")
            // })


            // } else {
            // if gate is open, show the alert
            // alert("Close the gate first!")
            // }

        }

        firstTimeHere = false;

    } else {
        // red
        $("#conveyor-img").attr('src', 'images/conveyor_' + username + '_stop.png')
        if (!firstTimeHere) {
            insertStatus("off");
            blockSwitchButton(5000)

            var timeTest = new Date()

            console.log("Conveyor STOP command sent!")

            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "stop"
            })

            // timeout(2000, function () {
            //     console.log("stop 2", new Date - timeTest)
            //     sendMessage("start/stop", "stop")
            // })

            // timeout(4000, function () {
            //     console.log("stop 2", new Date - timeTest)
            //     sendMessage("start/stop", "stp[")
            // })

        }

        firstTimeHere = false;
    }
}


// get list of power sources
let getPowerSource = async () => {
    let response = await fetch("https://anysensor.dasstec.ro/api/get-voltage?source1&source2")
    return response.json()
}

function updateVoltage() {
    (async () => {

        // console.log(await chartList)

        let json = await getPowerSource();

        json.forEach(source => {
            if (source.sensorQueried.includes("source1")) {
                var voltage1 = source.value
                $(".supply-1 h3").html(voltage1 + "V")
            } else if (source.sensorQueried.includes("source2")) {
                var voltage2 = source.value
                $(".supply-2 h3").html(voltage2 + "V")
            }

            // console.log(source.sensorQueried, source.value, source.responseTime)

        })


    })()
}

function checkGate() {
    sendMessage(client, 'gate/noriel', 'status')
}

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

let run = async () => {

    while (1) {
        updateVoltage();
        await delay(5 * 1000);
    }
}

run()

// setInterval(function(){
//     sendMessage(client, "start/stop", "start2")
// },1000)

// Custom function for sending the same command as toggle
function sendCommand() {
    console.log("Send hard command")

    // check toggle
    if ($(".small-box #switch-conveyor").is(':checked')) {
        console.log("Send start hard command")
        sendMessage("socketChannel", {
            topic: "start/stop",
            message: "start"
        })
        timeout(2000, function () {
            // sendMessage(client, "start/stop", "start")
        })
    } else {
        console.log("Send stop hard command")
        sendMessage("socketChannel", {
            topic: "start/stop",
            message: "stop"
        })
        timeout(2000, function () {
            // sendMessage(client, "start/stop", "stop")
        })
    }
}