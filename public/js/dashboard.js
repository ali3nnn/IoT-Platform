var time = new Date()
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var dayName = days[time.getDay()];

// Global Variables
// var username = $(".navbar-brand b")[0].innerText.slice(0, $(".navbar-brand b")[0].innerText.length - 1)
let countyName = $(".county-detail h3").html()
let json = ''
var oldUpdatedTime = ''
var counterOld = ['', '']

// console.log("vars", new Date() - time)

// Set the minimum height of the sidebar
// let timeout = (ms,f) => {
//     let sleep =  new Promise(resolve => setTimeout(function(){
//         f()
//         // return resolve
//     }, ms))
// }

// Make Socket.io connection
// var socket = io.connect("https://anysensor.dasstec.ro/")

// socket.on('message', function (data) {

// console.log(data)

// $(".messages.hideMe").remove()

// $("#main notification").append(`<div class="messages hideMe">
//     <div class="alert alert-success mt-3 mb-0" role="alert">
//         <background></background>
//         `+data.send+`
//     </div>
// </div>`)

// })
// end WebSocket.io

function addSmallBox(label, value, fontAwesome = false) {
    var component = `<div class="small-box bg-info county-detail box-shadow-5">
        <div class="inner">
            <h3>` + value + `</h3>
            <p>` + label + `</p>
        </div>`

    if (fontAwesome) {
        component += `<div class="icon"><i class="` + fontAwesome + `"></i></div>`
    }

    component += `</div>`

    $(".small-box-container").append(component)


}

function addCssForSmallBox() {
    var countSmallBoxes = $(".small-box-container .small-box").length
    $(".small-box-container").addClass("small-box-length-" + countSmallBoxes + "")
    // console.log("countSmallBoxes:", countSmallBoxes)
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// used to create the gauges
function currentValueSvgGauge(element, currentValue = NaN, updatedAt = false, min = -20, max = 70) {

    var isCounter = false
    // element.split('-')[1] == 'c' ? isCounter = true : isCounter = false
    // console.log(element, isCounter)

    if (isCounter) {
        $('.' + element + '-newItem-spinner').remove()
    } else {
        $('.' + element + '-currentValue-spinner').remove()
    }


    // console.log("currentValueSvgGauge", currentValue)

    if (isNaN(currentValue)) {
        if (isCounter) {
            $("." + element + "-newItem").prepend("No value recorded today")
            $("." + element + "-newItem").attr("no-value")
            $(".live-card-" + element + " .card-settings-button").addClass("hidden-element")
            return [NaN, NaN]
        } else {
            // here can be improved by showing the latest read value
            // and showing the time when last value was read
            // and maybe a small info that the info is not very recent
            $(".live-card-" + element + " .card-settings-button").addClass("hidden-element")
            $("#" + element + "-gauge").parent().prepend("No value recorded today")
            $("#" + element + "-gauge").parent().attr("no-value", 'true')
            return [NaN, NaN]
        }

    } else {

        // console.log(element + '-gauge')

        if (isCounter) {
            // pulse effect already appended
        } else {
            // console.log("else gauge")
            var gauge = Gauge(
                document.getElementById(element + '-gauge'), {
                    min: min,
                    max: max,
                    dialStartAngle: 180,
                    dialEndAngle: 0,
                    value: currentValue,
                    label: function (value) {
                        return (Math.round(value * 10) / 10);
                    },
                    viewBox: "0 0 100 57",
                    // valueDialClass: "valueDial",
                    // valueClass: "valueText",
                    // dialClass: "dial",
                    // gaugeClass: "gauge",
                    showValue: true,
                    color: function (value) {
                        if (value < 20) {
                            return "#5ee432";
                        } else if (value < 40) {
                            return "#fffa50";
                        } else if (value < 60) {
                            return "#f7aa38";
                        } else if (value == 0) {
                            return "gray";
                        } else {
                            return "#ef4655";
                        }
                    }
                }
            );
        }

        // console.log(updatedAt)

        if (updatedAt) {
            // current date
            var date = new Date()

            // updatedAt is at best 1 hour behind current date 
            var hour = date.getHours()

            // dateLatestValue add two hours to updatedAt
            var dateLatestValue = updatedAt.split("T")[0].split("-")
            var hourLatestValue = updatedAt.split("T")[1].split(":").slice(0, 2)

            // -1 to match with hour from graph
            // var hourLatestValue = dateLatestValue.getHours() - 1

            // console.log(element)
            // console.log("date",date)
            // console.log("dateLatestValue",dateLatestValue,hourLatestValue)

            var influxTime = new Date(dateLatestValue[0], dateLatestValue[1] - 1, dateLatestValue[2], hourLatestValue[0], hourLatestValue[1])
            // console.log(influxTime)
            influxTime = influxTime.addHours(1)
            influxTime = String(influxTime).split(" ").slice(1, 5)
            updatedTime = influxTime[0] + " " + influxTime[1] + " " + influxTime[2] + " " + influxTime[3]
            // console.log(influxTime)
            // var dif = date - dateLatestValue
            // var difMin = dif/1000/60
            // var preciseTime = (parseInt(String(difMin).split('.')[0]) > 4) ? parseInt(String(difMin).split('.')[0])+" min ago" : parseInt(String(difMin*60).split('.')[0])+" sec ago"
            // var difH = hour - hourLatestValue
            // var text = difH > 1 ? 'hours' : 'hour'

            if (isCounter) {
                $('#' + element + '-floatinBall').removeClass("hidden-element")
                $("." + element + "-newItem").append("<p class='update-time-gauge'>Updated at " + updatedTime + "</p>")
                // $('#' + element + '-floatinBall').addClass("pulse-effect")
                // timeout(1700, function () {
                //     $('#' + element + '-floatinBall').removeClass("pulse-effect")
                // console.log("3 seconds async timeout")
                // })
            } else {
                $('#' + element + '-gauge').removeClass("hidden-element")
                $("#" + element + "-gauge").parent().append("<p class='update-time-gauge'>Updated at " + updatedTime + "</p>")
            }


            // if(parseInt(String(difMin).split('.')[0] > 60)) {
            //     // try { $(".update-time-gauge").remove() } catch {}
            //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+difH+" "+text+" ago</p>")
            // } else {
            //     // try { $(".update-time-gauge").remove() } catch {}
            //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+preciseTime+" </p>")
            // }

        }

        // Append unit measure
        if (Number.isInteger(currentValue)) {
            if (element.includes("source")) {
                $('#' + element + '-gauge g.text-container text').append(".0 V")
            } else {
                $('#' + element + '-gauge g.text-container text').append(".0 &#8451;")
            }
        } else {
            if (element.includes("source")) {
                $('#' + element + '-gauge g.text-container text').append(" V")
            } else {
                $('#' + element + '-gauge g.text-container text').append(" &#8451;")
            }
        }


        return gauge
    }



}

// not used
function currentValueAdd(element, liveData) {
    // Live Data
    if (liveData != 'NaN') {
        // Remove Loading Item
        $('.' + element + '-currentValue-spinner').remove()
        // Add Live Data
        // $("." + element + "-currentValue").append(liveData)
        // debug
        // console.log("Real value update "+element+":",liveData)
    } else {
        // Remove Loading Item
        $('.' + element + '-currentValue-spinner').remove()
        // Add Live Data
        // $("." + element + "-currentValue").append(`<p class='no-data-from-sensor' >No data from sensor with id <b>` + element + `</b></p>`)
    }
}

// used for updating the gauges
function updateValueSvgGauge(element, gauge, value, updatedAt = false) {

    var isCounter = false
    element.split('-')[1] == 'c' ? isCounter = true : isCounter = false

    // Update the value
    if (!isNaN(value) && !isCounter)
        gauge.setValue(value);

    // Append unit measure
    if (Number.isInteger(value)) {
        if (element.includes("source")) {
            $('#' + element + '-gauge g.text-container text').append(".0 V")
        } else {
            $('#' + element + '-gauge g.text-container text').append(".0 &#8451;")
        }
    } else {
        if (element.includes("source")) {
            $('#' + element + '-gauge g.text-container text').append(" V")
        } else {
            $('#' + element + '-gauge g.text-container text').append(" &#8451;")
        }
    }

    // console.log(updatedAt)

    if (updatedAt) {

        // console.log("updatedAt received",updatedAt)

        // current date
        var date = new Date()

        // updatedAt is at best 1 hour behind current date 
        var hour = date.getHours()

        // dateLatestValue add two hours to updatedAt
        var dateLatestValue = updatedAt.split("T")[0].split("-")
        var hourLatestValue = updatedAt.split("T")[1].split(":").slice(0, 3)
        // console.log(updatedAt.split("T")[1].split(":"))

        // -1 to match with hour from graph
        // var hourLatestValue = dateLatestValue.getHours() - 1

        // console.log(element)
        // console.log("date",date)
        // console.log("dateLatestValue",dateLatestValue,hourLatestValue)

        var influxTime = new Date(dateLatestValue[0], dateLatestValue[1] - 1, dateLatestValue[2], hourLatestValue[0], hourLatestValue[1], hourLatestValue[2].split(".")[0])
        // console.log(influxTime)
        influxTime = influxTime.addHours(1)
        influxTime = String(influxTime).split(" ").slice(1, 6)
        updatedTime = influxTime[0] + " " + influxTime[1] + " " + influxTime[2] + " " + influxTime[3]
        // console.log(influxTime)
        // var dif = date - dateLatestValue
        // var difMin = dif/1000/60
        // var preciseTime = (parseInt(String(difMin).split('.')[0]) > 4) ? parseInt(String(difMin).split('.')[0])+" min ago" : parseInt(String(difMin*60).split('.')[0])+" sec ago"
        // var difH = hour - hourLatestValue
        // var text = difH > 1 ? 'hours' : 'hour'

        // console.log("." + element + "-currentValue .update-time-gauge")
        if (isCounter) {

            var oldUpdatedTime = $("." + element + "-newItem .update-time-gauge").html().split("Updated at ")[1]

            if (oldUpdatedTime != updatedTime) {

                $("." + element + "-newItem .update-time-gauge").html("Updated at " + updatedTime)
                $('#' + element + '-floatinBall').addClass("pulse-effect")

                timeout(4500, function () {
                    $('#' + element + '-floatinBall').removeClass("pulse-effect")
                    // console.log("3 seconds async timeout")
                })
            }

        } else {
            $("." + element + "-currentValue .update-time-gauge").html("Updated at " + updatedTime)
        }

        // if(parseInt(String(difMin).split('.')[0] > 60)) {
        //     // try { $(".update-time-gauge").remove() } catch {}
        //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+difH+" "+text+" ago</p>")
        // } else {
        //     // try { $(".update-time-gauge").remove() } catch {}
        //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+preciseTime+" </p>")
        // }

    }
}

var plotData = async (element, ylabels, xlabels, label) => {

    // Check if there is data
    console.log(element, ylabels, ylabels.length)
    // console.log("NEW chart for:", element, "ylabels.length", ylabels.length, ylabels)

    // AI Prediction
    // ===============================================
    // console.log("PLOT DATA:")
    var prediction = []
    // for (i = 0; i < ylabels.length; i++) {
    //     prediction[i] = null;
    //     if (i == ylabels.length - 1) {
    //         prediction[i] = ylabels[i];
    //     }
    // }

    if (!$("body").hasClass("calendar-active"))
        var xLastHour = xlabels[xlabels.length - 1]
        for (var i = parseInt(xLastHour) + 1; i < 24; i++) {
            xlabels.push(i.toString())
            ylabels.push(null)
            // prediction.push(Math.floor(Math.random() * (29 - 27 + 1)) + 27)
        }
    // ===============================================
    // END AI Prediction

    // Get last week of this day
    // ===============================================
    let experiment = await getSensorDataExperiment(element);
    if (!experiment[0].error)
        experiment[0].sensorAverage.forEach(item => {
            prediction.push(item.sensorValue.toFixed(1))
        })
    prediction = prediction.reverse()
    // console.log(experiment[0].sensorAverage)
    // console.log(prediction)
    // ===============================================
    // END Get last week of this day

    // console.log("y:", ylabels)
    // console.log("x:", xlabels)

    // Get sensorType attribute
    var sensorType = $('article.' + element + '-card').attr('sensorType')
    label = sensorType

    // console.log(label)

    // Remove No data message
    $('article.' + element + '-card .no-data-from-sensor').remove()

    // Remove Loading Item
    $('.' + element + '-graph-spinner').remove()

    // add canvas
    // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
    // console.log($('.' + element + '-card .card-body'))

    $('.' + element + '-card .card-body').append(`<canvas id="` + element + `-graph"></canvas>`)


    // console.log($(element + "-graph"))

    // console.log("xlabels.length:", xlabels.length)

    if (ylabels.length) {

        // Remove Loading Item
        // console.log('.' + element + '-graph-spinner', 'removed')
        // $('.' + element + '-graph-spinner').remove()

        /* CHART JS */
        var chart_canvas = document.getElementById(element + '-graph').getContext("2d");

        // if (chart) {
        //     chart.destroy();
        // }

        // var gradientStroke = chart_canvas.createLinearGradient(500, 0, 100, 0);
        // gradientStroke.addColorStop(0, '#80b6f4');
        // gradientStroke.addColorStop(1, '#f49080');

        // var gradientFill = chart_canvas.createLinearGradient(500, 0, 100, 0);
        // gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
        // gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");

        var chart = new Chart(chart_canvas, {
            type: 'line',
            data: {
                labels: xlabels,
                datasets: [{
                    label: label[0].toUpperCase() + label.slice(1, label.length),
                    data: ylabels,
                    backgroundColor: 'rgba(51, 153, 255, 0.2)',
                    borderColor: 'rgba(51, 153, 255, 1)',
                    pointBorderColor: '#343a40',
                    pointBackgroundColor: "rgba(51, 153, 255, 1)",
                    pointHoverBackgroundColor: "white",
                    pointRadius: 7,
                    pointHoverRadius: 7,
                    pointBorderWidth: 4,
                    borderWidth: 1,
                    lineTension: 0.2
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                drawBorder: false,
                // onResize: console.log("chart resize"),
                legend: {
                    labels: {
                        fontColor: 'white'
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            fontColor: 'white'
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
        });

        if (!experiment[0].error)
            switchSecondGraph(chart, element, prediction)
        else
            disableSwitchSecondGraph(element)

        // return chart

    } else {

        // add no data message
        // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
        $('.' + element + '-card .card-body').append(`<p class='no-data-from-sensor' >No data from sensor with id <b>` + element + `</b> for today</p>`)

        // add canvas
        // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
        // $('.' + element + '-card .card-body').append(`<canvas id="` + element + `-graph class='hidden-graph' "></canvas>`)

        // Remove Loading Item
        // console.log('.' + element + '-graph-spinner', 'removed')
        // $('.' + element + '-graph-spinner').remove()

        /* CHART JS */
        // console.log(element + '-graph', xlabels, ylabels, label)
        $('#' + element + '-graph').addClass('hidden-graph')
        var chart_canvas = document.getElementById(element + '-graph').getContext("2d");

        // if (chart) {
        //     chart.destroy();
        // }

        var chart = new Chart(chart_canvas, {
            type: 'line',
            data: {
                labels: xlabels,
                datasets: [{
                    label: label,
                    data: ylabels,
                    backgroundColor: '#bac8db',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });



    }

    return chart

}

// select mean(value) as value, first(type) as type from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time>='2020-06-29T09:00:00.000000000Z' and time<'2020-07-01T17:00:00.000000000Z' GROUP BY time(1h) ORDER BY time DESC

function defaultSensorView(sensorId, sensorType, sensorZone) {

    // console.log("append")

    sensorId = String(sensorId)

    // current value gauge component
    var currentValueView = `
    <article class="card height-control live-card-` + sensorId + `" sensorId="` + sensorId + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Current Value
        </h3>
        <span class='card-settings-button hidden-button'>
            <i class="far fa-sliders-h"></i>
        </span>
    </div>

    <div class="card-body">
        <div class="` + sensorId + `-currentValue">
            <a href="#" class='spinner ` + sensorId + `-currentValue-spinner'>
                <span>Loading...</span>
            </a>
            <div id="` + sensorId + `-gauge" class="gauge-container two hidden-element">
                
            </div>
        </div>
    </div>

    <div class='card-alerts-settings alert-` + sensorId + `'>
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
                <p class='label-input'>Minimum</p>
                <input type="number" placeholder="Type lower alert..." class="input input-min">
                <p class='label-input'>Maximum</p>
                <input type="number" placeholder="Type upper alert..." class="input input-max">
                <p class='label-input'>Lat</p>
                <input type="number" placeholder="Type lat value..." class="input input-lat">
                <p class='label-input'>Long</p>
                <input type="number" placeholder="Type long value..." class="input input-long">
            </div>
        </div>
    </div>
    `

    // counter noriel ui
    var newItemLive = `
    <article class="card height-control live-card-` + sensorId + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Live Update
        </h3>
    </div>

    <div class="card-body">
        <div class="` + sensorId + `-newItem">

            <a href="#" class='spinner ` + sensorId + `-newItem-spinner'>
                <span>Loading...</span>
            </a>

            <div id="` + sensorId + `-floatinBall" class="hidden-element"></div>

        </div>
    </div>`

    // graph view component
    var graphView = `</article>

    <article class="card height-control ` + sensorId + `-card graph-` + sensorId + `" sensorType="` + sensorType + `" sensorId="` + sensorId + `">
    
        <div class="card-header">

            <h3 class="card-title">
                <i class='update-icon'></i>
                <span>` + sensorZone + `</span> |
                <b>` + sensorId + `</b>
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
                        <div id="predictor-switch" clicked="false" class="tooltip_test" style="background: #fff;cursor: pointer;padding: 5px 10px;border: 1px solid #ccc;width: 100%;height: 32px;width: 36px;">
                            <i class="fas fa-history" aria-hidden="true"></i> 
                            <span class="tooltiptext">Show data for last ` + dayName.toLowerCase() + `</span>
                        </div>
                    </li>
                </ul>
            </div>
    
        </div>
        
    
        <div class="card-body">
            <a href="#" class='spinner ` + sensorId + `-graph-spinner'>
                <span>Loading...</span>
            </a> 
            <div class="` + sensorId + `-graph-calendar graph-calendar">
                Time interval for ` + sensorId + ` 
                <input name="dates" value="Button Change"> 
            </div> 
        </div>
        
    </article>`

    // stack the components
    if (sensorType == 'counter') {
        return newItemLive + graphView
    } else {
        return currentValueView + graphView
    }
    // stack the components
    // return currentValueView + graphView
}

var alertsLoadFlag = true


let readAlerts = async () => {
    let alerts = await fetch("https://anysensor.dasstec.ro/api/read-alerts")
    return alerts.json()
}

// let readLocation = async () => {
//     let alerts = await fetch("https://anysensor.dasstec.ro/api/read-location")
//     return alerts.json()
// }


function alertsAndLocationLoad() {
    console.log("alertsAndLocationLoad()")
    if (alertsLoadFlag)
        (async () => {
            // alertsLoadFlag = false
            let alerts = await readAlerts() //this returns all the alerts in mysql - it should return only the  alerts of this user
            for (var i = 0; i < alerts.result.length; i++) {
                var sensorId = alerts.result[i].sensorId

                // load alert' values
                $(`.live-card-` + sensorId + ` .input-min`).attr("value", alerts.result[i].min)
                $(`.live-card-` + sensorId + ` .input-max`).attr("value", alerts.result[i].max)

                // load locations into inputs value
                try {
                    var locationObj = getLocationObj()
                    if (locationObj[sensorId] != undefined) {
                        // console.log(locationObj, locationObj[sensorId])
                        $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").attr("value", locationObj[sensorId][0])
                        $("article[class*='live'][sensorid='" + sensorId + "'] .input-long").attr("value", locationObj[sensorId][1])
                    }
                } catch {
                    $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").attr("value", "not set")
                    $("article[class*='live'][sensorid='" + sensorId + "'] .input-long").attr("value", "not set")
                }
            }
        })()

}

function sensorSettingsToggle(sensorId) {

    console.log("sensorSettingsToggle(" + sensorId + ")")

    $(".live-card-" + sensorId + " .card-settings-button").removeClass("hidden-button")

    $(".live-card-" + sensorId + "  .card-settings-button").click(function () {
        $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up')
        $(this).parent().parent().children('.card-body').toggleClass('blur8')
        $(this).parent().parent().children('.card-header').toggleClass('blur8')

        alertsAndLocationLoad()

    })
    $(".live-card-" + sensorId + "  .card-settings-button-inner").click(function () {
        $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up')
        $(this).parent().parent().children('.card-body').toggleClass('blur8')
        $(this).parent().parent().children('.card-header').toggleClass('blur8')
    })

    $(".live-card-" + sensorId + " .card-settings-button-update").click(function () {
        updateSensorSettings(sensorId)
        appendAlertsToHTML(sensorId)
    })
}


let saveSensorSettings = async (sensorId, minVal, maxVal, lat, long, sensorType = null) => {
    // let response = await fetch("https://anysensor.dasstec.ro/api/set-alerts/?sensorId='" + sensorId + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long)
    // console.log(await response)
    // return response.json()

    // need to replace with ajax request for notification
    $.ajax({
        url: "https://anysensor.dasstec.ro/api/set-alerts/?sensorId='" + sensorId + "'&sensorType='" + sensorType + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long,
        type: 'GET',
        success: function (msg) {
            alert("Alerts and location updated!")
            console.log({
                msg,
                url: "https://anysensor.dasstec.ro/api/set-alerts/?sensorId='" + sensorId + "'&sensorType='" + sensorType + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long
            })
        }
    });
}

async function updateSensorSettings(sensorId) {

    const minVal = $(".live-card-" + sensorId + " .settings-wrapper .input-min").val()
    const maxVal = $(".live-card-" + sensorId + " .settings-wrapper .input-max").val()
    const lat = $(".live-card-" + sensorId + " .settings-wrapper .input-lat").val()
    const long = $(".live-card-" + sensorId + " .settings-wrapper .input-long").val()
    const sensorType = $("article[class*='graph-'][sensorid='" + sensorId + "']").attr("sensortype")

    await saveSensorSettings(sensorId, minVal, maxVal, lat, long, sensorType)

}

function sliderAlerts(element) {

    $(document).on('input', element, function () {
        var stringList = String(element).split('-')
        var pClass = stringList[stringList.length - 1]
        $(this).siblings('.text-slider-' + pClass).children('span').html($(this).val())
        // console.log($(this).val(), pClass);
        //vals
        var optimVal = $("#slider-optim").val()
        var midVal = $("#slider-mid").val()
        var warningVal = $("#slider-warning").val()
        // sliders
        var optimSlider = $("#slider-optim")
        var midSlider = $("#slider-mid")
        var warningSlider = $("#slider-warning")
        // if
        if (optimVal) {
            midSlider.attr("min", optimVal)
            warningSlider.attr("min", midVal)
        }

    });

}

// Time Interval Change
function timeIntervalChanger(sensorId, chartList) {

    const overlay = $(".main-overlay")
    const cancelBtn = $(".daterangepicker .cancelBtn")
    const applyBtn = $(".daterangepicker .applyBtn")
    const range = $(".ranges ul li:not(:last-child)")
    const main = $("#main")

    // open the overlay
    $('.' + sensorId + '-card #reportrange').click(function () {
        // overlay.addClass("force-show-overlay")
        // main.addClass("no-scroll")
    })

    // close the overlay
    // overlay.click(function () {
    //     console.log("------------>click overlay")
    //     overlay.removeClass("force-show-overlay")
    //     main.removeClass("no-scroll")
    // });

    // cancelBtn.click(function () {
    //     overlay.removeClass("force-show-overlay")
    //     main.removeClass("no-scroll")
    // });

    // applyBtn.click(function () {
    //     console.log("------------>click apply")
    //     overlay.removeClass("force-show-overlay")
    //     main.removeClass("no-scroll")
    // });

    // range.click(function () {
    //     overlay.removeClass("force-show-overlay")
    //     main.removeClass("no-scroll")
    // });

    var currentHourPm = moment().format("HH")
    var currentMin = moment().format("mm")
    var start = moment().subtract(currentHourPm, 'hours').subtract(currentMin, 'minutes');
    var end = moment();

    $('.' + sensorId + '-card #reportrange').daterangepicker({
        // startDate: start,
        // endDate: end,
        timePicker: true,
        "timePicker24Hour": true,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        // ranges: {
        //     'Today': [moment(), moment()],
        //     'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        //     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        //     'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        //     'This Month': [moment().startOf('month'), moment().endOf('month')],
        //     'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        // }
    }, callback);

    function callback(start, end, chartList) {
        // $('.' + sensorId + '-card #reportrange span').html(start.format('MMM D, YYYY, HH:mm') + ' - ' + end.format('MMM D, YYYY, HH:mm'));
        // plot data from influx with a new time interval
        // reloadDataCustomCalendar(start, end, countyName, sensorId);

        // console.log()

        start = start.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'
        end = end.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'

        // subtract 3 hours because of timezone
        // subtract 1 more hour because influx is 1 hour behind

        // console.log(start, end)

        startAux = new Date(start) - (4 * 60 * 60 * 1000)
        endAux = new Date(end) - (4 * 60 * 60 * 1000)

        // console.log(startAux, endAux)

        start = moment(new Date(startAux)).format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'
        end = moment(new Date(endAux)).format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'

        // console.log(start, end)

        reloadDataCustomCalendar(start, end, countyName, sensorId, chartList)
    }

    callback(start, end, chartList);
}

// not used
function currentValueGauge(element) {
    console.log(element)
    // JS 
    var chart = JSC.chart(element, {
        debug: true,
        type: 'gauge ',
        legend_visible: false,
        chartArea_boxVisible: false,
        xAxis: {
            /*Used to position marker on top of axis line.*/
            scale: {
                range: [0, 1],
                invert: true
            }
        },
        palette: {
            pointValue: '%yValue',
            ranges: [{
                    value: 350,
                    color: '#FF5353'
                },
                {
                    value: 400,
                    color: '#FFD221'
                },
                {
                    value: 700,
                    color: '#77E6B4'
                },
                {
                    value: [800, 850],
                    color: '#21D683'
                }
            ]
        },
        yAxis: {
            defaultTick: {
                padding: 13,
                enabled: false
            },
            customTicks: [400, 700, 800],
            line: {
                width: 15,
                breaks_gap: 0.03,
                color: 'smartPalette'
            },
            scale: {
                range: [350, 850]
            }
        },
        defaultSeries: {
            opacity: 1,
            shape: {
                label: {
                    align: 'center',
                    verticalAlign: 'middle'
                }
            }
        },
        series: [{
            type: 'marker',
            name: 'Score',
            shape_label: {
                text: "720<br/> <span style='fontSize: 35'>Great!</span>",
                style: {
                    fontSize: 48
                }
            },
            defaultPoint: {
                tooltip: '%yValue',
                marker: {
                    outline: {
                        width: 10,
                        color: 'currentColor'
                    },
                    fill: 'white',
                    type: 'circle',
                    visible: true,
                    size: 30
                }
            },
            points: [
                [1, 620]
            ]
        }]
    });
}

function fontAwesomeClassGenerator(type) {

    switch (type) {
        case 'temperatura':
            var faClass = `fas fa-temperature-high mr-1`
            break;
        case 'temperature':
            var faClass = `fas fa-temperature-high mr-1`
            break;
        case 'counter':
            var faClass = `far fa-chart-line`
            break;
        case 'scale':
            var faClass = `fas fa-balance-scale`
            break;
        case 'voltage':
            var faClass = `fas fa-car-battery`
            break;
        default:
            var faClass = `fas fa-spinner`
    }

    return faClass

    // select an icon
    // if (type == 'type1' || type == 'temperatura' || type == 'temperature') {
    //     var faClass = `fas fa-temperature-high mr-1`
    // } else if (type == 'type2') {
    //     var faClass = `far fa-lightbulb`
    // } else if (type == 'type3') {
    //     var faClass = `fas fa-bolt`
    // } else if (type == 'type4') {
    //     var faClass = `fas fa-adjust`
    // } else if (type == 'counter') {
    //     var faClass = `far fa-chart-line`
    // } else {
    //     var faClass = type + `_icon`
    // }

    // return faClass
}

function appendAlertsToHTML(sensorId_) {

    (async () => {

        // console.log("called for", sensorId_)

        let alerts = await readAlerts()

        var alertsDict = []

        var alertCounter = 0

        for (var i = 0; i < alerts.result.length; i++) {

            var bodyEl = $("body")
            if (sensorId_.includes(alerts.result[i].sensorId)) {
                alertsDict[alertCounter] = [alerts.result[i].sensorId, alerts.result[i].min, alerts.result[i].max, alerts.result[i].sensorType]
                alertCounter++
            }

        }

        alertsDict.forEach(alert => {
            // console.log(alert, sensorId_)

            if (sensorId_ == alert[0]) {

                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").remove()
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").remove()
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container").prepend(`<span class='minAlertGauge' value='` + alert[1] + `' sensortype='` + alert[3] + `'>` + alert[1] + `</span><span class='maxAlertGauge' value='` + alert[2] + `' sensortype='` + alert[3] + `'>` + alert[2] + `</span>`)
                // if sensortype = voltage add .alert-type-voltage class
                if (alert[3] == "voltage") {
                    $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-voltage")
                    $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-voltage")
                }
                // if sensortype = temperature add .alert-type-temperature
                if (alert[3] == "temperature") {
                    $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-temperature")
                    $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-temperature")
                }
            }

        })

    })()
}

// append alerts test
async function appendAlertsToHTMLAsync(sensorId_) {

    // console.log("called for", sensorId_)

    let alerts = await readAlerts()

    var alertsDict = []

    var alertCounter = 0

    for (var i = 0; i < alerts.result.length; i++) {

        var bodyEl = $("body")
        if (sensorId_.includes(alerts.result[i].sensorId)) {
            alertsDict[alertCounter] = [alerts.result[i].sensorId, alerts.result[i].min, alerts.result[i].max, alerts.result[i].sensorType]
            alertCounter++
        }

    }

    // bodyEl.prepend(`<alerts style="display:none">` + JSON.stringify(alertsDict) + `</alerts>`)

    var min_ = 0;
    var max_ = 0;

    alertsDict.forEach(alert => {
        // console.log(alert, sensorId_)

        if (sensorId_ == alert[0]) {

            min_ = alert[1]
            max_ = alert[2]

            $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").remove()
            $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").remove()
            $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container").prepend(`<span class='minAlertGauge' value='` + alert[1] + `' sensortype='` + alert[3] + `'>` + alert[1] + `</span><span class='maxAlertGauge' value='` + alert[2] + `' sensortype='` + alert[3] + `'>` + alert[2] + `</span>`)
            // if sensortype = voltage add .alert-type-voltage class
            if (alert[3] == "voltage") {
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-voltage")
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-voltage")
            }
            // if sensortype = temperature add .alert-type-temperature
            if (alert[3] == "temperature") {
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-temperature")
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-temperature")
            }
        }

    })

    return [min_, max_]
}

// get list of sensors from a county
let getData = async () => {
    // console.log("getData")
    let response = await fetch("https://anysensor.dasstec.ro/api/v2/get-data/sensorId/" + countyName)
    // console.log("getData",new Date()-time)
    return response.json()
}

// get all values of a sensor
let getSensorData = async (sensor) => {
    // console.log("getSensorData")
    let response = await fetch("https://anysensor.dasstec.ro/api/get-data/" + countyName + "/" + sensor)
    // console.log("getSensorData",new Date()-time)
    return response.json()
}

// experiment
let getSensorDataExperiment = async (sensor) => {
    // console.log("getSensorData")
    let response = await fetch("https://anysensor.dasstec.ro/api/experiment/get-data/" + countyName + "/" + sensor)
    // console.log("getSensorData",new Date()-time)
    return response.json()
}

// get last recorded value of a sensor
let getLatestValueRecorded = async (sensor) => {
    // console.log("getLatestValueRecorded")
    let response = await fetch("https://anysensor.dasstec.ro/api/get-data/last/" + countyName + "/" + sensor)
    // console.log("getLatestValueRecorded",new Date()-time)
    return response.json()
}

// get and plot data by a specific interval
let getSensorDataCustomInterval = async (countyName, sensor, start, end, chartList) => {

    if (!$("body").hasClass("calendar-active")) {
        $("body").addClass("calendar-active")
        $("#predictor-switch .tooltiptext").html("Disabled function when calendar view is active - refresh the page")
    }
        

    const date1 = new Date(start);
    const date2 = new Date(end);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = diffTime / 1000 / 60 / 60
    console.log(diffHours + " hours");

    if (diffDays <= 1) {

        if (diffHours <= 1) {
            var step = '1mins'
        } else if (diffHours <= 3) {
            var step = '10mins'
        } else if (diffHours <= 6) {
            var step = '30mins'
        } else {
            var step = 'hourly'
        }
    } else if (diffDays <= 6)
        var step = 'hourlyS'
    else if (diffDays <= 45)
        var step = 'daily'
    else
        var step = 'dailyS'

    const query = "https://anysensor.dasstec.ro/api/get-interval/" + step + "?" + "county=" + countyName + "&sensorQuery=" + sensor + "&start=" + start + "&end=" + end
    console.log(query)

    // remove graph and add loading
    $("#" + sensor + "-graph").parent().append(`<a href="#" class='spinner ` + sensor + `-graph-spinner'><span>Loading...</span></a> `)
    $("#" + sensor + "-graph").remove() //remove existing graph

    fetch(query).then((response) => {
        // console.log("fetch")
        return response.json()
    }).then((data) => {
        // console.log(data[0]);
        // console.log(data[0].error)
        const sensorId = data[0].sensorQueried
        const graphId = sensorId + '-graph'

        // console.log(data[0])

        if (data[0].error == false) {

            var label = ''
            var labelIdx = 0

            try {
                while (label.length == 0) {
                    // console.log(data[0].sensorAverage[labelIdx])
                    if (data[0].sensorAverage[labelIdx].sensorType != null) {
                        label = data[0].sensorAverage[labelIdx].sensorType
                    }
                    labelIdx++;
                }
            } catch {
                // console.warn("There is no sensorType for",sensorId)
            }

            const ylabels = []
            const xlabels = []

            for (var i = 0; i < data[0].sensorReadings; i++) {
                ylabels.push(parseFloat(data[0].sensorAverage[i].sensorValue).toFixed(2))

                var influxTime = data[0].sensorAverage[i].sensorTime
                var influxH = influxTime.split("T")[1].split(":")[0]
                var influxMins = influxTime.split("T")[1].split(":")[1]

                if (step == '1mins' || step == '10mins' || step == '30mins') {
                    influxH = parseInt(influxH) + 1
                    xlabels.push(influxH < 10 ? "0" + String(influxH) + ":" + String(influxMins) : (influxH == 24 ? "00" + ":" + String(influxMins) : String(influxH) + ":" + String(influxMins)))
                } else if (step == 'hourly') {

                    // var influxDay = influxTime.split("T")[0].split("-")[2]

                    // var influxMonth = influxTime.split("T")[0].split("-")[1]
                    // influxMonth = parseInt(influxMonth)
                    // influxMonth = monthChanger(influxMonth).slice(0, 3)

                    influxH = parseInt(influxH) + 1
                    // influxH = influxDay + " " + influxMonth + " " + influxH + ':00'

                    // example: influxH = '29 Jun 17:00'

                    xlabels.push(influxH < 10 ? "0" + String(influxH) : (influxH == 24 ? "00" : String(influxH)))

                } else if (step == 'hourlyS') {

                    var influxDay = influxTime.split("T")[0].split("-")[2]

                    var influxMonth = influxTime.split("T")[0].split("-")[1]
                    influxMonth = parseInt(influxMonth)
                    influxMonth = monthChanger(influxMonth).slice(0, 3)

                    influxH = parseInt(influxH) + 1
                    influxH = influxDay + " " + influxMonth + " " + influxH + ':00'

                    // example: influxH = '29 Jun 17:00'

                    xlabels.push(influxH)

                } else if (step == 'daily') {

                    var influxDay = influxTime.split("T")[0].split("-")[2]

                    var influxMonth = influxTime.split("T")[0].split("-")[1]
                    influxMonth = parseInt(influxMonth)
                    influxMonth = monthChanger(influxMonth).slice(0, 3)

                    // influxH = parseInt(influxH) + 1
                    // influxH = influxDay + " " + influxMonth + " " +influxH +':00'
                    // example: influxH = '29 Jun 17:00'


                    xlabels.push(influxDay + " " + influxMonth)

                } else {
                    var influxDay = influxTime.split("T")[0].split("-")[2]

                    var influxMonth = influxTime.split("T")[0].split("-")[1]
                    influxMonth = parseInt(influxMonth)
                    influxMonth = monthChanger(influxMonth).slice(0, 3)

                    // influxH = parseInt(influxH) + 1
                    // influxH = influxDay + " " + influxMonth + " " +influxH +':00'
                    // example: influxH = '29 Jun 17:00'


                    xlabels.push(influxDay + " " + influxMonth)
                }

                // console.log(step, influxH)


                // influx time is 1 hour behind romanian timezone
                // increment influx with 2 because:
                // if time of influx is 8:20, it means that romanian hour is 9:20
                // and all the values between 9 to 10 (ro timezone) and (8 to 9 - influx timezone) is displayed as average at 10h (ro rimezone)
                // that's why is incremented with 2


                // xlabels.push(parseInt(influxH)+1)
            }

            // console.log("aici")

            // xlabels.push(hour+1 < 10 ? "0" + String(hour+1) : String(hour+1))

            const xlabels_reversed = xlabels.reverse()
            const ylabels_reversed = ylabels.reverse()


            $("#" + graphId).removeClass('hidden-graph');
            $('#' + graphId).parent().children('.no-data-from-sensor').remove();

            /* CHART JS RE-APPEND */

            // remove loading spinner and append graph
            plotData(sensorId, ylabels_reversed, xlabels_reversed, label)

            $("#" + graphId).css("min-height", "250px")

        } else {
            // Remove Loading Item
            $('.' + sensorId + '-graph-spinner').remove()
            // add no data message
            $('.' + sensorId + '-card .card-body').append(`<p class='no-data-from-sensor' >No data for specified time range</p>`)
        }

        // console.log(typeof chartList)
        // chartList.forEach((chart) => {
        //     // console.log(data[0].error)
        //     if (chart != undefined && data[0].error == false) {
        //         // chart[0] == sensorIdToLookFor ? console.log(chart[0],chart[1],ylabels_reversed) : 0
        //         // console.log(chart[0] == sensor, chart[1] != undefined)

        //         if (chart[0] == sensor && chart[1] != undefined) {
        //             //     // console.log("chart:",chart[1])
        //             //     // console.log("sent data:",ylabels_reversed)
        //             console.log("chart:", chart)
        //             // $("#"+sensor+"-graph").removeClass("hidden-graph")
        //             // addData(chart[1], xlabels_reversed, ylabels_reversed)
        //         } else if (chart[0] == sensor && !isNaN(ylabels_reversed[ylabels_reversed.length - 1])) {
        //             //     // plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)
        //             //     // addData(chart[1], xlabels_reversed, ylabels_reversed)
        //             //     // reloadThePage++; //page is reloaded 
        //         } 
        //     } else if (chart[0] == sensor) {
        //         console.log("no data for this chart:", chart)
        //     }
        // })
        // return data[0]

    }).catch(function (err) {
        console.log(err);
        err = 'this is an error';
        console.log(err);
    })

}


let reloadDataCustomCalendar = async (start, end, countyName, sensorId, chartList) => {

    // console.log(typeof chartList, '\r\n')
    if (typeof chartList != 'object')
        getSensorDataCustomInterval(countyName, sensorId, start, end, chartList)

}

// no longer used - instead I use getSensorData()
let getSensorType = async (sensorId) => {

    let response = await fetch("https://anysensor.dasstec.ro/api/get-data/type/" + sensorId)
    return response.json()
}

// console.log("async",new Date()-time)

var gaugeList = []
var chartList = []

let test = (async () => {
    json = await getData();
})().then(() => {
    // If error was returned, put 0 value for reading
    if (json[0].error) {

        // // $(".card-container .card-body").html(json[0].message)

        // // County name append
        // // addSmallBox('county',api_data[0].county,fontAwesome='fas fa-map-marker-alt')

        // let ylabels = []
        // let xlabels = []
        // var xValue

        // var cur_date = new Date()

        // // console.log(cur_date.getHours())

        // // Sensors data append 0
        // for (var i = 1; i <= cur_date.getHours(); i++) {

        //     xlabels.push(0)
        //     ylabels.push(i)

        // }

        // // const xlabels_reversed = xlabels.reverse()
        // // const ylabels_reversed = ylabels.reverse()

        // plotData('temperature_2', ylabels, xlabels, "Temperature")


    } else {

        const api_data = json[0]
        const sensorCounter = api_data.sensorIdListLength

        for (var i = 0; i < sensorCounter; i++) {

            (async () => {

                var sensorIdToLookFor = api_data.sensorIdList[i]
                // let sensorType = await getSensorType(api_data.sensorIdList[i])
                let sensorData = await getSensorData(sensorIdToLookFor);
                // console.log(sensorIdToLookFor, sensorData[0])

                // append default sensor view
                $(".card-container").append(defaultSensorView(sensorData[0].sensorQueried, sensorData[0].sensorType, sensorData[0].sensorZone));
                // console.log("append")

                // Turn On alert sliders
                // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-optim")
                // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-mid")
                // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-warning")

                sensorSettingsToggle(sensorData[0].sensorQueried)

                // Append alerts
                // timeout(500, appendAlertsToHTML(sensorData[0].sensorQueried))

                // Add Icons based on sensor type
                $(".live-card-" + sensorData[0].sensorQueried + " .update-icon").addClass(fontAwesomeClassGenerator(sensorData[0].sensorType))
                $(".graph-" + sensorData[0].sensorQueried + " .update-icon").addClass(fontAwesomeClassGenerator(sensorData[0].sensorType))

                // check readings of each sensor and plot
                // let sensorIdToLookFor = await api_data.sensorIdList[i]
                // let sensorData = await getSensorData(sensorIdToLookFor);

                // console.log(sensorIdToLookFor, api_data.sensorIdList, sensorData[0])

                var ylabels = []
                var xlabels = []
                var label = sensorData[0].sensorType

                // Parse all readings of queried sensor
                // console.log("readings",sensorData[0].sensorReadings)
                for (var index = 0; index < sensorData[0].sensorReadings; index++) {

                    ylabels.push(parseFloat(sensorData[0].sensorAverage[index].sensorValue).toFixed(2))
                    var influxTime = sensorData[0].sensorAverage[index].sensorTime
                    var influxH = influxTime.split("T")[1].split(":")[0]

                    // influx time is 1 hour ahead of romanian time
                    // increment influx with 2 because:
                    // if time of influx is 8:20, it means that romanian hour is 9:20
                    // and all the values between 9 to 10 (ro timezone) and (8 to 9 - influx timezone) is displayed as mean at 10h (ro rimezone)
                    // that's why is incremented with 2

                    var hour = parseInt(influxH) + 1
                    xlabels.push(hour < 10 ? "0" + String(hour) : (hour == 24 ? "00" : String(hour)))
                    // xlabels.push(parseInt(influxH)+1)
                }

                // xlabels.push(hour+1 < 10 ? "0" + String(hour+1) : String(hour+1))

                const xlabels_reversed = xlabels.reverse()
                const ylabels_reversed = ylabels.reverse()

                // var liveData = parseFloat(sensorData[0].sensorLive).toFixed(2)

                // if (sensorIdToLookFor.split('-')[1] == 'c') {
                //     // if sensor is a counter
                //     let lastValue = await getLatestValueRecorded(sensorIdToLookFor).then((resLast) => {
                //         gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time)])
                //     })
                // } else {

                let promise = new Promise(function (resolve, reject) {
                    // executor (the producing code, "singer")
                });

                let lastValue = await getLatestValueRecorded(sensorIdToLookFor).then((resLast) => {
                    // console.log(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time)

                    // appendAlertsToHTML(sensorData[0].sensorQueried)

                    appendAlertsToHTMLAsync(sensorData[0].sensorQueried).then(res => {
                        gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time, min = res[0], max = res[1])])
                    })

                    // gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time, min = 0, max = 30)])
                })

                // plot data and add current value for each sensor
                chartList.push([sensorIdToLookFor, plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)])

                timeIntervalChanger(sensorIdToLookFor, chartList);

            })()

        }

        // Small box append
        addSmallBox('Sensors', api_data.sensorIdListLength, fontAwesome = 'fa fa-check')

    }

    addCssForSmallBox()

    return chartList

})

function arraysEqual(a1, a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1) == JSON.stringify(a2);
}

function addData(chart, label, data) {
    // console.log("oldLabel:",chart.data.labels)
    // console.log("newLabel:",label)

    var oldDataset = chart.data.datasets[0].data.slice(0, chart.data.datasets[0].data.length)
    // var oldLabel = chart.data.datasets[0].data.slice(0, chart.data.datasets[0].data.length)

    if (oldDataset.length > 0 && data.length > 0) {
        // console.log("new dataset:",data)
        // console.log("old dataset:",oldDataset)
        // console.log(arraysEqual(data,oldDataset))
        if (arraysEqual(data, oldDataset) == false) {
            // if new and old datasets are not equal, chart should be updated
            chart.data.datasets[0].data = data;
            chart.data.labels = label;
            chart.update();
            // console.log(chart)
            // console.log("chart updated with:", oldDataset)
            // console.log("chart label update:", chart.data.labels)
        }
    } else if (oldDataset.length == 0) {
        if (arraysEqual(data, oldDataset) == false) {
            // if new and old datasets are not equal, chart should be updated
            chart.data.datasets[0].data = data;
            chart.data.labels = label;
            chart.update();
            // console.log(chart)
            // console.log("chart updated with:", oldDataset)
            // console.log("chart label update:", chart.data.labels)
        }
    }

}

function updateData(chartList) {

    (async () => {

        // console.log(await chartList)

        let json = await getData();

        if (json[0].error) {
            // if error happens at update
        } else {
            const api_data = json[0]
            // console.log(api_data)
            const sensorCounter = api_data.sensorIdListLength
            for (var index = 0; index < sensorCounter; index++) {
                (async () => {
                    var sensorIdToLookFor = api_data.sensorIdList[index]

                    let sensorData = await getSensorData(sensorIdToLookFor);

                    var ylabels = []
                    var xlabels = []
                    // var label = sensorData[0].sensorType

                    // console.log(sensorIdToLookFor, sensorData)

                    for (var i = 0; i < sensorData[0].sensorReadings; i++) {

                        ylabels.push(parseFloat(sensorData[0].sensorAverage[i].sensorValue).toFixed(2))
                        var influxTime = sensorData[0].sensorAverage[i].sensorTime
                        var influxH = influxTime.split("T")[1].split(":")[0]

                        // influx time is 1 hour ahead of romanian time
                        // increment influx with 2 because:
                        // if time of influx is 8:20, it means that romanian hour is 9:20
                        // and all the values between 9 to 10 (ro timezone) and (8 to 9 - influx timezone) is displayed as mean at 10h (ro rimezone)
                        // that's why is incremented with 2

                        var hour = parseInt(influxH) + 1
                        xlabels.push(hour < 10 ? "0" + String(hour) : (hour == 24 ? "00" : String(hour)))
                        // xlabels.push(parseInt(influxH)+1)
                    }

                    const xlabels_reversed = xlabels.reverse()
                    const ylabels_reversed = ylabels.reverse()

                    // console.log("chartList:",chartList)
                    // console.log("sent data:",sensorIdToLookFor, ylabels_reversed)

                    // var liveData = parseFloat(sensorData[0].sensorLive).toFixed(2)
                    // var nanFlag = 0
                    // if(isNaN(liveData)) {
                    let lastValue = await getLatestValueRecorded(sensorIdToLookFor).then((resLast) => {
                        liveData = resLast[0].lastValue.value
                        liveDataTime = resLast[0].lastValue.time
                        nanFlag = 1
                    })
                    // }

                    // currentValueAdd(sensorIdToLookFor, liveData)

                    // Loop through gauge list and when a gauge id match the sensorIdToLookFor
                    // Do the update
                    gaugeList.forEach((element) => {
                        if (sensorIdToLookFor == element[0]) {
                            // console.log("Update", element[0], "with", liveData, "at", liveDataTime)
                            updateValueSvgGauge(element[0], element[1], liveData, liveDataTime)
                        }
                    })


                    // currentValueSvgGauge(sensorIdToLookFor + '-gauge', liveData)

                    // let chartIndex = 0
                    let reloadThePage = 0
                    chartList.forEach((chart) => {
                        if (chart != undefined) {
                            // chart[0] == sensorIdToLookFor ? console.log(chart[0],chart[1],ylabels_reversed) : 0
                            if (chart[0] == sensorIdToLookFor && chart[1] != undefined) {
                                // console.log("chart:",chart[1])
                                // console.log("sent data:",ylabels_reversed)

                                addData(chart[1], xlabels_reversed, ylabels_reversed)
                            } else if (chart[0] == sensorIdToLookFor && !isNaN(ylabels_reversed[ylabels_reversed.length - 1])) {
                                // plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)
                                // addData(chart[1], xlabels_reversed, ylabels_reversed)
                                reloadThePage++; //page is reloaded 
                            }
                        }
                        // chartIndex++
                    })
                    // console.log(reloadThePage)
                    if (reloadThePage) {
                        location.reload();
                    }

                    // console.log("Real time data:", sensorIdToLookFor, liveData)

                })()
            }
            // console.log("")

        }

    })()
}

function monthChanger(number) {
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

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

function switchSecondGraph(chart, sensorId, x) {
    $("body:not(.calendar-active) .graph-" + sensorId + " #predictor-switch").click(function (e) {
        e.preventDefault;
        // console.log(chart)
        // console.log($(".graph-" + sensorId + " #predictor-switch").attr('clicked') == 'false')
        if ($(".graph-" + sensorId + " #predictor-switch").attr('clicked') == 'false') {
            document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', 'true')
            chart.config.data.datasets.push({
                label: 'Last ' + dayName,
                data: x,
                // backgroundColor: 'rgba(225, 193, 7, 0.2)',
                borderColor: 'rgba(225, 193, 7, 1)',
                pointBorderColor: '#343a40',
                pointBackgroundColor: "rgba(225, 193, 7, 1)",
                pointHoverBackgroundColor: "white",
                pointRadius: 0,
                pointHoverRadius: 0,
                pointBorderWidth: 0,
                borderWidth: 1,
                lineTension: 0.2
            })
            chart.update();
        } else if ($(".graph-" + sensorId + " #predictor-switch").attr('clicked') == 'true') {
            document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', 'false')
            chart.config.data.datasets.pop()
            chart.update()
        }
    })
}

function disableSwitchSecondGraph(sensorId) {
    document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', 'disabled')
    $(".graph-" + sensorId + " #predictor-switch .tooltiptext").html("No data test test test test test")
}

let run = async () => {

    while (1) {
        updateData(await test);
        // test
        // notification()
        await delay(5 * 1000);
    }
}

let notification = async () => {
    fetch('/api/notification-test?message=Updating the sensor gauge')
}

// run();