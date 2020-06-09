var passwordField = document.querySelector('.login-container .charInput:nth-child(4)');
var otherPasswordFields = document.querySelectorAll('.login-container .charInput:not(:nth-child(4))');
var registerButton = document.querySelector('.login-container input:last-child');

var passwordRules = document.querySelector('.login-container .passwordRules');

var passwordUpperCase = document.querySelector('.login-container .passwordRules li:first-child');
var passwordLowerCase = document.querySelector('.login-container .passwordRules li:nth-child(2)');
var passwordDigit = document.querySelector('.login-container .passwordRules li:nth-child(3)');
var password8Char = document.querySelector('.login-container .passwordRules li:nth-child(4)');

//hide the rules
if (passwordRules)
    passwordRules.classList.add('hideRules');

//show the rules when field is clicked
if (passwordField)
    passwordField.addEventListener('click', function (e) {
        e.preventDefault();
        // console.log('password input clicked');
        passwordRules.classList.remove('hideRules');
    });

if (passwordField)
    //show the rules when typing and check strongness
    passwordField.addEventListener('input', function (e) {
        e.preventDefault();
        console.log("string:", this.value)
        passwordCheck = {
            lowercase: false,
            uppercase: false,
            digit: false,
            _8char: false
        }

        //check uppercase lowercase digit
        function checkPasswordString(str) {
            if (/[a-z]/.test(str)) passwordCheck.lowercase = true
            else passwordCheck.lowercase = false

            if (/[A-Z]/.test(str)) passwordCheck.uppercase = true
            else passwordCheck.uppercase = false

            if (/[0-9]/.test(str)) passwordCheck.digit = true
            else passwordCheck.digit = false

            if (str.length >= 8) passwordCheck._8char = true
            else passwordCheck._8char = false
        }
        checkPasswordString(this.value)

        //make li's green if condition if met
        if (passwordCheck.lowercase) passwordLowerCase.style.color = "green"
        else passwordLowerCase.style.color = "red"

        if (passwordCheck.uppercase) passwordUpperCase.style.color = "green"
        else passwordUpperCase.style.color = "red"

        if (passwordCheck.digit) passwordDigit.style.color = "green"
        else passwordDigit.style.color = "red";

        if (passwordCheck._8char) password8Char.style.color = "green"
        else password8Char.style.color = "red";

        //enable register button if all li's are green
        function allTrue(obj) {
            for (var o in obj)
                if (!obj[o]) return false;
            return true;
        }

        console.log(allTrue(passwordCheck))

        if (allTrue(passwordCheck)) {
            registerButton.value = "Register"
            registerButton.disabled = false
        }
        else {
            registerButton.value = "Try a stronger password"
            registerButton.disabled = true
        }
        // console.log("test",passwordCheck,allTrue(passwordCheck))


        //show the password rules
        passwordRules.classList.remove('hideRules');
    });

for (let i = 0; i < otherPasswordFields.length; i++) {
    otherPasswordFields[i].addEventListener('click', function (e) {
        e.preventDefault();
        console.log('click in another input');
        passwordRules.classList.add('hideRules');
    });
    otherPasswordFields[i].addEventListener('input', function (e) {
        e.preventDefault();
        console.log('input in another field');
        passwordRules.classList.add('hideRules');
    });
}

var editButton = document.querySelectorAll('.users-table tbody > tr .edit-btn');
var editUserBox = document.querySelector('.edit-user');

// $("#role_dropdown").prop("selectedIndex", 1);

$(document).ready(function () {
    // pop up functionality
    // Listen for all clicks on the document
    document.addEventListener('click', function (event) {

        var el = event.path[0].parentNode;

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

});


// sidebar navigation

try {

    const toggleButtons = document.querySelectorAll(".toggleSidenav")
    const overlay = document.querySelector(".main-overlay")

    const nav = document.getElementById("mySidenav")

    const widthOpen = "250px"
    const widthClosed = "50px"

    document.querySelector(".open-button").addEventListener('click', function (e) {

        if (!nav.classList.contains("sidenav-opened")) {
            nav.classList.add("sidenav-opened");
            overlay.classList.remove("hidden-overlay")
            // $("#main").css({ "margin-left": "250px" })
        }

        nav.classList.remove("sidenav-closed")
        overlay.classList.remove("hidden-overlay")
        nav.classList.toggle("click-open")
        // $("#main").css({"margin-left": "50px"})

        for (var i = 0; i < toggleButtons.length; i++) toggleButtons[i].classList.toggle("hidden-button")
    })

    $("#mySidenav").hover(function () {
        // console.log("trying to hover in")
        if (!nav.classList.contains("click-open")) {
            // $("#main").css({ "margin-left": "250px" })
            nav.classList.add("sidenav-opened")
            overlay.classList.remove("hidden-overlay")
            nav.classList.remove("sidenav-closed")
            for (var i = 0; i < toggleButtons.length; i++) toggleButtons[i].classList.toggle("hidden-button")
        }
    }, function () {
        // console.log("trying to hover out")
        if (!nav.classList.contains("click-open")) {
            // $("#main").css({ "margin-left": "50px" })
            nav.classList.remove("sidenav-opened")
            overlay.classList.add("hidden-overlay")
            nav.classList.add("sidenav-closed")
            for (var i = 0; i < toggleButtons.length; i++) toggleButtons[i].classList.toggle("hidden-button")
        }
    })

    var body = document.getElementById('main');
    var except = document.getElementById('mySidenav');

    body.addEventListener("click", function () {
        if (nav.classList.contains("click-open")) {
            // $("#main").css({ "margin-left": "50px" })
            nav.classList.remove("click-open")
            nav.classList.remove("sidenav-opened")
            overlay.classList.add("hidden-overlay")
            nav.classList.add("sidenav-closed")
            for (var i = 0; i < toggleButtons.length; i++) toggleButtons[i].classList.toggle("hidden-button")
        }
    }, false);

    except.addEventListener("click", function (ev) {
        // console.log("click on sidebar");
        ev.stopPropagation(); //this is important! If removed, you'll get both alerts
    }, false);

    document.querySelector(".open-button").addEventListener("click", function (ev) {
        // console.log("click on button");
        ev.stopPropagation(); //this is important! If removed, you'll get both alerts
    }, false);
} catch (e) {
    console.warn("It looks like there is no sidebar navigation")
}

// Chart.JS
{/* <script> */ }
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
                        if ((majorUnit === 'minute' && val.second() === 0)
                            || (majorUnit === 'hour' && val.minute() === 0)
                            || (majorUnit === 'day' && val.hour() === 9)
                            || (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1)
                            || (majorUnit === 'year' && val.month() === 0)) {
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



