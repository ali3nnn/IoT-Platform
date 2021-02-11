
// Imports
// ======================================================
// import { deprecationHandler } from 'moment'
const humanizeDuration = require("humanize-duration");
const _ = require('lodash');

import {
    getDistinctValuesFromObject,
    getValuesFromObject,
    downloadCSV,
    getKeyByValue,
    timeoutAsync,
    sendMessage,
    monthNames
} from './utils.js'

import {
    conveyor,
    currentValueView,
    graphView,
    doorLive,
    newItemLive,
    conveyorLive,
    conveyorLayout,
    conveyorItem,
    newItemsConveyorLayout,
    states_dict
} from './dashboard-components'
// ======================================================

// Check internet connection
// ======================================================
const checkOnlineStatus = async () => {
    try {
        const online = await fetch("/sound/alert.wav");
        return online.status >= 200 && online.status < 300; // either true or false
    } catch (err) {
        return false; // definitely offline
    }
};
// let internetConection = false
// setInterval(async () => {
//     const result = await checkOnlineStatus();
//     // const statusDisplay = document.getElementById("status");
//     let statusDisplay = result ? "Online" : "OFFline";
//     if(statusDisplay=='OFFline') {
//         alert("No internet connection")
//         internetConection = true
//     } else {
//         if(internetConection) {
//             alert("Internet connection established")
//         }
//     }
// }, 30*1000);
// ======================================================

// Sounds
// ======================================================
// FIREFOX: menu > preferinte > securitate > redare automata > permite
// CHROME: menu > setari > securitate > setarile site-ului > setari continut > audio > permite 

let alertSound = new Audio('/sound/alert.wav')
alertSound.loop = true

function playAlert() {
    alertSound.play()
}

function stopAlert() {
    alertSound.pause()
    alertSound.currentTime = 0
}

// let confirmationSound = new Audio('/sound/confirmation-sound.wav')
let confirmationSound = new Audio('/sound/switch.wav')
confirmationSound.loop = false

function playButtonSound() {
    confirmationSound.play()
    timeoutAsync(1000, stopButtonSound)
}

function stopButtonSound() {
    confirmationSound.pause()
    confirmationSound.currentTime = 0
}

window.alertSound = alertSound
window.confirmationSound = confirmationSound
window.playButtonSound = playButtonSound
// ======================================================

// Fetch sensor data
// ======================================================
let getSensorData = async (id, type) => {
    let response = await fetch("/api/v3/get-sensor-data?id=" + id + "&type=" + type)
    return response.json()
}
// ======================================================

// ======================================================
function updateDataForChart(sensor) {
    let sensorData = JSON.stringify(sensor.sensorData)
    $("article.graph-" + sensor.sensorMeta.sensorId).attr("sensorData", sensorData)
}
// ======================================================

// Add different components
// ======================================================
function defaultSensorView(sensor) {

    // console.log(sensor)
    // window.sensor = sensor

    // sensorId = String(sensorId)
    let sensorData = JSON.stringify(sensor.sensorData)

    // console.log(sensor.sensorMeta.sensorId,sensor.sensorMeta.battery)

    // Sensor state 0/1/2/3,4
    let alertClass2 = ''
    if (sensor.sensorMeta.alerts == 1) {
        alertClass2 = 'alert-active'
    }
    else if (sensor.sensorMeta.alerts == 2) {
        alertClass2 = 'alarm-active'
    }
    else if ([3, 4].includes(sensor.sensorMeta.alerts) && sensor.sensorMeta.battery == 1)
        alertClass2 = 'no-power'

    // stack the components
    if (['counter'].includes(sensor.sensorMeta.sensorType)) {
        return newItemLive(sensor) + graphView(sensor, sensorData)
    } else if (['door'].includes(sensor.sensorMeta.sensorType)) {
        return doorLive(alertClass2, sensor) + graphView(sensor, sensorData)
    } else if (['temperature'].includes(sensor.sensorMeta.sensorType)) {
        return currentValueView(alertClass2, sensor) + graphView(sensor, sensorData)
    } else if (['conveyor'].includes(sensor.sensorMeta.sensorType)) {
        // $("body").addClass("conveyor-main-dashboard")
        // console.log(sensor.sensorMeta.sensorId, sensor.sensorMeta.status)
        return conveyor(sensor, sensorData)
    }

}
// ======================================================

// Triggers [activate triggers when sensor are loading]
// ======================================================
function triggerSensorView(sensorId, sensor) {

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

    // Edit sensor name
    $('article[sensorid="' + sensorId + '"] .card-title .edit-sensor-name').on('click', function (event) {
        let name = prompt('Type a new name for ' + sensorId, $('article[sensorid="' + sensorId + '"] .card-title span').text());
        if (name && sensorId) {
            const params = new URLSearchParams({ name, sensorId });
            let url = "/api/v3/set-sensor-name?" + params.toString()
            // console.log(url)
            $.ajax({
                url: url,
                type: 'GET'
            }).done((result) => {
                // console.log(result.msg)
                if (result.msg == "Update performed") {
                    $('article[sensorid="' + sensorId + '"] .card-title span').html(name)
                }
                // let res = result.json()
                // console.log(res.msg)
            })
        }
    });

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

    // Event listener for attribute seconds on conveyor usageTotal and usageTotal
    let usageToday = document.querySelector('.controller-' + sensorId + ' .usage-today');
    let usageTotal = document.querySelector('.controller-' + sensorId + ' .usage-total');
    let observer
    if (usageTotal && usageToday) {
        observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == "attributes" && mutation.attributeName == "seconds") {

                    // TODAY
                    let secondsToday = usageToday.getAttribute(mutation.attributeName)

                    let resultToday = humanizeDuration(secondsToday * 1000, {
                        language: "en",
                        spacer: "",
                        // units: ["h", "m", "s"],
                        units: ["h", "m"],
                        round: true
                    })

                    // console.log("resultToday", resultToday)

                    resultToday = resultToday.replaceAll("hours", "h")
                    resultToday = resultToday.replaceAll("hour", "h")
                    resultToday = resultToday.replaceAll("minutes", "m")
                    resultToday = resultToday.replaceAll("minute", "m")
                    resultToday = resultToday.replaceAll("seconds", "s")
                    resultToday = resultToday.replaceAll("second", "s")
                    resultToday = resultToday.replaceAll(",", "")

                    // console.log("resultToday",resultToday)
                    $('.conveyor-info-message', usageToday).html(resultToday)

                    // TOTAL
                    let secondsTotal = usageTotal.getAttribute(mutation.attributeName)

                    let resultTotal = humanizeDuration(secondsTotal * 1000, {
                        language: "en",
                        spacer: "",
                        // units: ["h", "m", "s"],
                        units: ["h", "m"],
                        round: true
                    })

                    resultTotal = resultTotal.replaceAll("hours", "h")
                    resultTotal = resultTotal.replaceAll("hour", "h")
                    resultTotal = resultTotal.replaceAll("minutes", "m")
                    resultTotal = resultTotal.replaceAll("minute", "m")
                    resultTotal = resultTotal.replaceAll("seconds", "s")
                    resultTotal = resultTotal.replaceAll("second", "s")
                    resultTotal = resultTotal.replaceAll(",", "")


                    $('.conveyor-info-message', usageTotal).html(resultTotal)
                }
            });
        });

        observer.observe(usageToday, {
            attributes: true //configure it to listen to attribute changes
        });

        observer.observe(usageTotal, {
            attributes: true //configure it to listen to attribute changes
        });
    }

    // Switch conveyor
    $('.controller-' + sensorId + ' .cb-value').on('click', function (event, isclick = 'active') {

        // UI confirmation sound
        playButtonSound()

        var mainParent = $(this).parent('.state-btn-inner');
        // console.log(isclick)

        // if button is RED - conveyor stop
        if ($(mainParent).hasClass('active') == false) {

            $(mainParent).addClass('active'); // make button green

            $('.conveyor-layout-inner > div.sensor-item').draggable("enable")

            if (isclick == 'active') { // if button is pressed directly

                // send 1 to mqtt
                sendMessage("socketChannel", {
                    topic: 'anygo/conveyor',
                    message: JSON.stringify({ username, sensorId, "status": 1 })
                })

                // do not let conveyor run with gate open
                // for (let item of userData_raw) {

                    // // check if gate exist and is open
                    // if (item.sensorType == 'gate' && item.status == 'open') {
                    //     // do not start

                    //     alert("Atentie! Poarta deschisa! Inchideti poarta inainte de pornire!")
                    // } else {
                    //     // start

                    //     // send 1 to mqtt
                    //     sendMessage("socketChannel", {
                    //         topic: 'anygo/conveyor',
                    //         message: JSON.stringify({ username, sensorId, "status": 1 })
                    //     })

                        // set info message
                        $('.controller-' + sensorId + ' .state-button .conveyor-info-message').html("RUN")

                    //     // update seconds
                    //     conveyorUsage(sensorId)
                    // }
                // }
            }

            // if button is GREEN - conveyor run
        } else {
            $(mainParent).removeClass('active'); // make button red

            $('.conveyor-layout-inner > div.sensor-item').draggable("disable")

            if (isclick == 'active') { // if button is pressed directly

                // send 0 to mqtt
                sendMessage("socketChannel", {
                    topic: 'anygo/conveyor',
                    message: JSON.stringify({ username, sensorId, "status": 0 })
                })
            }

            // set info msg
            $('.controller-' + sensorId + ' .state-button .conveyor-info-message').html("STOP")

            // stop update seconds
            clearInterval(window.usageInterval);
        }

    })

    // Make sensor draggable
    $(`.draggable[sensor='` + sensorId + `']`).draggable({
        grid: [5, 5],
        create: function (event, ui) {

            $(this).css('top', sensor.sensorMeta.y)
            $(this).css('left', sensor.sensorMeta.x)

        },
        stop: function (event, ui) {
            const sensorId = $(this).attr('sensor')
            // Update position of sensor on map
            fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(result => {
                console.log("position saved", sensorId, ui.position)
            })
        },
    });


    // Append conveyor items to map
    $(".new-items-conveyor .sensor-item[sensor='" + sensorId + "']").on('click', () => {
        // Clone & append
        let sensorCloned = $(".new-items-conveyor .sensor-item[sensor=" + sensorId + "]").clone()
        $(".conveyor-layout-inner").append(sensorCloned)
        $(".new-items-conveyor .sensor-item[sensor=" + sensorId + "]").remove()
        $(".conveyor-layout-inner .sensor-item[sensor=" + sensorId + "]").addClass("draggable")
        $(`.draggable[sensor='` + sensorId + `']`).draggable({
            grid: [5, 5],
            create: function (event, ui) {

                $(this).css('top', sensor.sensorMeta.y)
                $(this).css('left', sensor.sensorMeta.x)

            },
            stop: function (event, ui) {
                const sensorId = $(this).attr('sensor')
                // Update position of sensor on map
                fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(result => {
                    console.log("position saved", sensorId, ui.position)
                })
            },
        });
    })
}
// ======================================================

// [ ] TODO: trebuie rezolvat cu timpul de folosire a conveiorului
//           sa se updateze odata la un minut in mysql, dar nu din front-end

// functia updateaza attributul seconds
let conveyorUsage = (sensorId) => {

    // Start counter
    let usageToday = $('.controller-' + sensorId + ' .usage-today').attr("seconds")
    let usageTotal = $('.controller-' + sensorId + ' .usage-total').attr("seconds")

    usageToday = parseInt(usageToday)
    usageTotal = parseInt(usageTotal)

    // console.log(usageToday, usageTotal)

    let makeUsage = () => {
        usageToday += 1
        usageTotal += 1

        $('.controller-' + sensorId + ' .usage-today').attr("seconds", usageToday)
        $('.controller-' + sensorId + ' .usage-total').attr("seconds", usageTotal)

        // console.log("usageToday:", humanizeDuration(usageToday * 1000, {
        //     language: "en",
        //     spacer: "",
        //     units: ["h", "m", "s"],
        //     // units: ["h", "m"],
        //     round: true
        // }))
    }

    window.usageInterval = setInterval(makeUsage, 1 * 1000); // each 1 second usage is increased 
}

let reloadDataCustomCalendar = async (start, end, sensorId) => {
    // [*] TODO: Get data for new date
    // [*] TODO: Reload the chart with new data
    getSensorDataCustomInterval(sensorId, start, end)
}

// get and plot data by a specific interval
// ======================================================
let getSensorDataCustomInterval = async (sensor, start, end) => {

    if (!$("body").hasClass("calendar-active")) {
        $("body").addClass("calendar-active")
    }

    // console.log("calendar-active for ",sensor)
    $("article.graph-" + sensor).addClass("calendar-active")

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
// ======================================================


// Create chart
// ======================================================
// Global chart list
let chartList = []

function plotData(sensorId, source = 'attr') {

    // [*] TODO: skip charts witch class .calendar-active
    // console.log($("article.graph-" + sensorId)[0].className)
    if ($("article.graph-" + sensorId).hasClass("calendar-active")) {
        return
    }

    if ($(`article.graph-` + sensorId).length == 0) {
        return
    }

    // [*] TODO: check source attr
    // [*] TODO: get data
    // [ ] TODO: display data
    if (source == 'attr') { // this source should run only when page is loaded
        // Get Data
        let rawData = $(`article.graph-` + sensorId).attr("sensorData")
        let sensorType = $(`article.graph-` + sensorId).attr("sensorType")
        // console.log(rawData)
        let sensorData
        // if(rawData != undefined)
        sensorData = JSON.parse(rawData)
        // console.log(sensorData)
        // Add Canvas for chart
        $(`article.graph-` + sensorId + ` .card-body a.spinner`).remove()
        if ($(`article.graph-` + sensorId + ` .card-body canvas#` + sensorId + `-graph`)) {
            $(`article.graph-` + sensorId + ` .card-body canvas#` + sensorId + `-graph`).remove()
        }
        $(`article.graph-` + sensorId + ` .card-body`).append(`<canvas id="` + sensorId + `-graph"></canvas>`)
        // Plot w/ Chart.js
        let canvas = $(`canvas#` + sensorId + `-graph`)[0].getContext("2d");

        let labels = getValuesFromObject('time', sensorData)
        let data = getValuesFromObject('value', sensorData)

        // General options of timeseries chart
        let options = {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            drawBorder: false,
            tooltips: {
                // Disable the on-canvas tooltip
                enabled: false,
                mode: 'index',
                intersect: false,

                custom: function (tooltipModel) {
                    // Tooltip Element
                    var tooltipEl = document.getElementById('chartjs-tooltip');
                    let sensorType = chart.titleBlock.chart.config.data.datasets[0].label
                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = '<table class="custom_tooltip ' + sensorType + '_tooltip"></table>';
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }

                    // Set Text
                    if (tooltipModel.body) {
                        var titleLines = tooltipModel.title || [];
                        titleLines = titleLines.map(title => title.replace("T", " ").split(".")[0])
                        var bodyLines = tooltipModel.body.map(getBody);

                        // Special text for DOOR type
                        if (sensorType == 'door') {
                            let state = bodyLines[0][0].split(":")[1]
                            if (state == 1) {
                                bodyLines[0][0] = "closed"
                            } else {
                                bodyLines[0][0] = "open"
                            }
                        }

                        var innerHtml = '<thead>';

                        titleLines.forEach(function (title) {
                            innerHtml += '<tr><th>' + title + '</th></tr>';
                        });
                        innerHtml += '</thead><tbody>';

                        bodyLines.forEach(function (body, i) {
                            var colors = tooltipModel.labelColors[i];
                            var style = 'background:' + colors.backgroundColor;
                            // var style = 'background: white';
                            style += '; border-color:' + colors.borderColor;
                            style += '; border-width: 2px';
                            style += '; color: white';
                            var span = '<span style="' + style + '"></span>';
                            innerHtml += '<tr><td>' + span + body + '</td></tr>';
                        });
                        innerHtml += '</tbody>';

                        var tableRoot = tooltipEl.querySelector('table');
                        tableRoot.innerHTML = innerHtml;
                    }

                    // `this` will be the overall tooltip
                    var position = this._chart.canvas.getBoundingClientRect();

                    // console.log(position.left, window.pageXOffset, tooltipModel.caretX, this._chart.width)

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = 'absolute';

                    // Switch side of tooltip
                    if (this._chart.width - tooltipModel.caretX - 20 > tooltipModel.width) {
                        tooltipEl.style.left = 20 + position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    }
                    else {
                        tooltipEl.style.left = -tooltipModel.width + position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    }
                    // tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.height + 'px';
                    tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                    tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                    tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                    tooltipEl.style.pointerEvents = 'none';
                    tooltipEl.style.transition = '0.2s';
                }
            },
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
            return value ? Math.round(value * 10) / 10 : value
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
                pointRadius.push(2)
            })
        else {
            backgroundColor = chartColors.blue2
            pointBackgroundColor = chartColors.blue
            borderColor = chartColors.blue
        }
        // end build arrays of colors

        // Graph view config general
        let datasetConfig = {
            backgroundColor,
            borderColor,
            pointBorderColor: '#343a40',
            pointBackgroundColor,
            pointHoverBackgroundColor: "#ffc107",
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBorderWidth: 1,
            borderWidth: 1,
            lineTension: 0.2
        }

        // console.log(pointRadius)

        // Graph view config for door
        if (sensorType == 'door') {
            datasetConfig.lineTension = 0
            datasetConfig.pointRadius = pointRadius
            // datasetConfig.pointHoverRadius = pointRadius.map(item => item + 2)
            datasetConfig.pointBorderWidth = 1
            datasetConfig.borderWidth = 1
            options.scales.yAxes[0].ticks['max'] = 1
            options.scales.yAxes[0].ticks['min'] = 0
        }

        // Add graph config
        let type, datasets
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
        // }
        // end TYPE of CHART based on sensorType

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
            draw: function (ease) {
                Chart.controllers.line.prototype.draw.call(this, ease);

                if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                    var activePoint = this.chart.tooltip._active[0],
                        ctx = this.chart.ctx,
                        x = activePoint.tooltipPosition().x,
                        y = activePoint.tooltipPosition().y,
                        topY = activePoint.tooltipPosition().y,
                        bottomY = this.chart.scales['y-axis-0'].bottom;

                    // console.log(x, y, topY, bottomY)

                    // draw line
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, 32);
                    ctx.lineTo(x, bottomY);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = datasetConfig.pointHoverBackgroundColor;
                    ctx.stroke();
                    ctx.restore();

                    // draw Circle
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, topY, datasetConfig.pointHoverRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = datasetConfig.pointHoverBackgroundColor;
                    ctx.fill();
                    ctx.stroke();

                }
            }
        });

        // console.log(labels)
        let chart = new Chart(canvas, {
            // type,
            type: 'LineWithLine',
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
                        // for (var i = 0; i < dataset.data.length; i++) {
                        //     if (isNaN(parseInt(dataset.data[i - 1])) || isNaN(parseInt(dataset.data[i + 1]))) {
                        //         dataset.pointRadius[i] = 3
                        //     } else if (parseInt(dataset.data[i - 1]) == 0 || parseInt(dataset.data[i + 1]) == 0) {
                        //         dataset.pointRadius[i] = 3
                        //     } else {
                        //         dataset.pointRadius[i] = 0
                        //     }
                        // }
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
// ======================================================

// Utility for info box
// ======================================================
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

    let childs = $(".small-box-container").children().length;
    $(".small-box-container").removeClass(function (index, className) {
        let arrayOfClasses = className.split(" ")
        let arrayOfClasses2 = arrayOfClasses.filter((item, index) => {
            return item.includes('length')
        })
        return arrayOfClasses2.join(' ')
    });
    $(".small-box-container").addClass("small-box-length-" + String(childs))

}
// ======================================================

// Update Live Card
// ======================================================
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
    let timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge .time")
    if (date) {
        // Live animation
        let currentDate = new Date()
        let oldDate = new Date(date)
        let diff = (currentDate.getTime() - oldDate.getTime()) / 1000
        if (diff > 3600)
            timeEl.siblings('.pulse').addClass("not-live")
        else
            timeEl.siblings('.pulse').removeClass("not-live")
        // Update date
        timeEl.html(date)
    } else {
        let currentTime = new Date()
        currentTime = currentTime.toLocaleString('en-US', {
            timeZone: 'Europe/Bucharest',
            timeStyle: "medium",
            dateStyle: "medium"
        })
        timeEl.siblings('.pulse').removeClass("not-live")
        timeEl.html(currentTime)
    }
}
// ======================================================

// Alerts
// ======================================================
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
// ======================================================

// Send keep alive each minute
// ======================================================
setInterval(function () {
    sendMessage("socketChannel", {
        topic: 'keepalive',
        message: JSON.stringify({ "user": username, "status2": 'keepalive' })
    })
}, 10 * 1000)
// ======================================================

// Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client
// ======================================================
// ======================================================
let socketChannel = 'socketChannel'
let currentValueBox = $("article[class*='live-card']")

// TIGANEALA
// =========================
// if(username.toLowerCase()=="pharmafarm") {
//     let alive = false
//     setInterval(function(){
//         if(alive==false) {
//             sendMessage("socketChannel", {
//                 topic: 'anygo/conveyor',
//                 message: JSON.stringify({"user":username, "sensorId":"PHARMA0001CONV", "status": "0", "safety":"1" })
//             })
//             console.log("safety message send")
//             $(".state-btn-inner > input").attr("disabled",true)
//         } else {
//             $(".state-btn-inner > input").attr("disabled",false)
//             if($('.client-username-pharmaFarm .state-button .conveyor-info-message').html() == "E-STOP") {
//                 $('.client-username-pharmaFarm .state-button .conveyor-info-message').html("READY TO RUN")
//             }

//         }
//         alive = false
//     },8*1000)
// }
// =========================

socket.on(socketChannel, async (data) => {

    // Temperature - OLD @depracated
    // ======================================================
    currentValueBox.each((index, item) => {

        // get sensor id for each current value box 
        let sensorid = $(item).attr("sensorid")

        // get value of topic that contains this sensorid
        if (data.topic.includes(sensorid)) {
            updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1))
        }

    })
    // ======================================================

    // Temperature
    // ======================================================
    let msg, value
    if (data.topic == 'dataPub') {
        msg = JSON.parse(data.message)
        value = parseFloat(msg.value).toFixed(1)
        if (value > -200)
            updateCurrentValue(msg.cId, value)
        else
            console.warn("Device", msg.cId, "send weird value:", value)
    }
    // ======================================================

    // Power
    // ======================================================
    if (data.topic == 'dataPub/power') {
        msg = JSON.parse(data.message)
        if (parseInt(msg.value)) {
            // add class no power to cId
            if (!$(".live-card-" + msg.cId).hasClass('no-power')) {
                $(".live-card-" + msg.cId + "[battery='1']").removeClass("alert-active").removeClass("alarm-active").addClass("no-power")
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
    // ======================================================

    // Conveyor
    // ======================================================
    if (data.topic == 'anygo/conveyor') {

        msg = JSON.parse(data.message)
        // msg = `{"username":"demo",sensorId":"TEST0001CONV0003SEG","status":"run"}`

        if ('status' in msg && 'sensorId' in msg) {

            // Start/stop conveyor - from mqtt directly not from button
            if ([1, 0, '1', '0'].includes(msg['status'])) {
                let isclick
                if ($('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active") && msg["status"] == 0) {
                    $('.controller-' + msg["sensorId"] + ' .cb-value').trigger('click', isclick = 'passive')
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("STOP")
                    $('.conveyor-layout-inner > div.sensor-item').draggable("disable")
                } else if ($('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active") == false && msg["status"] == 1) {
                    $('.controller-' + msg["sensorId"] + ' .cb-value').trigger('click', isclick = 'passive')
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("RUN")
                    $('.conveyor-layout-inner > div.sensor-item').draggable("enable")
                } else {
                    // console.log(msg["status"], $('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active"))
                }
            }

            // Segment - Gate - Safety
            if (['run', 'energy', 'acc', 'error', 'open', 'closed', 'close', 'press', 'released', 'stop'].includes(msg['status'])) {
                let sensorId = msg['sensorId']

                // update status
                let status = msg['status']
                $(".sensor-item[sensor='" + sensorId + "']").attr('state', status)
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext state").html("Status: " + states_dict[status])

                // update usage
                let timeEl = $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").html()
                // let len = timeEl.length

                let oldTime = timeEl.slice(6)
                let oldTimeObj = new Date()
                oldTimeObj.setHours(parseInt(oldTime.slice(0, 2)))
                oldTimeObj.setMinutes(parseInt(oldTime.slice(3)))
                // [ ] TODO: setDate and setDay when try to sync with status time older than current day
                // if (len > 11)
                //     oldTimeObj.setDate()

                // let nowObj = new Date()
                // let diffSec = parseInt((nowObj - oldTimeObj)/1000)
                // let diffM = parseInt(diffSec / 60)
                // let diffH = parseInt(diffM / 60)
                // let diffRest = parseInt(diffM % 60)

                // let incrementH = diffH
                // let incrementM = diffRest

                // let usageInitialH = $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext usage").html().replace("Usage total: ","").split(' ')[0].replace("h","")
                // let usageInitialM = $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext usage").html().replace("Usage total: ","").split(' ')[0].replace("m","")
                // let usageFinal = "Usage total: "+(usageInitialH + incrementH)+"h "+(usageInitialM + incrementM)+"m"
                // $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext usage").html(usageFinal)

                // update time
                let now = new Date()
                now = now.toLocaleString().slice(12, 17)
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").html("From: " + now)
                let date = new Date()
                let day = date.toLocaleString().slice(0, 2)
                let month = date.toLocaleString().slice(3, 5)
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").attr('title', date + " " + monthNames[parseInt(month - 1)].slice(0, 3))

            }

            // Conveyor Safety Released
            if ("safety" in msg) {
                if (['1', 1].includes(msg['safety'])) {
                    // show info msg
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("E-STOP")
                    // disable button
                    $(".state-btn-inner > input").attr("disabled", true)
                    // play alert sound
                    playAlert()
                    // info title
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').attr("title", "emergency button is pressed")
                } else if (['0', 0].includes(msg['safety'])) {
                    // show info msg
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("READY TO RUN")
                    // enable button
                    $(".state-btn-inner > input").attr("disabled", false)
                    // title info
                    $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').attr("title", "emergency button is released")
                    // stop alert sound
                    stopAlert()
                }
            }

        }

    }
    // ======================================================


})
// ======================================================
// ======================================================

// This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================
let sensorMetaRaw // init variable globally
let mainLoader = async () => {

    // Get zoneId from URL
    // =============================================
    const url = new URL(location.href)
    const zoneId = url.searchParams.get('zoneid')
    // =============================================

    // Preprocess data to extract sensors from current zone only
    // =============================================
    sensorMetaRaw = []
    let sensorBuffer = [] // this buffer is use to prevent double inserting of sensors
    userData_raw.forEach(sensor => {
        // Iterate through each result and save unique sensorId rows
        if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
            sensor.zoneId == zoneId ? sensorMetaRaw.push(sensor) : null
            sensorBuffer.push(sensor.sensorId)
        }
    })
    // =============================================

    // Get data from influx for each sensor
    // =============================================
    let sensorDataRaw = []
    let sensorsWithBattery = []
    let sensorCounter = 0

    for (const sensor of sensorMetaRaw) {

        // Get influx data for each sensor
        // --------------------------------------------------
        let sensorData = await getSensorData(sensor.sensorId, sensor.sensorType)
        sensorDataRaw.push({ sensorMeta: sensor, sensorData })
        // --------------------------------------------------

        // Add Conveyor Class + Append Conveyor Layout Map
        // --------------------------------------------------
        if (['gate', 'safety', 'segment', 'conveyor'].includes(sensor.sensorType)) {
            // console.log($("body").hasClass("conveyor-main-dashboard"), sensor.sensorType)
            if (!$("body").hasClass("conveyor-main-dashboard")) { // do this only once
                $("body").addClass("conveyor-main-dashboard")
                $(".conveyor-main-dashboard .card-container").append(conveyorLayout(sensor))
            }
        }
        // --------------------------------------------------

        // Append Conveyor Items + Dashboard
        // --------------------------------------------------
        if (['gate', 'safety', 'segment'].includes(sensor.sensorType)) {
            // Append conveyor items on map created above
            if (sensor.x && sensor.y)
                $(".conveyor-main-dashboard .conveyor-layout .conveyor-layout-inner").append(conveyorItem(sensor, 'draggable', { name: sensor.sensorName }))
            else
                $(".conveyor-main-dashboard .conveyor-layout .new-items-conveyor").append(conveyorItem(sensor, '', { name: sensor.sensorName }))
        } else if (['conveyor'].includes(sensor.sensorType)) {
            // Prepend conveyor controller
            $(".card-container").prepend(defaultSensorView(sensorDataRaw[sensorDataRaw.length - 1]));
        } else {
            // Append the default sensor view (current value + graph) for each sensor
            $(".card-container").append(defaultSensorView(sensorDataRaw[sensorDataRaw.length - 1]));
        }
        if (sensor.sensorType == 'conveyor' && sensor.status == 1)
            conveyorUsage(sensor.sensorId)
        // --------------------------------------------------


        // Enable trigger events on defaultSensorView components after append
        // --------------------------------------------------
        triggerSensorView(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId, sensorDataRaw[sensorDataRaw.length - 1])
        // --------------------------------------------------

        // Plot data on graph based on sensorData attr
        // --------------------------------------------------
        plotData(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId)
        // --------------------------------------------------

        // Sensors w/ battery functionality
        // --------------------------------------------------
        if (sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.battery == 1)
            sensorsWithBattery.push(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId)

        // console.log(sensorMetaRaw)

        if (sensorCounter == 0) { // Add info box - location

            // Add info box BUT NOT on conveyor dashboard
            // =============================================
            if (['gate', 'safety', 'segment', 'conveyor'].includes(sensor.sensorType) == false) {

                let sensorsCounter = sensorMetaRaw.length

                appendInfoBox({
                    title: sensorDataRaw[0].sensorMeta.location2,
                    message: sensorDataRaw[0].sensorMeta.location3,
                    icon: '<i class="fas fa-compass"></i>',
                    class: ''
                })

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
                    message: alert + ' / ' + sensorsCounter,
                    icon: '<i class="fas fa-bell"></i>',
                    class: ''
                })

                appendInfoBox({
                    title: 'Limits exeeded',
                    message: alarm + ' / ' + sensorsCounter,
                    icon: '<i class="fas fa-exclamation-triangle"></i>',
                    class: ''
                })

                // Display battery info box only if there are sensors with this functionality
                // console.log("sensorsWithBattery:",sensorsWithBattery)
                if (sensorsWithBattery.length)
                    appendInfoBox({
                        title: 'On battery',
                        message: power + ' / ' + sensorsCounter,
                        icon: '<i class="fas fa-battery-quarter"></i>',
                        class: 'battery-info'
                    })
            }
            // =============================================

            sensorCounter++
        }
        // --------------------------------------------------

    }
    // =============================================
    // END Get data from influx for each sensor


    // Conveyor dashboard - remove new item bar if no sensor there
    // =============================================
    let newItems = $(".conveyor-main-dashboard .conveyor-layout .new-items-conveyor").children().length
    if (newItems == 0) {
        $(".conveyor-main-dashboard .new-items-conveyor").remove()
        let newItemsAppended = $(".conveyor-main-dashboard .conveyor-layout").children().length
        if (newItemsAppended == 0) {
            $(".conveyor-main-dashboard .conveyor-layout").remove()
        }
    }
    if ($('.state-btn-inner').hasClass("active") == false)
        $('.conveyor-layout-inner > div.sensor-item').draggable("disable")
    // =============================================


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
    // console.log("sensorsMetaRaw", sensorsMetaRaw)
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

// Update charts continously
let liveChart = async () => {

    let sensorDataRaw = []

    for (const sensor of sensorMetaRaw) {
        // Get influx data for each sensor
        let sensorData = await getSensorData(sensor.sensorId, sensor.sensorType)
        sensorDataRaw.push({ sensorMeta: sensor, sensorData })
    }

    for (const sensor of sensorDataRaw) {
        // Update json in element attribute before plotting
        updateDataForChart(sensor)
        // Plot data on graph based on sensorData attr
        plotData(sensor.sensorMeta.sensorId)
        // Log
        // console.log(sensor.sensorMeta.sensorId)
    }
}

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

let run = async () => {
    while (1) {
        liveChart();
        await delay(60 * 1000); // charts are updating one time per minute
    }
}

run()

// switch-context button listener
const goToMap = function () {
    let url = window.location.origin + '/map' + window.location.search.replace("zone", "")
    window.location.replace(url)
}

$(".switch-context").on('click', () => {
    goToMap()
})