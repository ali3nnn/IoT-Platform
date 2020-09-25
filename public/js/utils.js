export const timeoutAsync = (ms, f) => {
    let sleep = new Promise(resolve => setTimeout(function () {
        f();
    }, ms))
}

export function sendMessage(topic, msg) {
    // send a status message to get the gate status
    socket.emit(topic, msg)
}

export async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export function displayTimeoutAndVanish(element, timeout) {
    var el = $(element)
    var timeout_ = timeout / 1000
    var x = setInterval(function () {
        timeout_ -= 1
        el.html(timeout_ + " sec")
    }, 1000)

    timeoutAsync(timeout, function () {
        el.fadeOut(500)
        clearInterval(x);
    })
}

export function liveWeight(payloadJson) {
    var scaleTitle = $(".scale-info h3")
    var barcodeTitle = $(".scale-info p")
    payloadJson = JSON.parse(payloadJson)
    scaleTitle.html(payloadJson.weight + "g")
    barcodeTitle.html(payloadJson.barcode)
}

export function liveWeightTable(payloadJson, tableColumn) {

    // Live card insert
    var scaleTitle = $(".scale-info h3")
    var barcodeTitle = $(".scale-info p")
    if (typeof payloadJson == 'string') {
        payloadJson = JSON.parse(payloadJson)
    }
    scaleTitle.html(payloadJson.weight + "g")
    barcodeTitle.html(payloadJson.barcode)

    // MySQL insert
    // if (payloadJson.wms)
    //   sendScaleRecordings(payloadJson.barcode, payloadJson.weight, payloadJson.wms)
    // else
    //   sendScaleRecordings(payloadJson.barcode, payloadJson.weight)

    if (payloadJson.wms == undefined)
        payloadJson.wms = 0

    // Remove no data text
    if ($(".table-wrapper .text-center").length) {
        $(".table-wrapper .text-center").remove()
    }

    var tbody = $(".table-wrapper table tbody")

    // Sync the timestamp (mysql - local timezone)
    var timestamp = new Date()
    timestamp = timestamp.toLocaleString('en-US', {
        timeZone: 'Europe/Bucharest',
        timeStyle: "medium",
        dateStyle: "long"
    })

    // Insert new data into table
    var index = $(".table-wrapper table tbody tr:first-child th").html()
    if (index == undefined) {
        index = 0
    }
    index = (parseInt(index) + 1)

    if (payloadJson.wms)
        var elClass = 'last-row-animation-good'
    else
        var elClass = 'last-row-animation-good'

    tbody.prepend(`<tr class="` + elClass + `" timestamp="` + timestamp + `" barcode="` + payloadJson.barcode + `">
                          <th scope="row">` + index + `</th>
                          <td>` + payloadJson.wms + `</td>
                          <td>` + payloadJson.barcode + `</td>
                          <td>` + payloadJson.weight + `g</td>
                          <td>` + timestamp.split(", ")[0] + `, ` + timestamp.split(", ")[1] + `</td>
                      </tr>`)

    // Filter again
    filterColumn(tableColumn)

}

var oneTime = true
// var statusConor = 0

export function liveGate(status) {
    var gate = $(".gate-info")
    var gateTitle = $(".gate-info h3")

    if (status == 0) {
        // gate is closed
        gate.attr("status", "closed")
        // document.querySelector(".gate-info").style.background = "#28a745"
        gateTitle.html("Closed")

        if (!isConveyorEnabled()) {
            insertStatus("on"); // insert status into DB
            switchConveyorToggle()
        }
        showNotification("Gate is closed", 4)
    } else if (status == 1) {
        // gate is open
        gate.attr("status", "open")
        // document.querySelector(".gate-info").style.background = "#dc3545"
        gateTitle.html("Open")
        // isConveyorEnabled()

        if (!isConveyorEnabled()) {
            insertStatus("on"); // insert status into DB
            switchConveyorToggle()
        }
        showNotification("Gate is open", 4)
    } else {
        timeoutAsync(2000, function() {

        })
    }

    // When page is loading first time
    // And toggle is on
    // And gate is unknown
    // => toggle should be off
    timeoutAsync(1000, function () {
        // wait 5000 sec to receive gate status

        if (gateTitle.text() == "Unknown") {
            if (isConveyorEnabled()) {
                insertStatus("off"); // insert status into DB
                switchConveyorToggle()
            }

            // showNotification("Conveyor is stopped", 0)
            // showNotification("Conveyor is stopped", 1)
            // showNotification("Conveyor is stopped", 2)
            if (oneTime) {
                // showNotification("Conveyor is stopped", 1)
                oneTime = false
            }

        }

    })
}

function isConveyorEnabled() {
    var switchConveyor = $("#switch-conveyor")
    var switchConveyorState = switchConveyor[0].checked
    return switchConveyorState
}

function switchConveyorToggle() {
    var switchConveyor = $("#switch-conveyor")
    switchConveyor[0].checked = !switchConveyor[0].checked
}

export function scaleInput(tableColumn) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("scaleInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("scaleTable");
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[tableColumn];
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

export function filterColumn(id_input, id_table, tableColumn) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(id_input);
    filter = input.value.toUpperCase();
    table = document.getElementById(id_table);
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[tableColumn];
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

// insert status of conveyor into mysql
export let insertStatus = async (status) => {
    // status = on / off
    $.ajax({
        url: "https://anysensor.dasstec.ro/api/conveyor?setStatus=" + status + "",
        type: 'GET'
    });
}

// get all values of a sensor
export let getConveyorStatus = async (sensor) => {
    let response = await fetch("https://anysensor.dasstec.ro/api/conveyor")
    return response.json()
}

export function showNotification(message, error = 0) {

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

    else if (error == 4)
        $("notification").append(`<div class="messages hideMe">
                                        <div class="alert alert-success mt-3 mb-0" role="alert">
                                            <i class="fas fa-info-circle"></i>
                                            <background></background>
                                            ` + message + `
                                        </div>
                                </div>`).show('slow');

}