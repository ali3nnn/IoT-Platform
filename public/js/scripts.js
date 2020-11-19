console.log("script.js added")

import { deprecationHandler } from 'moment';
// BIG TODO: This file should be organized differently. Split code in different files.

// Start imports
import {
    allTrue,
    getDistinctValuesFromObject,
    getValuesFromObject
} from './utils.js'

// End Imports

let href = window.location.pathname

// Window loader
// ============================
$(window).on('load', function () {
    $("body").addClass("window-loaded")
})
// ============================
// END Window loader

// Init sensor form
// ============================

if (href.includes('init')) {

    if (userData_raw.length)
        $("form.location-container").append(`<input type="charInput" class='hidden' name="company" placeholder="Company" value="` + userData_raw[0].createdBy + `"/>`)

    $("form.location-container #zone").on('input', function (e) {
        const optionSelected = $("option:selected", this)[0].text
        if (optionSelected != 'Nothing selected') {
            const zoneId = optionSelected.split('/')[0]
            const location1 = optionSelected.split('/')[1]
            const location2 = optionSelected.split('/')[2]
            const location3 = optionSelected.split('/')[3]
            $("form.location-container input[name=zoneId]").attr("value", zoneId)
            $("form.location-container input[name=location1]").attr("value", location1)
            $("form.location-container input[name=location2]").attr("value", location2)
            $("form.location-container input[name=location3]").attr("value", location3)
            $("form.location-container input[name=location1]").attr("readonly", 'readonly')
            $("form.location-container input[name=location2]").attr("readonly", 'readonly')
            $("form.location-container input[name=location3]").attr("readonly", 'readonly')
        } else {
            $("form.location-container input[name=zoneId]").attr("value", '')
            $("form.location-container input[name=location1]").attr("value", '')
            $("form.location-container input[name=location2]").attr("value", '')
            $("form.location-container input[name=location3]").attr("value", '')
            $("form.location-container input[name=location1]").attr("readonly", false)
            $("form.location-container input[name=location2]").attr("readonly", false)
            $("form.location-container input[name=location3]").attr("readonly", false)
        }
    });

}

// ============================
// END Init sensor form

// $("#role_dropdown").prop("selectedIndex", 1);

function eventPath(evt) {
    var path = (evt.composedPath && evt.composedPath()) || evt.path,
        target = evt.target;

    if (path != null) {
        // Safari doesn't include Window, but it should.
        return (path.indexOf(window) < 0) ? path.concat(window) : path;
    }

    if (target === window) {
        return [window];
    }

    function getParents(node, memo) {
        memo = memo || [];
        var parentNode = node.parentNode;

        if (!parentNode) {
            return memo;
        } else {
            return getParents(parentNode, memo.concat(parentNode));
        }
    }

    return [target].concat(getParents(target), window);
}

$(document).ready(function () {
    // pop up functionality
    // Listen for all clicks on the document
    document.addEventListener('click', function (event) {

        var path = event.path || (event.composedPath && event.composedPath());

        var el

        if (path) {
            // You got some path information

            //Old Way
            // var el = event.path[0].parentNode;

            // New Way
            var el = eventPath(event)[0].parentNode
        } else {
            // This browser doesn't supply path information
        }



        if (el.classList.contains("popup")) {
            $(".show").removeClass("show")
            el.classList.toggle("show")
        }

        // If the click happened inside the the container, bail
        if (!event.target.closest(".popup")) {
            // console.log(el)
            $(".show").removeClass("show")
            // console.log("click outside")
        } else {
            // el.addClass("show")
            // console.log("click inside")
        }

    }, false);


    try {
        // var childs = $(".small-box-container").children().length;
        // $(".small-box-container").addClass("children-" + String(childs))
    } finally {

    }

});

// Main navbar trick
// TODO: find a better solution
// ================================
try {

    var toggleButtons = document.querySelectorAll(".toggleSidenav")
    var openButton = document.querySelector(".open-button");
    var overlay = document.querySelector(".main-overlay")
    var asideLinks = document.querySelectorAll(".sidenav-wrapper a")

    var sidenav = document.getElementById("mySidenav")
    var mainbody = document.getElementById("main")

    var body = document.getElementById('main');
    var except = document.getElementById('mySidenav');

    var flagOpenMenu = false
    var flagCloseMenu = false

    var widthOpen = "250px"
    var widthClosed = "50px"

    // sidebar navigation
    function openedFinal() {
        setTimeout(function () {
            sidenav.classList.add("sidenav-opened-final");
            sidenav.classList.remove("sidenav-closed-final");
        }, 150)
    }

    function closedFinal() {
        // setTimeout(function () {
        sidenav.classList.remove("sidenav-opened-final");
        sidenav.classList.add("sidenav-closed-final");
        // }, 200)
    }

    // Check if mobile to wrap sidenav or not

    // Run at first load
    $(window).on('load', function () {

        let addBodyClass = function () {
            // var date = new Date();
            // var date = date.getTime()
            // console.log(date,(date-date_1)/1000)
            $("body").addClass("window-loaded")
        }

        if (sidenav) {
            if (window.innerWidth > 991) {
                if (!sidenav.classList.contains("sidenav-opened")) {
                    // openButton.click()
                    // var date_1;

                    let openButtonClick = function (callback) {
                        // date_1 = new Date();
                        // date_1 = date_1.getTime()
                        // console.log(date_1)
                        openButton.click();
                        setTimeout(function () {
                            callback()
                        }, 150)
                    }
                    openButtonClick(addBodyClass)
                }
            } else {
                closedFinal.bind()();
                addBodyClass()
            }
        }

    })

    // Run when resize and onload
    $(window).resize(function () {

        if (window.innerWidth > 991) {
            // console.log(">",window.innerWidth)
            // if sidenav is closes
            if (!sidenav.classList.contains("sidenav-opened")) {
                openButton.click()
            }
        } else {
            // console.log("<",window.innerWidth)
            // if sidebar is closed
            if (!sidenav.classList.contains("sidenav-opened")) {

            }
            // if sidebar is opened
            else {
                overlay.click();

            }
        }
    });
    // End Check if mobile to wrap sidenav or not

    // if (window.innerWidth <= 991) {
    openButton.addEventListener('click', function () {

        let date = new Date()
        date = date.getMilliseconds()
        // console.log("opened click:", date)

        if (!sidenav.classList.contains("sidenav-opened")) {
            sidenav.classList.add("sidenav-opened");
            overlay.classList.remove("hidden-overlay")
            if (mainbody.getBoundingClientRect().width > 500) {
                mainbody.classList.add("pl-250")
                mainbody.classList.remove("pl-50")
            }
        }

        sidenav.classList.remove("sidenav-closed")
        overlay.classList.remove("hidden-overlay")
        // mainbody.classList.remove("pl-250")
        // mainbody.classList.add("pl-50")
        sidenav.classList.toggle("click-open")

        // $("#main").css({"margin-left": "50px"})

        for (var i = 0; i < toggleButtons.length; i++)
            toggleButtons[i].classList.toggle("hidden-button")

        openedFinal.bind()();
    })

    if (window.innerWidth <= 991)
        $("#mySidenav").hover(function () {

            // console.log("trying to hover in")
            if (!sidenav.classList.contains("click-open")) {
                // $("#main").css({ "margin-left": "250px" })
                sidenav.classList.add("sidenav-opened")
                if (mainbody.getBoundingClientRect().width > 500) {
                    mainbody.classList.add("pl-250")
                    mainbody.classList.remove("pl-50")
                }
                overlay.classList.remove("hidden-overlay")
                sidenav.classList.remove("sidenav-closed")
                for (var i = 0; i < toggleButtons.length; i++)
                    toggleButtons[i].classList.toggle("hidden-button")
            }
            openedFinal.bind()();
        }, function () {
            // console.log("trying to hover out")
            if (!sidenav.classList.contains("click-open")) {
                closedFinal();
                // $("#main").css({ "margin-left": "50px" })
                sidenav.classList.remove("sidenav-opened")
                if (mainbody.getBoundingClientRect().width > 500) {
                    mainbody.classList.remove("pl-250")
                    mainbody.classList.add("pl-50")
                }
                overlay.classList.add("hidden-overlay")
                sidenav.classList.add("sidenav-closed")
                for (var i = 0; i < toggleButtons.length; i++)
                    toggleButtons[i].classList.toggle("hidden-button")
            }
        })

    body.addEventListener("click", function () {
        if (window.innerWidth <= 991)
            if (sidenav.classList.contains("click-open")) {
                closedFinal();
                sidenav.classList.remove("click-open")
                sidenav.classList.remove("sidenav-opened")
                if (mainbody.getBoundingClientRect().width > 500) {
                    mainbody.classList.remove("pl-250")
                    mainbody.classList.add("pl-50")
                }
                overlay.classList.add("hidden-overlay")
                sidenav.classList.add("sidenav-closed")
                for (var i = 0; i < toggleButtons.length; i++)
                    toggleButtons[i].classList.toggle("hidden-button")
            }
    });

    except.addEventListener("click", function (ev) {
        // console.log("click on sidebar");
        ev.stopPropagation(); //this is important! If removed, you'll get both alerts
    }, false);

    document.querySelector(".open-button").addEventListener("click", function (ev) {
        // console.log("click on button");
        ev.stopPropagation(); //this is important! If removed, you'll get both alerts
    }, false);
    // }

} catch (e) {
    console.warn("It looks like there is no sidebar navigation")
}
// ================================
// END Main navbar trick

// Chart.JS
{
    /* <script> */
}
// chartIt('temperature_1')

function chartIt(selector) {
    var ctx = document.getElementById(selector).getContext('2d');

    xLabels = [20, 30, 25, 40]
    yLabel = [2020, 2019, 2018, 2017]

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yLabel,
            datasets: [{
                label: 'Average Temperature',
                data: xLabels,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
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

// CARD DATA FETCH
// ========================================
// $("#chart-customizer").ready(function () {
//     let loader = `<div class="boxLoading">Loading...</div>`;
//     document.getElementById('chart-customizer').innerHTML = loader;
//     fetch('https://jsonplaceholder.typicode.com/todos/1')
//         .then(response => response.json())
//         .then(json => {
//             console.log(json)
//             const str = JSON.stringify(json, null, 2)
//             console.log(str)
//             let result = `<h2> Result: </h2><br>`;
//             result += `<p>User id:${json.userId} </p><br>`
//             result += `<p>Title:${json.title} </p>`
//             $(".boxLoading").remove()
//             $('#chart-customizer').append(result)
//         }).catch((e)=>{
//             console.warn(e.message)
//         })
// })
// ========================================
// End CARD DATA FETCH

// chart_TimeSeries('timeseries_1', generateData())

// not used
function chart_TimeSeries(selector, data) {
    var ctx = document.getElementById(selector).getContext('2d');
    var color = Chart.helpers.color;
    var cfg = {
        data: {
            datasets: [{
                label: 'Timeseries chart',
                backgroundColor: "red",
                borderColor: "black",
                data: data,
                type: 'line',
                pointRadius: 0,
                fill: false,
                lineTension: 0,
                borderWidth: 2
            }]
        },
        options: {
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'series',
                    offset: true,
                    ticks: {
                        major: {
                            enabled: true,
                            fontStyle: 'bold'
                        },
                        source: 'data',
                        autoSkip: true,
                        autoSkipPadding: 75,
                        maxRotation: 0,
                        sampleSize: 100
                    },
                    afterBuildTicks: function (scale, ticks) {
                        var majorUnit = scale._majorUnit;
                        var firstTick = ticks[0];
                        var i, ilen, val, tick, currMajor, lastMajor;

                        val = moment(ticks[0].value);
                        if ((majorUnit === 'minute' && val.second() === 0) ||
                            (majorUnit === 'hour' && val.minute() === 0) ||
                            (majorUnit === 'day' && val.hour() === 9) ||
                            (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1) ||
                            (majorUnit === 'year' && val.month() === 0)) {
                            firstTick.major = true;
                        } else {
                            firstTick.major = false;
                        }
                        lastMajor = val.get(majorUnit);

                        for (i = 1, ilen = ticks.length; i < ilen; i++) {
                            tick = ticks[i];
                            val = moment(tick.value);
                            currMajor = val.get(majorUnit);
                            tick.major = currMajor !== lastMajor;
                            lastMajor = currMajor;
                        }
                        return ticks;
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawBorder: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Closing price ($)'
                    }
                }]
            },
            tooltips: {
                intersect: false,
                mode: 'index',
                callbacks: {
                    label: function (tooltipItem, myData) {
                        var label = myData.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += parseFloat(tooltipItem.value).toFixed(2);
                        return label;
                    }
                }
            }
        }
    };

    var chart = new Chart(ctx, cfg);
}

function generateData() {
    // var unit = document.getElementById('unit').value;
    const unit = 'Day'

    function unitLessThanDay() {
        return unit === 'second' || unit === 'minute' || unit === 'hour';
    }

    function beforeNineThirty(date) {
        return date.hour() < 9 || (date.hour() === 9 && date.minute() < 30);
    }

    // Returns true if outside 9:30am-4pm on a weekday
    function outsideMarketHours(date) {
        if (date.isoWeekday() > 5) {
            return true;
        }
        if (unitLessThanDay() && (beforeNineThirty(date) || date.hour() > 16)) {
            return true;
        }
        return false;
    }

    function randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomBar(date, lastClose) {
        var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
        var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
        return {
            t: date.valueOf(),
            y: close
        };
    }

    var date = moment('Jan 01 1990', 'MMM DD YYYY');
    var now = moment();
    var data = [];
    var lessThanDay = unitLessThanDay();
    for (; data.length < 600 && date.isBefore(now); date = date.clone().add(1, unit).startOf(unit)) {
        if (outsideMarketHours(date)) {
            if (!lessThanDay || !beforeNineThirty(date)) {
                date = date.clone().add(date.isoWeekday() >= 5 ? 8 - date.isoWeekday() : 1, 'day');
            }
            if (lessThanDay) {
                date = date.hour(9).minute(30).second(0);
            }
        }
        data.push(randomBar(date, data.length > 0 ? data[data.length - 1].y : 30));
    }

    return data;
}

// chart_lineboundaries('timeseries_1')

function chart_lineboundaries(selector) {

    var presets = window.chartColors;
    var utils = Samples.utils;
    var inputs = {
        min: -100,
        max: 100,
        count: 8,
        decimals: 2,
        continuity: 1
    };

    function generateData(config) {
        return utils.numbers(Chart.helpers.merge(inputs, config || {}));
    }

    function generateLabels(config) {
        return utils.months(Chart.helpers.merge({
            count: inputs.count,
            section: 3
        }, config || {}));
    }

    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        elements: {
            line: {
                tension: 0.000001
            }
        },
        plugins: {
            filler: {
                propagate: false
            }
        },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 0
                }
            }]
        }
    };

    [false, 'origin', 'start', 'end'].forEach(function (boundary, index) {

        // reset the random seed to generate the same data for all charts
        utils.srand(8);

        new Chart(selector, {
            type: 'line',
            data: {
                labels: generateLabels(),
                datasets: [{
                    backgroundColor: utils.transparentize(presets.red),
                    borderColor: presets.red,
                    data: generateData(),
                    label: 'Dataset',
                    fill: boundary
                }]
            },
            options: Chart.helpers.merge(options, {
                title: {
                    text: 'fill: ' + boundary,
                    display: true
                }
            })
        });
    });

}

// Comment the following line if you don't want notification to be on all pages
animationInNotification()

function animationInNotification() {
    setTimeout(50, $(".messages").animate({
        right: "0px",
        opacity: "1",
        visibility: "visible"
    }))
}

// navigator.usb.getDevices()
// .then(device => {
//   console.log(device.productName);      // "Arduino Micro"
//   console.log(device.manufacturerName); // "Arduino LLC"
// })
// .catch(error => { console.log(error); });


// if (!('usb' in navigator)) throw new Error("Browser does not support WebUSB");

// navigator.usb.getDevices()
//   .then(devices => {
//     const report = "<p>Total devices: " + devices.length + "</p><ul>" + devices.map(d => {
//       return "<li>Product name: " + device.productName + ", serial number " + device.serialNumber + "</li>";
//     }).join('\n') + "</ul>";
//     console.log("report",report)
//     DemoUtils.reportDemoResult(true);
//   })
//   .catch(e => DemoUtils.reportDemoResult(false, {resultDetail: e.toString()}));

// customTimelineCalendar()

// function customTimelineCalendar() {
//     $("#graph-calendar button").click(function(){
//         console.log("test")
//     })
// }

// Async timeout
// let timeout = (ms,f) => {
//     let sleep =  new Promise(resolve => setTimeout(function(){
//         f()
//         // return resolve
//     }, ms))
// }

function timeout(ms, f) {
    let sleep = new Promise(resolve => setTimeout(function () {
        f()
        // return resolve
    }, ms))
}

// Test async timeout
timeout(3000, function () {
    console.log("3 seconds async timeout")
})

// Set the minimum height of the sidebar
var infos = () => {
    var brandH = $("#mySidenav .brand").height();
    var basicItemsCounter = $("#mySidenav .basicItems").length;
    var basicItemsH = $("#mySidenav .basicItems").height();
    var zoneLisH = $("#mySidenav .zone-list").height();
    var settingItemsH = $("#mySidenav .settings-items").height();
    console.log(brandH, basicItemsCounter, basicItemsH, zoneLisH, settingItemsH)
}