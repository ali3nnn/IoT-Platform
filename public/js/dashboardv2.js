import {
    getDistinctValuesFromObject,
    getValuesFromObject,
    downloadCSV
} from './utils.js'

let getSensorData = async (id) => {
    let response = await fetch("/api/v3/get-sensor-data?id=" + id)
    return response.json()
}

function defaultSensorView(sensor) {

    // sensorId = String(sensorId)
    let sensorData = JSON.stringify(sensor.sensorData)

    let alertClass = ''
    if(sensor.sensorMeta.alerts==1)
        alertClass = 'alert-active' 
    else if(sensor.sensorMeta.alerts==2)
        alertClass = 'alarm-active'
    
    // alertClass = 'alert-active'


    // current value gauge component
    var currentValueView = `
    <article class="card height-control live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `">

        <div class="card-header `+alertClass+`">
            <h3 class="card-title">
                <i class='update-icon'></i>
                Current Value
            </h3>
            <span class='card-settings-button'>
                <i class="far fa-sliders-h"></i>
            </span>
        </div>

        <div class="card-body">
           <div class="` + sensor.sensorMeta.sensorId + `-currentValue">
                <div id="` + sensor.sensorMeta.sensorId + `-gauge" class="gauge-container two">
                    <span class="currentValue">0</span>
                    `+ (() => { return sensor.sensorMeta.min ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ' })() + `
                    `+ (() => { return sensor.sensorMeta.max ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ' })() + `
                </div>
                <p class='update-time-gauge'>Waiting to be updated...</p>
            </div>
        </div>

        <div class='card-alerts-settings alert-` + sensor.sensorMeta.sensorId + `'>
            <span class='card-settings-button-alert tooltip_test'>
                <i class="fas fa-bell"></i>
                <span class="tooltiptext">New feature is coming!</span>
            </span>
            <span class='card-settings-button-update tooltip_test'>
                <i class="fas fa-save"></i>
                <span class="tooltiptext">By clicking you will update alerts and location!</span>
            </span>
            <span class='card-settings-button-inner'>
                <i class="far fa-sliders-h"></i>
            </span>
            <div class='settings-wrapper'>
                <div class="slidecontainer">

                    <p class='label-input'>Min: </p>
                    <input type="number" name="minAlert" `+ (() => { return sensor.sensorMeta.min ? 'value="'+sensor.sensorMeta.min+'"' : 'placeholder="Set min alert"' })() + ` class="input input-min">
                    <p class='label-input'>Max: </p>
                    <input type="number" name="maxAlert" `+ (() => { return sensor.sensorMeta.max ? 'value="'+sensor.sensorMeta.max+'"' : 'placeholder="Set max alert"' })() + ` class="input input-max">

                    <p class='label-input'>Lat: </p>
                    <input type="number" name="xLat" `+ (() => { return sensor.sensorMeta.x ? 'value="'+sensor.sensorMeta.x+'"' : 'placeholder="Set x position"' })() + ` class="input input-lat">
                    <p class='label-input'>Long: </p>
                    <input type="number" name="yLong" `+ (() => { return sensor.sensorMeta.y ? 'value="'+sensor.sensorMeta.y+'"' : 'placeholder="Set y position"' })() + ` class="input input-long">

                </div>
            </div>
        </div>
    </article>
    `

    // counter noriel ui
    var newItemLive = `
    <article class="card height-control live-card-` + sensor.sensorMeta.sensorId + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Live Update
        </h3>
    </div>

    <div class="card-body">
        <div class="` + sensor.sensorMeta.sensorId + `-newItem">

            <a href="#" class='spinner ` + sensor.sensorMeta.sensorId + `-newItem-spinner'>
                <span>Loading...</span>
            </a>

            <div id="` + sensor.sensorMeta.sensorId + `-floatinBall" class="hidden-element"></div>

        </div>
    </div>`

    // graph view component
    var graphView = `

    <article class="card height-control ` + sensor.sensorMeta.sensorId + `-card graph-` + sensor.sensorMeta.sensorId + `" sensorType="` + sensor.sensorMeta.sensorType + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensorData='` + sensorData + `'>
    
        <div class="card-header">

            <h3 class="card-title">
                <i class='update-icon'></i>
                <span>` + sensor.sensorMeta.sensorName + `</span> |
                <b>` + sensor.sensorMeta.sensorId + `</b>
            </h3>
    
            <div class="card-tools">
                <ul class="pagination pagination-sm">

                    <li class="page-item">
                        <div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                            <i class="fa fa-calendar"></i>&nbsp;
                            <span></span> <i class="fa fa-caret-down"></i>
                        </div>
                    </li>

                    <li class="page-item">
                        <div id="report" class="tooltip_test" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                            <i class="fas fa-file-csv"></i>
                            <span class="tooltiptext">Download CSV</span>
                        </div>
                    </li>

                </ul>
            </div>
    
        </div>
        
    
        <div class="card-body">
            <a href="#" class='spinner ` + sensor.sensorMeta.sensorId + `-graph-spinner'>
                <span>Loading...</span>
            </a> 
            <div class="` + sensor.sensorMeta.sensorId + `-graph-calendar graph-calendar">
                Time interval for ` + sensor.sensorMeta.sensorId + ` 
                <input name="dates" value="Button Change"> 
            </div> 
        </div>
        
    </article>`

    // stack the components
    if (sensor.sensorMeta.sensorType == 'counter') {
        return newItemLive + graphView
    } else {
        return currentValueView + graphView
    }

}

// Triggers
function triggerSensorView(sensorId) {

    // Expand settings panel
    $(".live-card-" + sensorId + " .card-settings-button").on('click', function () {
        $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up')
        $(this).parent().parent().children('.card-body').toggleClass('blur8')
        $(this).parent().parent().children('.card-header').toggleClass('blur8')
        // alertsAndLocationLoad()
    })

    // Close settings pane
    $(".live-card-" + sensorId + "  .card-settings-button-inner").on('click', function () {
        $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up')
        $(this).parent().parent().children('.card-body').toggleClass('blur8')
        $(this).parent().parent().children('.card-header').toggleClass('blur8')
    })

    // Save settings
    $(".live-card-" + sensorId + " .card-settings-button-update").on('click', function () {
        saveSensorSettings(sensorId)
    })

    // Trigger calendar
    var currentHourPm = moment().format("HH")
    var currentMin = moment().format("mm")
    // var start = moment().subtract(currentHourPm, 'hours').subtract(currentMin, 'minutes');
    // var end = moment();
    // console.log("Trigger loaded for:", sensorId)
    $('.' + sensorId + '-card #reportrange').daterangepicker({
        timePicker: true,
        "timePicker24Hour": true,
        startDate: moment().startOf('hour').subtract(currentHourPm, 'hour'),
        endDate: moment().startOf('hour').add(24 - currentHourPm, 'hour'),
    }, callback);

    function callback(start, end) {

        start = start.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'
        end = end.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'

        // console.log("Calendar for:",sensorId,start,end)
        reloadDataCustomCalendar(start, end, sensorId)
    }

    // callback(start, end);

    // Trigger for CSV button

    $("article.graph-" + sensorId + " #report").on('click', function (e) {

        var sensorData = $("article.graph-" + sensorId).attr("sensorData")
        sensorData = JSON.parse(sensorData)

        // console.log(sensorData)

        let filename = "Report-"+sensorId+".csv"

        downloadCSV({
            filename,
            xlabels: getValuesFromObject('time',sensorData),
            ylabels: getValuesFromObject('value',sensorData)
        })

    })
}

let reloadDataCustomCalendar = async (start, end, sensorId) => {
    // [8] TODO: Get data for new date
    // [*] TODO: Reload the chart with new data
    getSensorDataCustomInterval(sensorId, start, end)
}

// get and plot data by a specific interval
let getSensorDataCustomInterval = async (sensor, start, end) => {

    if (!$("body").hasClass("calendar-active")) {
        $("body").addClass("calendar-active")
    }

    // Building the url
    const url = "/api/v3/get-interval?sensorId=" + sensor + "&start=" + start + "&end=" + end

    // Making the request
    $.ajax({
        url: url,
        type: 'GET'
    }).done((msg) => {

        // Insert data into attributes of html element
        let sensorData = JSON.stringify(msg.result)
        console.log("initial attr:", $("article.graph-"+sensor).attr("sensorData"))
        $("article.graph-"+sensor).attr("sensorData",sensorData)
        console.log("after attr:", $("article.graph-"+sensor).attr("sensorData"))

        // Split the dataset
        let values = getValuesFromObject('value', msg.result)
        let timestamps = getValuesFromObject('time', msg.result)

        // Process the dataset
        timestamps = timestamps.map(time => {
            return time.replace('Z', '')
        })

        values = values.map(value => {
            return value ? value.toFixed(1) : value
        })

        // Main
        chartList.forEach(chart => {
            let chartId = chart.canvas.id.split('-')[0]
            if (chartId == sensor) {

                // Update dataset
                chart.data.datasets[0].data = values;
                chart.data.labels = timestamps;

                // Update options
                chart.options.scales.xAxes[0].time.unit = 'day'

                // Perform update
                chart.update();
            }
        })
    });

}

// Global chart list
let chartList = []

// Plot data
function plotData(sensorId, source = 'attr') {

    // [*] TODO: check source attr
    // [*] TODO: get data
    // [ ] TODO: display data
    if (source == 'attr') { // this source should run only when page is loaded
        // Get Data
        let rawData = $(`article.graph-` + sensorId + ``).attr("sensorData")
        let sensorType = $(`article.graph-` + sensorId + ``).attr("sensorType")
        let sensorData = JSON.parse(rawData)
        // console.log(sensorData)
        // Add Canvas for chart
        $(`article.graph-` + sensorId + ` .card-body a.spinner`).remove()
        $(`article.graph-` + sensorId + ` .card-body`).append(`<canvas id="` + sensorId + `-graph"></canvas>`)
        // Plot w/ Chart.js
        let canvas = $(`canvas#` + sensorId + `-graph`)[0].getContext("2d");

        let labels = getValuesFromObject('time', sensorData)
        let data = getValuesFromObject('value', sensorData)

        let options = {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            drawBorder: false,
            legend: {
                labels: {
                    fontColor: 'white'
                }
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        parser: 'YYYY-MM-DD HH:mm:ss',
                        unit: 'minute',
                        displayFormats: {
                            day: 'MM/DD HH:mm'
                        },
                    },
                    distribution: 'series',
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        fontColor: 'white',
                        source: 'auto',
                        // min: labels[labels.length - 1],
                        // max: labels[0]
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                        fontColor: 'white'
                    },
                    gridLines: {
                        color: "#415f7d",
                        zeroLineColor: '#415f7d'
                    }
                }]
            }
        }

        // console.log(labels)

        labels = labels.map(time => {
            return time.replace('Z', '')
        })

        data = data.map(value => {
            return value ? value.toFixed(1) : value
        })

        // console.log(timestamps[0], timestamps[timestamps.length - 1])
        // let min = labels[labels.length - 1]
        // let max = labels[0]
        // let labels2 = []
        // let timeDiff = moment(max).diff(moment(min), 'm'); // difference (in days) between min and max date
        // populate 'labels' array
        // console.log("min:", min, "max:", max)
        // for (let i = 0; i <= timeDiff; i++) {
        //     var _label = moment(min).add(i, 'm').format('MM/DD HH:mm');
        //     // console.log(_label)
        //     labels2.push(_label);
        // }
        // console.log(labels)
        // console.log(labels2)

        // console.log(labels)
        let chart = new Chart(canvas, {
            type: 'line',
            data: {
                // labels: labels, //labels are displayed with 3 more hours than this list
                labels: labels,
                datasets: [{
                    label: sensorType,
                    data: data,
                    backgroundColor: 'rgba(51, 153, 255, 0.2)',
                    borderColor: 'rgba(51, 153, 255, 1)',
                    pointBorderColor: '#343a40',
                    pointBackgroundColor: "rgba(51, 153, 255, 1)",
                    pointHoverBackgroundColor: "#ffc107",
                    pointRadius: 1.5,
                    pointHoverRadius: 7,
                    pointBorderWidth: 1,
                    borderWidth: 1,
                    lineTension: 0.2
                }]
            },
            options,
            plugins: [{
                // beforeInit: function (chart) {
                //     // console.log(timestamps[0], timestamps[timestamps.length - 1])
                //     var ticks = chart.options.scales.xAxes[0].ticks, // 'ticks' object reference
                //         // difference (in days) between min and max date
                //         timeDiff = moment(ticks.max).diff(moment(ticks.min), 'm');
                //     // populate 'labels' array
                //     // (create a date string for each date between min and max, inclusive)
                //     // chart.data.labels = []
                //     for (let i = 0; i <= timeDiff; i++) {
                //         var _label = moment(ticks.min).add(i, 'm').format('MM/DD HH:mm');
                //         chart.data.labels.push(_label);
                //     }
                //     // chart.update()
                // }
            }]
        });
        // console.log(chart.data)
        chartList.push(chart)
    } else {

    }

}

function appendInfoBox(label, value, fontAwesome = false) {
    var component = `<div class="small-box bg-info county-detail box-shadow-5">
        <div class="inner">
            <h3>` + value + `</h3>
            <p>` + label + `</p>
        </div>`

    if (fontAwesome) {
        component += `<div class="icon">` + fontAwesome + `</div>`
    }

    component += `</div>`

    $(".small-box-container").append(component)

}

function updateCurrentValue(sensorid, value) {
    // Update value
    let valueEl = $("article.live-card-" + sensorid + " span.currentValue")
    valueEl.html(value)

    // Update time
    let timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge")
    let currentTime = new Date()
    currentTime = currentTime.toLocaleString('en-US', {
        timeZone: 'Europe/Bucharest',
        timeStyle: "medium",
        dateStyle: "medium"
    })
    timeEl.html(currentTime)

}

// Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client
var socketChannel = 'socketChannel'
socket.on(socketChannel, async (data) => {

    let currentValueBox = $("article[class*='live-card']")

    // Loop through each current value box
    currentValueBox.each((index, item) => {
        // get sensor id for each current value box 
        let sensorid = $(item).attr("sensorid")
        // get value of topic that contains this sensorid
        if (data.topic.includes(sensorid)) {
            updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1))
        }
    })

})

// Alerts
function saveSensorSettings(sensorid) {

    const min = $(".live-card-" + sensorid + " .settings-wrapper .input-min").val()
    const max = $(".live-card-" + sensorid + " .settings-wrapper .input-max").val()
    const xLat = $(".live-card-" + sensorid + " .settings-wrapper .input-lat").val()
    const yLong = $(".live-card-" + sensorid + " .settings-wrapper .input-long").val()

    let url = "/api/v3/save-settings?sensorId='" + sensorid + "' " + (() => { return min ? '&min=' + min : '' })() + (() => { return max ? '&max=' + max : '' })() + (() => { return xLat ? '&xlat=' + xLat : '' })() + (() => { return yLong ? '&ylong=' + yLong : '' })()
    url = url.replace(' ', '')
    console.log(url)


    $.ajax({
        url: url,
        type: 'GET'
    }).done((msg) => {

        // Min alert
        if (min) {
            $(".live-card-" + sensorid + " .minAlertGauge").prop("value", min)
            $(".live-card-" + sensorid + " .minAlertGauge").html("min: " + min)
            $(".live-card-" + sensorid + " input[name='minAlert']").prop("value", '')
            $(".live-card-" + sensorid + " input[name='minAlert']").prop("placeholder", "Updated at " + min)
        }

        // Max alert
        if (max) {
            $(".live-card-" + sensorid + " .maxAlertGauge").prop("value", max)
            $(".live-card-" + sensorid + " .maxAlertGauge").html("max: " + max)
            $(".live-card-" + sensorid + " input[name='maxAlert']").prop("value", '')
            $(".live-card-" + sensorid + " input[name='maxAlert']").prop("placeholder", "Updated at " + max)
        }

        // xLat
        if (xLat) {
            $(".live-card-" + sensorid + " input[name='xLat']").prop("value", '')
            $(".live-card-" + sensorid + " input[name='xLat']").prop("placeholder", "Updated at " + xLat)
        }

        // yLong
        if (yLong) {
            $(".live-card-" + sensorid + " input[name='yLong']").prop("value", '')
            $(".live-card-" + sensorid + " input[name='yLong']").prop("placeholder", "Updated at " + yLong)
        }


    });
}

// This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================
let mainLoader = async () => {
    // console.log(userData_raw)
    // let zoneData = JSON.parse('{{{zoneData}}}')

    // Get query from URL
    const url = new URL(location.href)
    const zoneId = url.searchParams.get('zoneid')

    // Preprocess data to extract sensors from current zone only
    let sensorMetaRaw = []
    let sensorBuffer = [] // this buffer is use to prevent double inserting of sensors
    console.log(userData_raw)
    userData_raw.forEach(sensor => {
        // Iterate through each result and save unique sensorId rows
        if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
            sensor.zoneId == zoneId ? sensorMetaRaw.push(sensor) : null
            sensorBuffer.push(sensor.sensorId)
        }
    })

    // Get data from influx for each sensor
    let sensorDataRaw = []
    for (const sensor of sensorMetaRaw) {
        let sensorData = await getSensorData(sensor.sensorId)
        sensorDataRaw.push({ sensorMeta: sensor, sensorData })
    }

    console.log(sensorDataRaw)

    for (const sensor of sensorDataRaw) {
        // Append the default sensor view (current value + graph) for each sensor
        $(".card-container").append(defaultSensorView(sensor));

        // Enable trigger events on defaultSensorView components after append
        triggerSensorView(sensor.sensorMeta.sensorId)

        // Plot data on graph based on sensorData attr
        plotData(sensor.sensorMeta.sensorId)

    }

    // Add info box
    let location3 = sensorDataRaw[0].sensorMeta.location3
    let location2 = sensorDataRaw[0].sensorMeta.location2
    appendInfoBox(location2, location3, '<i class="fas fa-compass"></i>')

    let alert = 0, alarm = 0
    sensorDataRaw.forEach(item => {
        if (item.sensorMeta.alerts == 1)
            alert++
        if (item.sensorMeta.alerts == 2)
            alarm++
    })
    appendInfoBox('Warning alert', alert + ' / ' + sensorDataRaw.length, '<i class="fas fa-exclamation"></i>')
    appendInfoBox('Limits exeeded', alarm + ' / ' + sensorDataRaw.length, '<i class="fas fa-exclamation-triangle"></i>')

    // return sensorDataRaw

}

mainLoader()