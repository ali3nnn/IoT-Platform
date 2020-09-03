// const { request } = require("express")

var lastKey = 0
var requestConfig = false

// The client listens on Socket.IO 
socket.on('socketChannel', async (data) => {

    // console.log(data)
    // Live Scanner - client receives scanner data from backend
    if (data.topic.includes(username + "/scanner")) {
        // sendScannerRecordings(data.message.barcode)
        // liveTableInsert(data.message.barcode, lastKey)
        if (!requestConfig) {
            getScannerConfigRequest(data.message.barcode)
            showNotification("Barcode scanned: " + data.message.barcode)
            // requestConfig = true
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

async function getScannerConfigRequest(barcode) {
    // get post config fmor mysql
    $.get({
        url: '/api/request-scanner-config',
        success: function (result) {
            console.log("SEND:", result[0])
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

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
    var proxyurl = ""

    // De adaugat in header pentru a elimina heorku proxy
    // Access-Control-Allow-Origin: *
    // Access-Control-Allow-Headers: Content-Type
    // Access-Control-Allow-Methods:GET,POST,PUT,DELETE,OPTIONS
    // Access-Control-Allow-Credentials: true
    // Access-Control-Expose-Headers: access-control-allow-origin

    // De sters din header pt iframe
    // X-Frame-Options: SAMEORIGIN

    fetch(proxyurl + url, {
            method: type,
            // mode: 'cors',
            // credentials: 'included',
            body: `{"` + data + `": "` + value + `"}`,
            headers: {
                'Content-Type': contentType
            },
        })
        .then(response => response.text())
        .then(contents => {
            console.log("Received:", JSON.parse(contents))
            var url_awb = JSON.parse(contents).awb
            var barcode = JSON.parse(contents).barcode
            var status = JSON.parse(contents).status
            if(status)
                openInNewTab(url_awb, barcode) // uncomment this to open a new tab
            else
                showNotification("Order pushed: " + value, error = 3)
        })
        .catch(() => {
            showNotification("AWB printing error: " + value, error = 1)
            console.log("Can’t access " + url + " response. Blocked by browser?")
        })

}

// not finished work
function liveTableInsert(barcode, index) {
    var tbody = $(".table-wrapper table tbody")
    var date = new Date()
    var value = {
        barcode,
        timestamp: date.toISOString()
    }
    tbody.prepend(`<tr timestamp="` + value.timestamp + `" barcode="` + value.barcode + `">
                            <th scope="row">` + (index + 1) + `</th>
                            <td>` + value.barcode + `</td>
                            <td>` + value.timestamp.split("T")[0] + ` at ` + value.timestamp.split("T")[1].split(".")[0] + `</td>
                        </tr>`)
    lastKey++
}

function openInNewTab(url, barcode) {

    // check if mobile
    // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // showNotification("AWB for barcode " + barcode + " is printing", error = 2)
    // } else {
    showNotification("AWB for barcode " + barcode + " is printing", error = 2)

    // var url = url.split("&")[0] + "&" + url.split("&")[1]
    // var win = window.open(url, '_blank');
    // console.log("AWB URL:", url);
    // setTimeout(function () {
    //     win.close()
    // }, 300)

    // }

}

function showNotification(message, error = 0) {

    if (error == 0)
        $("notification").append(`<div class="messages hideMe">
                                    <div class="alert alert-info mt-3 mb-0" role="alert">
                                    <i class="fas fa-barcode"></i>
                                        <background></background>
                                        ` + message + `
                                    </div>
                                </div>`).show('slow');
    else if (error == 1)
        $("notification").append(`<div class="messages hideMe">
                                    <div class="alert alert-danger mt-3 mb-0" role="alert">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <background></background>
                                        ` + message + `
                                    </div>
                                </div>`).show('slow');

    else if (error == 2)
        $("notification").append(`<div class="messages hideMe">
                                        <div class="alert alert-success mt-3 mb-0" role="alert">
                                            <i class="fas fa-print"></i>
                                            <background></background>
                                            ` + message + `
                                        </div>
                                </div>`).show('slow');
    
    else if (error == 3)
        $("notification").append(`<div class="messages hideMe">
                                        <div class="alert alert-info mt-3 mb-0" role="alert">
                                            <i class="fas fa-times-circle"></i>
                                            <background></background>
                                            ` + message + `
                                        </div>
                                </div>`).show('slow');

}

function sendMessage(topic, msg) {
    // send a status message to get the gate status
    socket.emit(topic, msg)
}

let getScannerRecordings = async () => {
    let response = await fetch("https://anysensor.dasstec.ro/api/get-scanner-recordings")
    return response.json()
}

let sendScannerRecordings = async (barcode) => {
    let response = await fetch("https://anysensor.dasstec.ro/api/send-scanner-recordings?barcode='" + barcode + "'")
    return response.json()
}

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

let run = (async () => {
    json = await getScannerRecordings();
})().then(() => {
    var tbody = $(".table-wrapper table tbody")
    if (json.length) {
        for (var [key, value] of Object.entries(json)) {
            tbody.prepend(`<tr timestamp="` + value.timestamp + `" barcode="` + value.barcode + `">
                            <th scope="row">` + (parseInt(key) + 1) + `</th>
                            <td>` + value.barcode + `</td>
                            <td>` + value.timestamp.split("T")[0] + ` at ` + value.timestamp.split("T")[1].split(".")[0] + `</td>
                        </tr>`)
            lastKey = (parseInt(key) + 1)
        }
        $(".scanner-info h3").html(lastKey)
    } else {
        $(".table-wrapper").append(`<p class="text-center">No recordings</p>`)
    }
})