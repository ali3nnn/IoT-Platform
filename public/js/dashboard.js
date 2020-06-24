const username = $(".navbar-brand b")[0].innerText.slice(0, $(".navbar-brand b")[0].innerText.length - 1)
let countyName = $(".county-detail h3").html()
let json = ''

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
    console.log("countSmallBoxes:", countSmallBoxes)
}

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

var plotData = (element, ylabels, xlabels, label) => {

    // Check if there is data
    // console.log(element, ylabels.length)
    if (ylabels.length) {
        // add canvas
        // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
        $('.' + element + '-card .card-body').append(`<canvas id="` + element + `-graph"></canvas>`)

        // Remove Loading Item
        // console.log('.' + element + '-graph-spinner', 'removed')
        $('.' + element + '-graph-spinner').remove()

        /* CHART JS */
        var chart_canvas = document.getElementById(element + '-graph').getContext("2d");

        var chart = new Chart(chart_canvas, {
            type: 'line',
            data: {
                labels: xlabels,
                datasets: [{
                    label: label,
                    data: ylabels,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
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

        return chart

    } else {
        // add text
        // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
        $('.' + element + '-card .card-body').append(`<p class='no-data-from-sensor' >No data from sensor with id <b>` + element + `</b></p>`)

        // Remove Loading Item
        // console.log('.' + element + '-graph-spinner', 'removed')
        $('.' + element + '-graph-spinner').remove()
    }

}

function defaultSensorView(sensorId, sensorType) {

    sensorId = String(sensorId)

    // select an icon
    if (sensorType == 'type1') {
        var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        // var icon = sensorType + `_icon`
    } else if (sensorType == 'type2') {
        var icon = `<i class="far fa-lightbulb"></i>`
        // var icon = sensorType + `_icon`
    } else if (sensorType == 'type3') {
        var icon = `<i class="fas fa-bolt"></i>`
        // var icon = sensorType + `_icon`
    } else if (sensorType == 'type4') {
        var icon = `<i class="fas fa-adjust"></i>`
        // var icon = sensorType + `_icon`
    } else {
        var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        // var icon = sensorType + `_icon`
    }

    // current value gauge component
    var currentValueView = `<article class="card height-control">

    <div class="card-header">
        <h3 class="card-title">
            ` + icon + `
            Current Value
        </h3>
    </div>

    <div class="card-body">
        <div class="` + sensorId + `-currentValue">
            <div id="` + sensorId + `-gauge" class="gauge-container two"></div>
            <a href="#" class='spinner ` + sensorId + `-currentValue-spinner'>
                <span>Loading...</span>
            </a>
        </div>
    </div>
    `
    // graph view component
    var graphView = `</article>

    <article class="card height-control ` + sensorId + `-card ">
    
        <div class="card-header">
            <h3 class="card-title">
                ` + icon + `
                Timeline Graph |
                <b>` + sensorId + `</b>
            </h3>
    
            <div class="card-tools">
                <ul class="pagination pagination-sm">
                    <li class="page-item">
                    <!--<a href="#" class="page-link time-interval-button">Change Time Interval</a>-->
                    <div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                        <i class="fa fa-calendar"></i>&nbsp;
                        <span></span> <i class="fa fa-caret-down"></i>
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
    return currentValueView + graphView
}


// Time Interval Change
function timeIntervalChanger(sensorId) {

    const overlay = $(".main-overlay")
    const cancelBtn = $(".daterangepicker .cancelBtn")
    const applyBtn = $(".daterangepicker .applyBtn")
    const range = $(".ranges ul li:not(:last-child)")
    const main = $("#main")

    // open the overlay
    $('.' + sensorId + '-card #reportrange').click(function(){
        overlay.addClass("force-show-overlay")
        main.addClass("no-scroll")
    })

    // close the overlay
    overlay.click(function() {
        overlay.removeClass("force-show-overlay")
        main.removeClass("no-scroll")
    });

    cancelBtn.click(function() {
        overlay.removeClass("force-show-overlay")
        main.removeClass("no-scroll")
    });

    applyBtn.click(function() {
        overlay.removeClass("force-show-overlay")
        main.removeClass("no-scroll")
    });

    range.click(function() {
        overlay.removeClass("force-show-overlay")
        main.removeClass("no-scroll")
    });
    
    var currentHourPm = moment().format("HH")
    var currentMin = moment().format("mm")
    var start = moment().subtract(currentHourPm, 'hours').subtract(currentMin, 'minutes');;
    var end = moment();

    function cb(start, end) {
        $('.' + sensorId + '-card #reportrange span').html(start.format('MMM D, YYYY, HH:mm') + ' - ' + end.format('MMM D, YYYY, HH:mm'));
    }

    $('.' + sensorId + '-card #reportrange').daterangepicker({
        // startDate: start,
        // endDate: end,
        timePicker: true,
        "timePicker24Hour": true,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);
}


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

function currentValueSvgGauge(element, currentValue = 0) {
    var gauge = Gauge(
        document.getElementById(element), {
            min: -20,
            max: 70,
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
    // console.log(currentValue, element +" .value-text")
    // $("#" + element + " .value-text").html(currentValue)
    return gauge
}

function updateValueSvgGauge(element, gauge, value) {
    gauge.setValueAnimated(value, 1);
    // console.log(element)
    // if(element=='sensor22-gauge') {
    // console.log("1", element, value)
    // $("#" + element + " .value-text").html(value)
    // console.log("2", element, $("#" + element + " .value-text").html())
    // }

}


const getData = async () => {
    const response = await fetch("https://anysensor.dasstec.ro/api/get-data/" + countyName)
    return response.json()
}

const getSensorData = async (sensor) => {
    const response = await fetch("https://anysensor.dasstec.ro/api/get-data/" + countyName + "/" + sensor)
    return response.json()
}

var gaugeList = []
let test = (async () => {
    json = await getData();
})().then(() => {

    var chartList = []

    // If error was returned, put 0 value for reading
    if (json[0].error) {

        // $(".card-container .card-body").html(json[0].message)

        // County name append
        // addSmallBox('county',api_data[0].county,fontAwesome='fas fa-map-marker-alt')

        let ylabels = []
        let xlabels = []
        var xValue

        Date.prototype.addHours = function (h) {
            this.setTime(this.getTime() + (h * 60 * 60 * 1000));
            return this;
        }

        var cur_date = new Date()

        // console.log(cur_date.getHours())

        // Sensors data append 0
        for (var i = 1; i <= cur_date.getHours(); i++) {

            xlabels.push(0)
            ylabels.push(i)

        }

        // const xlabels_reversed = xlabels.reverse()
        // const ylabels_reversed = ylabels.reverse()

        plotData('temperature_2', ylabels, xlabels, "Temperature")


    } else {

        // const api_data = json.slice(1, json.length)
        const api_data = json[0]
        const sensorCounter = api_data.sensorIdListLength
        var canvasList = []
        var liveData = []
        // console.log(api_data.sensorIdList)

        for (var i = 0; i < sensorCounter; i++) {
            $(".card-container").append(defaultSensorView(api_data.sensorIdList[i].sensorId, api_data.sensorIdList[i].sensorType));
            // currentValueSvgGauge(api_data.sensorIdList[i].sensorId + '-gauge')
            // console.log("Component created:", api_data.sensorIdList[i].sensorId, api_data.sensorIdList[i].sensorType)
            timeIntervalChanger(api_data.sensorIdList[i].sensorId);
        }

        // cal the time interval changer after the button of this action is created


        for (var index = 0; index < sensorCounter; index++) {

            (async () => {

                var sensorIdToLookFor = api_data.sensorIdList[index].sensorId
                let result = await getSensorData(sensorIdToLookFor);

                // console.log(sensorIdToLookFor + " data:", result[0].sensorReadings ? result[0].sensorAverage : "No data found")

                var ylabels = []
                var xlabels = []
                var label = result[0].sensorType

                for (var i = 0; i < result[0].sensorReadings; i++) {
                    ylabels.push(parseFloat(result[0].sensorAverage[i].sensorValue).toFixed(2))
                    var hour = parseInt(result[0].sensorAverage[i].sensorTime.split("T")[1].split(":")[0]) + 2
                    xlabels.push(hour < 10 ? "0" + String(hour) : String(hour))
                }

                // xlabels.push(hour+1 < 10 ? "0" + String(hour+1) : String(hour+1))

                const xlabels_reversed = xlabels.reverse()
                const ylabels_reversed = ylabels.reverse()

                var liveData = parseFloat(result[0].sensorLive).toFixed(2)

                // plot data and add current value for each sensor
                chartList.push([sensorIdToLookFor, plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)])
                // console.log(sensorIdToLookFor, liveData)
                currentValueAdd(sensorIdToLookFor, liveData);
                gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor + '-gauge', liveData)])

            })()

        }

        // Small box append
        addSmallBox('Sensors', api_data.sensorIdListLength, fontAwesome = 'fa fa-check')

        // /* GAUGE */

        // var latestValue = xlabels[xlabels.length - 1]
        // // console.log(latestValue)

        // var g = new JustGage({
        //     id: "gauge",
        //     value: latestValue,
        //     min: -25,
        //     max: 50,
        //     relativeGaugeSize: true,
        //     title: "",
        //     label: "",
        // });

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
                    var sensorIdToLookFor = api_data.sensorIdList[index].sensorId
                    let result = await getSensorData(sensorIdToLookFor);

                    var ylabels = []
                    var xlabels = []
                    var label = result[0].sensorType

                    for (var i = 0; i < result[0].sensorReadings; i++) {
                        ylabels.push(parseFloat(result[0].sensorAverage[i].sensorValue).toFixed(2))
                        var hour = parseInt(result[0].sensorAverage[i].sensorTime.split("T")[1].split(":")[0]) + 2
                        xlabels.push(hour < 10 ? "0" + String(hour) : String(hour))
                    }

                    const xlabels_reversed = xlabels.reverse()
                    const ylabels_reversed = ylabels.reverse()

                    // console.log("chartList:",chartList)
                    // console.log("sent data:",sensorIdToLookFor, ylabels_reversed)

                    var liveData = parseFloat(result[0].sensorLive).toFixed(2)

                    currentValueAdd(sensorIdToLookFor, liveData)

                    // Loop through gauge list and when a gauge id match the sensorIdToLookFor
                    // Do the update
                    gaugeList.forEach((element) => {
                        if (sensorIdToLookFor == element[0]) {
                            // console.log("Update", element[0], liveData)
                            updateValueSvgGauge(element[0] + '-gauge', element[1], liveData)
                        }
                    })


                    // currentValueSvgGauge(sensorIdToLookFor + '-gauge', liveData)

                    let chartIndex = 0
                    chartList.forEach((chart) => {
                        if (chart != undefined) {
                            // console.log(chart[0] == sensorIdToLookFor,chart[0],sensorIdToLookFor)
                            if (chart[0] == sensorIdToLookFor && chart[1] != undefined) {
                                // console.log("chart:",chart[1])
                                // console.log("sent data:",ylabels_reversed)
                                addData(chart[1], xlabels_reversed, ylabels_reversed)
                            }

                        }
                        chartIndex++
                    })

                    // console.log("Real time data:", sensorIdToLookFor, liveData)

                })()
            }
            // console.log("")
        }

    })()
}

// (async () => {
//     updateData();
// })()

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

let run = async () => {

    while (1) {
        updateData(await test);
        await delay(60 * 1000);
    }
}

run();