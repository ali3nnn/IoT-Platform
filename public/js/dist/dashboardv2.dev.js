"use strict";

var _moment = require("moment");

var _utils = require("./utils.js");

// first line test git
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


function updateDataForChart(sensor) {
  var sensorData = JSON.stringify(sensor.sensorData);
  $("article.graph-" + sensor.sensorMeta.sensorId).attr("sensorData", sensorData);
}

function defaultSensorView(sensor) {
  // sensorId = String(sensorId)
  var sensorData = JSON.stringify(sensor.sensorData); // console.log(sensor.sensorMeta.sensorId,sensor.sensorMeta.battery)
  // Sensor state 0/1/2/3,4

  var alertClass2 = '';

  if (sensor.sensorMeta.alerts == 1) {
    // alertClass = 'alert-active' 
    alertClass2 = 'alert-active';
  } else if (sensor.sensorMeta.alerts == 2) {
    // alertClass = 'alarm-active'
    alertClass2 = 'alarm-active';
  } else if ([3, 4].includes(sensor.sensorMeta.alerts) && sensor.sensorMeta.battery == 1) alertClass2 = 'no-power'; // current value gauge component


  var currentValueView = "\n    <article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\" battery=\"" + sensor.sensorMeta.battery + "\">\n\n        <div class=\"card-header\">\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                Current Value\n            </h3>\n            <span class='card-settings-button'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n        </div>\n\n        <div class=\"card-body\">\n           <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n                <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                    <span class=\"currentValue\">0</span>\n                    " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.min) ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ';
  }() + "\n                    " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.max) ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ';
  }() + "\n                </div>\n                <p class='update-time-gauge'><span class=\"not-live pulse\"></span><span class=\"time\">Waiting to be updated...</span></p>\n            </div>\n        </div>\n\n        <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n            <span class='card-settings-button-alert tooltip_test'>\n                <i class=\"fas fa-bell\"></i>\n                <span class=\"tooltiptext\">New feature is coming!</span>\n            </span>\n            <span class='card-settings-button-update tooltip_test'>\n                <i class=\"fas fa-save\"></i>\n                <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n            </span>\n            <span class='card-settings-button-inner'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n            <div class='settings-wrapper'>\n                <div class=\"slidecontainer\">\n\n                    <p class='label-input'>Min: </p>\n                    <input type=\"number\" name=\"minAlert\" " + function () {
    return sensor.sensorMeta.min ? 'value="' + sensor.sensorMeta.min + '"' : 'placeholder="Set min alert"';
  }() + " class=\"input input-min\">\n                    <p class='label-input'>Max: </p>\n                    <input type=\"number\" name=\"maxAlert\" " + function () {
    return sensor.sensorMeta.max ? 'value="' + sensor.sensorMeta.max + '"' : 'placeholder="Set max alert"';
  }() + " class=\"input input-max\">\n                    <p class='label-input'>Lat: </p>\n                    <input type=\"number\" name=\"xLat\" " + function () {
    return sensor.sensorMeta.x ? 'value="' + sensor.sensorMeta.x + '"' : 'placeholder="Set x position"';
  }() + " class=\"input input-lat\">\n                    <p class='label-input'>Long: </p>\n                    <input type=\"number\" name=\"yLong\" " + function () {
    return sensor.sensorMeta.y ? 'value="' + sensor.sensorMeta.y + '"' : 'placeholder="Set y position"';
  }() + " class=\"input input-long\">\n\n                </div>\n            </div>\n        </div>\n    </article>\n    "; // counter noriel ui


  var newItemLive = "\n    <article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Live Update\n        </h3>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"" + sensor.sensorMeta.sensorId + "-newItem\">\n\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-newItem-spinner'>\n                <span>Loading...</span>\n            </a>\n\n            <div id=\"" + sensor.sensorMeta.sensorId + "-floatinBall\" class=\"hidden-element\"></div>\n\n        </div>\n    </div>";

  var doorLive = "\n    <article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\" battery=\"" + sensor.sensorMeta.battery + "\">\n\n        <div class=\"card-header\">\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                Door live\n            </h3>\n            <span class='card-settings-button'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n        </div>\n\n        <div class=\"card-body\">\n           <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n                <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                    <span class=\"doorState\" state=\"unknown\">\n                        <i class=\"fas fa-door-closed\"></i>\n                        <i class=\"fas fa-door-open\"></i>\n                    </span>\n                    " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.openTimer) ? '<span class=\'openTimer\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: ' + sensor.sensorMeta.openTimer + '</span> ' : '<span class=\'openTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: <i class="fas fa-infinity"></i></span> ';
  }() + "\n                    " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.closedTimer) ? '<span class=\'closedTimer\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: ' + sensor.sensorMeta.closedTimer + '</span> ' : '<span class=\'closedTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: <i class="fas fa-infinity"></i></span> ';
  }() + "\n                </div>\n                <p class='update-time-gauge'><span class=\"not-live pulse\"></span><span class=\"time\">Waiting to be updated...</span></p>\n            </div>\n        </div>\n\n        <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n            <span class='card-settings-button-alert tooltip_test'>\n                <i class=\"fas fa-bell\"></i>\n                <span class=\"tooltiptext\">New feature is coming!</span>\n            </span>\n            <span class='card-settings-button-update tooltip_test'>\n                <i class=\"fas fa-save\"></i>\n                <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n            </span>\n            <span class='card-settings-button-inner'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n            <div class='settings-wrapper'>\n                <div class=\"slidecontainer\">\n\n                    <p class='label-input'>Open:</p>\n                    <input type=\"number\" name=\"openAlert\" " + function () {
    return sensor.sensorMeta.openTimer ? 'value="' + sensor.sensorMeta.openTimer + '"' : '';
  }() + "placeholder=\"Set open limit in seconds\" class=\"input input-open\">\n                    <p class='label-input'>Closed:</p>\n                    <input type=\"number\" name=\"closedAlert\" " + function () {
    return sensor.sensorMeta.closedTimer ? 'value="' + sensor.sensorMeta.closedTimer + '"' : '';
  }() + "placeholder=\"Set closed limit in seconds\" class=\"input input-closed\">\n\n                </div>\n            </div>\n        </div>\n    </article>\n    "; // graph view component


  var graphView = "\n\n    <article class=\"card height-control " + sensor.sensorMeta.sensorId + "-card graph-" + sensor.sensorMeta.sensorId + "\" sensorType=\"" + sensor.sensorMeta.sensorType + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensorData='" + sensorData + "'>\n    \n        <div class=\"card-header\">\n\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                <div class='edit-sensor-name'><i class=\"far fa-edit\"></i></div>\n                <span>" + sensor.sensorMeta.sensorName + "</span> |\n                <b>" + sensor.sensorMeta.sensorId + "</b>\n            </h3>\n    \n            <div class=\"card-tools\">\n                <ul class=\"pagination pagination-sm\">\n\n                    <li class=\"page-item\">\n                        <div id=\"reportrange\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fa fa-calendar\"></i>&nbsp;\n                            <span></span> <i class=\"fa fa-caret-down\"></i>\n                        </div>\n                    </li>\n\n                    <li class=\"page-item\">\n                        <div id=\"report\" class=\"tooltip_test\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fas fa-file-csv\"></i>\n                            <span class=\"tooltiptext\">Download CSV</span>\n                        </div>\n                    </li>\n\n                </ul>\n            </div>\n    \n        </div>\n        \n    \n        <div class=\"card-body\">\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-graph-spinner'>\n                <span>Loading...</span>\n            </a> \n            <div class=\"" + sensor.sensorMeta.sensorId + "-graph-calendar graph-calendar\">\n                Time interval for " + sensor.sensorMeta.sensorId + " \n                <input name=\"dates\" value=\"Button Change\"> \n            </div> \n        </div>\n        \n    </article>"; // stack the components

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
  }); // Edit sensor name

  $('.graph-' + sensorId + ' .card-title .edit-sensor-name').on('click', function (event) {
    var name = prompt('Type a new name for ' + sensorId, $('.graph-' + sensorId + ' .card-title span').text());

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
          $('.graph-' + sensorId + ' .card-title span').html(name);
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
          return _context3.stop();
      }
    }
  });
}; // Global chart list


var chartList = []; // Plot data

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
}

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


  var timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge .time");

  if (date) {
    // Live animation
    var currentDate = new Date();
    var oldDate = new Date(date);
    var diff = (currentDate.getTime() - oldDate.getTime()) / 1000;
    if (diff > 3600) timeEl.siblings('.pulse').addClass("not-live");else timeEl.siblings('.pulse').removeClass("not-live"); // Update date

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
  var currentValueBox, msg, value, currentPower, _currentPower;

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
            value = parseFloat(msg.value).toFixed(1);
            if (value > -200) updateCurrentValue(msg.cId, value);else console.warn("Device", msg.cId, "send weird value:", value);
          } // Listen for no power state


          if (data.topic == 'dataPub/power') {
            msg = JSON.parse(data.message);

            if (parseInt(msg.value)) {
              // add class no power to cId
              if (!$(".live-card-" + msg.cId).hasClass('no-power')) {
                $(".live-card-" + msg.cId + "[battery='1']").removeClass("alert-active").removeClass("alarm-active").addClass("no-power");
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

var sensorMetaRaw; // init variable globally

var mainLoader = function mainLoader() {
  var url, zoneId, sensorBuffer, sensorDataRaw, sensorsWithBattery, sensorCounter, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sensor, sensorData, location3, location2, alert, alarm, power;

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
          sensorsWithBattery = [];
          sensorCounter = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 11;
          _iterator = sensorMetaRaw[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 27;
            break;
          }

          sensor = _step.value;
          _context5.next = 17;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId, sensor.sensorType));

        case 17:
          sensorData = _context5.sent;
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          }); // Append the default sensor view (current value + graph) for each sensor

          $(".card-container").append(defaultSensorView(sensorDataRaw[sensorDataRaw.length - 1])); // Enable trigger events on defaultSensorView components after append

          triggerSensorView(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId); // Plot data on graph based on sensorData attr

          plotData(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId); // Sensors w/ battery functionality

          if (sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.battery == 1) sensorsWithBattery.push(sensorDataRaw[sensorDataRaw.length - 1].sensorMeta.sensorId);

          if (sensorCounter == 0) {
            // Add info box - location
            location3 = sensorDataRaw[0].sensorMeta.location3;
            location2 = sensorDataRaw[0].sensorMeta.location2;
            appendInfoBox({
              title: location2,
              message: location3,
              icon: '<i class="fas fa-compass"></i>',
              class: ''
            });
            sensorCounter++;
          }

        case 24:
          _iteratorNormalCompletion = true;
          _context5.next = 13;
          break;

        case 27:
          _context5.next = 33;
          break;

        case 29:
          _context5.prev = 29;
          _context5.t0 = _context5["catch"](11);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 33:
          _context5.prev = 33;
          _context5.prev = 34;

          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }

        case 36:
          _context5.prev = 36;

          if (!_didIteratorError) {
            _context5.next = 39;
            break;
          }

          throw _iteratorError;

        case 39:
          return _context5.finish(36);

        case 40:
          return _context5.finish(33);

        case 41:
          // let sensorsWithBattery = []
          // for (const sensor of sensorDataRaw) {
          //     // Testing
          //     // if(sensor.sensorMeta.sensorId=='DAS001TCORA') {[
          //     //     sensor.sensorMeta.alerts = 3
          //     // ]}
          //     // if(sensor.sensorMeta.sensorId=='DAS003TCORA') {[
          //     //     sensor.sensorMeta.alerts = 1
          //     // ]}
          //     // if(sensor.sensorMeta.sensorId=='DAS005TCORA') {[
          //     //     sensor.sensorMeta.alerts = 2
          //     // ]}
          //     // Append the default sensor view (current value + graph) for each sensor
          //     $(".card-container").append(defaultSensorView(sensor));
          //     // Enable trigger events on defaultSensorView components after append
          //     triggerSensorView(sensor.sensorMeta.sensorId)
          //     // Plot data on graph based on sensorData attr
          //     plotData(sensor.sensorMeta.sensorId)
          //     // Sensors w/ battery functionality
          //     if (sensor.sensorMeta.battery == 1)
          //         sensorsWithBattery.push(sensor.sensorMeta.sensorId)
          // }
          // Add info box
          // let location3 = sensorDataRaw[0].sensorMeta.location3
          // let location2 = sensorDataRaw[0].sensorMeta.location2
          // appendInfoBox({
          //     title: location2,
          //     message: location3,
          //     icon: '<i class="fas fa-compass"></i>',
          //     class: ''
          // })
          alert = 0, alarm = 0, power = 0;
          sensorDataRaw.forEach(function (item) {
            if (item.sensorMeta.alerts == 1) alert++;
            if (item.sensorMeta.alerts == 2) alarm++;
            if ([3, 4].includes(item.sensorMeta.alerts)) power++;
          });
          appendInfoBox({
            title: 'Warning alert',
            message: alert + ' / ' + sensorDataRaw.length,
            icon: '<i class="fas fa-bell"></i>',
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

        case 47:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[11, 29, 33, 41], [34,, 36, 40]]);
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
          return _context7.stop();
      }
    }
  });
};

initLiveData(); // Update charts continously

var liveChart = function liveChart() {
  var sensorDataRaw, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, sensor, sensorData, _i, _sensorDataRaw, _sensor;

  return regeneratorRuntime.async(function liveChart$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          sensorDataRaw = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context8.prev = 4;
          _iterator2 = sensorMetaRaw[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context8.next = 15;
            break;
          }

          sensor = _step2.value;
          _context8.next = 10;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId, sensor.sensorType));

        case 10:
          sensorData = _context8.sent;
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          });

        case 12:
          _iteratorNormalCompletion2 = true;
          _context8.next = 6;
          break;

        case 15:
          _context8.next = 21;
          break;

        case 17:
          _context8.prev = 17;
          _context8.t0 = _context8["catch"](4);
          _didIteratorError2 = true;
          _iteratorError2 = _context8.t0;

        case 21:
          _context8.prev = 21;
          _context8.prev = 22;

          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }

        case 24:
          _context8.prev = 24;

          if (!_didIteratorError2) {
            _context8.next = 27;
            break;
          }

          throw _iteratorError2;

        case 27:
          return _context8.finish(24);

        case 28:
          return _context8.finish(21);

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
          return _context8.stop();
      }
    }
  }, null, null, [[4, 17, 21, 29], [22,, 24, 28]]);
};

function delay(ms) {
  return regeneratorRuntime.async(function delay$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          }));

        case 2:
          return _context9.abrupt("return", _context9.sent);

        case 3:
        case "end":
          return _context9.stop();
      }
    }
  });
}

var run = function run() {
  return regeneratorRuntime.async(function run$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          if (!1) {
            _context10.next = 6;
            break;
          }

          liveChart();
          _context10.next = 4;
          return regeneratorRuntime.awrap(delay(60 * 1000));

        case 4:
          _context10.next = 0;
          break;

        case 6:
        case "end":
          return _context10.stop();
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