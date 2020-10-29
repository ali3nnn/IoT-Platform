"use strict";

var _utils = require("./utils.js");

var getSensorData = function getSensorData(id) {
  var response;
  return regeneratorRuntime.async(function getSensorData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/get-sensor-data?id=" + id));

        case 2:
          response = _context.sent;
          return _context.abrupt("return", response.json());

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

function defaultSensorView(sensor) {
  // sensorId = String(sensorId)
  var sensorData = JSON.stringify(sensor.sensorData);
  var alertClass = '';
  if (sensor.sensorMeta.alerts == 1) alertClass = 'alert-active';else if (sensor.sensorMeta.alerts == 2) alertClass = 'alarm-active'; // alertClass = 'alert-active'
  // current value gauge component

  var currentValueView = "\n    <article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\">\n\n        <div class=\"card-header " + alertClass + "\">\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                Current Value\n            </h3>\n            <span class='card-settings-button'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n        </div>\n\n        <div class=\"card-body\">\n           <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n                <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                    <span class=\"currentValue\">0</span>\n                    " + function () {
    return sensor.sensorMeta.min ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ';
  }() + "\n                    " + function () {
    return sensor.sensorMeta.max ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ';
  }() + "\n                </div>\n                <p class='update-time-gauge'>Waiting to be updated...</p>\n            </div>\n        </div>\n\n        <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n            <span class='card-settings-button-alert tooltip_test'>\n                <i class=\"fas fa-bell\"></i>\n                <span class=\"tooltiptext\">New feature is coming!</span>\n            </span>\n            <span class='card-settings-button-update tooltip_test'>\n                <i class=\"fas fa-save\"></i>\n                <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n            </span>\n            <span class='card-settings-button-inner'>\n                <i class=\"far fa-sliders-h\"></i>\n            </span>\n            <div class='settings-wrapper'>\n                <div class=\"slidecontainer\">\n\n                    <p class='label-input'>Min: </p>\n                    <input type=\"number\" name=\"minAlert\" placeholder=\"" + function () {
    return sensor.sensorMeta.min ? sensor.sensorMeta.min : 'Set min alert';
  }() + "\" class=\"input input-min\">\n                    <p class='label-input'>Max: </p>\n                    <input type=\"number\" name=\"maxAlert\" placeholder=\"" + function () {
    return sensor.sensorMeta.max ? sensor.sensorMeta.max : 'Set max alert';
  }() + "\" class=\"input input-max\">\n\n                    <p class='label-input'>Lat: </p>\n                    <input type=\"number\" name=\"xLat\" placeholder=\"" + function () {
    return sensor.sensorMeta.x ? sensor.sensorMeta.x : 'Set x position';
  }() + "\" class=\"input input-lat\">\n                    <p class='label-input'>Long: </p>\n                    <input type=\"number\" name=\"yLong\" placeholder=\"" + function () {
    return sensor.sensorMeta.y ? sensor.sensorMeta.y : 'Set y position';
  }() + "\" class=\"input input-long\">\n\n                </div>\n            </div>\n        </div>\n    </article>\n    "; // counter noriel ui


  var newItemLive = "\n    <article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Live Update\n        </h3>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"" + sensor.sensorMeta.sensorId + "-newItem\">\n\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-newItem-spinner'>\n                <span>Loading...</span>\n            </a>\n\n            <div id=\"" + sensor.sensorMeta.sensorId + "-floatinBall\" class=\"hidden-element\"></div>\n\n        </div>\n    </div>"; // graph view component

  var graphView = "\n\n    <article class=\"card height-control " + sensor.sensorMeta.sensorId + "-card graph-" + sensor.sensorMeta.sensorId + "\" sensorType=\"" + sensor.sensorMeta.sensorType + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensorData='" + sensorData + "'>\n    \n        <div class=\"card-header\">\n\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                <span>" + sensor.sensorMeta.sensorName + "</span> |\n                <b>" + sensor.sensorMeta.sensorId + "</b>\n            </h3>\n    \n            <div class=\"card-tools\">\n                <ul class=\"pagination pagination-sm\">\n\n                    <li class=\"page-item\">\n                        <div id=\"reportrange\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fa fa-calendar\"></i>&nbsp;\n                            <span></span> <i class=\"fa fa-caret-down\"></i>\n                        </div>\n                    </li>\n\n                    <li class=\"page-item\">\n                        <div id=\"report\" class=\"tooltip_test\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fas fa-file-csv\"></i>\n                            <span class=\"tooltiptext\">Download CSV</span>\n                        </div>\n                    </li>\n\n                </ul>\n            </div>\n    \n        </div>\n        \n    \n        <div class=\"card-body\">\n            <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-graph-spinner'>\n                <span>Loading...</span>\n            </a> \n            <div class=\"" + sensor.sensorMeta.sensorId + "-graph-calendar graph-calendar\">\n                Time interval for " + sensor.sensorMeta.sensorId + " \n                <input name=\"dates\" value=\"Button Change\"> \n            </div> \n        </div>\n        \n    </article>"; // stack the components

  if (sensor.sensorMeta.sensorType == 'counter') {
    return newItemLive + graphView;
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
    sensorData = JSON.parse(sensorData); // console.log(sensorData)

    var filename = "Report-" + sensorId + ".csv";
    (0, _utils.downloadCSV)({
      filename: filename,
      xlabels: (0, _utils.getValuesFromObject)('time', sensorData),
      ylabels: (0, _utils.getValuesFromObject)('value', sensorData)
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
            var sensorData = JSON.stringify(msg.result);
            console.log("initial attr:", $("article.graph-" + sensor).attr("sensorData"));
            $("article.graph-" + sensor).attr("sensorData", sensorData);
            console.log("after attr:", $("article.graph-" + sensor).attr("sensorData")); // Split the dataset

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
    var data = (0, _utils.getValuesFromObject)('value', sensorData);
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
    }; // console.log(labels)

    labels = labels.map(function (time) {
      return time.replace('Z', '');
    });
    data = data.map(function (value) {
      return value ? value.toFixed(1) : value;
    }); // console.log(timestamps[0], timestamps[timestamps.length - 1])
    // let min = labels[labels.length - 1]
    // let max = labels[0]
    // let labels2 = []
    // let timeDiff = moment(max).diff(moment(min), 'm'); // difference (in days) between min and max date
    // populate 'labels' array
    // console.log("min:", min, "max:", max)
    // for (let i = 0; i <= timeDiff; i++) {
    //     var _label = moment(min).add(i, 'm').format('MM/DD HH:mm');
    //     // console.log(_label)
    //     labels2.push(_label);
    // }
    // console.log(labels)
    // console.log(labels2)
    // console.log(labels)

    var chart = new Chart(canvas, {
      type: 'line',
      data: {
        // labels: labels, //labels are displayed with 3 more hours than this list
        labels: labels,
        datasets: [{
          label: sensorType,
          data: data,
          backgroundColor: 'rgba(51, 153, 255, 0.2)',
          borderColor: 'rgba(51, 153, 255, 1)',
          pointBorderColor: '#343a40',
          pointBackgroundColor: "rgba(51, 153, 255, 1)",
          pointHoverBackgroundColor: "#ffc107",
          pointRadius: 1.5,
          pointHoverRadius: 7,
          pointBorderWidth: 1,
          borderWidth: 1,
          lineTension: 0.2
        }]
      },
      options: options,
      plugins: [{// beforeInit: function (chart) {
        //     // console.log(timestamps[0], timestamps[timestamps.length - 1])
        //     var ticks = chart.options.scales.xAxes[0].ticks, // 'ticks' object reference
        //         // difference (in days) between min and max date
        //         timeDiff = moment(ticks.max).diff(moment(ticks.min), 'm');
        //     // populate 'labels' array
        //     // (create a date string for each date between min and max, inclusive)
        //     // chart.data.labels = []
        //     for (let i = 0; i <= timeDiff; i++) {
        //         var _label = moment(ticks.min).add(i, 'm').format('MM/DD HH:mm');
        //         chart.data.labels.push(_label);
        //     }
        //     // chart.update()
        // }
      }]
    }); // console.log(chart.data)

    chartList.push(chart);
  } else {}
}

function appendInfoBox(label, value) {
  var fontAwesome = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var component = "<div class=\"small-box bg-info county-detail box-shadow-5\">\n        <div class=\"inner\">\n            <h3>" + value + "</h3>\n            <p>" + label + "</p>\n        </div>";

  if (fontAwesome) {
    component += "<div class=\"icon\">" + fontAwesome + "</div>";
  }

  component += "</div>";
  $(".small-box-container").append(component);
}

function updateCurrentValue(sensorid, value) {
  // Update value
  var valueEl = $("article.live-card-" + sensorid + " span.currentValue");
  valueEl.html(value); // Update time

  var timeEl = $("article.live-card-" + sensorid + " p.update-time-gauge");
  var currentTime = new Date();
  currentTime = currentTime.toLocaleString('en-US', {
    timeZone: 'Europe/Bucharest',
    timeStyle: "medium",
    dateStyle: "medium"
  });
  timeEl.html(currentTime);
} // Update current value - it runs each time a message is sent to the broker
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client


var socketChannel = 'socketChannel';
socket.on(socketChannel, function _callee(data) {
  var currentValueBox;
  return regeneratorRuntime.async(function _callee$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          currentValueBox = $("article[class*='live-card']"); // Loop through each current value box

          currentValueBox.each(function (index, item) {
            // get sensor id for each current value box 
            var sensorid = $(item).attr("sensorid"); // get value of topic that contains this sensorid

            if (data.topic.includes(sensorid)) {
              updateCurrentValue(sensorid, parseFloat(data.message).toFixed(1));
            }
          });

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Alerts

function saveSensorSettings(sensorid) {
  var min = $(".live-card-" + sensorid + " .settings-wrapper .input-min").val();
  var max = $(".live-card-" + sensorid + " .settings-wrapper .input-max").val();
  var xLat = $(".live-card-" + sensorid + " .settings-wrapper .input-lat").val();
  var yLong = $(".live-card-" + sensorid + " .settings-wrapper .input-long").val();

  var url = "/api/v3/save-settings?sensorId='" + sensorid + "' " + function () {
    return min ? '&min=' + min : '';
  }() + function () {
    return max ? '&max=' + max : '';
  }() + function () {
    return xLat ? '&xlat=' + xLat : '';
  }() + function () {
    return yLong ? '&ylong=' + yLong : '';
  }();

  url = url.replace(' ', '');
  console.log(url);
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (msg) {
    // Min alert
    if (min) {
      $(".live-card-" + sensorid + " .minAlertGauge").prop("value", min);
      $(".live-card-" + sensorid + " .minAlertGauge").html("min: " + min);
      $(".live-card-" + sensorid + " input[name='minAlert']").prop("value", '');
      $(".live-card-" + sensorid + " input[name='minAlert']").prop("placeholder", "Updated at " + min);
    } // Max alert


    if (max) {
      $(".live-card-" + sensorid + " .maxAlertGauge").prop("value", max);
      $(".live-card-" + sensorid + " .maxAlertGauge").html("max: " + max);
      $(".live-card-" + sensorid + " input[name='maxAlert']").prop("value", '');
      $(".live-card-" + sensorid + " input[name='maxAlert']").prop("placeholder", "Updated at " + max);
    } // xLat


    if (xLat) {
      $(".live-card-" + sensorid + " input[name='xLat']").prop("value", '');
      $(".live-card-" + sensorid + " input[name='xLat']").prop("placeholder", "Updated at " + xLat);
    } // yLong


    if (yLong) {
      $(".live-card-" + sensorid + " input[name='yLong']").prop("value", '');
      $(".live-card-" + sensorid + " input[name='yLong']").prop("placeholder", "Updated at " + yLong);
    }
  });
} // This is the main loader that loads all the data on the dashboard
// ======================================================
// ======================================================


var mainLoader = function mainLoader() {
  var url, zoneId, sensorMetaRaw, sensorBuffer, sensorDataRaw, _i, _sensorMetaRaw, sensor, sensorData, _i2, _sensorDataRaw, _sensor, location3, location2, alert, alarm;

  return regeneratorRuntime.async(function mainLoader$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // console.log(userData_raw)
          // let zoneData = JSON.parse('{{{zoneData}}}')
          // Get query from URL
          url = new URL(location.href);
          zoneId = url.searchParams.get('zoneid'); // Preprocess data to extract sensors from current zone only

          sensorMetaRaw = [];
          sensorBuffer = []; // this buffer is use to prevent double inserting of sensors

          console.log(userData_raw);
          userData_raw.forEach(function (sensor) {
            // Iterate through each result and save unique sensorId rows
            if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
              sensor.zoneId == zoneId ? sensorMetaRaw.push(sensor) : null;
              sensorBuffer.push(sensor.sensorId);
            }
          }); // Get data from influx for each sensor

          sensorDataRaw = [];
          _i = 0, _sensorMetaRaw = sensorMetaRaw;

        case 8:
          if (!(_i < _sensorMetaRaw.length)) {
            _context5.next = 17;
            break;
          }

          sensor = _sensorMetaRaw[_i];
          _context5.next = 12;
          return regeneratorRuntime.awrap(getSensorData(sensor.sensorId));

        case 12:
          sensorData = _context5.sent;
          sensorDataRaw.push({
            sensorMeta: sensor,
            sensorData: sensorData
          });

        case 14:
          _i++;
          _context5.next = 8;
          break;

        case 17:
          console.log(sensorDataRaw);

          for (_i2 = 0, _sensorDataRaw = sensorDataRaw; _i2 < _sensorDataRaw.length; _i2++) {
            _sensor = _sensorDataRaw[_i2];
            // Append the default sensor view (current value + graph) for each sensor
            $(".card-container").append(defaultSensorView(_sensor)); // Enable trigger events on defaultSensorView components after append

            triggerSensorView(_sensor.sensorMeta.sensorId); // Plot data on graph based on sensorData attr

            plotData(_sensor.sensorMeta.sensorId);
          } // Add info box


          location3 = sensorDataRaw[0].sensorMeta.location3;
          location2 = sensorDataRaw[0].sensorMeta.location2;
          appendInfoBox(location2, location3, '<i class="fas fa-compass"></i>');
          alert = 0, alarm = 0;
          sensorDataRaw.forEach(function (item) {
            if (item.sensorMeta.alerts == 1) alert++;
            if (item.sensorMeta.alerts == 2) alarm++;
          });
          appendInfoBox('Warning alert', alert + ' / ' + sensorDataRaw.length, '<i class="fas fa-exclamation"></i>');
          appendInfoBox('Limits exeeded', alarm + ' / ' + sensorDataRaw.length, '<i class="fas fa-exclamation-triangle"></i>'); // return sensorDataRaw

        case 26:
        case "end":
          return _context5.stop();
      }
    }
  });
};

mainLoader();