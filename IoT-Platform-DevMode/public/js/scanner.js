import {
    timeoutAsync,
    sendMessage,
    // delay,
    // displayTimeoutAndVanish,
    // liveWeight,
    // liveGate,
    // insertStatus,
    // getConveyorStatus,
    showNotification,
    filterColumn
} from './utils.js'

var lastKey = 0

var beep = new Audio('/sound/scanner_sound.mp3')

function playAudio() {
    // Play audio "beep" if barcode is scanned correctly
    // FIREFOX: menu > preferinte > securitate > redare automata > permite
    // CHROME: menu > setari > securitate > setarile site-ului > setari continut > audio > permite 
    beep.play()
}

// Send start whenever page is loaded
// this helps the backend app to search the scanner port
sendMessage("socketChannel", {
    topic: username + "/scanner",
    message: "start"
})

// The client listens on Socket.IO 
socket.on('socketChannel', async (data) => {

    // console.log(data)
    // Live Scanner - client receives scanner data from backend
    if (data.topic.includes(username + "/scanner")) {
        // sendScannerRecordings(data.message.barcode)
        if(data.message.barcode)
            liveTableInsert(data.message.barcode, lastKey)

        // if (data.message != 'start' && data.message != 'print' && data.message != 'push') {
        var mqttMessage = ''
        if (['start', 'print', 'push', 'print_error'].indexOf(data.message) == -1) {
            try {
                mqttMessage = JSON.parse(data.message)
            } catch {
                mqttMessage = {
                    barcode: "wrong format"
                }
            }
            getScannerConfigRequest(mqttMessage.barcode)
            showNotification("Barcode scanned: " + mqttMessage.barcode)
        }

        // setTimeout(()=>{
        //     requestConfig = false
        // },4000)
        // Sen acknowledge message to server
        // sendMessage("socketChannel",{
        //     topic: 'ack',
        //     message: "I am "+username+"! I updated live weight!"
        // })
    }

})

// Check if website is accesed on mobile
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

async function getScannerConfigRequest(barcode) {
    // get post config fmor mysql
    $.get({
        url: '/api/request-scanner-config',
        success: function (result) {
            console.log("SEND:", result[0])
            // var alpha = "https://alpha2.superpantofi.ro/api/wms/prepare?api_token=nvb01520!wxr1kzz"
            // result[0].url
            if (isMobile) {
                getAWB(result[0].method, result[0].contenttype, result[0].url, result[0].data, barcode)
            } else {
                getAWB(result[0].method, result[0].contenttype, result[0].url, result[0].data, barcode)
            }

            // 4433901393784
            // https://alpha2.superpantofi.ro/api/wms/print?api_token=nvb01520!wxr1kzz&order_id=487200&order_position_id=711270

            // 2222222
            // https://alpha2.superpantofi.ro/api/wms/print?api_token=nvb01520!wxr1kzz&order_id=487391
        },
    });
}

async function getAWB(type, contentType, url, data, value) {

    // var proxyurl = "http://89.39.209.2:8010/";
    // var proxyurl = "https://cors-anywhere.herokuapp.com/";
    // var proxyurl = "https://api.codetabs.com/v1/proxy?quest="
    var proxyurl = "/proxy?url="

    fetch(proxyurl + url, {
            method: type,
            body: `{"` + data + `": "` + value + `"}`,
            headers: {
                'Content-Type': contentType
            },
        })
        .then(response => response.text())
        .then(contents => {
            console.log("Received:", JSON.parse(contents))
            // console.log("Received:", contents)
            var url_awb = JSON.parse(contents).awb
            var barcode = JSON.parse(contents).barcode
            var status = JSON.parse(contents).status
            if (barcode == "ERROR") {
                var status = -1
            } else {
                // Play audio "beep" if barcode is scanned correctly
                // FIREFOX: menu > preferinte > securitate > redare automata > permite
                // CHROME: menu > setari > securitate > setarile site-ului > setari continut > audio > permite 
                playAudio()
            }
            if (status == 1) {
                if (!isMobile) {

                    // Send message to start the conveyor after message is received
                    sendMessage("socketChannel", {
                        topic: username + "/scanner",
                        message: "print"
                    })

                    openInNewTab(url_awb, barcode) // uncomment this to open a new tab

                    // Insert into DB to track awb printing
                    sendScannerRecordings(barcode, status)
                }

                // Show notification
                var error
                showNotification("AWB for barcode " + barcode + " is printing", error = 2)

                // Live table update correct packages
                liveTableInsert(barcode, status)

            } else {

                if (!isMobile) {
                    // Send message to push the box
                    sendMessage("socketChannel", {
                        topic: username + "/scanner",
                        message: "push"
                    })

                    // Record into DB pushed packages
                    sendScannerRecordings(barcode, status)
                } else {
                    // Show notification
                    var error
                    showNotification("Order pushed: " + value, error = 1)
                }

                // Show notification
                var error
                showNotification("Order pushed: " + value, error = 1)

                // Live table update wrong packages
                liveTableInsert(barcode, status)
            }
        })
        .catch(() => {
            // sendMessage("socketChannel", {
            //     topic: username + "/scanner",
            //     message: "print_error"
            // })
            var error
            showNotification("AWB printing error: " + value, error = 1)
            console.log("Can’t access " + url + " response. Blocked by browser?")
        })

}

// live insert into table
function liveTableInsert(barcode, status) {
    var tbody = $(".table-wrapper table tbody")
    var date = new Date()
    var index = $(".table-wrapper table tbody tr:first-child th").html()
    if (index == undefined) {
        index = 0
    }
    index = (parseInt(index) + 1)
    var value = {
        barcode,
        timestamp: date.toLocaleString('en-US', {
            timeZone: 'Europe/Bucharest',
            timeStyle: "medium",
            dateStyle: "long"
        })
    }

    if (status)
        var elClass = 'last-row-animation-good'
    else
        var elClass = 'last-row-animation-bad'

    // console.log(value.timestamp)
    tbody.prepend(`<tr class="` + elClass + `" timestamp="` + value.timestamp + `" barcode="` + value.barcode + `">
                            <th scope="row">` + index + `</th>
                            <td>` + value.barcode + `</td>
                            <td>` + status + `</td>
                            <td>` + value.timestamp.split(", ")[0] + ` at ` + value.timestamp.split(", ")[1] + `</td>
                        </tr>`)

    // Total packages update
    $(".scanner-info h3").html(index)

    // Correct packages update
    if (status == 1) {
        var currentIndex = $(".correct-packages h3").html()
        $(".correct-packages h3").html(parseInt(currentIndex) + 1)
    }

    // Wrong packages update
    if (status == 0) {
        var currentIndex = $(".wrong-packages h3").html()
        $(".wrong-packages h3").html(parseInt(currentIndex) + 1)
    }

    // Eror packages update
    if (status == -1) {
        var currentIndex = $(".error-packages h3").html()
        $(".error-packages h3").html(parseInt(currentIndex) + 1)
    }

    // Remove text if exists
    if ($(".text-center").length) {
        $(".text-center").remove()
    }
}

function openInNewTab(url, barcode) {

    // uncomment this for production

    // check if mobile
    if (isMobile) {
        var error
        showNotification("On mobile you can't send print command", error = 2)
    } else {
        // var error
        // showNotification("AWB for barcode " + barcode + " is printing", error = 2)
        // console.log(">>>> URL TO PRINT:",url)
        // var url = url.split("&")[0] + "&" + url.split("&")[1]
        var win = window.open(url, '_blank');
        console.log("AWB URL:", url);
        setTimeout(function () {
            win.close()
        }, 300)

    }

}

// function sendMessage(topic, msg) {
//     // send a status message to get the gate status
//     socket.emit(topic, msg)
// }

let getScannerRecordings = async () => {
    let response = await fetch("/api/get-scanner-recordings")
    return response.json()
}

let sendScannerRecordings = async (barcode, status) => {
    let response = await fetch("/api/send-scanner-recordings?barcode='" + barcode + "'&status='" + status + "'")
    return response.json()
}

// Filter on keyup
$("#scannerInput").keyup(function () {
    filterColumn('scannerInput', 'scannerTable', 0)
});

function scannerInput() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("scannerInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("scannerTable");
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        //   console.log(i, td)
        if (td) {
            txtValue = td.textContent || td.innerText;
            // console.log(i, td, txtValue)
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// function incrementCorrectPackages() {
//     var value = $(".correct-packages h3").html()
//     $(".correct-packages h3").html(parseInt(value) + 1)    
// }

// function incrementWrongPackages() {
//     var value = $(".wrong-packages h3").html()
//     $(".wrong-packages h3").html(parseInt(value) + 1)
// }

let run = (async () => {
    return await getScannerRecordings();
})().then((json) => {
    var tbody = $(".table-wrapper table tbody")
    if (json.length) {
        for (var [key, value] of Object.entries(json)) {

            var date = new Date(value.timestamp)
            date.setHours(date.getHours() - 2); //mysql is 2 hours ahead of romanian timezone
            value.timestamp = date.toLocaleString('en-US', {
                timeZone: 'Europe/Bucharest',
                timeStyle: "medium",
                dateStyle: "long"
            })

            // Init correct packages
            if (value.status == 1) {
                var currentIndex = $(".correct-packages h3").html()
                $(".correct-packages h3").html(parseInt(currentIndex) + 1)
            }

            // Init wrong packages
            if (value.status == 0) {
                var currentIndex = $(".wrong-packages h3").html()
                $(".wrong-packages h3").html(parseInt(currentIndex) + 1)
            }

            // Init rrror packages
            if (value.status == -1) {
                var currentIndex = $(".error-packages h3").html()
                $(".error-packages h3").html(parseInt(currentIndex) + 1)
            }

            tbody.prepend(`<tr timestamp="` + value.timestamp + `" barcode="` + value.barcode + `" status="` + value.status + `">
                            <th scope="row">` + (parseInt(key) + 1) + `</th>
                            <td>` + value.barcode + `</td>
                            <td>` + value.status + `</td>
                            <td>` + value.timestamp.split(", ")[0] + `, ` + value.timestamp.split(", ")[1] + `</td>
                        </tr>`)
            lastKey = (parseInt(key) + 1)
        }

        // Init total packages
        $(".scanner-info h3").html(lastKey)

    } else {
        $(".table-wrapper").append(`<p class="text-center">No recordings</p>`)
    }
})