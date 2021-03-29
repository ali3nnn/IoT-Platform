"use strict";

var _utils = require("./utils.js");

var _dashboardComponents = require("./dashboard-components");

// Imports
// ======================================================
// import { deprecationHandler } from 'moment'
var humanizeDuration = require("humanize-duration");

var _ = require('lodash');

window.lodash = _;

function clearLocation(sensorId) {
  fetch("/api/v3/save-position?x=NULL&y=NULL&sensor=".concat(sensorId));
}

var checkOnlineStatus = function checkOnlineStatus() {
  var online;
  return regeneratorRuntime.async(function checkOnlineStatus$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch("www.google.ro"));

        case 3:
          online = _context.sent;
          return _context.abrupt("return", online.status >= 200 && online.status < 300);

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", false);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // let internetConection = false
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


var alertSound = new Audio('/sound/alert.wav');
alertSound.loop = true;

function playAlert() {
  alertSound.play();
}

function stopAlert() {
  alertSound.pause();
  alertSound.currentTime = 0;
} // let confirmationSound = new Audio('/sound/confirmation-sound.wav')


var confirmationSound = new Audio('/sound/switch.wav');
confirmationSound.loop = false;

function playButtonSound() {
  confirmationSound.play();
  (0, _utils.timeoutAsync)(1000, stopButtonSound);
}

function stopButtonSound() {
  confirmationSound.pause();
  confirmationSound.currentTime = 0;
}

window.alertSound = alertSound;
window.confirmationSound = confirmationSound;
window.playButtonSound = playButtonSound; // ======================================================
// Fetch sensor data
// ======================================================

var getSensorData = function getSensorData(id, type) {
  var response;
  return regeneratorRuntime.async(function getSensorData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/get-sensor-data?id=" + id + "&type=" + type));

        case 2:
          response = _context2.sent;
          return _context2.abrupt("return", response.json());

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // ======================================================
// ======================================================


function updateDataForChart(sensor) {
  var sensorData = JSON.stringify(sensor.sensorData);
  $("article.graph-" + sensor.sensorMeta.sensorId).attr("sensorData", sensorData);
} // ======================================================
// Add different components
// ======================================================


function defaultSensorView(sensor) {
  // console.log(sensor)
  // window.sensor = sensor
  // sensorId = String(sensorId)
  var sensorData = JSON.stringify(sensor.sensorData); // console.log(sensor.sensorMeta.sensorId,sensor.sensorMeta.battery)
  // Sensor state 0/1/2/3,4

  var alertClass2 = '';

  if (sensor.sensorMeta.alerts == 1) {
    alertClass2 = 'alert-active';
  } else if (sensor.sensorMeta.alerts == 2) {
    alertClass2 = 'alarm-active';
  } else if ([3, 4].includes(sensor.sensorMeta.alerts) && sensor.sensorMeta.battery == 1) alertClass2 = 'no-power'; // stack the components


  if (['counter'].includes(sensor.sensorMeta.sensorType)) {
    return (0, _dashboardComponents.newItemLive)(sensor) + (0, _dashboardComponents.graphView)(sensor, sensorData);
  } else if (['door'].includes(sensor.sensorMeta.sensorType)) {
    return (0, _dashboardComponents.doorLive)(alertClass2, sensor) + (0, _dashboardComponents.graphView)(sensor, sensorData);
  } else if (['temperature'].includes(sensor.sensorMeta.sensorType)) {
    return (0, _dashboardComponents.currentValueView)(alertClass2, sensor) + (0, _dashboardComponents.graphView)(sensor, sensorData);
  } else if (['conveyor'].includes(sensor.sensorMeta.sensorType)) {
    // $("body").addClass("conveyor-main-dashboard")
    // console.log(sensor.sensorMeta.sensorId, sensor.sensorMeta.status)
    return (0, _dashboardComponents.conveyor)(sensor, sensorData);
  }
} // ======================================================
// Triggers [activate triggers when sensor are loading]
// ======================================================


function triggerSensorView(sensorId, sensor) {
  // Expand settings panel
  $(".live-card-" + sensorId + " .card-settings-button").on('click', function () {
    $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up');
    $(this).parent().parent().children('.card-body').toggleClass('blur8');
    $(this).parent().parent().children('.card-header').toggleClass('blur8'); // alertsAndLocationLoad()
  }); // Close settings pane

  $(".live-card-" + sensorId + "  .card-settings-button-inner").on('click', function () {
    $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up');
    $(this).parent().parent().children('.card-body').toggleClass('blur8');
    $(this).parent().parent().children('.card-header').toggleClass('blur8');
  }); // Save settings

  $(".live-card-" + sensorId + " .card-settings-button-update").on('click', function () {
    saveSensorSettings(sensorId);
  }); // Edit sensor name

  $('article[sensorid="' + sensorId + '"] .card-title .edit-sensor-name').on('click', function (event) {
    var name = prompt('Type a new name for ' + sensorId, $('article[sensorid="' + sensorId + '"] .card-title span').text());

    if (name && sensorId) {
      var params = new URLSearchParams({
        name: name,
        sensorId: sensorId
      });
      var url = "/api/v3/set-sensor-name?" + params.toString(); // console.log(url)

      $.ajax({
        url: url,
        type: 'GET'
      }).done(function (result) {
        // console.log(result.msg)
        if (result.msg == "Update performed") {
          $('article[sensorid="' + sensorId + '"] .card-title span').html(name);
        } // let res = result.json()
        // console.log(res.msg)

      });
    }
  }); // Trigger calendar

  var currentHourPm = moment().format("HH");
  var currentMin = moment().format("mm"); // var start = moment().subtract(currentHourPm, 'hours').subtract(currentMin, 'minutes');
  // var end = moment();
  // console.log("Trigger loaded for:", sensorId)

  $('.' + sensorId + '-card #reportrange').daterangepicker({
    timePicker: true,
    "timePicker24Hour": true,
    startDate: moment().startOf('hour').subtract(currentHourPm, 'hour'),
    endDate: moment().startOf('hour').add(24 - currentHourPm, 'hour')
  }, callback);

  function callback(start, end) {
    start = start.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z';
    end = end.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'; // console.log("Calendar for:",sensorId,start,end)

    reloadDataCustomCalendar(start, end, sensorId);
  } // callback(start, end);
  // Trigger for CSV button


  $("article.graph-" + sensorId + " #report").on('click', function (e) {
    var sensorData = $("article.graph-" + sensorId).attr("sensorData");
    var sensorType = $("article.graph-" + sensorId).attr("sensorType");
    sensorData = JSON.parse(sensorData);
    var filename = "Report-" + String(sensorId) + ".csv";
    (0, _utils.downloadCSV)({
      filename: filename,
      xlabels: (0, _utils.getValuesFromObject)('time', sensorData),
      ylabels: (0, _utils.getValuesFromObject)('value', sensorData),
      sensorType: sensorType
    });
  }); // Event listener for attribute seconds on conveyor usageTotal and usageTotal

  var usageToday = document.querySelector('.controller-' + sensorId + ' .usage-today');
  var usageTotal = document.querySelector('.controller-' + sensorId + ' .usage-total');
  var observer;

  if (usageTotal && usageToday) {
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type == "attributes" && mutation.attributeName == "seconds") {
          // TODAY
          var secondsToday = usageToday.getAttribute(mutation.attributeName);
          var resultToday = humanizeDuration(secondsToday * 1000, {
            language: "en",
            spacer: "",
            // units: ["h", "m", "s"],
            units: ["h", "m"],
            round: true
          }); // console.log("resultToday", resultToday)

          resultToday = resultToday.replaceAll("hours", "h");
          resultToday = resultToday.replaceAll("hour", "h");
          resultToday = resultToday.replaceAll("minutes", "m");
          resultToday = resultToday.replaceAll("minute", "m");
          resultToday = resultToday.replaceAll("seconds", "s");
          resultToday = resultToday.replaceAll("second", "s");
          resultToday = resultToday.replaceAll(",", ""); // console.log("resultToday",resultToday)

          $('.conveyor-info-message', usageToday).html(resultToday); // TOTAL

          var secondsTotal = usageTotal.getAttribute(mutation.attributeName);
          var resultTotal = humanizeDuration(secondsTotal * 1000, {
            language: "en",
            spacer: "",
            // units: ["h", "m", "s"],
            units: ["h", "m"],
            round: true
          });
          resultTotal = resultTotal.replaceAll("hours", "h");
          resultTotal = resultTotal.replaceAll("hour", "h");
          resultTotal = resultTotal.replaceAll("minutes", "m");
          resultTotal = resultTotal.replaceAll("minute", "m");
          resultTotal = resultTotal.replaceAll("seconds", "s");
          resultTotal = resultTotal.replaceAll("second", "s");
          resultTotal = resultTotal.replaceAll(",", "");
          $('.conveyor-info-message', usageTotal).html(resultTotal);
        }
      });
    });
    observer.observe(usageToday, {
      attributes: true //configure it to listen to attribute changes

    });
    observer.observe(usageTotal, {
      attributes: true //configure it to listen to attribute changes

    });
  } // Switch conveyor


  $('.controller-' + sensorId + ' .cb-value').on('click', function (event) {
    var isclick = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'active';
    // UI confirmation sound
    playButtonSound();
    var mainParent = $(this).parent('.state-btn-inner'); // console.log(isclick)
    // if button is RED - conveyor stop

    if ($(mainParent).hasClass('active') == false) {
      $(mainParent).addClass('active'); // make button green

      $('.conveyor-layout-inner > div.sensor-item').draggable("enable");

      if (isclick == 'active') {
        // if button is pressed directly
        // send 1 to mqtt
        (0, _utils.sendMessage)("socketChannel", {
          topic: 'anygo/conveyor',
          message: JSON.stringify({
            username: username,
            sensorId: sensorId,
            "status": 1
          })
        }); // do not let conveyor run with gate open
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

        $('.controller-' + sensorId + ' .state-button .conveyor-info-message').html("RUN"); //     // update seconds
        //     conveyorUsage(sensorId)
        // }
        // }
      } // if button is GREEN - conveyor run

    } else {
      $(mainParent).removeClass('active'); // make button red

      $('.conveyor-layout-inner > div.sensor-item').draggable("disable");

      if (isclick == 'active') {
        // if button is pressed directly
        // send 0 to mqtt
        (0, _utils.sendMessage)("socketChannel", {
          topic: 'anygo/conveyor',
          message: JSON.stringify({
            username: username,
            sensorId: sensorId,
            "status": 0
          })
        });
        $(".state-btn-inner > input").attr("disabled", true); // SEND STOP TO MQTT 2 TIMES
        // ---------------

        var intervalGap = 2000;
        var stopInterval = setInterval(function () {
          console.log("send stop one more time");
          (0, _utils.sendMessage)("socketChannel", {
            topic: 'anygo/conveyor',
            message: JSON.stringify({
              username: username,
              sensorId: sensorId,
              "status": 0
            })
          });
        }, intervalGap);
        setTimeout(function () {
          console.log("stop sender is cleared");
          clearInterval(stopInterval);
          $(".state-btn-inner > input").attr("disabled", false);
        }, intervalGap * 5); // ---------------
        // END STOP WORKAROUND
      } // set info msg


      $('.controller-' + sensorId + ' .state-button .conveyor-info-message').html("STOP"); // stop update seconds

      clearInterval(window.usageInterval);
    }
  }); // Make sensor draggable

  $(".draggable[sensor='" + sensorId + "']").draggable({
    grid: [5, 5],
    create: function create(event, ui) {
      $(this).css('top', sensor.sensorMeta.y);
      $(this).css('left', sensor.sensorMeta.x);
    },
    stop: function stop(event, ui) {
      var sensorId = $(this).attr('sensor'); // Update position of sensor on map

      fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(function (result) {
        console.log("position saved", sensorId, ui.position);
      });
    }
  }); // Append conveyor items to map

  $(".new-items-conveyor .sensor-item[sensor='" + sensorId + "']").on('click', function () {
    // Clone & append
    var sensorCloned = $(".new-items-conveyor .sensor-item[sensor=" + sensorId + "]").clone();
    $(".conveyor-layout-inner").append(sensorCloned);
    $(".new-items-conveyor .sensor-item[sensor=" + sensorId + "]").remove();
    $(".conveyor-layout-inner .sensor-item[sensor=" + sensorId + "]").addClass("draggable");
    $(".draggable[sensor='" + sensorId + "']").draggable({
      grid: [5, 5],
      create: function create(event, ui) {
        $(this).css('top', sensor.sensorMeta.y);
        $(this).css('left', sensor.sensorMeta.x);
      },
      stop: function stop(event, ui) {
        var sensorId = $(this).attr('sensor'); // Update position of sensor on map

        fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(function (result) {
          console.log("position saved", sensorId, ui.position);
        });
      }
    });
  });
} // ======================================================
// [ ] TODO: trebuie rezolvat cu timpul de folosire a conveiorului
//           sa se updateze odata la un minut in mysql, dar nu din front-end
// functia updateaza attributul seconds


var conveyorUsage = function conveyorUsage(sensorId) {
  // Start counter
  var usageToday = $('.controller-' + sensorId + ' .usage-today').attr("seconds");
  var usageTotal = $('.controller-' + sensorId + ' .usage-total').attr("seconds");
  usageToday = parseInt(usageToday);
  usageTotal = parseInt(usageTotal); // console.log(usageToday, usageTotal)

  var makeUsage = function makeUsage() {
    usageToday += 1;
    usageTotal += 1;
    $('.controller-' + sensorId + ' .usage-today').attr("seconds", usageToday);
    $('.controller-' + sensorId + ' .usage-total').attr("seconds", usageTotal); // console.log("usageToday:", humanizeDuration(usageToday * 1000, {
    //     language: "en",
    //     spacer: "",
    //     units: ["h", "m", "s"],
    //     // units: ["h", "m"],
    //     round: true
    // }))
  };

  window.usageInterval = setInterval(makeUsage, 1 * 1000); // each 1 second usage is increased 
};

var reloadDataCustomCalendar = function reloadDataCustomCalendar(start, end, sensorId) {
  return regeneratorRuntime.async(function reloadDataCustomCalendar$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // [*] TODO: Get data for new date
          // [*] TODO: Reload the chart with new data
          getSensorDataCustomInterval(sensorId, start, end);

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}; // get and plot data by a specific interval
// ======================================================


var getSensorDataCustomInterval = function getSensorDataCustomInterval(sensor, start, end) {
  var url;
  return regeneratorRuntime.async(function getSensorDataCustomInterval$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!$("body").hasClass("calendar-active")) {
            $("body").addClass("calendar-active");
          } // console.log("calendar-active for ",sensor)


          $("article.graph-" + sensor).addClass("calendar-active"); // Building the url

          url = "/api/v3/get-interval?sensorId=" + sensor + "&start=" + start + "&end=" + end; // Making the request

          $.ajax({
            url: url,
            type: 'GET'
          }).done(function (msg) {
            // Insert data into attributes of html element
            var sensorData = JSON.stringify(msg.result); // console.log("initial attr:", $("article.graph-"+sensor).attr("sensorData"))

            $("article.graph-" + sensor).attr("sensorData", sensorData); // console.log("after attr:", $("article.graph-"+sensor).attr("sensorData"))
            // Split the dataset

            var values = (0, _utils.getValuesFromObject)('value', msg.result);
            var timestamps = (0, _utils.getValuesFromObject)('time', msg.result); // Process the dataset

            timestamps = timestamps.map(function (time) {
              return time.replace('Z', '');
            });
            values = values.map(function (value) {
              return value ? value.toFixed(1) : value;
            }); // Main

            chartList.forEach(function (chart) {
              var chartId = chart.canvas.id.split('-')[0];

              if (chartId == sensor) {
                // Update dataset
                chart.data.datasets[0].data = values;
                chart.data.labels = timestamps; // Update options

                chart.options.scales.xAxes[0].time.unit = 'day'; // Perform update

                chart.update();
              }
            });
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
}; // ======================================================
// Create chart
// ======================================================
// Global chart list


var chartList = [];

function plotData(sensorId) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'attr';

  // [*] TODO: skip charts witch class .calendar-active
  // console.log($("article.graph-" + sensorId)[0].className)
  if ($("article.graph-" + sensorId).hasClass("calendar-active")) {
    return;
  }

  if ($("article.graph-" + sensorId).length == 0) {
    return;
  } // [*] TODO: check source attr
  // [*] TODO: get data
  // [ ] TODO: display data


  if (source == 'attr') {
    // this source should run only when page is loaded
    // Get Data
    var rawData = $("article.graph-" + sensorId).attr("sensorData");
    var sensorType = $("article.graph-" + sensorId).attr("sensorType"); // console.log(rawData)

    var sensorData; // if(rawData != undefined)

    sensorData = JSON.parse(rawData); // console.log(sensorData)
    // Add Canvas for chart

    $("article.graph-" + sensorId + " .card-body a.spinner").remove();

    if ($("article.graph-" + sensorId + " .card-body canvas#" + sensorId + "-graph")) {
      $("article.graph-" + sensorId + " .card-body canvas#" + sensorId + "-graph").remove();
    }

    $("article.graph-" + sensorId + " .card-body").append("<canvas id=\"" + sensorId + "-graph\"></canvas>"); // Plot w/ Chart.js

    var canvas = $("canvas#" + sensorId + "-graph")[0].getContext("2d");
    var labels = (0, _utils.getValuesFromObject)('time', sensorData);
    var data = (0, _utils.getValuesFromObject)('value', sensorData); // General options of timeseries chart

    var options = {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      drawBorder: false,
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,
        mode: 'index',
        intersect: false,
        custom: function custom(tooltipModel) {
          // Tooltip Element
          var tooltipEl = document.getElementById('chartjs-tooltip');
          var sensorType = chart.titleBlock.chart.config.data.datasets[0].label; // Create element on first render

          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table class="custom_tooltip ' + sensorType + '_tooltip"></table>';
            document.body.appendChild(tooltipEl);
          } // Hide if no tooltip


          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          } // Set caret Position


          tooltipEl.classList.remove('above', 'below', 'no-transform');

          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          } // Set Text


          if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            titleLines = titleLines.map(function (title) {
              return title.replace("T", " ").split(".")[0];
            });
            var bodyLines = tooltipModel.body.map(getBody); // Special text for DOOR type

            if (sensorType == 'door') {
              var state = bodyLines[0][0].split(":")[1];

              if (state == 1) {
                bodyLines[0][0] = "closed";
              } else {
                bodyLines[0][0] = "open";
              }
            }

            var innerHtml = '<thead>';
            titleLines.forEach(function (title) {
              innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';
            bodyLines.forEach(function (body, i) {
              var colors = tooltipModel.labelColors[i];
              var style = 'background:' + colors.backgroundColor; // var style = 'background: white';

              style += '; border-color:' + colors.borderColor;
              style += '; border-width: 2px';
              style += '; color: white';
              var span = '<span style="' + style + '"></span>';
              innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';
            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          } // `this` will be the overall tooltip


          var position = this._chart.canvas.getBoundingClientRect(); // console.log(position.left, window.pageXOffset, tooltipModel.caretX, this._chart.width)
          // Display, position, and set styles for font


          tooltipEl.style.opacity = 1;
          tooltipEl.style.position = 'absolute'; // Switch side of tooltip

          if (this._chart.width - tooltipModel.caretX - 20 > tooltipModel.width) {
            tooltipEl.style.left = 20 + position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          } else {
            tooltipEl.style.left = -tooltipModel.width + position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          } // tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';


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
            }
          },
          distribution: 'series',
          gridLines: {
            color: "rgba(0, 0, 0, 0)"
          },
          ticks: {
            fontColor: 'white',
            source: 'auto' // min: labels[labels.length - 1],
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
    };
    var chartColors = {
      red: 'rgba(255,0,0,1)',
      red2: 'rgba(255,0,0,0.2)',
      red5: 'rgba(255,0,0,0.5)',
      blue: 'rgba(51, 153, 255,1)',
      blue2: 'rgba(51, 153, 255,0.2)',
      blue5: 'rgba(51, 153, 255,0.5)',
      yellow: 'rgba(255, 193, 7,1)',
      yellow2: 'rgba(255, 193, 7,0.2)'
    }; // END General ptions of timeseries chart
    // remap labels and data

    labels = labels.map(function (time) {
      return time.replace('Z', '');
    });
    data = data.map(function (value) {
      return value ? Math.round(value * 10) / 10 : value;
    }); // end remap labels and data
    // Build arrays of colors

    var backgroundColor = [];
    var pointBackgroundColor = [];
    var borderColor = [];
    var pointRadius = [];
    if (labels.length) labels.forEach(function (item, index) {
      backgroundColor.push(chartColors.blue2);
      pointBackgroundColor.push(chartColors.blue);
      borderColor.push(chartColors.blue);
      pointRadius.push(2);
    });else {
      backgroundColor = chartColors.blue2;
      pointBackgroundColor = chartColors.blue;
      borderColor = chartColors.blue;
    } // end build arrays of colors
    // Graph view config general

    var datasetConfig = {
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      pointBorderColor: '#343a40',
      pointBackgroundColor: pointBackgroundColor,
      pointHoverBackgroundColor: "#ffc107",
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBorderWidth: 1,
      borderWidth: 1,
      lineTension: 0.2
    }; // console.log(pointRadius)
    // Graph view config for door

    if (sensorType == 'door') {
      datasetConfig.lineTension = 0;
      datasetConfig.pointRadius = pointRadius; // datasetConfig.pointHoverRadius = pointRadius.map(item => item + 2)

      datasetConfig.pointBorderWidth = 1;
      datasetConfig.borderWidth = 1;
      options.scales.yAxes[0].ticks['max'] = 1;
      options.scales.yAxes[0].ticks['min'] = 0;
    } // Add graph config


    var type, datasets;
    type = 'line';
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
    }]; // }
    // end TYPE of CHART based on sensorType

    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
      draw: function draw(ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          var activePoint = this.chart.tooltip._active[0],
              ctx = this.chart.ctx,
              x = activePoint.tooltipPosition().x,
              y = activePoint.tooltipPosition().y,
              topY = activePoint.tooltipPosition().y,
              bottomY = this.chart.scales['y-axis-0'].bottom; // console.log(x, y, topY, bottomY)
          // draw line

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, 32);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1;
          ctx.strokeStyle = datasetConfig.pointHoverBackgroundColor;
          ctx.stroke();
          ctx.restore(); // draw Circle

          ctx.save();
          ctx.beginPath();
          ctx.arc(x, topY, datasetConfig.pointHoverRadius, 0, 2 * Math.PI);
          ctx.fillStyle = datasetConfig.pointHoverBackgroundColor;
          ctx.fill();
          ctx.stroke();
        }
      }
    }); // console.log(labels)

    var chart = new Chart(canvas, {
      // type,
      type: 'LineWithLine',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: options,
      plugins: [{
        beforeInit: function beforeInit(chart) {
          // Get min and max for temerature sensors
          var threshold_min;
          var threshold_max;
          var dataset = chart.data.datasets[0];
          var labels = chart.data.labels;
          var sensorId = $(chart.canvas).attr("id").split("-")[0];
          var itemResult;
          userData_raw.forEach(function (item, index) {
            if (item.sensorId == sensorId) itemResult = item;
          });

          var isTemperature = function isTemperature(sensorId) {
            return itemResult.sensorType == 'temperature';
          };

          var hasMin = function hasMin(sensorId) {
            return itemResult.min;
          };

          var hasMax = function hasMax(sensorId) {
            return itemResult.max;
          }; // Set color of bars depeding of min and max


          if (isTemperature(sensorId)) {// threshold_min = hasMin(sensorId) ? hasMin(sensorId) : null
            // threshold_max = hasMax(sensorId) ? hasMax(sensorId) : null
            // if (threshold_min && threshold_min)
            //     for (var i = 0; i < dataset.data.length; i++) {
            //         if (dataset.data[i] < threshold_min || dataset.data[i] > threshold_max) {
            //             // dataset.backgroundColor[i] = chartColors.red5;
            //             // dataset.borderColor[i] = chartColors.red5;
            //             dataset.pointBackgroundColor[i] = chartColors.red2;
            //         }
            //     }
          } else {//if not temperature sensor
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
    }); // console.log(chart.data)

    chartList.push(chart);
  } else {// [ ] TODO: make another plot when source is not from attribute.
  }
} // ======================================================
// Utility for info box
// ======================================================


function appendInfoBox(args) {
  var component = "<div class=\"small-box " + args.class + " bg-info box-shadow-5\">\n        <div class=\"inner\">\n            <h3>" + args.message + "</h3>\n            <p>" + args.title + "</p>\n        </div>";

  if (args.icon) {
    component += "<div class=\"icon\">" + args.icon + "</div>";
  }

  component += "</div>";
  $(".small-box-container").append(component);
  var childs = $(".small-box-container").children().length;
  $(".small-box-container").removeClass(function (index, className) {
    var arrayOfClasses = className.split(" ");
    var arrayOfClasses2 = arrayOfClasses.filter(function (item, index) {
      return item.includes('length');
    });
    return arrayOfClasses2.join(' ');
  });
  $(".small-box-container").addClass("small-box-length-" + String(childs));
} // ======================================================
// Update Live Card
// ======================================================


function updateCurrentValue(sensorid, value) {
  var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  // Check sensor type of this sensorid
  var sensorType = $("article.live-card-" + sensorid + "").attr('sensortype'); // Update value

  var valueEl;

  if (sensorType == 'door') {
    valueEl = $("article.live-card-" + sensorid + " span.doorState"); // 1 => door closed, 0 => door open

    if (parseInt(value)) {
      valueEl.attr('state', 'closed');
    } else {
      valueEl.attr('state', 'open');
    }
  } else {
    valueEl = $("article.live-card-" + sensorid + " span.currentValue");
    valueEl.html(value);
  } // Update time


  var timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge .time");

  if (date) {
    // Live animation
    var currentDate = new Date();
    var oldDate = new Date(date);
    var diff = (currentDate.getTime() - oldDate.getTime()) / 1000;
    if (diff > 5 * 60) // diff > SECONDS - seconds = how many seconds should wait before showing not live
      timeEl.siblings('.pulse').addClass("not-live");else timeEl.siblings('.pulse').removeClass("not-live"); // Update date

    timeEl.html(date);
  } else {
    var currentTime = new Date();
    currentTime = currentTime.toLocaleString('en-US', {
      timeZone: 'Europe/Bucharest',
      timeStyle: "medium",
      dateStyle: "medium"
    });
    timeEl.siblings('.pulse').removeClass("not-live");
    timeEl.html(currentTime);
  }
} // ======================================================
// Alerts
// ======================================================


function saveSensorSettings(sensorid) {
  var min = $(".live-card-" + sensorid + " .settings-wrapper .input-min").val();
  var max = $(".live-card-" + sensorid + " .settings-wrapper .input-max").val(); // const xLat = $(".live-card-" + sensorid + " .settings-wrapper .input-lat").val()
  // const yLong = $(".live-card-" + sensorid + " .settings-wrapper .input-long").val()

  var openTimer = $(".live-card-" + sensorid + " .settings-wrapper .input-open").val();
  var closedTimer = $(".live-card-" + sensorid + " .settings-wrapper .input-closed").val();

  var url = "/api/v3/save-settings?sensorId='" + sensorid + "' " + function () {
    return min ? '&min=' + min : '';
  }() + function () {
    return max ? '&max=' + max : '';
  }() + function () {
    return openTimer ? '&openTimer=' + openTimer : '';
  }() + function () {
    return closedTimer ? '&closedTimer=' + closedTimer : '';
  }(); // (() => { return xLat ? '&xlat=' + xLat : '' })() +
  // (() => { return yLong ? '&ylong=' + yLong : '' })()


  url = url.replace(' ', ''); // console.log(url)

  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (msg) {
    if ('errno' in msg) {
      alert("Sensor " + sensorid + " update failed!");
      console.warn(msg);
    } else {
      alert("Sensor " + sensorid + " updated!"); // Min alert

      if (min) {
        $(".live-card-" + sensorid + " .minAlertGauge").prop("value", min);
        $(".live-card-" + sensorid + " .minAlertGauge").html("min: " + min); // $(".live-card-" + sensorid + " input[name='minAlert']").prop("value", '')
        // $(".live-card-" + sensorid + " input[name='minAlert']").prop("placeholder", "Updated at " + min)
      } // Max alert


      if (max) {
        $(".live-card-" + sensorid + " .maxAlertGauge").prop("value", max);
        $(".live-card-" + sensorid + " .maxAlertGauge").html("max: " + max); // $(".live-card-" + sensorid + " input[name='maxAlert']").prop("value", '')
        // $(".live-card-" + sensorid + " input[name='maxAlert']").prop("placeholder", "Updated at " + max)
      }
    } // // xLat
    // if (xLat) {
    //     // $(".live-card-" + sensorid + " input[name='xLat']").prop("value", '')
    //     // $(".live-card-" + sensorid + " input[name='xLat']").prop("placeholder", "Updated at " + xLat)
    // }
    // // yLong
    // if (yLong) {
    //     // $(".live-card-" + sensorid + " input[name='yLong']").prop("value", '')
    //     // $(".live-card-" + sensorid + " input[name='yLong']").prop("placeholder", "Updated at " + yLong)
    // }

  });
} // ======================================================
// Send keep alive each minute
// ======================================================


setInterval(function () {
  (0, _utils.sendMessage)("socketChannel", {
    topic: 'keepalive',
    message: JSON.stringify({
      "user": username,
      "status2": 'keepalive'
    })
  });
}, 10 * 1000); // ======================================================
// Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client
// ======================================================
// ======================================================

var socketChannel = 'socketChannel';
var currentValueBox = $("article[class*='live-card']"); // TIGANEALA
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

socket.on(socketChannel, function _callee(data) {
  var msg, value, currentPower, _currentPower, isSensorForCurrentUser, isclick, sensorId, status, timeEl, oldTime, oldTimeObj, now, date, day, month;

  return regeneratorRuntime.async(function _callee$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // Temperature - OLD @depracated - check what sensors work this way before delete
          // ======================================================
          currentValueBox.each(function (index, item) {
            // get sensor id for each current value box 
            var sensorid = $(item).attr("sensorid"); // get value of topic that contains this sensorid

            if (data.topic.includes(sensorid)) {
              updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1));
            }
          }); // ======================================================
          // Temperature
          // ======================================================

          if (data.topic == 'dataPub') {
            msg = JSON.parse(data.message);
            value = parseFloat(msg.value).toFixed(1);
            if (value > -200) updateCurrentValue(msg.cId, value);else console.warn("Device", msg.cId, "send weird value:", value);
          } // ======================================================
          // Power
          // ======================================================


          if (data.topic == 'dataPub/power') {
            msg = JSON.parse(data.message);

            if (parseInt(msg.value)) {
              // add no power class - {"cId":"sensorId","value":1}
              if (!$(".live-card-" + msg.cId).hasClass('no-power')) {
                $(".live-card-" + msg.cId + "[battery='1']").removeClass("alert-active").removeClass("alarm-active").addClass("no-power");
                currentPower = $(".battery-info h3").html().split('/');
                currentPower[0] = Math.min(parseInt(currentPower[0]) + 1, currentPower[1]);
                $(".battery-info h3").html(currentPower[0] + ' / ' + currentPower[1]);
              }
            } else {
              // remove no power class - {"cId":"sensorId","value":0}
              if ($(".live-card-" + msg.cId).hasClass('no-power')) {
                _currentPower = $(".battery-info h3").html().split('/');
                _currentPower[0] = Math.max(parseInt(_currentPower[0]) - 1, 0);
                $(".battery-info h3").html(_currentPower[0] + ' / ' + _currentPower[1]);
                $(".live-card-" + msg.cId).removeClass("no-power");
              }
            }
          } // ======================================================
          // Conveyor
          // ======================================================


          if (data.topic == 'anygo/conveyor') {
            msg = JSON.parse(data.message); // console.log(msg)
            // msg = `{"username":"demo",sensorId":"TEST0001CONV0003SEG","status":"run"}`

            isSensorForCurrentUser = _.find(userData_raw, function (n) {
              if (n.sensorId == msg.sensorId) return true;
            }); // if (isSensorForCurrentUser) {

            if ('status' in msg && 'sensorId' in msg && isSensorForCurrentUser) {
              // Start/stop conveyor - from mqtt directly not from button
              if ([1, 0, '1', '0'].includes(msg['status'])) {
                if ($('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active") && msg["status"] == 0) {
                  $('.controller-' + msg["sensorId"] + ' .cb-value').trigger('click', isclick = 'passive');
                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("STOP");
                  $('.conveyor-layout-inner > div.sensor-item').draggable("disable");
                } else if ($('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active") == false && msg["status"] == 1) {
                  $('.controller-' + msg["sensorId"] + ' .cb-value').trigger('click', isclick = 'passive');
                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("RUN");
                  $('.conveyor-layout-inner > div.sensor-item').draggable("enable");
                } else {// console.log(msg["status"], $('.controller-' + msg["sensorId"] + ' .cb-value').parent('.state-btn-inner').hasClass("active"))
                }
              } // Segment - Gate - Safety


              if (['run', 'energy', 'acc', 'error', 'open', 'closed', 'close', 'press', 'released', 'stop'].includes(msg['status'])) {
                sensorId = msg['sensorId']; // update status

                status = msg['status'];
                $(".sensor-item[sensor='" + sensorId + "']").attr('state', status);
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext state").html("Status: " + _dashboardComponents.states_dict[status]); // update usage

                timeEl = $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").html(); // let len = timeEl.length

                oldTime = timeEl.slice(6);
                oldTimeObj = new Date();
                oldTimeObj.setHours(parseInt(oldTime.slice(0, 2)));
                oldTimeObj.setMinutes(parseInt(oldTime.slice(3))); // [ ] TODO: setDate and setDay when try to sync with status time older than current day
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

                now = new Date();
                now = now.toLocaleString().slice(12, 17);
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").html("From: " + now);
                date = new Date();
                day = date.toLocaleString().slice(0, 2);
                month = date.toLocaleString().slice(3, 5);
                $(".sensor-item[sensor='" + sensorId + "'] .tooltiptext date").attr('title', date + " " + _utils.monthNames[parseInt(month - 1)].slice(0, 3));
              } // Conveyor Safety Released


              if ("safety" in msg) {
                if (['1', 1].includes(msg['safety'])) {
                  // show info msg
                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("E-STOP"); // disable button

                  $(".state-btn-inner > input").attr("disabled", true); // play alert sound

                  playAlert(); // info title

                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').attr("title", "emergency button is pressed");
                } else if (['0', 0].includes(msg['safety'])) {
                  // show info msg
                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').html("READY TO RUN"); // enable button

                  $(".state-btn-inner > input").attr("disabled", false); // title info

                  $('.controller-' + msg["sensorId"] + ' .state-button .conveyor-info-message').attr("title", "emergency button is released"); // stop alert sound

                  stopAlert();
                }
              }
            } // } else {
            //     console.warn("topic: anygo/conveyor", "msg:"+msg.sensorId, "not for this user")
            // }

          } // ======================================================


        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // ======================================================
// ======================================================
// This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================

var sensorMetaRaw; // init variable globally

var mainLoader = function mainLoader() {
  var url, zoneId, sensorBuffer, sensorDataRaw, sensorsWithBattery, sensorCounter, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sensor, sensorData, newItems, newItemsAppended;

  return regeneratorRuntime.async(function mainLoader$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // Get zoneId from URL
          // =============================================
          url = new URL(location.href);
          zoneId = url.searchParams.get('zoneid'); // =============================================
          // Preprocess data to extract sensors from current zone only
          // =============================================

          sensorMetaRaw = [];
          sensorBuffer = []; // this buffer is use to prevent double inserting of sensors

          userData_raw.forEach(function (sensor) {
            // Iterate through each result and save unique sensorId rows
            if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
              sensor.zoneId == zoneId ? sensorMetaRaw.push(sensor) : null;
              sensorBuffer.push(sensor.sensorId);
            }
          }); // =============================================
          // Get data from influx for each sensor
          // =============================================

          sensorDataRaw = [];
          sensorsWithBattery = [];
          sensorCounter = 0; // console.log(sensorMetaRaw)

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context6.prev = 11;
          _iterator = sensorMetaRaw[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context6.next = 29;
            break;
          }

          sensor = _step.value;
          _context6.next = 17;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId, sensor.sensorType));

        case 17:
          sensorData = _context6.sent;
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          }); // console.log(sensorDataRaw.length)
          // --------------------------------------------------
          // Add Conveyor Class + Append Conveyor Layout Map
          // --------------------------------------------------

          if (['gate', 'safety', 'segment', 'conveyor'].includes(sensor.sensorType)) {
            // console.log($("body").hasClass("conveyor-main-dashboard"), sensor.sensorType)
            if (!$("body").hasClass("conveyor-main-dashboard")) {
              // do this only once
              $("body").addClass("conveyor-main-dashboard");
              $(".conveyor-main-dashboard .card-container").append((0, _dashboardComponents.conveyorLayout)(sensor));
            }
          } // --------------------------------------------------
          // Append Conveyor Items + Dashboard
          // --------------------------------------------------


          if (['gate', 'safety', 'segment'].includes(sensor.sensorType)) {
            // Append conveyor items on map created above
            if (sensor.x && sensor.y) $(".conveyor-main-dashboard .conveyor-layout .conveyor-layout-inner").append((0, _dashboardComponents.conveyorItem)(sensor, 'draggable', {
              name: sensor.sensorName
            }));else $(".conveyor-main-dashboard .conveyor-layout .new-items-conveyor").append((0, _dashboardComponents.conveyorItem)(sensor, '', {
              name: sensor.sensorName
            }));
          } else if (['conveyor'].includes(sensor.sensorType)) {
            // Prepend conveyor controller
            $(".card-container").prepend(defaultSensorView(sensorDataRaw[sensorDataRaw.length - 1]));
          } else {
            // Append the default sensor view (current value + graph) for each sensor
            $(".card-container").append(defaultSensorView(sensorDataRaw[sensorDataRaw.length - 1]));
          }

          if (sensor.sensorType == 'conveyor' && sensor.status == 1) conveyorUsage(sensor.sensorId); // --------------------------------------------------
          // Enable trigger events on defaultSensorView components after append
          // --------------------------------------------------

          triggerSensorView(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId, sensorDataRaw[sensorDataRaw.length - 1]); // --------------------------------------------------
          // Plot data on graph based on sensorData attr
          // --------------------------------------------------

          plotData(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId); // --------------------------------------------------
          // Sensors w/ battery functionality
          // --------------------------------------------------

          if (sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.battery == 1) sensorsWithBattery.push(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId);

          if (sensorCounter == 0) {
            // Add info box - location
            // Add info box BUT NOT on conveyor dashboard
            // =============================================
            if (['gate', 'safety', 'segment', 'conveyor'].includes(sensor.sensorType) == false) {
              (function () {
                var sensorsCounter = sensorMetaRaw.length;
                appendInfoBox({
                  title: sensorDataRaw[0].sensorMeta.location2,
                  message: sensorDataRaw[0].sensorMeta.location3,
                  icon: '<i class="fas fa-compass"></i>',
                  class: ''
                });
                var alert = 0,
                    alarm = 0,
                    power = 0;
                sensorMetaRaw.forEach(function (item) {
                  if (item.alerts == 1) {
                    alert++;
                  }

                  if (item.alerts == 2) {
                    alarm++;
                  }

                  if ([3, 4].includes(item.alerts)) {
                    power++;
                  }
                });
                appendInfoBox({
                  title: 'Warning alert',
                  message: alert + ' / ' + sensorsCounter,
                  icon: '<i class="fas fa-bell"></i>',
                  class: ''
                });
                appendInfoBox({
                  title: 'Limits exeeded',
                  message: alarm + ' / ' + sensorsCounter,
                  icon: '<i class="fas fa-exclamation-triangle"></i>',
                  class: ''
                }); // Display battery info box only if there are sensors with this functionality

                if (sensorsWithBattery.length) appendInfoBox({
                  title: 'On battery',
                  message: power + ' / ' + sensorsCounter,
                  icon: '<i class="fas fa-battery-quarter"></i>',
                  class: 'battery-info'
                });
              })();
            } // =============================================


            sensorCounter++;
          } // --------------------------------------------------


        case 26:
          _iteratorNormalCompletion = true;
          _context6.next = 13;
          break;

        case 29:
          _context6.next = 35;
          break;

        case 31:
          _context6.prev = 31;
          _context6.t0 = _context6["catch"](11);
          _didIteratorError = true;
          _iteratorError = _context6.t0;

        case 35:
          _context6.prev = 35;
          _context6.prev = 36;

          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }

        case 38:
          _context6.prev = 38;

          if (!_didIteratorError) {
            _context6.next = 41;
            break;
          }

          throw _iteratorError;

        case 41:
          return _context6.finish(38);

        case 42:
          return _context6.finish(35);

        case 43:
          // =============================================
          // END Get data from influx for each sensor
          // Conveyor dashboard - remove new item bar if no sensor there
          // =============================================
          newItems = $(".conveyor-main-dashboard .conveyor-layout .new-items-conveyor").children().length;

          if (newItems == 0) {
            $(".conveyor-main-dashboard .new-items-conveyor").remove();
            newItemsAppended = $(".conveyor-main-dashboard .conveyor-layout").children().length;

            if (newItemsAppended == 0) {
              $(".conveyor-main-dashboard .conveyor-layout").remove();
            }
          }

          if ($('.state-btn-inner').hasClass("active") == false) $('.conveyor-layout-inner > div.sensor-item').draggable("disable"); // =============================================
          // return sensorDataRaw

          return _context6.abrupt("return", sensorMetaRaw);

        case 47:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[11, 31, 35, 43], [36,, 38, 42]]);
};

var influxQuery = function influxQuery(query) {
  var response;
  return regeneratorRuntime.async(function influxQuery$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/query-influx?query=" + query));

        case 2:
          response = _context7.sent;
          return _context7.abrupt("return", response.json());

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  });
};

var initLiveData = function initLiveData() {
  var sensorsMetaRaw, sensorsList, query, influxResult;
  return regeneratorRuntime.async(function initLiveData$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(mainLoader());

        case 2:
          sensorsMetaRaw = _context8.sent;
          sensorsList = (0, _utils.getValuesFromObject)('sensorId', sensorsMetaRaw);
          query = "SELECT value FROM sensors WHERE sensorId =~ /" + sensorsList.join('|') + "/ group by sensorId order by time desc limit 1";
          _context8.next = 7;
          return regeneratorRuntime.awrap(influxQuery(query));

        case 7:
          influxResult = _context8.sent;
          // console.log("sensorsMetaRaw", sensorsMetaRaw)
          influxResult.forEach(function (item, index) {
            var sensorId = item.sensorId;
            var value = item.value;
            var time = item.time;
            var currentTime = new Date(time); // current time is +2h from Europe/Bucharest

            currentTime.setHours(currentTime.getHours() - 2);
            currentTime = currentTime.toLocaleString('en-US', {
              timeZone: 'Europe/Bucharest',
              timeStyle: "medium",
              dateStyle: "medium"
            }); // console.log(currentTime)

            updateCurrentValue(sensorId, parseFloat(value).toFixed(1), currentTime);
          });

        case 9:
        case "end":
          return _context8.stop();
      }
    }
  });
};

initLiveData(); // Order graph in ascending order based on sensor name
// const orderCharts = () => {
//     console.log("here")
//     console.log($(""))
// }
// timeoutAsync(3000, orderCharts)
// End ordering
// Update charts continously

var liveChart = function liveChart() {
  var sensorDataRaw, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, sensor, sensorData, _i, _sensorDataRaw, _sensor;

  return regeneratorRuntime.async(function liveChart$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          sensorDataRaw = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context9.prev = 4;
          _iterator2 = sensorMetaRaw[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context9.next = 15;
            break;
          }

          sensor = _step2.value;
          _context9.next = 10;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId, sensor.sensorType));

        case 10:
          sensorData = _context9.sent;
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          });

        case 12:
          _iteratorNormalCompletion2 = true;
          _context9.next = 6;
          break;

        case 15:
          _context9.next = 21;
          break;

        case 17:
          _context9.prev = 17;
          _context9.t0 = _context9["catch"](4);
          _didIteratorError2 = true;
          _iteratorError2 = _context9.t0;

        case 21:
          _context9.prev = 21;
          _context9.prev = 22;

          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }

        case 24:
          _context9.prev = 24;

          if (!_didIteratorError2) {
            _context9.next = 27;
            break;
          }

          throw _iteratorError2;

        case 27:
          return _context9.finish(24);

        case 28:
          return _context9.finish(21);

        case 29:
          for (_i = 0, _sensorDataRaw = sensorDataRaw; _i < _sensorDataRaw.length; _i++) {
            _sensor = _sensorDataRaw[_i];
            // Update json in element attribute before plotting
            updateDataForChart(_sensor); // Plot data on graph based on sensorData attr

            plotData(_sensor.sensorMeta.sensorId); // Log
            // console.log(sensor.sensorMeta.sensorId)
          }

        case 30:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[4, 17, 21, 29], [22,, 24, 28]]);
};

function delay(ms) {
  return regeneratorRuntime.async(function delay$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          }));

        case 2:
          return _context10.abrupt("return", _context10.sent);

        case 3:
        case "end":
          return _context10.stop();
      }
    }
  });
}

var run = function run() {
  return regeneratorRuntime.async(function run$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          if (!1) {
            _context11.next = 6;
            break;
          }

          liveChart();
          _context11.next = 4;
          return regeneratorRuntime.awrap(delay(60 * 1000));

        case 4:
          _context11.next = 0;
          break;

        case 6:
        case "end":
          return _context11.stop();
      }
    }
  });
};

run(); // switch-context button listener

var goToMap = function goToMap() {
  var url = window.location.origin + '/map' + window.location.search.replace("zone", "");
  window.location.replace(url);
};

$(".switch-context").on('click', function () {
  goToMap();
});