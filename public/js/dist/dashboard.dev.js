"use strict";

var _utils = require("./utils.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var time = new Date();
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
var monthName = month[time.getMonth()];
var dayName = days[time.getDay()]; // Global Variables
// var username = $(".navbar-brand b")[0].innerText.slice(0, $(".navbar-brand b")[0].innerText.length - 1)

var countyName = $(".county-detail h3").html();
document.title = countyName.toUpperCase() + " | Anysensor";
var json = '';
var oldUpdatedTime = '';
var counterOld = ['', '']; // console.log("vars", new Date() - time)
// Set the minimum height of the sidebar
// let timeout = (ms,f) => {
//     let sleep =  new Promise(resolve => setTimeout(function(){
//         f()
//         // return resolve
//     }, ms))
// }
// Make Socket.io connection
// var socket = io.connect("/")
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

function addSmallBox(label, value) {
  var fontAwesome = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var component = "<div class=\"small-box bg-info county-detail box-shadow-5\">\n        <div class=\"inner\">\n            <h3>" + value + "</h3>\n            <p>" + label + "</p>\n        </div>";

  if (fontAwesome) {
    component += "<div class=\"icon\"><i class=\"" + fontAwesome + "\"></i></div>";
  }

  component += "</div>";
  $(".small-box-container").append(component);
}

function addCssForSmallBox() {
  var countSmallBoxes = $(".small-box-container .small-box").length;
  $(".small-box-container").addClass("small-box-length-" + countSmallBoxes + ""); // console.log("countSmallBoxes:", countSmallBoxes)
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

function playSound(url) {
  var audio = new Audio(url);
  audio.play();
} // used to create the gauges


function currentValueSvgGauge(element) {
  var currentValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : NaN;
  var updatedAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -20;
  var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 70;
  // If there are no alerts min and max == NaN
  // console.log("Alerts:",min,max)
  var isCounter = false; // element.split('-')[1] == 'c' ? isCounter = true : isCounter = false
  // console.log(element, isCounter)
  // Remove loader

  if (isCounter) {
    $('.' + element + '-newItem-spinner').remove();
  } else {
    $('.' + element + '-currentValue-spinner').remove();
  } // console.log("currentValueSvgGauge", currentValue)


  if (isNaN(currentValue)) {
    if (isCounter) {
      $("." + element + "-newItem").prepend("No value recorded today");
      $("." + element + "-newItem").attr("no-value");
      $(".live-card-" + element + " .card-settings-button").addClass("hidden-element");
      return [NaN, NaN];
    } else {
      // here can be improved by showing the latest read value
      // and showing the time when last value was read
      // and maybe a small info that the info is not very recent
      // $(".live-card-" + element + " .card-settings-button").addClass("hidden-element")
      // new way
      var gauge = $('#' + element + '-gauge .currentValue'); // $('#' + element + '-gauge .currentValue').remove()
      // $('#' + element + '-gauge').append(gauge)
      // gauge.html("No value recorded today")
      // Append two times the same element, it may not be loaded first time

      (0, _utils.timeoutAsync)(500, function () {
        $("#" + element + "-gauge .currentValue").html("<span class='no-value'>No value recorded today</span>");
      });
      (0, _utils.timeoutAsync)(1500, function () {
        $("#" + element + "-gauge .currentValue .no-value").remove();
        $("#" + element + "-gauge .currentValue").html("<span class='no-value'>No value recorded today</span>");
      }); // End append two times

      $("#" + element + "-gauge .currentValue").attr("no-value", 'true'); // old way
      // $("#" + element + "-gauge").parent().prepend("No value recorded today")
      // $("#" + element + "-gauge").parent().attr("no-value", 'true')

      return gauge;
    }
  } else {
    // console.log(element + '-gauge')
    if (isCounter) {// pulse effect already appended
    } else {
      // console.log("else gauge")
      // experimental way - show the numbers
      // $('#' + element + '-gauge').append(`<span class="currentValue" value="` + currentValue + `">` + currentValue + `</span>`)
      var gauge = $('#' + element + '-gauge .currentValue');
      gauge.html(currentValue); // old way - transform element in gauge
      // var gauge = Gauge(
      //     document.getElementById(element + '-gauge'), {
      //         min: min,
      //         max: max,
      //         dialStartAngle: 180,
      //         dialEndAngle: 0,
      //         value: currentValue,
      //         label: function (value) {
      //             return (Math.round(value * 10) / 10);
      //         },
      //         viewBox: "0 0 100 57",
      //         // valueDialClass: "valueDial",
      //         // valueClass: "valueText",
      //         // dialClass: "dial",
      //         // gaugeClass: "gauge",
      //         showValue: true,
      //         color: function (value) {
      //             if (value < 20) {
      //                 return "#5ee432";
      //             } else if (value < 40) {
      //                 return "#fffa50";
      //             } else if (value < 60) {
      //                 return "#f7aa38";
      //             } else if (value == 0) {
      //                 return "gray";
      //             } else {
      //                 return "#ef4655";
      //             }
      //         }
      //     }
      // );
    } // console.log(updatedAt)


    if (updatedAt) {
      var updatedTime = Date.parse(updatedAt);
      updatedTime = new Date(updatedTime);
      updatedTime = updatedTime.addHours(-2);
      updatedTime = updatedTime.toLocaleString('en-US', {
        timeZone: 'Europe/Bucharest',
        timeStyle: "medium",
        dateStyle: "long"
      }); // console.log(">> ",updatedTime)
      // current date
      // var date = new Date()
      // updatedAt is at best 1 hour behind current date 
      // var hour = date.getHours()
      // dateLatestValue add two hours to updatedAt
      // var dateLatestValue = updatedAt.split("T")[0].split("-")
      // var hourLatestValue = updatedAt.split("T")[1].split(":").slice(0, 2)
      // -1 to match with hour from graph
      // var hourLatestValue = dateLatestValue.getHours() - 1
      // console.log(element)
      // console.log("date",date)
      // console.log("dateLatestValue",dateLatestValue,hourLatestValue)
      // var influxTime = new Date(dateLatestValue[0], dateLatestValue[1] - 1, dateLatestValue[2], hourLatestValue[0], hourLatestValue[1])
      // console.log(influxTime)
      // influxTime = influxTime.addHours(1)
      // influxTime = String(influxTime).split(" ").slice(1, 5)
      // updatedTime = influxTime[0] + " " + influxTime[1] + " " + influxTime[2] + " " + influxTime[3]
      // console.log(influxTime)
      // var dif = date - dateLatestValue
      // var difMin = dif/1000/60
      // var preciseTime = (parseInt(String(difMin).split('.')[0]) > 4) ? parseInt(String(difMin).split('.')[0])+" min ago" : parseInt(String(difMin*60).split('.')[0])+" sec ago"
      // var difH = hour - hourLatestValue
      // var text = difH > 1 ? 'hours' : 'hour'

      if (isCounter) {
        $('#' + element + '-floatinBall').removeClass("hidden-element");
        $("." + element + "-newItem").append("<p class='update-time-gauge'>Updated at " + updatedTime + "</p>"); // $('#' + element + '-floatinBall').addClass("pulse-effect")
        // timeout(1700, function () {
        //     $('#' + element + '-floatinBall').removeClass("pulse-effect")
        // console.log("3 seconds async timeout")
        // })
      } else {
        $('#' + element + '-gauge').removeClass("hidden-element");
        $("#" + element + "-gauge").parent().append("<p class='update-time-gauge'>Updated at " + updatedTime + "</p>");
      } // if(parseInt(String(difMin).split('.')[0] > 60)) {
      //     // try { $(".update-time-gauge").remove() } catch {}
      //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+difH+" "+text+" ago</p>")
      // } else {
      //     // try { $(".update-time-gauge").remove() } catch {}
      //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+preciseTime+" </p>")
      // }

    } // Append unit measure


    if (Number.isInteger(currentValue)) {
      if (element.includes("source")) {
        $('#' + element + '-gauge g.text-container text').append(".0 V");
      } else {
        $('#' + element + '-gauge g.text-container text').append(".0 &#8451;");
      }
    } else {
      if (element.includes("source")) {
        $('#' + element + '-gauge g.text-container text').append(" V");
      } else {
        $('#' + element + '-gauge g.text-container text').append(" &#8451;");
      }
    }

    return gauge;
  }
} // not used


function currentValueAdd(element, liveData) {
  // Live Data
  if (liveData != 'NaN') {
    // Remove Loading Item
    $('.' + element + '-currentValue-spinner').remove(); // Add Live Data
    // $("." + element + "-currentValue").append(liveData)
    // debug
    // console.log("Real value update "+element+":",liveData)
  } else {
    // Remove Loading Item
    $('.' + element + '-currentValue-spinner').remove(); // Add Live Data
    // $("." + element + "-currentValue").append(`<p class='no-data-from-sensor' >No data from sensor with id <b>` + element + `</b></p>`)
  }
} // used for updating the gauges


function updateValueSvgGauge(element, gauge, value) {
  var updatedAt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  // Reset no-value attribute
  $("#" + element + "-gauge .currentValue").removeAttr("no-value"); // TODO: Cuurently the counter sensors depends on their sensorid in order
  // to be recognized (SENSORID-c). It should not depened anymore.

  var isCounter = false;
  element.split('-')[1] == 'c' ? isCounter = true : isCounter = false; // TODO: Gauge are not used anymore
  // Update the value

  if (!isNaN(value) && !isCounter) {
    try {
      gauge.setValue(value);
    } catch (_unused) {
      gauge.html(value);
    }
  } // TODO: g.text-container doest not exist anymore
  // Append unit measure


  if (value == parseInt(value, 10)) {
    if (element.includes("source")) {
      $('#' + element + '-gauge g.text-container text').append(".0 V");
    } else {
      $('#' + element + '-gauge g.text-container text').append(".0 &#8451;");
    }
  } else {
    if (element.includes("source")) {
      $('#' + element + '-gauge g.text-container text').append(" V");
    } else {
      $('#' + element + '-gauge g.text-container text').append(" &#8451;");
    }
  } // console.log(updatedAt)


  if (updatedAt) {
    // console.log("updatedAt received",updatedAt)
    // current date
    var date = new Date(); // this is the server date
    // updatedAt is at best 1 hour behind current date 
    // var hour = date.getHours()
    // dateLatestValue add two hours to updatedAt
    // var dateLatestValue = updatedAt.split("T")[0].split("-")
    // var hourLatestValue = updatedAt.split("T")[1].split(":").slice(0, 3)
    // console.log(updatedAt.split("T")[1].split(":"))

    var updatedTime = updatedAt; // -1 to match with hour from graph
    // var hourLatestValue = dateLatestValue.getHours() - 1
    // console.log(element)
    // console.log("date",date)
    // console.log("dateLatestValue",dateLatestValue,hourLatestValue)
    // var influxTime = new Date(dateLatestValue[0], dateLatestValue[1] - 1, dateLatestValue[2], hourLatestValue[0], hourLatestValue[1], hourLatestValue[2].split(".")[0])
    // console.log(influxTime)
    // influxTime = influxTime.addHours(1)
    // influxTime = String(influxTime).split(" ").slice(1, 6)
    // updatedTime = influxTime[0] + " " + influxTime[1] + " " + influxTime[2] + " " + influxTime[3]
    // console.log(influxTime)
    // var dif = date - dateLatestValue
    // var difMin = dif/1000/60
    // var preciseTime = (parseInt(String(difMin).split('.')[0]) > 4) ? parseInt(String(difMin).split('.')[0])+" min ago" : parseInt(String(difMin*60).split('.')[0])+" sec ago"
    // var difH = hour - hourLatestValue
    // var text = difH > 1 ? 'hours' : 'hour'
    // console.log("." + element + "-currentValue .update-time-gauge")

    if (isCounter) {
      var oldUpdatedTime = $("." + element + "-newItem .update-time-gauge").html().split("Updated at ")[1];

      if (oldUpdatedTime != updatedTime) {
        $("." + element + "-newItem .update-time-gauge").html("Updated at " + updatedTime);
        $('#' + element + '-floatinBall').addClass("pulse-effect");
        timeout(4500, function () {
          $('#' + element + '-floatinBall').removeClass("pulse-effect"); // console.log("3 seconds async timeout")
        });
      }
    } else {
      $("." + element + "-currentValue .update-time-gauge").html("Updated at " + updatedTime);
    } // if(parseInt(String(difMin).split('.')[0] > 60)) {
    //     // try { $(".update-time-gauge").remove() } catch {}
    //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+difH+" "+text+" ago</p>")
    // } else {
    //     // try { $(".update-time-gauge").remove() } catch {}
    //     $("#"+element+"-gauge").parent().append("<p class='update-time-gauge'>Updated "+preciseTime+" </p>")
    // }

  }
}

function removeElement(array, index) {
  array.splice(index, 1);
}

function addHistoryButton(sensor, x, y) {
  $(".graph-" + sensor + " ul.pagination").append("<li class=\"page-item\">\n        <div id=\"predictor-switch\" xlabels=\"" + x + "\" ylabels=\"" + y + "\" clicked=\"false\" class=\"tooltip_test graph-button\" style=\"background: #fff;cursor: pointer;padding: 5px 10px;border: 1px solid #ccc;width: 100%;height: 32px;width: 36px;\">\n            <i class=\"fas fa-history\" aria-hidden=\"true\"></i> \n            <span class=\"tooltiptext\">Show data for last " + dayName.toLowerCase() + "</span>\n        </div>\n    </li>");
}

function addExpandButton() {
  var nan = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var sensor = arguments.length > 1 ? arguments[1] : undefined;
  var ylabels = arguments.length > 2 ? arguments[2] : undefined;
  var xlabels = arguments.length > 3 ? arguments[3] : undefined;
  var label = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var graphConfig = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  console.log(sensor); // $(".graph-" + sensor + " ul.pagination").style.display = "none"

  $(".graph-" + sensor + " ul.pagination").prepend("<li class=\"page-item\">\n        <div id=\"expand-switch\" clicked=\"0\" ylabels=\"" + ylabels + "\" xlabels=\"" + xlabels + "\"\n        class=\"tooltip_test graph-button\"\n        style=\"background: #fff;cursor: pointer;padding: 5px 10px;border: 1px solid #ccc;width: 100%;height: 32px;width: 36px;\" >\n        <i class=\"fas fa-search-plus\"> </i> \n        <span class=\"tooltiptext\" > Fit the chart view </span> \n        </div>\n        </li>");
  $(".graph-" + sensor + " #expand-switch").css("display", "none"); // if(nan==0) {
  //     $(".graph-" + sensor + " #expand-switch").attr("enable","false")
  //     $(".graph-" + sensor + " #expand-switch").attr("clicked","disabled")
  // }

  $("#expand-switch").click(function () {
    //     // console.log($(".calendar-active").length)
    if ($(".calendar-active").length) {
      //         addExpandButtonFlag = false
      //         // console.log("zoom out", attrInt, attrInt % 2 == 0)
      //         sliceFlag = false
      var ylabels_attr = $(this).attr('ylabels').split(",");
      var xlabels_attr = $(this).attr('xlabels').split(",");
      var xlabels_attr_clone = [];
      xlabels_attr.forEach(function (item) {
        var aux = new Date(parseInt(item)); // console.log(item, aux, aux.getTime())

        xlabels_attr_clone.push(aux.getTime());
      }); //         // console.log(ylabels_attr)
      //         // console.log(xlabels_attr_clone)
      // plotData(sensor, ylabels_attr, xlabels_attr_clone, '', null)
      // $(".graph-" + sensor + " #expand-switch").css("display", "none")
      // var oldHtml = $("#predictor-switch .tooltiptext").attr("oldhtml")
      // switchButtonSecondGraph(sensor, attr = 'false')
      // $("#predictor-switch .tooltiptext").html(oldHtml)
      //         // Remove calendar-active class
      //         $("body").removeClass("calendar-active")
      //         // Check history button
      //         var isDisabled = $(".graph-" + sensorId + " #predictor-switch").attr("clicked") == 'disabled'
      //         var isOldHtml = $(".graph-" + sensorId + " #predictor-switch .tooltiptext").attr("oldhtml")
      //         if (isDisabled && isOldHtml) {
      //             switchButtonSecondGraph(sensor, attr = 'false')
      //             $(".graph-" + sensorId + " #predictor-switch .tooltiptext").html(isOldHtml)
      //         }
    } else {} //         var clickedAttr = $(this).attr('clicked')
      //         var attrInt = parseInt(clickedAttr) + 1
      //         $(this).attr('clicked', attrInt)
      //         addExpandButtonFlag = false
      //         if (attrInt % 2 == 1) {
      //             // console.log("zoom in ", attrInt, attrInt % 2 == 0)
      //             sliceFlag = true
      //             plotData(sensor, ylabels, xlabels, label, graphConfig)
      //         } else {
      //             // console.log("zoom out", attrInt, attrInt % 2 == 0)
      //             sliceFlag = false
      //             var ylabels_attr = $(this).attr('ylabels').split(",")
      //             var xlabels_attr = $(this).attr('xlabels').split(",")
      //             var xlabels_attr_clone = []
      //             xlabels_attr.forEach(item => {
      //                 var aux = new Date(parseInt(item))
      //                 // console.log(item, aux, aux.getTime())
      //                 xlabels_attr_clone.push(aux.getTime())
      //             })
      //             // console.log(ylabels_attr)
      //             // console.log(xlabels_attr_clone)
      //             plotData(sensor, ylabels_attr, xlabels_attr_clone, label, graphConfig)
      //         }
      //     // console.log(xlabels)
      //     // console.log(ylabels)

  });
}

var sliceFlag = false;
var addExpandButtonFlag = true;
var chartList2 = [];

var plotData = function plotData(element, ylabels, xlabels, label) {
  var graphConfig,
      original_ylabels,
      original_xlabels,
      counterTemperature,
      counterTimestamp,
      nanFlag,
      counterNaN,
      threshold,
      prediction_y,
      prediction_x,
      experiment,
      sensorType,
      chart_canvas,
      options,
      chart,
      _args = arguments;
  return regeneratorRuntime.async(function plotData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          graphConfig = _args.length > 4 && _args[4] !== undefined ? _args[4] : false;
          // Check if there is data
          // console.log(element, ylabels, ylabels.length)
          // console.log("NEW chart for:", element, "ylabels.length", ylabels.length, ylabels)
          // console.log("y", ylabels)
          // console.log("x", xlabels)
          // console.log(ylabels[0], ylabels[0] == "NaN")
          original_ylabels = ylabels.slice();
          original_xlabels = xlabels.slice(); // Slice NaN Data
          // If there is no data from 00:00 to 07:00 for example - all data between will be deleted
          // ===============================================

          if (ylabels[0] == "NaN" && sliceFlag == true) {
            removeElement(ylabels, 0);
            removeElement(xlabels, 0);
            counterTemperature = 0;
            counterTimestamp = 0;
            nanFlag = false;

            while (nanFlag == false) {
              // console.log("nanFlag", nanFlag, ylabels[0])
              if (ylabels[0] == "NaN") {
                // console.log("y,x:", ylabels[0], xlabels[0])
                // console.log(ylabels.length)
                removeElement(ylabels, 0);
                removeElement(xlabels, 0); // console.log(ylabels.length)
              } else {
                nanFlag = true;
              }
            } // console.log("RESULT")
            // console.log("y", ylabels)
            // console.log("x", xlabels)

          } else if (sliceFlag == false) {
            counterNaN = 0;
            nanFlag = false;

            while (nanFlag == false) {
              if (ylabels[counterNaN] == "NaN") {
                counterNaN++;
              } else {
                nanFlag = true;
              }
            }

            threshold = counterNaN / ylabels.length;

            if (addExpandButtonFlag) {// add button to expand
              // addExpandButton(nan = counterNaN, element, original_ylabels, original_xlabels, label, graphConfig)
            }
          } // console.log(original_ylabels)
          // console.log(original_xlabels)
          // ===============================================
          // END Slice NaN Data
          // AI Prediction
          // ===============================================
          // console.log("PLOT DATA:")
          // for (i = 0; i < ylabels.length; i++) {
          //     prediction[i] = null;
          //     if (i == ylabels.length - 1) {
          //         prediction[i] = ylabels[i];
          //     }
          // }
          // Check last datestamp
          // if (!$("body").hasClass("calendar-active")) {
          //     // var xLastHour = xlabels[xlabels.length - 1]
          //     // var lastDatestamp = xlabels[xlabels.length - 1]
          //     // var convertLastDatestamp = new Date(lastDatestamp)
          //     // var xLastHour = convertLastDatestamp.getHours()
          //     // console.log(xLastHour, xlabels.length, xlabels.length/xLastHour)
          // }
          // for (var i = parseInt(xLastHour) + 1; i < 24; i++) {
          //     xlabels.push(i.toString())
          //     ylabels.push(null)
          // prediction.push(Math.floor(Math.random() * (29 - 27 + 1)) + 27)
          // }
          // ===============================================
          // END AI Prediction
          // Get last week of this day
          // ===============================================


          prediction_y = [];
          prediction_x = [];
          _context.next = 8;
          return regeneratorRuntime.awrap(getSensorDataExperiment(element));

        case 8:
          experiment = _context.sent;
          // console.log(experiment[0])
          if (!experiment[0].error) experiment[0].sensorAverage.forEach(function (item) {
            if (item.sensorValue) {
              prediction_y.push(item.sensorValue.toFixed(1));
            } else {
              prediction_y.push(null);
            }

            prediction_x.push(item.sensorTime);
          });
          prediction_y = prediction_y.reverse();
          prediction_x = prediction_x.reverse();

          if (!$("#predictor-switch").length) {} // addHistoryButton(element, prediction_x, prediction_y)
          // console.log("prediction_y:",prediction_y)
          // console.log("prediction_x:",prediction_x)
          // ===============================================
          // END Get last week of this day
          // console.log("y:", ylabels)
          // console.log("x:", xlabels)
          // Get sensorType attribute


          sensorType = $('article.' + element + '-card').attr('sensorType');
          label = sensorType; // console.log(label)
          // Remove No data message

          $('article.' + element + '-card .no-data-from-sensor').remove(); // Remove Loading Item

          $('.' + element + '-graph-spinner').remove(); // Remove Old Canvas if exist

          $('#' + element + '-graph').remove(); // add canvas

          $('.' + element + '-card .card-body').append("<canvas id=\"" + element + "-graph\"></canvas>");

          if (ylabels.length) {
            /* CHART JS */
            chart_canvas = document.getElementById(element + '-graph').getContext("2d");

            if (graphConfig != false) {
              options = {
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
                    type: "time",
                    time: {
                      unit: graphConfig
                    },
                    // distribution: 'series',
                    gridLines: {
                      color: "rgba(0, 0, 0, 0)"
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
              };
            } else {
              options = {
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
                    type: "time",
                    time: {
                      unit: 'minute'
                    },
                    distribution: 'series',
                    gridLines: {
                      color: "rgba(0, 0, 0, 0)"
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
              };
            } // var options = {
            //     animation: false,
            //     responsive: true,
            //     maintainAspectRatio: false,
            //     drawBorder: false,
            //     // onResize: console.log("chart resize"),
            //     legend: {
            //         labels: {
            //             fontColor: 'white'
            //         }
            //     },
            //     scales: {
            //         xAxes: [{
            //             type: "time",
            //             time: {
            //                 unit: 'day'
            //             },
            //             // distribution: 'series',
            //             gridLines: {
            //                 color: "rgba(0, 0, 0, 0)",
            //             },
            //             ticks: {
            //                 fontColor: 'white'
            //             }
            //         }],
            //         yAxes: [{
            //             ticks: {
            //                 beginAtZero: false,
            //                 fontColor: 'white'
            //             },
            //             gridLines: {
            //                 color: "#415f7d",
            //                 zeroLineColor: '#415f7d'
            //             }
            //         }]
            //     }
            // }


            chart = new Chart(chart_canvas, {
              type: 'line',
              data: {
                labels: xlabels,
                datasets: [{
                  label: label[0].toUpperCase() + label.slice(1, label.length),
                  data: ylabels,
                  // old design
                  // backgroundColor: 'rgba(51, 153, 255, 0.2)',
                  // borderColor: 'rgba(51, 153, 255, 1)',
                  // pointBorderColor: '#343a40',
                  // pointBackgroundColor: "rgba(51, 153, 255, 1)",
                  // pointHoverBackgroundColor: "white",
                  // pointRadius: 7,
                  // pointHoverRadius: 7,
                  // pointBorderWidth: 4,
                  // borderWidth: 1,
                  // lineTension: 0.2
                  // new design
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
              options: options
            }); // if (!experiment[0].error)
            // switchSecondGraph(chart, element, prediction_y, prediction_x)
            // else
            // switchButtonSecondGraph(element, attr = 'disabled')
            // return chart
          } else {
            // add no data message
            // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
            $('.' + element + '-card .card-body').append("<p class='no-data-from-sensor' >No data from sensor with id <b>" + element + "</b> for today</p>"); // add canvas
            // console.log(`<canvas id="` + element + `-graph"></canvas> in`, '.' + element + '-card')
            // $('.' + element + '-card .card-body').append(`<canvas id="` + element + `-graph class='hidden-graph' "></canvas>`)
            // Remove Loading Item
            // console.log('.' + element + '-graph-spinner', 'removed')
            // $('.' + element + '-graph-spinner').remove()

            /* CHART JS */
            // console.log(element + '-graph', xlabels, ylabels, label)

            $('#' + element + '-graph').addClass('hidden-graph');
            chart_canvas = document.getElementById(element + '-graph').getContext("2d"); // if (chart) {
            //     chart.destroy();
            // }

            chart = new Chart(chart_canvas, {
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

          $('article.' + element + '-card').attr("xlabels", xlabels);
          $('article.' + element + '-card').attr("ylabels", ylabels); // filename = filename.split(" ")
          // console.log(filename)
          // document.getElementById("report").addEventListener("click", function (e) {
          // $("#report").click(function (e) {
          //     e.preventDefault();
          //     downloadCSV({
          //         filename,
          //         chart
          //     })
          // })
          // });

          chartList2.push(chart);
          return _context.abrupt("return", chart);

        case 24:
        case "end":
          return _context.stop();
      }
    }
  });
};

function convertChartDataToCSV(args) {// console.log(args.data)
  // var result, ctr, keys, columnDelimiter, lineDelimiter, data;
  // data = args.data || null;
  // if (data == null || !data.length) {
  //     return null;
  // }
  // columnDelimiter = args.columnDelimiter || ',';
  // lineDelimiter = args.lineDelimiter || '\n';
  // keys = Object.keys(data[0]);
  // result = '';
  // result += keys.join(columnDelimiter);
  // result += lineDelimiter;
  // data.forEach(function (item) {
  //     ctr = 0;
  //     keys.forEach(function (key) {
  //         if (ctr > 0) result += columnDelimiter;
  //         result += item[key];
  //         ctr++;
  //     });
  //     result += lineDelimiter;
  // });
  // return result;
}

function addDataAttributeToGraph(sensorId, x, y) {
  document.querySelector(".graph-" + sensorId + " #reportrange").setAttribute('xlabels', x);
  document.querySelector(".graph-" + sensorId + " #reportrange").setAttribute('ylabels', y);
} // select mean(value) as value, first(type) as type from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time>='2020-06-29T09:00:00.000000000Z' and time<'2020-07-01T17:00:00.000000000Z' GROUP BY time(1h) ORDER BY time DESC


function defaultSensorView(sensorId, sensorType, sensorZone) {
  // console.log("append")
  sensorId = String(sensorId); // current value gauge component

  var currentValueView = "\n    <article class=\"card height-control live-card-" + sensorId + "\" sensorId=\"" + sensorId + "\" sensortype=\"" + sensorType + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Current Value\n        </h3>\n        <span class='card-settings-button hidden-button'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"" + sensorId + "-currentValue\">\n            <a href=\"#\" class='spinner " + sensorId + "-currentValue-spinner'>\n                <span>Loading...</span>\n            </a>\n            <div id=\"" + sensorId + "-gauge\" class=\"gauge-container two hidden-element\">\n                <span class=\"currentValue\"></span>\n            </div>\n        </div>\n    </div>\n\n    <div class='card-alerts-settings alert-" + sensorId + "'>\n        <span class='card-settings-button-alert tooltip_test'>\n            <i class=\"fas fa-bell\"></i>\n            <span class=\"tooltiptext\">New feature is coming!</span>\n        </span>\n        <span class='card-settings-button-update tooltip_test'>\n            <i class=\"fas fa-save\"></i>\n            <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n        </span>\n        <span class='card-settings-button-inner'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n        <div class='settings-wrapper'>\n            <div class=\"slidecontainer\">\n\n                <p class='label-input'>Min:</p>\n                <input type=\"number\" placeholder=\"Min alert\" class=\"input input-min\">\n                <p class='label-input'>Max:</p>\n                <input type=\"number\" placeholder=\"Max alert\" class=\"input input-max\">\n\n                <p class='label-input'>Lat:</p>\n                <input type=\"number\" placeholder=\"Lat\" class=\"input input-lat\">\n                <p class='label-input'>Long:</p>\n                <input type=\"number\" placeholder=\"Long\" class=\"input input-long\">\n\n            </div>\n        </div>\n    </div>\n    "; // counter noriel ui

  var newItemLive = "\n    <article class=\"card height-control live-card-" + sensorId + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Live Update\n        </h3>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"" + sensorId + "-newItem\">\n\n            <a href=\"#\" class='spinner " + sensorId + "-newItem-spinner'>\n                <span>Loading...</span>\n            </a>\n\n            <div id=\"" + sensorId + "-floatinBall\" class=\"hidden-element\"></div>\n\n        </div>\n    </div>"; // graph view component

  var graphView = "</article>\n\n    <article class=\"card height-control " + sensorId + "-card graph-" + sensorId + "\" sensorType=\"" + sensorType + "\" sensorId=\"" + sensorId + "\">\n    \n        <div class=\"card-header\">\n\n            <h3 class=\"card-title\">\n                <i class='update-icon'></i>\n                <span>" + sensorZone + "</span> |\n                <b>" + sensorId + "</b>\n            </h3>\n    \n            <div class=\"card-tools\">\n                <ul class=\"pagination pagination-sm\">\n\n                    <li class=\"page-item\">\n                        <div id=\"reportrange\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fa fa-calendar\"></i>&nbsp;\n                            <span></span> <i class=\"fa fa-caret-down\"></i>\n                        </div>\n                    </li>\n\n                    <li class=\"page-item\">\n                        <div id=\"report\" class=\"tooltip_test\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                            <i class=\"fas fa-file-csv\"></i>\n                            <span class=\"tooltiptext\">Download CSV</span>\n                        </div>\n                    </li>\n\n                </ul>\n            </div>\n    \n        </div>\n        \n    \n        <div class=\"card-body\">\n            <a href=\"#\" class='spinner " + sensorId + "-graph-spinner'>\n                <span>Loading...</span>\n            </a> \n            <div class=\"" + sensorId + "-graph-calendar graph-calendar\">\n                Time interval for " + sensorId + " \n                <input name=\"dates\" value=\"Button Change\"> \n            </div> \n        </div>\n        \n    </article>"; // stack the components

  if (sensorType == 'counter') {
    return newItemLive + graphView;
  } else {
    return currentValueView + graphView;
  }
}

var alertsLoadFlag = true;

var readAlerts = function readAlerts() {
  var alerts;
  return regeneratorRuntime.async(function readAlerts$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/read-alerts"));

        case 2:
          alerts = _context2.sent;
          return _context2.abrupt("return", alerts.json());

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // let readLocation = async () => {
//     let alerts = await fetch("/api/read-location")
//     return alerts.json()
// }


function alertsAndLocationLoad() {
  // console.log("alertsAndLocationLoad()")
  if (alertsLoadFlag) {
    (function _callee() {
      var alerts, i, sensorId, locationObj, item;
      return regeneratorRuntime.async(function _callee$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(readAlerts());

            case 2:
              alerts = _context3.sent;

              //this returns all the alerts in mysql - it should return only the alerts of this user
              // console.log(alerts)
              for (i = 0; i < alerts.result.length; i++) {
                sensorId = alerts.result[i].sensorId; // load alert' values

                $(".live-card-" + sensorId + " .input-min").attr("value", alerts.result[i].min);
                $(".live-card-" + sensorId + " .input-max").attr("value", alerts.result[i].max);
              } // load locations into inputs value
              // console.log(getLocationObj())


              locationObj = (0, _utils.getLocationObj)();

              for (item in locationObj) {
                // console.log(item, locationObj[item])
                $("article[class*='live'][sensorid='" + item + "'] .input-lat").attr("value", locationObj[item][0]);
                $("article[class*='live'][sensorid='" + item + "'] .input-long").attr("value", locationObj[item][1]);
              } // try {
              //     var locationObj = getLocationObj()
              //     console.log(locationObj,sensorId)
              //     if (locationObj[sensorId] != undefined) {
              //         // console.log(locationObj, locationObj[sensorId])
              //         // console.log($("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").length)
              //         // $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").val(locationObj[sensorId][0])
              //         // $("article[class*='live'][sensorid='" + sensorId + "'] .input-long").val(locationObj[sensorId][1])
              //         // console.log(sensorId, $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").val())
              //         $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").attr("value", locationObj[sensorId][0])
              //         $("article[class*='live'][sensorid='" + sensorId + "'] .input-long").attr("value", locationObj[sensorId][1])
              //     }
              // } catch {
              //     $("article[class*='live'][sensorid='" + sensorId + "'] .input-lat").attr("value", "not set")
              //     $("article[class*='live'][sensorid='" + sensorId + "'] .input-long").attr("value", "not set")
              // }


            case 6:
            case "end":
              return _context3.stop();
          }
        }
      });
    })();
  }
}

function sensorSettingsToggle(sensorId) {
  $(".live-card-" + sensorId + " .card-settings-button").removeClass("hidden-button");
  $(".live-card-" + sensorId + "  .card-settings-button").click(function () {
    $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up');
    $(this).parent().parent().children('.card-body').toggleClass('blur8');
    $(this).parent().parent().children('.card-header').toggleClass('blur8');
    alertsAndLocationLoad();
  });
  $(".live-card-" + sensorId + "  .card-settings-button-inner").click(function () {
    $(this).parent().parent().children('.card-alerts-settings').toggleClass('alerts-settings-up');
    $(this).parent().parent().children('.card-body').toggleClass('blur8');
    $(this).parent().parent().children('.card-header').toggleClass('blur8');
  });
  $(".live-card-" + sensorId + " .card-settings-button-update").click(function () {
    // these two should use promises and call one after another
    updateSensorSettings(sensorId); // appendAlertsToHTML(sensorId)
  });
}

var saveSensorSettings = function saveSensorSettings(sensorId, minVal, maxVal, lat, long) {
  var sensorType,
      _args4 = arguments;
  return regeneratorRuntime.async(function saveSensorSettings$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          sensorType = _args4.length > 5 && _args4[5] !== undefined ? _args4[5] : null;
          // let response = await fetch("/api/set-alerts/?sensorId='" + sensorId + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long)
          // console.log(await response)
          // return response.json()
          // need to replace with ajax request for notification
          $.ajax({
            url: "/api/set-alerts/?sensorId='" + sensorId + "'&sensorType='" + sensorType + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long,
            type: 'GET',
            success: function success(msg) {
              alert("Alerts and location updated!");
              console.log({
                msg: msg,
                url: "/api/set-alerts/?sensorId='" + sensorId + "'&sensorType='" + sensorType + "'&min=" + minVal + "&max=" + maxVal + "&lat=" + lat + "&long=" + long
              });
            }
          });

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
};

function updateSensorSettings(sensorId) {
  var minVal, maxVal, lat, long, sensorType;
  return regeneratorRuntime.async(function updateSensorSettings$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          minVal = $(".live-card-" + sensorId + " .settings-wrapper .input-min").val();
          maxVal = $(".live-card-" + sensorId + " .settings-wrapper .input-max").val();
          lat = $(".live-card-" + sensorId + " .settings-wrapper .input-lat").val();
          long = $(".live-card-" + sensorId + " .settings-wrapper .input-long").val();
          sensorType = $("article[class*='graph-'][sensorid='" + sensorId + "']").attr("sensortype");
          $("article[class*='live'][sensorid='" + sensorId + "'] .gauge-container .minAlertGauge").html("min: " + minVal);
          $("article[class*='live'][sensorid='" + sensorId + "'] .gauge-container .maxAlertGauge").html("max: " + maxVal);
          _context5.next = 9;
          return regeneratorRuntime.awrap(saveSensorSettings(sensorId, minVal, maxVal, lat, long, sensorType));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  });
} // function not used


function sliderAlerts(element) {
  $(document).on('input', element, function () {
    var stringList = String(element).split('-');
    var pClass = stringList[stringList.length - 1];
    $(this).siblings('.text-slider-' + pClass).children('span').html($(this).val()); // console.log($(this).val(), pClass);
    //vals

    var optimVal = $("#slider-optim").val();
    var midVal = $("#slider-mid").val();
    var warningVal = $("#slider-warning").val(); // sliders

    var optimSlider = $("#slider-optim");
    var midSlider = $("#slider-mid");
    var warningSlider = $("#slider-warning"); // if

    if (optimVal) {
      midSlider.attr("min", optimVal);
      warningSlider.attr("min", midVal);
    }
  });
} // Time Interval Change


function timeIntervalChanger(sensorId, chartList) {
  var currentHourPm = moment().format("HH");
  var currentMin = moment().format("mm");
  var start = moment().subtract(currentHourPm, 'hours').subtract(currentMin, 'minutes');
  var end = moment();
  $('.' + sensorId + '-card #reportrange').daterangepicker({
    // startDate: start,
    // endDate: end,
    timePicker: true,
    "timePicker24Hour": true,
    startDate: moment().startOf('hour').subtract(currentHourPm, 'hour'),
    endDate: moment().startOf('hour').add(24 - currentHourPm, 'hour') // ranges: {
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
    start = start.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z';
    end = end.format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'; // subtract 3 hours because of timezone
    // subtract 1 more hour because influx is 1 hour behind
    // console.log(start, end)

    var startAux = new Date(start) - 4 * 60 * 60 * 1000;
    var endAux = new Date(end) - 4 * 60 * 60 * 1000; // console.log(startAux, endAux)

    start = moment(new Date(startAux)).format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z';
    end = moment(new Date(endAux)).format('YYYY-MM-DD' + 'T' + 'HH:mm').split("+")[0] + ':00.000000000Z'; // console.log(start, end)

    reloadDataCustomCalendar(start, end, countyName, sensorId, chartList);
  }

  callback(start, end, chartList);
} // not used


function currentValueGauge(element) {
  console.log(element); // JS 

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
      }, {
        value: 400,
        color: '#FFD221'
      }, {
        value: 700,
        color: '#77E6B4'
      }, {
        value: [800, 850],
        color: '#21D683'
      }]
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
      points: [[1, 620]]
    }]
  });
}

function fontAwesomeClassGenerator(type) {
  switch (type) {
    case 'temperatura':
      var faClass = "fas fa-temperature-high mr-1";
      break;

    case 'temperature':
      var faClass = "fas fa-temperature-high mr-1";
      break;

    case 'counter':
      var faClass = "far fa-chart-line";
      break;

    case 'scale':
      var faClass = "fas fa-balance-scale";
      break;

    case 'voltage':
      var faClass = "fas fa-car-battery";
      break;

    default:
      var faClass = "fas fa-spinner";
  }

  return faClass; // select an icon
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
} // function not used
// append min and max after the alerts are modified (not always)


function appendAlertsToHTML(sensorId_) {
  (function _callee2() {
    var alerts, alertsDict, alertCounter, i, bodyEl;
    return regeneratorRuntime.async(function _callee2$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return regeneratorRuntime.awrap(readAlerts());

          case 2:
            alerts = _context6.sent;
            alertsDict = [];
            alertCounter = 0;

            for (i = 0; i < alerts.result.length; i++) {
              bodyEl = $("body");

              if (sensorId_.includes(alerts.result[i].sensorId)) {
                alertsDict[alertCounter] = [alerts.result[i].sensorId, alerts.result[i].min, alerts.result[i].max, alerts.result[i].sensorType];
                alertCounter++;
              }
            }

            alertsDict.forEach(function (alert) {
              // console.log(alert, sensorId_)
              if (sensorId_ == alert[0]) {
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").html(alert[1]);
                $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .axAlertGauge").html(alert[2]);
              }
            });

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    });
  })();
} // append alerts initially


function appendAlertsToHTMLAsync(sensorId_) {
  var alerts, alertsDict, alertCounter, i, bodyEl, min_, max_;
  return regeneratorRuntime.async(function appendAlertsToHTMLAsync$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(readAlerts());

        case 2:
          alerts = _context7.sent;
          alertsDict = [];
          alertCounter = 0;

          for (i = 0; i < alerts.result.length; i++) {
            bodyEl = $("body");

            if (sensorId_.includes(alerts.result[i].sensorId)) {
              alertsDict[alertCounter] = [alerts.result[i].sensorId, alerts.result[i].min, alerts.result[i].max, alerts.result[i].sensorType];
              alertCounter++;
            }
          } // bodyEl.prepend(`<alerts style="display:none">` + JSON.stringify(alertsDict) + `</alerts>`)


          min_ = NaN;
          max_ = NaN;
          alertsDict.forEach(function (alert) {
            // console.log(alert, sensorId_)
            if (sensorId_ == alert[0]) {
              min_ = alert[1];
              max_ = alert[2];
              $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").remove();
              $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").remove();
              $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container").prepend("<span class='minAlertGauge' value='" + alert[1] + "' sensortype='" + alert[3] + "'>min: " + alert[1] + "</span><span class='maxAlertGauge' value='" + alert[2] + "' sensortype='" + alert[3] + "'>max: " + alert[2] + "</span>"); // if sensortype = voltage add .alert-type-voltage class
              // if (alert[3] == "voltage") {
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .currentValue").addClass("alert-type-voltage")
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-voltage")
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-voltage")
              // }
              // // if sensortype = temperature add .alert-type-temperature
              // if (alert[3] == "temperature") {
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .currentValue").addClass("alert-type-temperature")
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .minAlertGauge").addClass("alert-type-temperature")
              //     $("article[class*='live'][sensorid='" + sensorId_ + "'] .gauge-container .maxAlertGauge").addClass("alert-type-temperature")
              //     // console.log($("#" + sensorId_ + "-gauge span").length)
              // }
            }
          }); // console.log(min_, max_)

          return _context7.abrupt("return", [min_, max_]);

        case 10:
        case "end":
          return _context7.stop();
      }
    }
  });
} // get list of sensors from a county


var getData = function getData() {
  var response;
  return regeneratorRuntime.async(function getData$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v2/get-data/sensorId/" + countyName));

        case 2:
          response = _context8.sent;
          return _context8.abrupt("return", response.json());

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  });
}; // get all values of a sensor


var getSensorData = function getSensorData(sensor) {
  var response;
  return regeneratorRuntime.async(function getSensorData$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v2/get-data/" + countyName + "/" + sensor));

        case 2:
          response = _context9.sent;
          return _context9.abrupt("return", response.json());

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
}; // experiment


var getSensorDataExperiment = function getSensorDataExperiment(sensor) {
  var response;
  return regeneratorRuntime.async(function getSensorDataExperiment$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/experiment/get-data/" + countyName + "/" + sensor));

        case 2:
          response = _context10.sent;
          return _context10.abrupt("return", response.json());

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  });
}; // get last recorded value of a sensor


var getLatestValueRecorded = function getLatestValueRecorded(sensor) {
  var response;
  return regeneratorRuntime.async(function getLatestValueRecorded$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/get-data/last/" + countyName + "/" + sensor));

        case 2:
          response = _context11.sent;
          return _context11.abrupt("return", response.json());

        case 4:
        case "end":
          return _context11.stop();
      }
    }
  });
}; // get and plot data by a specific interval


var getSensorDataCustomInterval = function getSensorDataCustomInterval(countyName, sensor, start, end, chartList) {
  var date1, date2, diffTime, diffDays, diffHours, step, query;
  return regeneratorRuntime.async(function getSensorDataCustomInterval$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          // addExpandButton(sensor)
          if (!$("body").hasClass("calendar-active")) {
            $("body").addClass("calendar-active"); // var oldHtml = $("#predictor-switch .tooltiptext").html()
            // $("#predictor-switch .tooltiptext").attr("oldhtml", oldHtml)
            // switchButtonSecondGraph(sensor, attr = 'disabled')
            // $("#predictor-switch .tooltiptext").html("The functionality is disabled when calendar view is active - refresh the page")
            // $(".graph-" + sensor + " #expand-switch").css("display", "block")
          }

          date1 = new Date(start);
          date2 = new Date(end);
          diffTime = Math.abs(date2 - date1);
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          diffHours = diffTime / 1000 / 60 / 60; // console.log(diffHours + " hours");

          if (diffDays <= 1) {
            if (diffHours <= 1) {
              step = '1mins';
            } else if (diffHours <= 3) {
              step = '10mins';
            } else if (diffHours <= 6) {
              step = '10mins'; // var step = '10mins'
            } else {
              // var step = 'hourly'
              step = '10mins';
            }
          } else if (diffDays <= 6) // var step = 'hourlyS'
            step = '30mins';else if (diffDays <= 45) // var step = 'daily'
            step = 'daily';else step = 'dailyS';

          query = "/api/get-interval/" + step + "?" + "county=" + countyName + "&sensorQuery=" + sensor + "&start=" + start + "&end=" + end; // console.log(query)
          // remove graph and add loading

          $("#" + sensor + "-graph").parent().parent().attr("calendar", "on");
          $("#" + sensor + "-graph").parent().append("<a href=\"#\" class='spinner " + sensor + "-graph-spinner'><span>Loading...</span></a> ");
          $("#" + sensor + "-graph").remove(); //remove existing graph

          fetch(query).then(function (response) {
            // console.log("fetch")
            return response.json();
          }).then(function (data) {
            // console.log(data[0]);
            // console.log(data[0].error)
            var sensorId = data[0].sensorQueried;
            var graphId = sensorId + '-graph';
            console.log(data[0]);

            if (data[0].error == false) {
              var label = '';
              var labelIdx = 0;

              try {
                while (label.length == 0) {
                  // console.log(data[0].sensorAverage[labelIdx])
                  if (data[0].sensorAverage[labelIdx].sensorType != null) {
                    label = data[0].sensorAverage[labelIdx].sensorType;
                  }

                  labelIdx++;
                }
              } catch (_unused2) {// console.warn("There is no sensorType for",sensorId)
              }

              var ylabels = [];
              var xlabels = [];

              for (var i = 0; i < data[0].sensorReadings; i++) {
                // ylabel preprocess
                ylabels.push(parseFloat(data[0].sensorAverage[i].sensorValue).toFixed(2)); // xlabel preprocess

                var influxTime = data[0].sensorAverage[i].sensorTime; // console.log(influxTime)

                var newDate = new Date(influxTime); // console.log(newDate)

                var adjustedDate = newDate.setHours(newDate.getHours() - 2); // console.log(adjustedDate)

                xlabels.push(adjustedDate); // var influxH = influxTime.split("T")[1].split(":")[0]
                // var influxMins = influxTime.split("T")[1].split(":")[1]
                // console.log("STEP: ", step, diffDays, diffHours)

                var graphConfig = '';

                if (step == '1mins') {
                  graphConfig = 'second'; //     influxH = parseInt(influxH) + 1
                  //     xlabels.push(influxH < 10 ? "0" + String(influxH) + ":" + String(influxMins) : (influxH == 24 ? "00" + ":" + String(influxMins) : String(influxH) + ":" + String(influxMins)))
                } else if (step == '10mins' || step == '30mins') {
                  graphConfig = 'minute';
                } else if (step == 'hourly') {
                  graphConfig = 'hour'; //     // var influxDay = influxTime.split("T")[0].split("-")[2]
                  //     // var influxMonth = influxTime.split("T")[0].split("-")[1]
                  //     // influxMonth = parseInt(influxMonth)
                  //     // influxMonth = monthChanger(influxMonth).slice(0, 3)
                  //     influxH = parseInt(influxH) + 1
                  //     // influxH = influxDay + " " + influxMonth + " " + influxH + ':00'
                  //     // example: influxH = '29 Jun 17:00'
                  //     xlabels.push(influxH < 10 ? "0" + String(influxH) : (influxH == 24 ? "00" : String(influxH)))
                } else if (step == 'hourlyS') {
                  graphConfig = 'hour'; //     var influxDay = influxTime.split("T")[0].split("-")[2]
                  //     var influxMonth = influxTime.split("T")[0].split("-")[1]
                  //     influxMonth = parseInt(influxMonth)
                  //     influxMonth = monthChanger(influxMonth).slice(0, 3)
                  //     influxH = parseInt(influxH) + 1
                  //     influxH = influxDay + " " + influxMonth + " " + influxH + ':00'
                  //     // example: influxH = '29 Jun 17:00'
                  //     xlabels.push(influxH)
                } else if (step == 'daily') {
                  graphConfig = 'day'; //     var influxDay = influxTime.split("T")[0].split("-")[2]
                  //     var influxMonth = influxTime.split("T")[0].split("-")[1]
                  //     influxMonth = parseInt(influxMonth)
                  //     influxMonth = monthChanger(influxMonth).slice(0, 3)
                  //     // influxH = parseInt(influxH) + 1
                  //     // influxH = influxDay + " " + influxMonth + " " +influxH +':00'
                  //     // example: influxH = '29 Jun 17:00'
                  //     xlabels.push(influxDay + " " + influxMonth)
                } else {
                  graphConfig = 'day'; //     var influxDay = influxTime.split("T")[0].split("-")[2]
                  //     var influxMonth = influxTime.split("T")[0].split("-")[1]
                  //     influxMonth = parseInt(influxMonth)
                  //     influxMonth = monthChanger(influxMonth).slice(0, 3)
                  //     // influxH = parseInt(influxH) + 1
                  //     // influxH = influxDay + " " + influxMonth + " " +influxH +':00'
                  //     // example: influxH = '29 Jun 17:00'
                  //     xlabels.push(influxDay + " " + influxMonth)
                } // console.log(step, influxH)
                // influx time is 1 hour behind romanian timezone
                // increment influx with 2 because:
                // if time of influx is 8:20, it means that romanian hour is 9:20
                // and all the values between 9 to 10 (ro timezone) and (8 to 9 - influx timezone) is displayed as average at 10h (ro rimezone)
                // that's why is incremented with 2
                // xlabels.push(parseInt(influxH)+1)

              } // console.log("aici")
              // xlabels.push(hour+1 < 10 ? "0" + String(hour+1) : String(hour+1))


              var xlabels_reversed = xlabels.reverse();
              var ylabels_reversed = ylabels.reverse();
              $("#" + graphId).removeClass('hidden-graph');
              $('#' + graphId).parent().children('.no-data-from-sensor').remove();
              /* CHART JS RE-APPEND */
              // remove loading spinner and append graph

              addExpandButtonFlag = false;
              plotData(sensorId, ylabels_reversed, xlabels_reversed, label, graphConfig);
              $("#" + graphId).css("min-height", "250px");
            } else {
              // Remove Loading Item
              $('.' + sensorId + '-graph-spinner').remove(); // add no data message

              $('.' + sensorId + '-card .card-body').append("<p class='no-data-from-sensor' >No data for specified time range</p>");
            } // console.log(typeof chartList)
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
          });

        case 12:
        case "end":
          return _context12.stop();
      }
    }
  });
};

var reloadDataCustomCalendar = function reloadDataCustomCalendar(start, end, countyName, sensorId, chartList) {
  return regeneratorRuntime.async(function reloadDataCustomCalendar$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          // console.log(typeof chartList, '\r\n')
          if (_typeof(chartList) != 'object') getSensorDataCustomInterval(countyName, sensorId, start, end, chartList);

        case 1:
        case "end":
          return _context13.stop();
      }
    }
  });
}; // no longer used - instead I use getSensorData()


var getSensorType = function getSensorType(sensorId) {
  var response;
  return regeneratorRuntime.async(function getSensorType$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/get-data/type/" + sensorId));

        case 2:
          response = _context14.sent;
          return _context14.abrupt("return", response.json());

        case 4:
        case "end":
          return _context14.stop();
      }
    }
  });
}; // console.log("async",new Date()-time)


var gaugeList = [];
var chartList = [];
var sensorList = []; // This is the main loader that loads all the data on the dashboard
// It is called by itself
// ======================================================
// ======================================================

var mainLoader = function _callee3() {
  return regeneratorRuntime.async(function _callee3$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(getData());

        case 2:
          json = _context15.sent;

        case 3:
        case "end":
          return _context15.stop();
      }
    }
  });
}().then(function () {
  // If error was returned, put 0 value for reading
  if (json[0].error) {} else {
    var i;
    var fontAwesome;

    (function () {
      var api_data = json[0];
      var sensorCounter = api_data.sensorIdListLength;
      sensorList = api_data.sensorIdList; // For each sensorId

      for (i = 0; i < sensorCounter; i++) {
        (function _callee4() {
          var sensorIdToLookFor, sensorZone, sensorType, sensorData, ylabels, xlabels, label, index, influxTime, newDate, adjustedDate, xlabels_reversed, ylabels_reversed, promise, lastValue, filename;
          return regeneratorRuntime.async(function _callee4$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  // Info about each sensorId from list retrieved by getData()
                  sensorIdToLookFor = api_data.sensorIdList[i]; //sensorId

                  sensorZone = api_data.sensorZoneList[i]; //sensorZone

                  sensorType = api_data.sensorTypeList[i]; //sensorType

                  _context16.next = 5;
                  return regeneratorRuntime.awrap(getSensorData(sensorIdToLookFor));

                case 5:
                  sensorData = _context16.sent;

                  //get sensorData
                  // if there is no data retrieved by sensorData
                  // GET sensor TYPE and ZONE of sensorIdToLookFor 
                  if (sensorData[0].error) {
                    sensorData[0].sensorType = sensorType;
                    sensorData[0].sensorZone = sensorZone;
                  } // Append the default sensor view (current value + graph) for each sensor


                  $(".card-container").append(defaultSensorView(sensorData[0].sensorQueried, sensorData[0].sensorType, sensorData[0].sensorZone)); // Turn On alert sliders
                  // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-optim")
                  // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-mid")
                  // sliderAlerts(".live-card-" + sensorData[0].sensorQueried + " #slider-warning")
                  // Turn on toggle menu from current value for each sensor

                  sensorSettingsToggle(sensorData[0].sensorQueried); // Append alerts
                  // timeout(500, appendAlertsToHTML(sensorData[0].sensorQueried))
                  // Add Icons based on sensor type

                  $(".live-card-" + sensorData[0].sensorQueried + " .update-icon").addClass(fontAwesomeClassGenerator(sensorData[0].sensorType));
                  $(".graph-" + sensorData[0].sensorQueried + " .update-icon").addClass(fontAwesomeClassGenerator(sensorData[0].sensorType)); // Current value box - add sensorType
                  // $("article[class*='live'][sensorid='" + sensorData[0].sensorQueried + "']").attr('sensortype',sensorData[0].sensorType)
                  // check readings of each sensor and plot
                  // let sensorIdToLookFor = await api_data.sensorIdList[i]
                  // let sensorData = await getSensorData(sensorIdToLookFor);
                  // console.log(sensorIdToLookFor, api_data.sensorIdList, sensorData[0])

                  ylabels = [];
                  xlabels = [];
                  label = sensorData[0].sensorType; // Parse all readings of queried sensor
                  // console.log("readings",sensorData[0].sensorReadings)

                  for (index = 0; index < sensorData[0].sensorReadings; index++) {
                    // Values preprocessed
                    ylabels.push(parseFloat(sensorData[0].sensorAverage[index].sensorValue).toFixed(1)); // Timestamp preprocessed

                    influxTime = sensorData[0].sensorAverage[index].sensorTime; // console.log(influxTime)
                    // var influxTimeDate = new Date(influxTime)
                    // influxTimeDate = influxTimeDate.toLocaleString('ro-RO', {
                    //     timeZone: 'Europe/Bucharest',
                    //     timeStyle: "medium",
                    //     dateStyle: "short"
                    // })
                    // console.log(influxTimeDate)
                    // var influxH = influxTime.split("T")[1].split(":")[0]
                    // // influx time is 1 hour behind of romanian time
                    // // increment influx with 2 because:
                    // // if time of influx is 8:20, it means that romanian hour is 9:20
                    // var hour = parseInt(influxH) + 1
                    // xlabels.push(hour < 10 ? "0" + String(hour) : (hour == 24 ? "00" : String(hour)))
                    // // xlabels.push(parseInt(influxH)+1)
                    // console.log(influxTime)

                    newDate = new Date(influxTime); // console.log(influxTime)

                    adjustedDate = newDate.setHours(newDate.getHours() - 2); // console.log(adjustedDate)

                    xlabels.push(adjustedDate);
                  } // xlabels.push(hour+1 < 10 ? "0" + String(hour+1) : String(hour+1))


                  xlabels_reversed = xlabels.reverse();
                  ylabels_reversed = ylabels.reverse(); // addDataAttributeToGraph(sensorData[0].sensorQueried, xlabels_reversed, ylabels_reversed)
                  // addExpandButton(null, sensorData[0].sensorQueried, ylabels_reversed, xlabels_reversed)
                  // var liveData = parseFloat(sensorData[0].sensorLive).toFixed(2)
                  // if (sensorIdToLookFor.split('-')[1] == 'c') {
                  //     // if sensor is a counter
                  //     let lastValue = await getLatestValueRecorded(sensorIdToLookFor).then((resLast) => {
                  //         gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time)])
                  //     })
                  // } else {

                  promise = new Promise(function (resolve, reject) {// executor (the producing code, "singer")
                  });
                  _context16.next = 20;
                  return regeneratorRuntime.awrap(getLatestValueRecorded(sensorIdToLookFor).then(function (resLast) {
                    // console.log(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time)
                    // appendAlertsToHTML(sensorData[0].sensorQueried)
                    var min, max;
                    appendAlertsToHTMLAsync(sensorData[0].sensorQueried).then(function (res) {
                      gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time, min = res[0], max = res[1])]);
                    }); // gaugeList.push([sensorIdToLookFor, currentValueSvgGauge(sensorIdToLookFor, resLast[0].lastValue.value, resLast[0].lastValue.time, min = 0, max = 30)])
                  }));

                case 20:
                  lastValue = _context16.sent;
                  // plot data and add current value for each sensor
                  chartList.push([sensorIdToLookFor, plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)]);
                  timeIntervalChanger(sensorIdToLookFor, chartList); // Download CSV
                  // var startDateCSV = chart.data.labels[0]
                  // startDateCSV = new Date(startDateCSV)
                  // var startDateCSV_day = startDateCSV.getDate()
                  // var startDateCSV_month = month[startDateCSV.getMonth()]
                  // var startDateCSV_h = startDateCSV.getHours()
                  // var startDateCSV_m = startDateCSV.getMinutes()
                  // startDateCSV = startDateCSV_day + "_" + startDateCSV_month + "_h:" + startDateCSV_h + "_m:" + startDateCSV_m
                  // var endDateCSV = chart.data.labels[chart.data.labels.length - 1]
                  // endDateCSV = new Date(endDateCSV)
                  // var endDateCSV_day = endDateCSV.getDate()
                  // var endDateCSV_month = month[endDateCSV.getMonth()]
                  // var endDateCSV_h = endDateCSV.getHours()
                  // var endDateCSV_m = endDateCSV.getMinutes()
                  // endDateCSV = endDateCSV_day + "_" + endDateCSV_month + "_h:" + endDateCSV_h + "_m:" + endDateCSV_m
                  // var filename = "Report_from_" + startDateCSV + '_to_' + endDateCSV + '.csv'

                  filename = "Report.csv";
                  $("article.graph-" + sensorData[0].sensorQueried + " #report").click(function (e) {
                    var parent = $(this).parent().parent().parent().parent().parent(); // console.log(, )

                    downloadCSV({
                      filename: filename,
                      xlabels: parent.attr("xlabels"),
                      ylabels: parent.attr("ylabels")
                    });
                  });

                case 25:
                case "end":
                  return _context16.stop();
              }
            }
          });
        })();
      } // Small box append


      fontAwesome = '';
      addSmallBox('Sensors', api_data.sensorIdListLength, fontAwesome = 'fa fa-check');
    })();
  }

  addCssForSmallBox();
  return chartList;
}); // ======================================================
// ======================================================
// End of main loader


function downloadCSV(args) {
  var data, filename, link;
  var csv = "";
  var ylabels = args.ylabels.split(",");
  var xlabels = args.xlabels.split(",");

  for (var i = 0; i < ylabels.length; i++) {
    var label = new Date(parseInt(xlabels[i]));
    label = label.toLocaleString('en-US', {
      timeZone: 'Europe/Bucharest',
      timeStyle: "medium",
      dateStyle: "long"
    }).split(" ").join("_").split(",").join("");
    console.log(label);
    csv += label + "," + ylabels[i].toString() + "\n";
  }

  if (csv == null) return;
  filename = args.filename || 'chart-data.csv';

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }

  data = encodeURI(csv);
  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  document.body.appendChild(link); // Required for FF

  link.click();
  document.body.removeChild(link);
}

function arraysEqual(a1, a2) {
  /* WARNING: arrays must not contain {objects} or behavior may be undefined */
  return JSON.stringify(a1) == JSON.stringify(a2);
}

function addData(chart, label, data) {
  // console.log(chart)
  // console.log("oldLabel:",chart.data.labels)
  // console.log("newLabel:",label)
  var oldDataset = chart.data.datasets[0].data.slice(0, chart.data.datasets[0].data.length); // var oldLabel = chart.data.datasets[0].data.slice(0, chart.data.datasets[0].data.length)

  if (oldDataset.length > 0 && data.length > 0) {
    // console.log("new dataset:",data)
    // console.log("old dataset:",oldDataset)
    // console.log(arraysEqual(data,oldDataset))
    if (arraysEqual(data, oldDataset) == false) {
      // if new and old datasets are not equal, chart should be updated
      chart.data.datasets[0].data = data;
      chart.data.labels = label;
      chart.update(); // console.log(chart)
      // console.log("chart updated with:", oldDataset)
      // console.log("chart label update:", chart.data.labels)
    }
  } else if (oldDataset.length == 0) {
    if (arraysEqual(data, oldDataset) == false) {
      // if new and old datasets are not equal, chart should be updated
      chart.data.datasets[0].data = data;
      chart.data.labels = label;
      chart.update(); // console.log(chart)
      // console.log("chart updated with:", oldDataset)
      // console.log("chart label update:", chart.data.labels)
    }
  }
}

function updateData(chartList) {
  (function _callee6() {
    var json, index;
    return regeneratorRuntime.async(function _callee6$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return regeneratorRuntime.awrap(getData());

          case 2:
            json = _context18.sent;

            if (json[0].error) {// if error happens at update
            } else {
              (function () {
                var api_data = json[0]; // console.log(api_data)

                var sensorCounter = api_data.sensorIdListLength;

                for (index = 0; index < sensorCounter; index++) {
                  (function _callee5() {
                    var sensorIdToLookFor, sensorData, ylabels, xlabels, i, influxTime, newDate, adjustedDate, xlabels_reversed, ylabels_reversed, reloadThePage;
                    return regeneratorRuntime.async(function _callee5$(_context17) {
                      while (1) {
                        switch (_context17.prev = _context17.next) {
                          case 0:
                            sensorIdToLookFor = api_data.sensorIdList[index];
                            _context17.next = 3;
                            return regeneratorRuntime.awrap(getSensorData(sensorIdToLookFor));

                          case 3:
                            sensorData = _context17.sent;
                            ylabels = [];
                            xlabels = []; // var label = sensorData[0].sensorType
                            // console.log(sensorIdToLookFor, sensorData)

                            for (i = 0; i < sensorData[0].sensorReadings; i++) {
                              ylabels.push(parseFloat(sensorData[0].sensorAverage[i].sensorValue).toFixed(2));
                              influxTime = sensorData[0].sensorAverage[i].sensorTime;
                              newDate = new Date(influxTime); // console.log(influxTime)

                              adjustedDate = newDate.setHours(newDate.getHours() - 2); // var influxH = influxTime.split("T")[1].split(":")[0]
                              // influx time is 1 hour ahead of romanian time
                              // increment influx with 2 because:
                              // if time of influx is 8:20, it means that romanian hour is 9:20
                              // and all the values between 9 to 10 (ro timezone) and (8 to 9 - influx timezone) is displayed as mean at 10h (ro rimezone)
                              // that's why is incremented with 2
                              // var hour = parseInt(influxH) + 1
                              // xlabels.push(hour < 10 ? "0" + String(hour) : (hour == 24 ? "00" : String(hour)))

                              xlabels.push(adjustedDate);
                            }

                            xlabels_reversed = xlabels.reverse();
                            ylabels_reversed = ylabels.reverse(); // console.log("chartList:",chartList)
                            // console.log("sent data:",sensorIdToLookFor, ylabels_reversed)
                            // var liveData = parseFloat(sensorData[0].sensorLive).toFixed(2)
                            // var nanFlag = 0
                            // if(isNaN(liveData)) {
                            // let lastValue = await getLatestValueRecorded(sensorIdToLookFor).then((resLast) => {
                            //     liveData = resLast[0].lastValue.value
                            //     liveDataTime = resLast[0].lastValue.time
                            //     nanFlag = 1
                            // })
                            // }
                            // currentValueAdd(sensorIdToLookFor, liveData)
                            // Loop through gauge list and when a gauge id match the sensorIdToLookFor
                            // Do the update
                            // gaugeList.forEach((element) => {
                            //     if (sensorIdToLookFor == element[0]) {
                            //         // console.log("Update", element[0], "with", liveData, "at", liveDataTime)
                            //         updateValueSvgGauge(element[0], element[1], liveData, liveDataTime)
                            //     }
                            // })
                            // currentValueSvgGauge(sensorIdToLookFor + '-gauge', liveData)
                            // let chartIndex = 0

                            reloadThePage = 0;
                            chartList.forEach(function (chart) {
                              if (chart != undefined) {
                                var canvasId = chart.canvas.id.split("-graph")[0];

                                if ($("#" + canvasId + "-graph").parent().parent().attr("calendar") == "on") {// Do not make update
                                } else {
                                  // chart[0] == sensorIdToLookFor ? console.log(chart[0],chart[1],ylabels_reversed) : 0
                                  if (canvasId == sensorIdToLookFor) {
                                    // console.log("chart:",chart[1])
                                    // console.log("updated:",xlabels_reversed,ylabels_reversed)
                                    addData(chart, xlabels_reversed, ylabels_reversed);
                                  } else if (canvasId == sensorIdToLookFor && !isNaN(ylabels_reversed[ylabels_reversed.length - 1])) {
                                    // plotData(String(sensorIdToLookFor), ylabels_reversed, xlabels_reversed, label)
                                    // addData(chart[1], xlabels_reversed, ylabels_reversed)
                                    reloadThePage++; //page is reloaded 
                                  }
                                }
                              } // chartIndex++

                            }); // console.log(reloadThePage)

                            if (reloadThePage) {
                              location.reload();
                            } // console.log("Real time data:", sensorIdToLookFor, liveData)


                          case 12:
                          case "end":
                            return _context17.stop();
                        }
                      }
                    });
                  })();
                } // console.log("")

              })();
            }

          case 4:
          case "end":
            return _context18.stop();
        }
      }
    });
  })();
}

function monthChanger(number) {
  var b = '';

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

  return b;
}

function delay(ms) {
  return regeneratorRuntime.async(function delay$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          _context19.next = 2;
          return regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          }));

        case 2:
          return _context19.abrupt("return", _context19.sent);

        case 3:
        case "end":
          return _context19.stop();
      }
    }
  });
}

function switchSecondGraph(chart, sensorId) {
  var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var x = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var old_x_labels = []; // var x = $(".graph-" + sensorId + " #predictor-switch").attr('xlabels')
  // var y = $(".graph-" + sensorId + " #predictor-switch").attr('ylabels')
  // console.log("x:",x)
  // x = x.split(",")
  // x.forEach((value, key) => {
  //     x[key] = new Date(value)
  // })
  // console.log(x)

  $("body:not(.calendar-active) .graph-" + sensorId + " #predictor-switch").click(function (e) {
    e.preventDefault;

    if ($(".graph-" + sensorId + " #predictor-switch").attr('clicked') == 'false') {
      document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', 'true');

      if (x) {
        old_x_labels = chart.config.data.labels;
        chart.config.data.labels = x;
      }

      chart.config.data.datasets.push({
        label: 'Last ' + dayName,
        data: y,
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
      });
      chart.update();
    } else if ($(".graph-" + sensorId + " #predictor-switch").attr('clicked') == 'true') {
      document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', 'false');
      chart.config.data.datasets.pop();
      chart.config.data.labels = old_x_labels;
      chart.update();
    }
  });
}

function switchButtonSecondGraph(sensorId, attr) {
  try {
    document.querySelector(".graph-" + sensorId + " #predictor-switch").setAttribute('clicked', attr);
    if (attr = 'disabled') $(".graph-" + sensorId + " #predictor-switch .tooltiptext").html("There is not enough data to enable this functionality");else $(".graph-" + sensorId + " #predictor-switch .tooltiptext").html($(".graph-" + sensorId + " #predictor-switch .tooltiptext").attr("oldhtml"));
  } catch (_unused3) {
    console.error("Predictor button failed!");
  }
}

var run = function run() {
  return regeneratorRuntime.async(function run$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          if (!1) {
            _context20.next = 6;
            break;
          }

          updateData(chartList2); // test
          // notification()

          _context20.next = 4;
          return regeneratorRuntime.awrap(delay(5 * 1000));

        case 4:
          _context20.next = 0;
          break;

        case 6:
        case "end":
          return _context20.stop();
      }
    }
  });
};

var notification = function notification() {
  return regeneratorRuntime.async(function notification$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          fetch('/api/notification-test?message=Updating the sensor gauge');

        case 1:
        case "end":
          return _context21.stop();
      }
    }
  });
};

run(); // Experiment get live sensor value from socket.io-mqqt bridge
// Get list of sensors to watch
//MQTT Broker --mqtt--> NodeJS --socket.io--> Client

var socketChannel = 'socketChannel';
socket.on(socketChannel, function _callee7(data) {
  var liveDate;
  return regeneratorRuntime.async(function _callee7$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          liveDate = new Date();
          gaugeList.forEach(function (gauge) {
            if (data.topic.includes(gauge[0])) {
              // console.log(gauge[0], parseFloat(data.message).toFixed(1))
              liveDate = liveDate.toLocaleString('en-US', {
                timeZone: 'Europe/Bucharest',
                timeStyle: "medium",
                dateStyle: "long"
              }); // Update Current Value when message is received by the broker
              // console.log(gauge[0],data.message)

              var updatedAt = liveDate;
              updateValueSvgGauge(gauge[0], gauge[1], parseFloat(data.message).toFixed(1), updatedAt); // Append topic

              var sensorId = gauge[1][0].parentElement.id.split("-")[0];
              $("article[sensorId='" + sensorId + "']").attr("topic", data.topic);
            }
          });

        case 2:
        case "end":
          return _context22.stop();
      }
    }
  });
});