import { deprecationHandler } from 'moment'
import {
    getDistinctValuesFromObject,
    getValuesFromObject,
    downloadCSV,
    getKeyByValue
} from './utils.js'

let getSensorData = async (id, type) => {
    let response = await fetch("/api/v3/get-sensor-data?id=" + id + "&type=" + type)
    return response.json()
}

// console.log(userData_raw)

function defaultSensorView(sensor) {

    // sensorId = String(sensorId)
    let sensorData = JSON.stringify(sensor.sensorData)

    // Sensor state 0/1/2/3
    let alertClass = ''
    let alertClass2 = ''
    if (sensor.sensorMeta.alerts == 1) {
        // alertClass = 'alert-active' 
        alertClass2 = 'alert-active'
    }
    else if (sensor.sensorMeta.alerts == 2) {
        // alertClass = 'alarm-active'
        alertClass2 = 'alarm-active'
    }
    else if ([3, 4].includes(sensor.sensorMeta.alerts))
        alertClass2 = 'no-power'

    // current value gauge component
    var currentValueView = `
    <article class="card height-control `+ alertClass2 + ` live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `">

        <div class="card-header `+ alertClass + `">
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
                    `+ (() => { return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.min) ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ' })() + `
                    `+ (() => { return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.max) ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ' })() + `
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
                    <input type="number" name="minAlert" `+ (() => { return sensor.sensorMeta.min ? 'value="' + sensor.sensorMeta.min + '"' : 'placeholder="Set min alert"' })() + ` class="input input-min">
                    <p class='label-input'>Max: </p>
                    <input type="number" name="maxAlert" `+ (() => { return sensor.sensorMeta.max ? 'value="' + sensor.sensorMeta.max + '"' : 'placeholder="Set max alert"' })() + ` class="input input-max">
                    <p class='label-input'>Lat: </p>
                    <input type="number" name="xLat" `+ (() => { return sensor.sensorMeta.x ? 'value="' + sensor.sensorMeta.x + '"' : 'placeholder="Set x position"' })() + ` class="input input-lat">
                    <p class='label-input'>Long: </p>
                    <input type="number" name="yLong" `+ (() => { return sensor.sensorMeta.y ? 'value="' + sensor.sensorMeta.y + '"' : 'placeholder="Set y position"' })() + ` class="input input-long">

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

    var doorLive = `
    <article class="card height-control `+ alertClass2 + ` live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `">

        <div class="card-header `+ alertClass + `">
            <h3 class="card-title">
                <i class='update-icon'></i>
                Door live
            </h3>
            <span class='card-settings-button'>
                <i class="far fa-sliders-h"></i>
            </span>
        </div>

        <div class="card-body">
           <div class="` + sensor.sensorMeta.sensorId + `-currentValue">
                <div id="` + sensor.sensorMeta.sensorId + `-gauge" class="gauge-container two">
                    <span class="doorState" state="unknown">
                        <i class="fas fa-door-closed"></i>
                        <i class="fas fa-door-open"></i>
                    </span>
                    `+ (() => { return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.openTimer) ? '<span class=\'openTimer\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: ' + sensor.sensorMeta.openTimer + '</span> ' : '<span class=\'openTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: <i class="fas fa-infinity"></i></span> ' })() + `
                    `+ (() => { return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.closedTimer) ? '<span class=\'closedTimer\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: ' + sensor.sensorMeta.closedTimer + '</span> ' : '<span class=\'closedTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: <i class="fas fa-infinity"></i></span> ' })() + `
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

                    <p class='label-input'>Open:</p>
                    <input type="number" name="openAlert" `+ (() => { return sensor.sensorMeta.openTimer ? 'value="' + sensor.sensorMeta.openTimer + '"' : '' })() + `placeholder="Set open limit in seconds" class="input input-open">
                    <p class='label-input'>Closed:</p>
                    <input type="number" name="closedAlert" `+ (() => { return sensor.sensorMeta.closedTimer ? 'value="' + sensor.sensorMeta.closedTimer + '"' : '' })() + `placeholder="Set closed limit in seconds" class="input input-closed">

                </div>
            </div>
        </div>
    </article>
    `

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
    } else if (sensor.sensorMeta.sensorType == 'door') {
        return doorLive + graphView
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

        let sensorData = $("article.graph-" + sensorId).attr("sensorData")
        let sensorType = $("article.graph-" + sensorId).attr("sensorType")
        sensorData = JSON.parse(sensorData)

        let filename = "Report-" + String(sensorId) + ".csv"

        downloadCSV({
            filename,
            xlabels: getValuesFromObject('time', sensorData),
            ylabels: getValuesFromObject('value', sensorData),
            sensorType
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
        // console.log("initial attr:", $("article.graph-"+sensor).attr("sensorData"))
        $("article.graph-" + sensor).attr("sensorData", sensorData)
        // console.log("after attr:", $("article.graph-"+sensor).attr("sensorData"))

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

        // General ptions of timeseries chart
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

        let chartColors = {
            red: 'rgba(255,0,0,1)',
            red2: 'rgba(255,0,0,0.2)',
            red5: 'rgba(255,0,0,0.5)',
            blue: 'rgba(51, 153, 255,1)',
            blue2: 'rgba(51, 153, 255,0.2)',
            blue5: 'rgba(51, 153, 255,0.5)',
            yellow: 'rgba(255, 193, 7,1)',
            yellow2: 'rgba(255, 193, 7,0.2)'
        }
        // END General ptions of timeseries chart

        // remap labels and data
        labels = labels.map(time => {
            return time.replace('Z', '')
        })

        data = data.map(value => {
            return value ? value.toFixed(1) : value
        })
        // end remap labels and data

        // Build arrays of colors
        let backgroundColor = []
        let pointBackgroundColor = []
        let borderColor = []
        let pointRadius = []
        if (labels.length)
            labels.forEach((item, index) => {
                backgroundColor.push(chartColors.blue2)
                pointBackgroundColor.push(chartColors.blue)
                borderColor.push(chartColors.blue)
                pointRadius.push(0)
            })
        else {
            backgroundColor = chartColors.blue2
            pointBackgroundColor = chartColors.blue
            borderColor = chartColors.blue
        }
        // end build arrays of colors

        // DATASET options based on sensorType
        let datasetConfig = {
            backgroundColor,
            borderColor,
            pointBorderColor: '#343a40',
            pointBackgroundColor,
            pointHoverBackgroundColor: "#ffc107",
            pointRadius: 3,
            pointHoverRadius: 7,
            pointBorderWidth: 1,
            borderWidth: 1,
            lineTension: 0.2
        }

        if (sensorType == 'door') {
            datasetConfig.lineTension = 0
            datasetConfig.pointRadius = pointRadius
            datasetConfig.pointHoverRadius = 7
            datasetConfig.pointBorderWidth = 0
            datasetConfig.borderWidth = 1
            // console.log(options.scales.yAxes[0])
            options.scales.yAxes[0].ticks['max'] = 1
            options.scales.yAxes[0].ticks['min'] = 0
        }
        // end DATASET options based on sensorType

        // TYPE of CHART based on sensorType
        let type, datasets
        if (sensorType == 'door') {
            type = 'line'
            datasets = [{
                label: sensorType,
                data: data,
                backgroundColor: datasetConfig.backgroundColor,
                borderColor: datasetConfig.borderColor,
                pointBorderColor: datasetConfig.pointBorderColor,
                pointBackgroundColor: datasetConfig.pointBackgroundColor,
                pointHoverBackgroundColor: datasetConfig.pointHoverBackgroundColor,
                pointRadius: datasetConfig.pointRadius,
                pointHoverRadius: datasetConfig.pointHoverRadius,
                pointBorderWidth: datasetConfig.pointBorderWidth,
                borderWidth: datasetConfig.borderWidth,
                lineTension: datasetConfig.lineTension
            }]
        }
        else {
            type = 'line'
            datasets = [{
                label: sensorType,
                data: data,
                backgroundColor: datasetConfig.backgroundColor,
                borderColor: datasetConfig.borderColor,
                pointBorderColor: datasetConfig.pointBorderColor,
                pointBackgroundColor: datasetConfig.pointBackgroundColor,
                pointHoverBackgroundColor: datasetConfig.pointHoverBackgroundColor,
                pointRadius: datasetConfig.pointRadius,
                pointHoverRadius: datasetConfig.pointHoverRadius,
                pointBorderWidth: datasetConfig.pointBorderWidth,
                borderWidth: datasetConfig.borderWidth,
                lineTension: datasetConfig.lineTension
            }]
        }
        // end TYPE of CHART based on sensorType

        // console.log(labels)
        let chart = new Chart(canvas, {
            type,
            data: {
                labels: labels,
                datasets,
            },
            options,
            plugins: [{
                beforeInit: function (chart) {
                    // Get min and max for temerature sensors
                    let threshold_min
                    let threshold_max
                    let dataset = chart.data.datasets[0];
                    let labels = chart.data.labels;
                    let sensorId = $(chart.canvas).attr("id").split("-")[0]
                    let itemResult
                    userData_raw.forEach((item, index) => {
                        if (item.sensorId == sensorId)
                            itemResult = item
                    })
                    let isTemperature = (sensorId) => { return itemResult.sensorType == 'temperature' }
                    let hasMin = (sensorId) => { return itemResult.min }
                    let hasMax = (sensorId) => { return itemResult.max }

                    // Set color of bars depeding of min and max
                    if (isTemperature(sensorId)) {
                        // threshold_min = hasMin(sensorId) ? hasMin(sensorId) : null
                        // threshold_max = hasMax(sensorId) ? hasMax(sensorId) : null

                        // if (threshold_min && threshold_min)
                        //     for (var i = 0; i < dataset.data.length; i++) {
                        //         if (dataset.data[i] < threshold_min || dataset.data[i] > threshold_max) {
                        //             // dataset.backgroundColor[i] = chartColors.red5;
                        //             // dataset.borderColor[i] = chartColors.red5;
                        //             dataset.pointBackgroundColor[i] = chartColors.red2;
                        //         }
                        //     }

                    } else { //if not temperature sensor
                        for (var i = 0; i < dataset.data.length; i++) {
                            if( isNaN(parseInt(dataset.data[i-1])) || isNaN(parseInt(dataset.data[i+1])) ) {
                                dataset.pointRadius[i] = 3
                            } else if (parseInt(dataset.data[i-1]) == 0 || parseInt(dataset.data[i+1]) == 0) {
                                dataset.pointRadius[i] = 3
                            } else {
                                dataset.pointRadius[i] = 0
                            }
                        }
                    }
                }
            }]
        });
        // console.log(chart.data)
        chartList.push(chart)
    } else {
        // [ ] TODO: make another plot when source is not from attribute.
    }

}

function appendInfoBox(args) {
    var component = `<div class="small-box ` + args.class + ` bg-info box-shadow-5">
        <div class="inner">
            <h3>` + args.message + `</h3>
            <p>` + args.title + `</p>
        </div>`

    if (args.icon) {
        component += `<div class="icon">` + args.icon + `</div>`
    }

    component += `</div>`

    $(".small-box-container").append(component)

}

function updateCurrentValue(sensorid, value, date = false) {

    // Check sensor type of this sensorid
    let sensorType = $("article.live-card-" + sensorid + "").attr('sensortype')

    // Update value
    let valueEl
    if (sensorType == 'door') {
        valueEl = $("article.live-card-" + sensorid + " span.doorState")
        // 1 => door closed, 0 => door open
        if (parseInt(value)) {
            valueEl.attr('state', 'closed')
        }
        else {
            valueEl.attr('state', 'open')
        }
    } else {
        valueEl = $("article.live-card-" + sensorid + " span.currentValue")
        valueEl.html(value)
    }

    // Update time
    if (date) {
        let timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge")
        timeEl.html(date)
    } else {
        let timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge")
        let currentTime = new Date()
        currentTime = currentTime.toLocaleString('en-US', {
            timeZone: 'Europe/Bucharest',
            timeStyle: "medium",
            dateStyle: "medium"
        })
        timeEl.html(currentTime)
    }
}

// Alerts
function saveSensorSettings(sensorid) {

    const min = $(".live-card-" + sensorid + " .settings-wrapper .input-min").val()
    const max = $(".live-card-" + sensorid + " .settings-wrapper .input-max").val()
    const xLat = $(".live-card-" + sensorid + " .settings-wrapper .input-lat").val()
    const yLong = $(".live-card-" + sensorid + " .settings-wrapper .input-long").val()
    const openTimer = $(".live-card-" + sensorid + " .settings-wrapper .input-open").val()
    const closedTimer = $(".live-card-" + sensorid + " .settings-wrapper .input-closed").val()

    let url = "/api/v3/save-settings?sensorId='" + sensorid + "' " +
        (() => { return min ? '&min=' + min : '' })() +
        (() => { return max ? '&max=' + max : '' })() +
        (() => { return openTimer ? '&openTimer=' + openTimer : '' })() +
        (() => { return closedTimer ? '&closedTimer=' + closedTimer : '' })() +
        (() => { return xLat ? '&xlat=' + xLat : '' })() +
        (() => { return yLong ? '&ylong=' + yLong : '' })()

    url = url.replace(' ', '')
    // console.log(url)

    $.ajax({
        url: url,
        type: 'GET'
    }).done((msg) => {

        alert("Sensor " + sensorid + " updated!")

        // Min alert
        if (min) {
            $(".live-card-" + sensorid + " .minAlertGauge").prop("value", min)
            $(".live-card-" + sensorid + " .minAlertGauge").html("min: " + min)
            // $(".live-card-" + sensorid + " input[name='minAlert']").prop("value", '')
            // $(".live-card-" + sensorid + " input[name='minAlert']").prop("placeholder", "Updated at " + min)
        }

        // Max alert
        if (max) {
            $(".live-card-" + sensorid + " .maxAlertGauge").prop("value", max)
            $(".live-card-" + sensorid + " .maxAlertGauge").html("max: " + max)
            // $(".live-card-" + sensorid + " input[name='maxAlert']").prop("value", '')
            // $(".live-card-" + sensorid + " input[name='maxAlert']").prop("placeholder", "Updated at " + max)
        }

        // xLat
        if (xLat) {
            // $(".live-card-" + sensorid + " input[name='xLat']").prop("value", '')
            // $(".live-card-" + sensorid + " input[name='xLat']").prop("placeholder", "Updated at " + xLat)
        }

        // yLong
        if (yLong) {
            // $(".live-card-" + sensorid + " input[name='yLong']").prop("value", '')
            // $(".live-card-" + sensorid + " input[name='yLong']").prop("placeholder", "Updated at " + yLong)
        }

    });
}

// Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client
var socketChannel = 'socketChannel'
socket.on(socketChannel, async (data) => {

    let currentValueBox = $("article[class*='live-card']")

    // OLD WAY - @depracated
    // Loop through each current value box
    currentValueBox.each((index, item) => {

        // get sensor id for each current value box 
        let sensorid = $(item).attr("sensorid")

        // get value of topic that contains this sensorid
        if (data.topic.includes(sensorid)) {
            updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1))
        }

    })

    // NEW TOPIC dataPub
    // dataPub {cId: "DAS001TCORA", value: 23.992979}
    let msg
    if (data.topic == 'dataPub') {
        msg = JSON.parse(data.message)
        updateCurrentValue(msg.cId, parseFloat(msg.value).toFixed(1))
    }

    if (data.topic == 'dataPub/power') {
        msg = JSON.parse(data.message)
        if (parseInt(msg.value)) {
            // add class no power to cId
            if (!$(".live-card-" + msg.cId).hasClass('no-power')) {
                $(".live-card-" + msg.cId).removeClass("alert-active").removeClass("alarm-active").addClass("no-power")
                let currentPower = $(".battery-info h3").html().split('/')
                currentPower[0] = Math.min(parseInt(currentPower[0]) + 1, currentPower[1])
                $(".battery-info h3").html(currentPower[0] + ' / ' + currentPower[1])
            }
        } else {
            if ($(".live-card-" + msg.cId).hasClass('no-power')) {
                let currentPower = $(".battery-info h3").html().split('/')
                currentPower[0] = Math.max(parseInt(currentPower[0]) - 1, 0)
                $(".battery-info h3").html(currentPower[0] + ' / ' + currentPower[1])
                $(".live-card-" + msg.cId).removeClass("no-power")
            }
        }
    }

})

// This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================
let mainLoader = async () => {
    // console.log(userData_raw)
    // let zoneData = JSON.parse('{{{zoneData}}}')

    // Get zoneId from URL
    const url = new URL(location.href)
    const zoneId = url.searchParams.get('zoneid')

    // Preprocess data to extract sensors from current zone only
    let sensorMetaRaw = []
    let sensorBuffer = [] // this buffer is use to prevent double inserting of sensors

    // console.log(userData_raw)
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
        // Get influx data for each sensor
        let sensorData = await getSensorData(sensor.sensorId, sensor.sensorType)
        // console.log(sensor.sensorId, sensorData)
        // if(sensor.sensorType == 'door') {
        //     sensorData.forEach((item,index)=>{
        //         console.log(index, item)
        //     })
        // }
        sensorDataRaw.push({ sensorMeta: sensor, sensorData })
    }

    // console.log(sensorDataRaw)

    let sensorsWithBattery = []

    for (const sensor of sensorDataRaw) {
        // Testing
        // if(sensor.sensorMeta.sensorId=='DAS001TCORA') {[
        //     sensor.sensorMeta.alerts = 3
        // ]}
        // if(sensor.sensorMeta.sensorId=='DAS003TCORA') {[
        //     sensor.sensorMeta.alerts = 1
        // ]}
        // if(sensor.sensorMeta.sensorId=='DAS005TCORA') {[
        //     sensor.sensorMeta.alerts = 2
        // ]}

        // Append the default sensor view (current value + graph) for each sensor
        $(".card-container").append(defaultSensorView(sensor));

        // Enable trigger events on defaultSensorView components after append
        triggerSensorView(sensor.sensorMeta.sensorId)

        // Plot data on graph based on sensorData attr
        plotData(sensor.sensorMeta.sensorId)

        // Sensors w/ battery functionality
        if (sensor.sensorMeta.battery == 1)
            sensorsWithBattery.push(sensor.sensorMeta.sensorId)
    }

    // Add info box
    let location3 = sensorDataRaw[0].sensorMeta.location3
    let location2 = sensorDataRaw[0].sensorMeta.location2

    appendInfoBox({
        title: location2,
        message: location3,
        icon: '<i class="fas fa-compass"></i>',
        class: ''
    })

    // Counter sensor with battery functionality
    // let sensorsWithBattery = userData_raw.filter((item,index)=>{
    //     if(item.battery == 1)
    //         return item
    // })

    // console.log(sensorsWithBattery)

    let alert = 0, alarm = 0, power = 0

    sensorDataRaw.forEach(item => {
        if (item.sensorMeta.alerts == 1)
            alert++
        if (item.sensorMeta.alerts == 2)
            alarm++
        if ([3, 4].includes(item.sensorMeta.alerts))
            power++
    })

    appendInfoBox({
        title: 'Warning alert',
        message: alert + ' / ' + sensorDataRaw.length,
        icon: '<i class="fas fa-exclamation"></i>',
        class: ''
    })

    appendInfoBox({
        title: 'Limits exeeded',
        message: alarm + ' / ' + sensorDataRaw.length,
        icon: '<i class="fas fa-exclamation-triangle"></i>',
        class: ''
    })

    // Display battery info box only if there are sensors with this functionality
    // console.log("sensorsWithBattery:",sensorsWithBattery)
    if (sensorsWithBattery.length)
        appendInfoBox({
            title: 'On battery',
            message: power + ' / ' + sensorDataRaw.length,
            icon: '<i class="fas fa-battery-quarter"></i>',
            class: 'battery-info'
        })

    // return sensorDataRaw
    return sensorMetaRaw

}

let influxQuery = async (query) => {
    let response = await fetch("/api/v3/query-influx?query=" + query)
    return response.json()
}

let initLiveData = async () => {
    let sensorsMetaRaw = await mainLoader()
    let sensorsList = getValuesFromObject('sensorId', sensorsMetaRaw)
    let query = "SELECT value FROM sensors WHERE sensorId =~ /" + sensorsList.join('|') + "/ group by sensorId order by time desc limit 1"
    let influxResult = await influxQuery(query)
    // console.log(influxResult)
    influxResult.forEach((item, index) => {
        let sensorId = item.sensorId
        let value = item.value
        let time = item.time
        let currentTime = new Date(time) // current time is +2h from Europe/Bucharest
        currentTime.setHours(currentTime.getHours() - 2)
        currentTime = currentTime.toLocaleString('en-US', {
            timeZone: 'Europe/Bucharest',
            timeStyle: "medium",
            dateStyle: "medium"
        })
        // console.log(currentTime)
        updateCurrentValue(sensorId, parseFloat(value).toFixed(1), currentTime)
    })
}

initLiveData()