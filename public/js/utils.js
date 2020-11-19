// Start imports
var Checker = require('password-checker');
export const _ = require('lodash')
// End Imports


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
    // console.log(payloadJson.weight)
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
    // try {
    //     filterColumn(tableColumn)
    // } catch(e) {
    //     console.warn(e)
    // }

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
        // showNotification("Gate is closed", 4)
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
        // showNotification("Gate is open", 4)
    } else {
        timeoutAsync(2000, function () {

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
    var input = {
        value: ''
    }
    var filter, table, tr, td, i, txtValue;
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

export const monthChanger = (number) => {
    var b = ''
    switch (number) {
        case 1:
            b = "January";
            break;
        case 2:
            b = "February";
            break;
        case 3:
            b = "March";
            break;
        case 4:
            b = "April";
            break;
        case 5:
            b = "May";
            break;
        case 6:
            b = "June";
            break;
        case 7:
            b = "July";
            break;
        case 8:
            b = "August";
            break;
        case 9:
            b = "September";
            break;
        case 10:
            b = "October";
            break;
        case 11:
            b = "November";
            break;
        case 12:
            b = "December";
            break;
    }
    return b
}

// insert status of conveyor into mysql
export let insertStatus = async (status) => {
    // status = on / off
    $.ajax({
        url: "/api/conveyor?setStatus=" + status + "",
        type: 'GET'
    });
}

// get all values of a sensor
export let getConveyorStatus = async (sensor) => {
    let response = await fetch("/api/conveyor")
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

    else if (error == 'top') {
        if ($(".new-message").length) {
            $("#main .new-message").hide().prepend(`<div>` + message + `</div>`).slideToggle(500, function () {
                timeoutAsync(7000, function () {
                    $('#main .new-message > div:last-child').slideToggle(1000)
                })
            })
        }
    }

}

export function getLocationObj() {
    var bodyEl = $("body")
    var location = []
    if (bodyEl.attr("location")) {
        location.push(bodyEl.attr("location"))
        var locationObj = JSON.parse(location)

        // if($("body").hasClass("map-page")) {
        //   showNotification("You have <b>"+location.length+" "+ (location.length>1 ? `sensors` : `sensor`) +"</b> on map!", error = 4)
        // }

        return locationObj
    } else {
        // return coordinates of bucharest (lon,lat)
        // showNotification("You have no sensor assigned!", error = 4)
        return {
            "bucharest": [44.439663, 26.096306]
        }
    }
}

export function passwordCheckerPromise(value) {

    let promise = new Promise(function (resolve, reject) {
        var checker = new Checker();
        var error = false
        checker.min_length = 6;
        checker.max_length = 20;
        checker.requireLetters(true);
        checker.requireNumbers(true);
        checker.requireSymbols(false);
        checker.checkLetters(true);
        checker.checkNumbers(true);
        checker.checkSymbols(true);
        checker.allowed_symbols = '-.';
        if (!checker.check(value)) {
            error = checker.errors[0].message
        } else {
            error = false
        }
        resolve(error)
    });

    return promise

}

export function passwordChecker(value) {
    var checker = new Checker();
    var error = false
    checker.min_length = 6;
    checker.max_length = 20;
    checker.requireLetters(true);
    checker.requireNumbers(true);
    checker.requireSymbols(false);
    checker.checkLetters(true);
    checker.checkNumbers(true);
    checker.checkSymbols(true);
    checker.allowed_symbols = '-.';
    if (!checker.check(value)) {
        error = checker.errors[0].message
    } else {
        error = false
    }
    return error
}

export function allTrue(obj) {
    for (var o in obj)
        if (!obj[o]) return false;
    return true;
}

export function getDistinctValuesFromObject(val, obj) {
    let flags = [],
        output = [],
        l,
        i;
    l = obj.length;
    for (i = 0; i < l; i++) {
        if (flags[obj[i][val]]) continue;
        flags[obj[i][val]] = true;
        output.push(obj[i][val]);
    }
    return output
}

export function getValuesFromObject(val, obj) {
    let flags = [],
        output = [],
        l,
        i;
    l = obj.length;
    for (i = 0; i < l; i++) {
        // if (flags[obj[i][val]]) continue;
        // flags[obj[i][val]] = true;
        output.push(obj[i][val]);
    }
    return output
}

export function searchToObj(val) {
    let search = val.split('?')[1]

    let searchobj = {}
    if (search) {
        search = search.split('&')
        for (const el of search) {
            searchobj[el.split('=')[0]] = el.split('=')[1]
        }
    }
    return searchobj
}

export function generateUniqueId() {
    // Generate unique Id
    let date = new Date()
    let uniqueId = date.getTime() + Math.floor((Math.random() * 100) + 1)
    return uniqueId
}

function roundToTwo(num) {
    let result = +(Math.round(num + "e+2") + "e-2");
    if (Number.isInteger(result)) {
        result += '.00'
    }
    return result
}

// Used for exporting sensor charts
export function downloadCSV(args) {

    console.log(args)

    let data, filename, link;
    let csv = "";

    let ylabels = args.ylabels
    let xlabels = args.xlabels
    let json = [], jsonUniqueByDate

    if (args.sensorType == 'door') {
        ylabels = ylabels.map(value => {
            return value ? "closed" : value == null ? "not recorded" : "open"
        })
        xlabels = xlabels.map(time => {
            return time ? time.split("T")[0] + " " + time.split("T")[1].split(".")[0] : time
        })
        ylabels.forEach((item, index) => {
            json[index] = { 'time': xlabels[index], 'state': item }
        })
        jsonUniqueByDate = _.uniqBy(json, 'time')
        // Header of table
        csv = "Date,State\n"
    } else if (args.sensorType == 'temperature') {
        ylabels = ylabels.map(value => {
            return value ? value.toFixed(1) : "not recorded"
        })
        xlabels = xlabels.map(time => {
            return time ? time.replace(":00.000Z", "").replace("T", " ") : time
        })
        // Header of table
        csv = "Date,Temperature\n"
    }

    console.log(json)
    console.log(jsonUniqueByDate) // TODO: extract value form this json to put in CSV
    console.log(xlabels)
    console.log(ylabels)

    for (var i = 0; i < ylabels.length; i++) {
        csv += xlabels[i] + "," + ylabels[i].toString() + "\n"
    }

    if (csv == null) return;

    filename = args.filename || 'Report.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

// Used for reports from settings
export function downloadCSVMulti(args) {

    // console.log(args.date)

    var data, filename, link;
    var csv = "";

    // Header of table
    csv = "Date,"
    args.sensors.forEach((item, index) => {
        csv += item
        if (index != args.sensors.length - 1)
            csv += ","
    })
    csv += "\n"

    let maxRowLength = 0
    let timestamps = []

    // Build each row independetly
    if (args.date[0] == args.date[1]) {

        // user wants hourly report  - hourly timestamps
        // ==================

        // Prepare timestamps for 24 hours
        timestamps = []
        // console.log(typeof args.data)
        for (var prop in args.data) {
            if (Object.prototype.hasOwnProperty.call(args.data, prop)) {
                if (args.data[prop].rows.length > maxRowLength) {
                    timestamps = getValuesFromObject('time', args.data[prop].rows)
                    maxRowLength = args.data[prop].rows.length
                }
            }
        }

        // Clean timestamps (HH:MM)
        timestamps = timestamps.map(item => {
            item = item.split("T")[1].split(":")[0] + ":" + item.split("T")[1].split(":")[1]
            return item
        })

    } else {

        // user wants daily report - daily timestamps
        // ==================

        // Calculate for how many days user asked
        timestamps = []
        // console.log(typeof args.data)
        for (var prop in args.data) {
            if (Object.prototype.hasOwnProperty.call(args.data, prop)) {
                if (args.data[prop].rows.length > maxRowLength) {
                    timestamps = getValuesFromObject('time', args.data[prop].rows)
                    maxRowLength = args.data[prop].rows.length
                }
            }
        }

        // Clean timestamps (YYYY-MM-DD)
        timestamps = timestamps.map(item => {
            item = item.split("T")[0]
            return item
        })

    }
    // End Build each row independetly

    // console.log(maxRowLength, timestamps)

    for (let rowIndex = 0; rowIndex < maxRowLength; rowIndex++) {

        // console.log("Day", rowIndex, '/', daysToReport)

        // Get timestamp for each row
        let timestamp = timestamps[rowIndex]
        let row = timestamp + ','

        // console.log("timestamp", timestamp)

        // Build each column of row
        let columnIndex = 0
        for (const sensor of args.sensors) {

            if (args.data[sensor]) {
                if (args.types[columnIndex] == 'door') { // add column for DOOR
                    // console.log("door:", args.data[sensor].rows[rowIndex].value)
                    if (args.data[sensor].rows[rowIndex].value != null)
                        row += args.data[sensor].rows[rowIndex].value + ' min open'
                    else
                        row += " "

                }
                else if (args.types[columnIndex] == 'temperature') { // add column for TEMPERATURE
                    let value = roundToTwo(parseFloat(args.data[sensor].rows[rowIndex].value))
                    if (value || value == 0)
                        row += roundToTwo(parseFloat(args.data[sensor].rows[rowIndex].value)) + " °C"
                    else
                        row += " "
                }
            }
            else
                row += " "

            if (columnIndex != args.sensors.length - 1)
                row += ","

            columnIndex++
        }

        // Append row to final csv
        csv += row + "\n"
    }

    filename = 'Report.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

// Used to make the requests before going to downloadCSVMulti()
export function getMultiReport(listOfZones, date = []) {
    if (listOfZones) {

        let sensorsRaw = userData_raw.filter((item, index) => {
            if (listOfZones.indexOf(item.zoneId) != -1)
                return item
        })

        let listOfSensorsId = getValuesFromObject('sensorId', sensorsRaw)
        if (typeof listOfSensorsId == 'string')
            listOfSensorsId = new Array(listOfSensorsId)

        let listOfSensorsType = getValuesFromObject('sensorType', sensorsRaw)
        if (typeof listOfSensorsType == 'string')
            listOfSensorsType = new Array(listOfSensorsType)

        // console.log("SENT:", listOfSensorsId, listOfSensorsType)

        if (date[0] == date[1]) { // if user wants hourly report
            $.ajax({
                url: "/api/v3/multi-report/hourly",
                type: 'POST',
                data: {
                    listOfSensorsId,
                    listOfSensorsType,
                    date
                }
            }).done(function (res) {

                // console.log("RECEIVED:", res)

                if (res.length) {
                    if (typeof listOfSensorsId == 'string') {
                        listOfSensorsId = new Array(listOfSensorsId)
                        listOfSensorsType = new Array(listOfSensorsType)
                    }

                    // Rename keys
                    res.forEach((item, index) => {
                        delete Object.assign(res, { [item.tags.sensorId]: res[index] })[index];
                    })

                    // console.log("RECEIVED:", res)

                    downloadCSVMulti({
                        sensors: listOfSensorsId,
                        types: listOfSensorsType,
                        data: res,
                        date
                    })
                } else {
                    alert("No data for selected zones")
                }

            });

        } else { // if user want a daily report
            $.ajax({
                url: "/api/v3/multi-report",
                type: 'POST',
                data: {
                    listOfSensorsId,
                    listOfSensorsType,
                    date
                }
            }).done(function (res) {

                // console.log("RECEIVED:", res)

                if (res.length) {
                    if (typeof listOfSensorsId == 'string') {
                        listOfSensorsId = new Array(listOfSensorsId)
                        listOfSensorsType = new Array(listOfSensorsType)
                    }

                    // Rename keys
                    res.forEach((item, index) => {
                        delete Object.assign(res, { [item.tags.sensorId]: res[index] })[index];
                    })

                    // console.log("RECEIVED:", res)

                    downloadCSVMulti({
                        sensors: listOfSensorsId,
                        types: listOfSensorsType,
                        data: res,
                        date
                    })
                } else {
                    alert("No data for selected zones")
                }

            });

        }


        // if(date.length) {

        // } else {

        // }

    } else {
        return 'There is no zone selected!'
    }

}

export function getDaysInMonth(month, year) {
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
};

export function getKeyByValue(value, object) {
    return Object.keys(object).find(key => object[key] === value);
}
