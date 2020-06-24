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
        $("." + element + "-currentValue").html(liveData)
        // debug
        // console.log("Real value update "+element+":",liveData)
    } else {
        // Remove Loading Item
        $('.' + element + '-currentValue-spinner').remove()
        // Add Live Data
        $("." + element + "-currentValue").html(`<p class='no-data-from-sensor' >No data from sensor with id <b>` + element + `</b></p>`)
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
        // var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        var icon = sensorType + `_icon`
    } else if (sensorType == 'type2') {
        // var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        var icon = sensorType + `_icon`
    } else if (sensorType == 'type3') {
        // var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        var icon = sensorType + `_icon`
    } else if (sensorType == 'type4') {
        // var icon = `<i class="fas fa-temperature-high mr-1"></i>`
        var icon = sensorType + `_icon`
    } else {
        var icon = sensorType + `_icon`
    }

    // current value gauge component
    var currentValueView = `<article class="card height-control">

    <div class="card-header">
        <h3 class="card-title">
            ` + icon + `
            Current Value
            ` + sensorId + `
        </h3>
    </div>

    <div class="card-body">
        <div class="` + sensorId + `-currentValue">
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
                Timeline Graph
                ` + sensorId + `
            </h3>
    
            <div class="card-tools">
                <ul class="pagination pagination-sm">
                    <li class="page-item"><a href="#" class="page-link">Change Time Interval</a></li>
                </ul>
            </div>
    
        </div>
        
    
        <div class="card-body">
            <a href="#" class='spinner ` + sensorId + `-graph-spinner'>
                <span>Loading...</span>
            </a>
            
            <div class="` + sensorId + `-graph-calendar">
                                
            </div>  
        </div>
        
    </article>`

    // stack the components
    return currentValueView + graphView
}

const getData = async () => {
    const response = await fetch("https://anysensor.dasstec.ro/api/get-data/" + countyName)
    return response.json()
}

const getSensorData = async (sensor) => {
    const response = await fetch("https://anysensor.dasstec.ro/api/get-data/" + countyName + "/" + sensor)
    return response.json()
}


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
            // console.log("Component created:", api_data.sensorIdList[i].sensorId, api_data.sensorIdList[i].sensorType)
        }

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
                    var hour = parseInt(result[0].sensorAverage[i].sensorTime.split("T")[1].split(":")[0]) + 1
                    xlabels.push(hour < 10 ? "0" + String(hour) : String(hour))
                }

                const xlabels_reversed = xlabels.reverse()
                const ylabels_reversed = ylabels.reverse()

                var liveData = parseFloat(result[0].sensorLive).toFixed(2)

                // plot data and add current value for each sensor
                chartList.push([sensorIdToLookFor, plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)])
                // console.log(sensorIdToLookFor, liveData)
                currentValueAdd(sensorIdToLookFor, liveData);

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

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

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
                        var hour = parseInt(result[0].sensorAverage[i].sensorTime.split("T")[1].split(":")[0]) + 1
                        xlabels.push(hour < 10 ? "0" + String(hour) : String(hour))
                    }

                    const xlabels_reversed = xlabels.reverse()
                    const ylabels_reversed = ylabels.reverse()

                    // console.log("chartList:",chartList)
                    // console.log("sent data:",sensorIdToLookFor, ylabels_reversed)

                    var liveData = parseFloat(result[0].sensorLive).toFixed(2)

                    currentValueAdd(sensorIdToLookFor, liveData)

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

let run = async () => {

    while (1) {
        updateData(await test);
        await delay(10000);
    }
}

run();

// setInterval(function(){
//     updateData();
// },1000)