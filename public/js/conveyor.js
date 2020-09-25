// Imports
import {
    timeoutAsync,
    sendMessage,
    delay,
    displayTimeoutAndVanish,
    liveWeight,
    liveGate,
    insertStatus,
    getConveyorStatus,
    showNotification
} from './utils.js'
// End imports

// if ($(".conveyor-page").length) {
// Switch Conveyor Event
// =================================
$("#switch-conveyor").click(function () {
    switchConveyor()
})

// SOCKET.IO
// =================================

// Check gate state each second
var gateChecker

sendMessage("socketChannel", {
    topic: 'gate/' + username,
    message: "status"
})

gateChecker = setInterval(function () {
    sendMessage("socketChannel", {
        topic: 'gate/' + username,
        message: "status"
    })
}, 2000)

window.gateChecker = gateChecker


// The client listens on Socket.IO 
socket.on('socketChannel', (data) => {

    // Live Weight - client receives scale data from backend
    if (data.topic.includes(username + "/scale")) {
        if ($(".scale-info").length)
            liveWeight(data.message)
    }

    // Live Gate Status
    if (data.topic.includes("gate/" + username)) {
        liveGate(data.message)
    }

})


// =================================
// END SOCKET.IO

// block input toggle for a 3s after pressed
function blockSwitchButton(timeout) {

    var time = new Date()
    $(".small-box #switch-conveyor").prop('disabled', true)
    $(".small-box #switch-conveyor").parent().append("<div class='switch-disable-time'>" + timeout / 1000 + " sec</div>")
    displayTimeoutAndVanish('.switch-disable-time', timeout)

    timeoutAsync(timeout, function () {
        // console.log("input toggle release ",new Date()-time)
        $(".small-box #switch-conveyor").prop('disabled', false)
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

            // Tasks
            insertStatus("on");
            blockSwitchButton(10000)
            $(".send-command-button").removeClass("send-stop").addClass("send-start")
            showNotification("Conveyor started", 1)

            // Check gate status
            gateChecker = setInterval(function () {
                sendMessage("socketChannel", {
                    topic: 'gate/' + username,
                    message: "status"
                })
            }, 2000)
            
            window.gateChecker = gateChecker

            // Send to MQTT
            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "start"
            })

            var timeTest = new Date()

            timeoutAsync(5000, function () {
                // console.log("start 2", new Date - timeTest)
                sendMessage("socketChannel", {
                    topic: "start/stop",
                    message: "start"
                })
            })

            timeoutAsync(7000, function () {
                // console.log("start 2", new Date - timeTest)
                sendMessage("socketChannel", {
                    topic: "start/stop",
                    message: "start"
                })
            })

            timeoutAsync(10000, function () {
                // console.log("start 2", new Date - timeTest)
                sendMessage("socketChannel", {
                    topic: "start/stop",
                    message: "start"
                })
            })

        }

        firstTimeHere = false;

    } else {
        // red
        $("#conveyor-img").attr('src', 'images/conveyor_' + username + '_stop.png')
        if (!firstTimeHere) {
            // Tasks
            insertStatus("off"); // insert status into DB
            blockSwitchButton(5000) // block switch button 5 sec
            $(".send-command-button").removeClass("send-start").addClass("send-stop") // change text
            clearInterval(gateChecker) // stop checking gate status 
            showNotification("Conveyor stopped", 4)

            // Send to MQTT
            var timeTest = new Date()

            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "stop"
            })

            timeoutAsync(2000, function () {
                // console.log("stop 2", new Date - timeTest)
                sendMessage("socketChannel", {
                    topic: "start/stop",
                    message: "stop"
                })
            })

            timeoutAsync(4000, function () {
                // console.log("stop 2", new Date - timeTest)
                sendMessage("socketChannel", {
                    topic: "start/stop",
                    message: "stop"
                })
            })

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

// async function delay(ms) {
//     // return await for better async stack trace support in case of errors.
//     return await new Promise(resolve => setTimeout(resolve, ms));
// }

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
if ($('.send-command-button').length) {

    // Send command
    timeoutAsync(1000, function () {
        // console.log($(".small-box #switch-conveyor").is(':checked'))
        if ($(".small-box #switch-conveyor").is(':checked')) {
            $(".send-command-button").addClass("send-start")
        } else {
            $(".send-command-button").addClass("send-stop")
        }
    })


    // Click
    $('.send-command-button').click(function () {
        // function sendCommand() {
        // console.log("Send hard command")

        // check toggle
        if ($(".small-box #switch-conveyor").is(':checked')) {
            // console.log("Send start hard command")
            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "start"
            })
            timeoutAsync(2000, function () {
                // sendMessage(client, "start/stop", "start")
            })
        } else {
            // console.log("Send stop hard command")
            sendMessage("socketChannel", {
                topic: "start/stop",
                message: "stop"
            })
            timeoutAsync(2000, function () {
                // sendMessage(client, "start/stop", "stop")
            })
        }
        // }
    })
}
// }