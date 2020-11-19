"use strict";

var _moment = require("moment");

var _utils = require("./utils.js");

var getSensorData = function getSensorData(id, type) {
  var response;
  return regeneratorRuntime.async(function getSensorData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/get-sensor-data?id=" + id + "&type=" + type));

        case 2:
          response = _context.sent;
          return _context.abrupt("return", response.json());

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}; // console.log(userData_raw)


function defaultSensorView(sensor) {
  // sensorId = String(sensorId)
  var sensorData = JSON.stringify(sensor.sensorData); // Sensor state 0/1/2/3

  var alertClass = '';
  var alertClass2 = '';

  if (sensor.sensorMeta.alerts == 1) {
    // alertClass = 'alert-active' 
    alertClass2 = 'alert-active';
  } else if (sensor.sensorMeta.alerts == 2) {
    // alertClass = 'alarm-active'
    alertClass2 = 'alarm-active';
  } else if ([3, 4].includes(sensor.sensorMeta.alerts)) alertClass2 = 'no-power'; // current value gauge component


  var currentValueView = "\n    <article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\">\n\n        <div class=\"card-header " + alertClass + "\">\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                Current Value\n            </h3>\n            <span class='card-settings-button'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n        </div>\n\n        <div class=\"card-body\">\n           <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n                <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                    <span class=\"currentValue\">0</span>\n                    " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.min) ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ';
  }() + "\n                    " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.max) ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ';
  }() + "\n                </div>\n                <p class='update-time-gauge'>Waiting to be updated...</p>\n            </div>\n        </div>\n\n        <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n            <span class='card-settings-button-alert tooltip_test'>\n                <i class=\"fas fa-bell\"></i>\n                <span class=\"tooltiptext\">New feature is coming!</span>\n            </span>\n            <span class='card-settings-button-update tooltip_test'>\n                <i class=\"fas fa-save\"></i>\n                <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n            </span>\n            <span class='card-settings-button-inner'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n            <div class='settings-wrapper'>\n                <div class=\"slidecontainer\">\n\n                    <p class='label-input'>Min: </p>\n                    <input type=\"number\" name=\"minAlert\" " + function () {
    return sensor.sensorMeta.min ? 'value="' + sensor.sensorMeta.min + '"' : 'placeholder="Set min alert"';
  }() + " class=\"input input-min\">\n                    <p class='label-input'>Max: </p>\n                    <input type=\"number\" name=\"maxAlert\" " + function () {
    return sensor.sensorMeta.max ? 'value="' + sensor.sensorMeta.max + '"' : 'placeholder="Set max alert"';
  }() + " class=\"input input-max\">\n                    <p class='label-input'>Lat: </p>\n                    <input type=\"number\" name=\"xLat\" " + function () {
    return sensor.sensorMeta.x ? 'value="' + sensor.sensorMeta.x + '"' : 'placeholder="Set x position"';
  }() + " class=\"input input-lat\">\n                    <p class='label-input'>Long: </p>\n                    <input type=\"number\" name=\"yLong\" " + function () {
    return sensor.sensorMeta.y ? 'value="' + sensor.sensorMeta.y + '"' : 'placeholder="Set y position"';
  }() + " class=\"input input-long\">\n\n                </div>\n            </div>\n        </div>\n    </article>\n    "; // counter noriel ui


  var newItemLive = "\n    <article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Live Update\n        </h3>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"" + sensor.sensorMeta.sensorId + "-newItem\">\n\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-newItem-spinner'>\n                <span>Loading...</span>\n            </a>\n\n            <div id=\"" + sensor.sensorMeta.sensorId + "-floatinBall\" class=\"hidden-element\"></div>\n\n        </div>\n    </div>";

  var doorLive = "\n    <article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\">\n\n        <div class=\"card-header " + alertClass + "\">\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                Door live\n            </h3>\n            <span class='card-settings-button'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n        </div>\n\n        <div class=\"card-body\">\n           <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n                <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                    <span class=\"doorState\" state=\"unknown\">\n                        <i class=\"fas fa-door-closed\"></i>\n                        <i class=\"fas fa-door-open\"></i>\n                    </span>\n                    " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.openTimer) ? '<span class=\'openTimer\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: ' + sensor.sensorMeta.openTimer + '</span> ' : '<span class=\'openTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: <i class="fas fa-infinity"></i></span> ';
  }() + "\n                    " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.closedTimer) ? '<span class=\'closedTimer\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: ' + sensor.sensorMeta.closedTimer + '</span> ' : '<span class=\'closedTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: <i class="fas fa-infinity"></i></span> ';
  }() + "\n                </div>\n                <p class='update-time-gauge'>Waiting to be updated...</p>\n            </div>\n        </div>\n\n        <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n            <span class='card-settings-button-alert tooltip_test'>\n                <i class=\"fas fa-bell\"></i>\n                <span class=\"tooltiptext\">New feature is coming!</span>\n            </span>\n            <span class='card-settings-button-update tooltip_test'>\n                <i class=\"fas fa-save\"></i>\n                <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n            </span>\n            <span class='card-settings-button-inner'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n            <div class='settings-wrapper'>\n                <div class=\"slidecontainer\">\n\n                    <p class='label-input'>Open:</p>\n                    <input type=\"number\" name=\"openAlert\" " + function () {
    return sensor.sensorMeta.openTimer ? 'value="' + sensor.sensorMeta.openTimer + '"' : '';
  }() + "placeholder=\"Set open limit in seconds\" class=\"input input-open\">\n                    <p class='label-input'>Closed:</p>\n                    <input type=\"number\" name=\"closedAlert\" " + function () {
    return sensor.sensorMeta.closedTimer ? 'value="' + sensor.sensorMeta.closedTimer + '"' : '';
  }() + "placeholder=\"Set closed limit in seconds\" class=\"input input-closed\">\n\n                </div>\n            </div>\n        </div>\n    </article>\n    "; // graph view component


  var graphView = "\n\n    <article class=\"card height-control " + sensor.sensorMeta.sensorId + "-card graph-" + sensor.sensorMeta.sensorId + "\" sensorType=\"" + sensor.sensorMeta.sensorType + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensorData='" + sensorData + "'>\n    \n        <div class=\"card-header\">\n\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                <span>" + sensor.sensorMeta.sensorName + "</span> |\n                <b>" + sensor.sensorMeta.sensorId + "</b>\n            </h3>\n    \n            <div class=\"card-tools\">\n                <ul class=\"pagination pagination-sm\">\n\n                    <li class=\"page-item\">\n                        <div id=\"reportrange\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fa fa-calendar\"></i>&nbsp;\n                            <span></span> <i class=\"fa fa-caret-down\"></i>\n                        </div>\n                    </li>\n\n                    <li class=\"page-item\">\n                        <div id=\"report\" class=\"tooltip_test\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fas fa-file-csv\"></i>\n                            <span class=\"tooltiptext\">Download CSV</span>\n                        </div>\n                    </li>\n\n                </ul>\n            </div>\n    \n        </div>\n        \n    \n        <div class=\"card-body\">\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-graph-spinner'>\n                <span>Loading...</span>\n            </a> \n            <div class=\"" + sensor.sensorMeta.sensorId + "-graph-calendar graph-calendar\">\n                Time interval for " + sensor.sensorMeta.sensorId + " \n                <input name=\"dates\" value=\"Button Change\"> \n            </div> \n        </div>\n        \n    </article>"; // stack the components

  if (sensor.sensorMeta.sensorType == 'counter') {
    return newItemLive + graphView;
  } else if (sensor.sensorMeta.sensorType == 'door') {
    return doorLive + graphView;
  } else {
    return currentValueView + graphView;
  }
} // Triggers


function triggerSensorView(sensorId) {
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
  });
}

var reloadDataCustomCalendar = function reloadDataCustomCalendar(start, end, sensorId) {
  return regeneratorRuntime.async(function reloadDataCustomCalendar$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // [8] TODO: Get data for new date
          // [*] TODO: Reload the chart with new data
          getSensorDataCustomInterval(sensorId, start, end);

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // get and plot data by a specific interval


var getSensorDataCustomInterval = function getSensorDataCustomInterval(sensor, start, end) {
  var url;
  return regeneratorRuntime.async(function getSensorDataCustomInterval$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!$("body").hasClass("calendar-active")) {
            $("body").addClass("calendar-active");
          } // Building the url


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

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
}; // Global chart list


var chartList = []; // Plot data

function plotData(sensorId) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'attr';

  // [*] TODO: check source attr
  // [*] TODO: get data
  // [ ] TODO: display data
  if (source == 'attr') {
    // this source should run only when page is loaded
    // Get Data
    var rawData = $("article.graph-" + sensorId + "").attr("sensorData");
    var sensorType = $("article.graph-" + sensorId + "").attr("sensorType");
    var sensorData = JSON.parse(rawData); // console.log(sensorData)
    // Add Canvas for chart

    $("article.graph-" + sensorId + " .card-body a.spinner").remove();
    $("article.graph-" + sensorId + " .card-body").append("<canvas id=\"" + sensorId + "-graph\"></canvas>"); // Plot w/ Chart.js

    var canvas = $("canvas#" + sensorId + "-graph")[0].getContext("2d");
    var labels = (0, _utils.getValuesFromObject)('time', sensorData);
    var data = (0, _utils.getValuesFromObject)('value', sensorData); // General ptions of timeseries chart

    var options = {
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
      return value ? value.toFixed(1) : value;
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
      pointRadius.push(0);
    });else {
      backgroundColor = chartColors.blue2;
      pointBackgroundColor = chartColors.blue;
      borderColor = chartColors.blue;
    } // end build arrays of colors
    // DATASET options based on sensorType

    var datasetConfig = {
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      pointBorderColor: '#343a40',
      pointBackgroundColor: pointBackgroundColor,
      pointHoverBackgroundColor: "#ffc107",
      pointRadius: 3,
      pointHoverRadius: 7,
      pointBorderWidth: 1,
      borderWidth: 1,
      lineTension: 0.2
    };

    if (sensorType == 'door') {
      datasetConfig.lineTension = 0;
      datasetConfig.pointRadius = pointRadius;
      datasetConfig.pointHoverRadius = 7;
      datasetConfig.pointBorderWidth = 0;
      datasetConfig.borderWidth = 1; // console.log(options.scales.yAxes[0])

      options.scales.yAxes[0].ticks['max'] = 1;
      options.scales.yAxes[0].ticks['min'] = 0;
    } // end DATASET options based on sensorType
    // TYPE of CHART based on sensorType


    var type, datasets;

    if (sensorType == 'door') {
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
      }];
    } else {
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
      }];
    } // end TYPE of CHART based on sensorType
    // console.log(labels)


    var chart = new Chart(canvas, {
      type: type,
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


          if (isTemperature(sensorId)) {
            threshold_min = hasMin(sensorId) ? hasMin(sensorId) : null;
            threshold_max = hasMax(sensorId) ? hasMax(sensorId) : null;
            if (threshold_min && threshold_min) for (var i = 0; i < dataset.data.length; i++) {
              if (dataset.data[i] < threshold_min || dataset.data[i] > threshold_max) {
                // dataset.backgroundColor[i] = chartColors.red5;
                // dataset.borderColor[i] = chartColors.red5;
                dataset.pointBackgroundColor[i] = chartColors.red2;
              }
            }
          } else {
            //if not temperature sensor
            for (var i = 0; i < dataset.data.length; i++) {
              if (isNaN(parseInt(dataset.data[i - 1])) || isNaN(parseInt(dataset.data[i + 1]))) {
                dataset.pointRadius[i] = 3;
              } else if (parseInt(dataset.data[i - 1]) == 0 || parseInt(dataset.data[i + 1]) == 0) {
                dataset.pointRadius[i] = 3;
              } else {
                dataset.pointRadius[i] = 0;
              }
            }
          }
        }
      }]
    }); // console.log(chart.data)

    chartList.push(chart);
  } else {// [ ] TODO: make another plot when source is not from attribute.
  }
}

function appendInfoBox(args) {
  var component = "<div class=\"small-box " + args.class + " bg-info box-shadow-5\">\n        <div class=\"inner\">\n            <h3>" + args.message + "</h3>\n            <p>" + args.title + "</p>\n        </div>";

  if (args.icon) {
    component += "<div class=\"icon\">" + args.icon + "</div>";
  }

  component += "</div>";
  $(".small-box-container").append(component);
}

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


  if (date) {
    var timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge");
    timeEl.html(date);
  } else {
    var _timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge");

    var currentTime = new Date();
    currentTime = currentTime.toLocaleString('en-US', {
      timeZone: 'Europe/Bucharest',
      timeStyle: "medium",
      dateStyle: "medium"
    });

    _timeEl.html(currentTime);
  }
} // Alerts


function saveSensorSettings(sensorid) {
  var min = $(".live-card-" + sensorid + " .settings-wrapper .input-min").val();
  var max = $(".live-card-" + sensorid + " .settings-wrapper .input-max").val();
  var xLat = $(".live-card-" + sensorid + " .settings-wrapper .input-lat").val();
  var yLong = $(".live-card-" + sensorid + " .settings-wrapper .input-long").val();
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
  }() + function () {
    return xLat ? '&xlat=' + xLat : '';
  }() + function () {
    return yLong ? '&ylong=' + yLong : '';
  }();

  url = url.replace(' ', ''); // console.log(url)

  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (msg) {
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
    } // xLat


    if (xLat) {} // $(".live-card-" + sensorid + " input[name='xLat']").prop("value", '')
    // $(".live-card-" + sensorid + " input[name='xLat']").prop("placeholder", "Updated at " + xLat)
    // yLong


    if (yLong) {// $(".live-card-" + sensorid + " input[name='yLong']").prop("value", '')
      // $(".live-card-" + sensorid + " input[name='yLong']").prop("placeholder", "Updated at " + yLong)
    }
  });
} // Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client


var socketChannel = 'socketChannel';
socket.on(socketChannel, function _callee(data) {
  var currentValueBox, msg, currentPower, _currentPower;

  return regeneratorRuntime.async(function _callee$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          currentValueBox = $("article[class*='live-card']"); // OLD WAY - @depracated
          // Loop through each current value box

          currentValueBox.each(function (index, item) {
            // get sensor id for each current value box 
            var sensorid = $(item).attr("sensorid"); // get value of topic that contains this sensorid

            if (data.topic.includes(sensorid)) {
              updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1));
            }
          }); // NEW TOPIC dataPub
          // dataPub {cId: "DAS001TCORA", value: 23.992979}

          if (data.topic == 'dataPub') {
            msg = JSON.parse(data.message);
            updateCurrentValue(msg.cId, parseFloat(msg.value).toFixed(1));
          }

          if (data.topic == 'dataPub/power') {
            msg = JSON.parse(data.message);

            if (parseInt(msg.value)) {
              // add class no power to cId
              if (!$(".live-card-" + msg.cId).hasClass('no-power')) {
                $(".live-card-" + msg.cId).removeClass("alert-active").removeClass("alarm-active").addClass("no-power");
                currentPower = $(".battery-info h3").html().split('/');
                currentPower[0] = Math.min(parseInt(currentPower[0]) + 1, currentPower[1]);
                $(".battery-info h3").html(currentPower[0] + ' / ' + currentPower[1]);
              }
            } else {
              if ($(".live-card-" + msg.cId).hasClass('no-power')) {
                _currentPower = $(".battery-info h3").html().split('/');
                _currentPower[0] = Math.max(parseInt(_currentPower[0]) - 1, 0);
                $(".battery-info h3").html(_currentPower[0] + ' / ' + _currentPower[1]);
                $(".live-card-" + msg.cId).removeClass("no-power");
              }
            }
          }

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================

var mainLoader = function mainLoader() {
  var url, zoneId, sensorMetaRaw, sensorBuffer, sensorDataRaw, _i, _sensorMetaRaw, sensor, sensorData, sensorsWithBattery, _i2, _sensorDataRaw, _sensor, location3, location2, alert, alarm, power;

  return regeneratorRuntime.async(function mainLoader$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // console.log(userData_raw)
          // let zoneData = JSON.parse('{{{zoneData}}}')
          // Get zoneId from URL
          url = new URL(location.href);
          zoneId = url.searchParams.get('zoneid'); // Preprocess data to extract sensors from current zone only

          sensorMetaRaw = [];
          sensorBuffer = []; // this buffer is use to prevent double inserting of sensors
          // console.log(userData_raw)

          userData_raw.forEach(function (sensor) {
            // Iterate through each result and save unique sensorId rows
            if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
              sensor.zoneId == zoneId ? sensorMetaRaw.push(sensor) : null;
              sensorBuffer.push(sensor.sensorId);
            }
          }); // Get data from influx for each sensor

          sensorDataRaw = [];
          _i = 0, _sensorMetaRaw = sensorMetaRaw;

        case 7:
          if (!(_i < _sensorMetaRaw.length)) {
            _context5.next = 16;
            break;
          }

          sensor = _sensorMetaRaw[_i];
          _context5.next = 11;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId, sensor.sensorType));

        case 11:
          sensorData = _context5.sent;
          // console.log(sensor.sensorId, sensorData)
          // if(sensor.sensorType == 'door') {
          //     sensorData.forEach((item,index)=>{
          //         console.log(index, item)
          //     })
          // }
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          });

        case 13:
          _i++;
          _context5.next = 7;
          break;

        case 16:
          // console.log(sensorDataRaw)
          sensorsWithBattery = [];

          for (_i2 = 0, _sensorDataRaw = sensorDataRaw; _i2 < _sensorDataRaw.length; _i2++) {
            _sensor = _sensorDataRaw[_i2];
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
            $(".card-container").append(defaultSensorView(_sensor)); // Enable trigger events on defaultSensorView components after append

            triggerSensorView(_sensor.sensorMeta.sensorId); // Plot data on graph based on sensorData attr

            plotData(_sensor.sensorMeta.sensorId); // Sensors w/ battery functionality

            if (_sensor.sensorMeta.battery == 1) sensorsWithBattery.push(_sensor.sensorMeta.sensorId);
          } // Add info box


          location3 = sensorDataRaw[0].sensorMeta.location3;
          location2 = sensorDataRaw[0].sensorMeta.location2;
          appendInfoBox({
            title: location2,
            message: location3,
            icon: '<i class="fas fa-compass"></i>',
            class: ''
          }); // Counter sensor with battery functionality
          // let sensorsWithBattery = userData_raw.filter((item,index)=>{
          //     if(item.battery == 1)
          //         return item
          // })
          // console.log(sensorsWithBattery)

          alert = 0, alarm = 0, power = 0;
          sensorDataRaw.forEach(function (item) {
            if (item.sensorMeta.alerts == 1) alert++;
            if (item.sensorMeta.alerts == 2) alarm++;
            if ([3, 4].includes(item.sensorMeta.alerts)) power++;
          });
          appendInfoBox({
            title: 'Warning alert',
            message: alert + ' / ' + sensorDataRaw.length,
            icon: '<i class="fas fa-exclamation"></i>',
            class: ''
          });
          appendInfoBox({
            title: 'Limits exeeded',
            message: alarm + ' / ' + sensorDataRaw.length,
            icon: '<i class="fas fa-exclamation-triangle"></i>',
            class: ''
          }); // Display battery info box only if there are sensors with this functionality
          // console.log("sensorsWithBattery:",sensorsWithBattery)

          if (sensorsWithBattery.length) appendInfoBox({
            title: 'On battery',
            message: power + ' / ' + sensorDataRaw.length,
            icon: '<i class="fas fa-battery-quarter"></i>',
            class: 'battery-info'
          }); // return sensorDataRaw

          return _context5.abrupt("return", sensorMetaRaw);

        case 27:
        case "end":
          return _context5.stop();
      }
    }
  });
};

var influxQuery = function influxQuery(query) {
  var response;
  return regeneratorRuntime.async(function influxQuery$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/query-influx?query=" + query));

        case 2:
          response = _context6.sent;
          return _context6.abrupt("return", response.json());

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
};

var initLiveData = function initLiveData() {
  var sensorsMetaRaw, sensorsList, query, influxResult;
  return regeneratorRuntime.async(function initLiveData$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(mainLoader());

        case 2:
          sensorsMetaRaw = _context7.sent;
          sensorsList = (0, _utils.getValuesFromObject)('sensorId', sensorsMetaRaw);
          query = "SELECT value FROM sensors WHERE sensorId =~ /" + sensorsList.join('|') + "/ group by sensorId order by time desc limit 1";
          _context7.next = 7;
          return regeneratorRuntime.awrap(influxQuery(query));

        case 7:
          influxResult = _context7.sent;
          // console.log(influxResult)
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
          return _context7.stop();
      }
    }
  });
};

initLiveData();