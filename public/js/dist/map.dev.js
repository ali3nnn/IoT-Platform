"use strict";

var _jquery = require("jquery");

var _utils = require("./utils.js");

// MAP PAGE
// ========================================
// Imports
function showNotification(message) {
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (error == 0) $("notification").append("<div class=\"messages hideMe\">\n                                  <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                  <i class=\"fas fa-barcode\"></i>\n                                      <background></background>\n                                      " + message + "\n                                  </div>\n                              </div>").show('slow');else if (error == 1) $("notification").append("<div class=\"messages hideMe\">\n                                  <div class=\"alert alert-danger mt-3 mb-0\" role=\"alert\">\n                                      <i class=\"fas fa-exclamation-triangle\"></i>\n                                      <background></background>\n                                      " + message + "\n                                  </div>\n                              </div>").show('slow');else if (error == 2) $("notification").append("<div class=\"messages hideMe\">\n                                      <div class=\"alert alert-success mt-3 mb-0\" role=\"alert\">\n                                          <i class=\"fas fa-print\"></i>\n                                          <background></background>\n                                          " + message + "\n                                      </div>\n                              </div>").show('slow');else if (error == 3) $("notification").append("<div class=\"messages hideMe\">\n                                      <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                          <i class=\"fas fa-times-circle\"></i>\n                                          <background></background>\n                                          " + message + "\n                                      </div>\n                              </div>").show('slow');else if (error == 4) $("notification").append("<div class=\"messages hideMe\">\n                              <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                  <background></background>\n                                  " + message + "\n                              </div>\n                          </div>").show('slow');
} // Display Map
// ============================
// Search to json


var searchObj = (0, _utils.searchToObj)(window.location.search);
var splash = "<div class='splash-inner'>\n\n<div class='ol-option'>\n  <h4>World map</h4>\n  <button type=\"button\" class='map-picker map-picker-ol' disabled>I want this map</button>\n  <div class='ol-map'>\n    <img src='../images/ol.jpeg' />\n    <background></background>\n  </div>\n</div>\n<div class='path-option'>\n    <h4>Custom Map</h4>\n    <button type=\"button\" class='map-picker map-picker-custom'>I want my custom map</button>\n    <div class='path-map'>\n      <img src='../images/custom.jpeg' />\n      <background></background>\n    </div>\n</div>\n\n</div>"; // let imageUploader = (id, href) => `<div class='uploadOutter'><div class="uploadWrapper">
// <form id="imageUploadForm" enctype="multipart/form-data" class="imageUploadForm" action="/api/v2/upload-image" method="post">
//   <span class="helpText" id="helpText">Upload an image</span>
//   <input id="file" name="map" type="file" class="uploadButton" />
//   <input name="id" class='hidden' readonly value="`+ id + `" />
//   <input name="href" class='hidden' readonly value="`+ href + `" />
//   <div id="uploadedImg" class="uploadedImg">
//     <span class="unveil"></span>
//   </div>
//   <span class="pickFile">
//     <a href="#" class="pickFileButton">Pick file</a>
//   </span>
// </form>
// </div></div>`

var imageUploader = function imageUploader(id) {
  return "<div><form id=\"upload-form\" enctype=\"multipart/form-data\" action=\"/api/upload-image\" method=\"post\">\n  <div class=\"custom-file\">\n    <span><i class=\"fas fa-file-image\"></i></span>\n    <input id=\"image-file\" name=\"map\" type=\"file\">\n  </div>\n  <input id=\"zone-id\" class='hidden' name=\"id\" type=\"number\" readonly value=\"" + id + "\">\n  </form></div>";
}; // Check map option (null, ol, custom)


var mapOption;
if (!userData_raw.error) userData_raw.forEach(function (sensor) {
  if (sensor.zoneId == searchObj.id) {
    mapOption = sensor.map;
  }
}); // Do magic stuff

if ((!mapOption || mapOption == 'NULL') && searchObj.id) {
  // show splash
  $("#map").append(splash); // button functionality - ol

  $(".map-picker-ol").on('click', function () {
    $(".map-picker-ol").html("Loading..."); // [*] get url data

    var params = new URLSearchParams(location.search);
    var id = params.get('id');
    var map = 'ol'; // [*] save into mysql option selected

    $.ajax({
      method: "POST",
      url: "/api/update-map",
      data: {
        id: id,
        map: map
      }
    }).done(function (msg) {
      console.log("Data Saved: ", msg);
      window.location.reload();
    }); // [ ] reload the page with new query
  }); // button functionality - custom

  $(".map-picker-custom").on('click', function () {
    $(".map-picker-custom").html("Loading..."); // [*] get url data

    var params = new URLSearchParams(location.search);
    var id = params.get('id');
    var map = 'custom'; // [*] save into mysql option selected

    $.ajax({
      method: "POST",
      url: "/api/update-map",
      data: {
        id: id,
        map: map
      }
    }).done(function (msg) {
      window.location.reload();
      console.log("Data Saved: ", msg);
    }); // [ ] reload the page with new query
  });
} else if (mapOption == 'ol') {
  // show ol
  // console.log(userData_raw)
  createMap();
} else if (mapOption == 'custom') {
  // show prompt to upload the image
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  $("#map").append(imageUploader(id));
  var fileInput = $('#image-file');
  fileInput.on("input", function (e) {
    var fileName = e.target.files[0].name;
    console.log("file added", fileName, e.target.files[0]);
    $("#upload-form").trigger('submit');
  }); // $('.custom-file > span').on({
  //   'mouseenter': function () {
  //     $('.custom-file').addClass('input-hovered');
  //   },
  //   'mouseleave': function () {
  //     $('.custom-file').remove('input-hovered');
  //   }
  // })
} else if (mapOption != 'NULL' && searchObj.id) {
  // console.log(userData_raw)
  var src = mapOption.split('./public')[1];
  $("#map").append("<div class='custom-map dragscroll'> <img class='custom-image' src='" + src + "' /> </div>"); // [ ] TODO: to implement scroll by dragging: http://qnimate.com/javascript-scroll-by-dragging/
} else {
  $("div#map").append("<span>choose an option</span>");
}

$(".dragscroll img").on('mouseover', function (el) {
  $(el.target).parent().removeAttr('nochilddrag');
});
$(".dragscroll img").on('mouseout', function (el) {
  $(el.target).parent().attr('nochilddrag', true);
}); // ============================
// END Display Map
// Display unassigned sensors
// ============================
// Everything happens if custom-map is present

if ($("#map .custom-map")) {
  // undefinedSensorsTemplate
  var undefinedSensorsTemplate = function undefinedSensorsTemplate(sensorList) {
    var sensorToDisplay = '';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = sensorList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var sensor = _step.value;
        sensorToDisplay += "<span class='sensor-item' type=\"" + sensor.sensorType + "\" sensor='" + sensor.sensorId + "'><i class=\"fad fa-signal-stream\"></i><span class='sensorName'>" + sensor.sensorName + "</span><span class='sensorValue'></span></span>";
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return "<div class='undefinedSensorsWrapper'><div class='undefinedSensorsInner hidden'>" + sensorToDisplay + "</div><div class='undefinedButton'><i class=\"fas fa-map-marker-question\"></i></div></div>";
  }; // Get query from URL


  var url = new URL(location.href);
  var zoneId = url.searchParams.get('id');
  var sensorsInThisZone = [];
  var sensorsWithUndefinedLocation = []; // Filter JSON with sensors by zoneId

  var userDataFinal;
  if (!userData_raw.error) userDataFinal = userData_raw.filter(function (item, index) {
    if (item.zoneId == zoneId) return item;
  });else userDataFinal = []; // Append sensors on map

  userDataFinal.forEach(function _callee(sensor, index) {
    var position, icon;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // if (sensor.zoneId == zoneId) {
            // sensorsInThisZone.push(sensor)
            // if no position was set then put then in corner
            if (!sensor.x || !sensor.y) {
              // Push all the sensors without a location
              sensorsWithUndefinedLocation.push(sensor); // This is for the last itteration

              if (index == userDataFinal.length - 1) {
                // Append undefined sensors to their box
                $("#map .custom-map").append(undefinedSensorsTemplate(sensorsWithUndefinedLocation)); // Toggle sensors box

                $(".undefinedButton").on('click', function (e) {
                  $(".undefinedSensorsInner").toggleClass("hidden");
                }); // When you click on a sensor it should be removed from current location and appended to custom-map

                $(".undefinedSensorsInner").on('click', function (e) {
                  var sensorElement = e.target.parentElement;
                  var sensorId = sensorElement.getAttribute("sensor");
                  var sensorName = $(sensorElement).children(".sensorName")[0].innerText;
                  $(".custom-map").append("\n                  <div sensor=\"" + sensorId + "\" class=\"sensor-item draggable ui-widget-content\" data-toggle=\"tooltip\" data-placement=\"top\"  title=\"" + sensorId + "\">\n                    <i class=\"fad fa-signal-stream\"></i>\n                    <span class='sensorName'>" + sensorName + "</span>\n                    <span class='sensorValue'>No data</span>\n                  </div>");
                  $(".draggable[sensor='" + sensorId + "']").draggable({
                    grid: [1, 1],
                    create: function create(event, ui) {
                      // console.log(ui.position)
                      $(this).position({
                        my: "left+" + 0 + ", top+" + 0,
                        at: "left top",
                        of: $('.custom-map')
                      });
                    },
                    start: function start(event, ui) {// console.log("start", ui.position)
                    },
                    drag: function drag(event, ui) {
                      console.log("drag", ui.position);
                    },
                    stop: function stop(event, ui) {
                      var sensorId = $(this).attr('sensor');
                      fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(function (result) {
                        console.log(result);
                      });
                    }
                  });
                  sensorElement.remove();
                });
              }
            } else {
              // if position was set append them on the map
              // Get location of sensor
              position = {
                top: parseInt(sensor.y),
                left: parseInt(sensor.x)
              };
              icon = {
                'door': '<i class="fas fa-door-closed"></i>',
                'temperature': '<i class="fad fa-signal-stream"></i>'
              }; // console.log(sensor.sensorId, icon[sensor.sensorType])
              // Sensor on map

              $(".custom-map").append("\n            <div sensor=\"" + sensor.sensorId + "\" type=\"" + sensor.sensorType + "\" class=\"sensor-item draggable ui-widget-content\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + sensor.sensorId + "\">\n              " + icon[sensor.sensorType] + "\n              <span class='sensorName'>" + sensor.sensorName + "</span>\n              <span class='sensorValue'>No data</span>\n            </div>"); // Make sensor on map draggable

              $(".draggable[sensor='" + sensor.sensorId + "']").draggable({
                grid: [1, 1],
                create: function create(event, ui) {
                  $(this).css('top', position.top);
                  $(this).css('left', position.left);
                },
                stop: function stop(event, ui) {
                  var sensorId = $(this).attr('sensor'); // Update position of sensor on map

                  fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(function (result) {// console.log(result)
                  });
                }
              });
            } // }


          case 1:
          case "end":
            return _context.stop();
        }
      }
    });
  }); // End append sensors on map
  // Init values of sensors

  var listOfSensorsId = (0, _utils.getValuesFromObject)('sensorId', userDataFinal);
  var listOfSensorsType = (0, _utils.getValuesFromObject)('sensorType', userDataFinal);
  var sensorsTypeJson = (0, _utils.arrayToJson)(listOfSensorsId, listOfSensorsType);
  fetch('/api/v3/query-influx?query=' + 'select value from sensors where sensorId =~ /' + listOfSensorsId.join("|") + '/ group by sensorId order by time desc limit 1').then(function _callee2(result) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(result.json());

          case 2:
            result = _context2.sent;
            // console.log(result, sensorsTypeJson)
            result.forEach(function (item) {
              // console.log(item.sensorId, parseFloat(item.value).toFixed(1))
              updateCurrentValueOnMap(item.sensorId, parseFloat(item.value).toFixed(1));
            });
            showNotification("Test notification", 0);
            showNotification("Test notification", 1);
            showNotification("Test notification", 2);
            showNotification("Test notification", 3);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    });
  }); // console.log(listOfSensorsId, listOfSensorsType)
  // updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
} // ============================
// END Display unassigned sensors
// Connect sensor to MQTT
// ============================


var socketChannel = 'socketChannel';
socket.on(socketChannel, function _callee3(data) {
  var currentValueBox;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // OLD WAY - @depracated
          // Loop through each current value box
          currentValueBox = $(".sensor-item span.sensorValue");
          currentValueBox.each(function (index, item) {
            // get sensor id for each current value box 
            var sensorId = $(item).parent().attr("sensor");
            var sensorType = $(item).parent().attr("type"); // get value of topic that contains this I

            if (data.topic.includes(sensorId)) {
              // Generate symbol
              var symbol = function symbol() {
                if (sensorType == 'temperature') return '°C';else if (sensorType != 'temperature') return ' V';
              }; // Append value and symbol


              $(item).html(parseFloat(data.message).toFixed(1) + symbol());
            } // NEW TOPIC dataPub
            // dataPub {cId: "DAS001TCORA", value: 23.992979}


            if (data.topic == 'dataPub') {
              var msg = JSON.parse(data.message);
              updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1));
            }
          });

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
});

var updateCurrentValueOnMap = function updateCurrentValueOnMap(id, value) {
  var type = $("#map .sensor-item[sensor='" + id + "']").attr("type");

  var symbol = function symbol(type) {
    if (type == 'temperature') return '°C';else if (type == 'voltage') return ' V';else return '';
  };

  var icon = {
    'door': {
      0: '<i class="fas fa-door-open"></i>',
      1: '<i class="fas fa-door-closed"></i>'
    },
    'temperature': '<i class="fad fa-signal-stream"></i>'
  };

  if (type == 'door') {
    // console.log(id, value, icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] i").remove();
    $("#map .sensor-item[sensor='" + id + "']").prepend(icon[type][parseInt(value)]);
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value == 1 ? 'closed' : 'open');
  } else {
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value + symbol(type));
  }
}; // ============================
// END Connect sensor to MQTT
// cluster
// get coordinates


var getSensorLocation = function getSensorLocation() {
  var response;
  return regeneratorRuntime.async(function getSensorLocation$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/read-location"));

        case 2:
          response = _context4.sent;
          return _context4.abrupt("return", response.json());

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
};

var lastValueOf = function lastValueOf(sensorId) {
  var response;
  return regeneratorRuntime.async(function lastValueOf$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/get-last-value/?sensorIdList=" + sensorId));

        case 2:
          response = _context5.sent;
          return _context5.abrupt("return", response.json());

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
};

var sensorDictionary;
var lastValue = []; // var time = new Date()
// sensorId = sess.sensors passed from backend
// [ ] TODO: refactor the way map get sensor values, locations, type, alerts.

if (typeof sensorId !== 'undefined') {
  var sensorsCoord = [];

  var sensorLocation = function _callee4() {
    return regeneratorRuntime.async(function _callee4$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return regeneratorRuntime.awrap(getSensorLocation());

          case 2:
            return _context6.abrupt("return", _context6.sent);

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    });
  }().then(function (json) {
    // console.log("then1")
    console.log(json);
    json.result.forEach(function (sensor) {
      // console.log(sensorId, sensor)
      if (sensorId.includes(sensor.sensorId)) {
        // console.log(sensor.coord.split(','))
        var numbers = sensor.coord.split(',').map(Number);
        numbers.push(sensor.sensorId); // console.log(numbers)

        sensorsCoord.push(numbers);
      }
    });
    return sensorsCoord;
  }).then(function _callee6(response) {
    var sensorList, sensorCounter, sensorLatestValueJson;
    return regeneratorRuntime.async(function _callee6$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            sensorList = '';
            sensorCounter = 0; // console.log(response)

            response.forEach(function _callee5(sensor) {
              return regeneratorRuntime.async(function _callee5$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      sensorCounter++;
                      if (sensorCounter != response.length) sensorList += sensor[2] + ',';else sensorList += sensor[2];

                    case 2:
                    case "end":
                      return _context7.stop();
                  }
                }
              });
            }); // console.log(sensorList, sensorList.length)

            if (!sensorList.length) {
              _context8.next = 13;
              break;
            }

            _context8.next = 6;
            return regeneratorRuntime.awrap(lastValueOf(sensorList));

          case 6:
            sensorLatestValueJson = _context8.sent;
            sensorLatestValueJson.forEach(function (sensor) {
              lastValue.push([sensor.sensorQueried, sensor.value]);
            });
            _context8.next = 10;
            return regeneratorRuntime.awrap([response, lastValue]);

          case 10:
            return _context8.abrupt("return", _context8.sent);

          case 13:
            _context8.next = 15;
            return regeneratorRuntime.awrap([response, [NaN, NaN]]);

          case 15:
            return _context8.abrupt("return", _context8.sent);

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    });
  }).then(function (response) {
    // console.log(response[1], response[1].length)
    if (response[0]) {
      var coordinates = response[0];
    } else {
      var coordinates = [];
    } // console.log("coordinates", coordinates)
    // create the map with pins for each sensor location in coordinates variable


    var map, clusters;
    createMap(coordinates, response[1]);
    sensorDictionary = coordinates; // append html markers for temperatures of each sensor location

    if ($("#map")) {
      var sensorPos = {};
      var sensorCounter = 0;
      sensorDictionary.forEach(function (sensor) {
        var pos = [sensor[1], sensor[0]];
        var posG = new ol.geom.Point(ol.proj.fromLonLat(pos)); // console.log(pos, posG.flatCoordinates)

        sensorDictionary[sensorCounter] = [posG.flatCoordinates, sensor[2]];
        sensorCounter++;
      }); // console.log(sensorPos)
    }
  });
} // function appendCoordToHTML(sensorId, coord) {
//   var bodyEl = $("body")
//   bodyEl.attr(sensorId, coord)
// }


$("body").attr("location", "");
var attributeLocationBody = {};

function appendCoordToHTML(sensorId, coord) {
  var bodyEl = $("body"); // bodyEl.attr(sensorId, coord)

  attributeLocationBody[sensorId] = coord;
  var value = JSON.stringify(attributeLocationBody);
  bodyEl.attr("location", value);
} // Aux Functions for getZoomOfMap()


function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km

  var dLat = deg2rad(lat2 - lat1); // deg2rad below

  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km

  return d * 1000; //distance in meter
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
} // End Aux Functions for getZoomOfMap()


function getZoomOfMap() {
  var locationObj = (0, _utils.getLocationObj)();
  var coordToCalc = [];

  for (var item in locationObj) {
    coordToCalc.push(locationObj[item]);
  }

  if (coordToCalc.length == 2) var dist = getDistanceFromLatLon(coordToCalc[0][1], coordToCalc[0][0], coordToCalc[1][1], coordToCalc[1][0]);else if (coordToCalc.length == 1) var dist = 2000000;else if (coordToCalc.length >= 3) var dist = 2000000; // console.log("length:", coordToCalc.length)
  // console.log("dist:", dist)

  var zoom;

  if (dist >= 100000 && dist < 200000) {
    zoom = 9;
  } else if (dist >= 50000 && dist < 100000) {
    zoom = 11;
  } else if (dist >= 6000 && dist < 50000) {
    zoom = 12;
  } else if (dist >= 1500 && dist < 6000) {
    zoom = 15;
  } else if (dist < 1500) {
    zoom = 17;
  } else {
    zoom = 6;
  } // console.log("zoom", zoom)
  // console.log("map_range", map_range(dist, 0, 100000, 18, 6))


  return zoom;
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getCenterOfMap() {
  // var bodyEl = $("body")
  // var location = []
  // location.push(bodyEl.attr("location"))
  var locationObj = (0, _utils.getLocationObj)();
  var latAvg = 0;
  var longAvg = 0;
  var contor = 0;

  for (var loc in locationObj) {
    latAvg += locationObj[loc][0];
    longAvg += locationObj[loc][1];
    contor++;
  }

  latAvg = latAvg / contor;
  longAvg = longAvg / contor; // getPerfectZoomForMap(longAvg, latAvg)

  console.log("center of map", longAvg, latAvg);
  return [longAvg, latAvg];
}

function createMap() {
  var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var sensorValuesJson = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var features = new Array();

  for (var i = 0; i < coordinates.length; ++i) {
    // features.push(new ol.Feature(new ol.geom.Point(coordinates[i])));
    appendCoordToHTML(coordinates[i][2], [coordinates[i][0], coordinates[i][1]]); // console.log(coordinates[i][1], coordinates[i][0])

    var featureObj = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([coordinates[i][1], coordinates[i][0]]))); // console.log("geom:",featureObj.getGeometry().flatCoordinates)

    features.push(featureObj);
  }

  var source = new ol.source.Vector({
    features: features,
    test: "string"
  });
  var clusterSource = new ol.source.Cluster({
    distance: 75,
    source: source
  });
  var styleCache = {};

  function getLatestValue(pinLocation) {
    var val = undefined; // var val = sensorValuesJson

    sensorDictionary.forEach(function (sensor) {
      // console.log(sensor[1], sensor[0], pinLocation, sensor[0].equals(pinLocation) === true)
      // this loads too many times - it may be slow when there will be more sensors
      // console.log(sensor[1], sensorValuesJson)
      if (sensor[0].equals(pinLocation) === true) {
        // console.log(sensor[1], sensor[0].equals(pinLocation) === true, sensorValuesJson)
        sensorValuesJson.forEach(function (sensorVal) {
          if (sensor[1] == sensorVal[0]) {
            if (sensor[1].includes("source")) {
              val = parseFloat(sensorVal[1]) + "V";
            } else {
              val = parseFloat(sensorVal[1]) + "°C";
            }
          }
        }); // val = sensorValuesJson[sensor[1]]
        // val = parseFloat(val)
        // val = sensor[1]
        // val = await latest[0].value
      }
    });

    if (val == undefined) {
      return "undefined";
    } else {
      return val;
    }
  }

  var pinLocation; // let latestValue

  var clusters = new ol.layer.Vector({
    source: clusterSource,
    style: function style(feature) {
      var size = feature.get('features').length;
      pinLocation = feature.getGeometry().flatCoordinates;
      var style;

      if (!style && size > 1) {
        // style when cluster
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: 20,
            fill: new ol.style.Fill({
              color: '#ffc107'
            })
          }),
          text: new ol.style.Text({
            scale: 2.8,
            text: size.toString(),
            fill: new ol.style.Fill({
              color: 'black'
            })
          })
        });
        styleCache[size] = style;
        return style;
      } else if (!style && size <= 1) {
        // style when single
        style = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: '/images/ol_logo.png',
            scale: 0.05,
            radius: 10
          }),
          text: new ol.style.Text({
            // text: 'test',
            padding: [1, 0, 0, 4],
            text: getLatestValue(pinLocation).toString(),
            placement: 'point',
            scale: 2,
            textAlign: 'center',
            textBaseline: 'middle',
            offsetX: 2,
            offsetY: -40,
            backgroundFill: new ol.style.Fill({
              color: 'black'
            }),
            fill: new ol.style.Fill({
              color: 'white'
            })
          })
        });
        styleCache[size] = style;
        return style;
      }
    }
  });
  var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  }); // timeout(1000, function () {

  var map = new ol.Map({
    layers: [raster, clusters],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat(getCenterOfMap()),
      zoom: getZoomOfMap()
    })
  }); // Helper

  map.on('click', function (e) {
    console.log(map.getView().getZoom());
  });
} //create map function


function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
} // Warn if overriding existing method


if (Array.prototype.equals) console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."); // attach the .equals method to Array's prototype to call it on any array

Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) return false; // compare lengths - can save a lot of time 

  if (this.length != array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }

  return true;
}; // Hide method from for-in loops


Object.defineProperty(Array.prototype, "equals", {
  enumerable: false
});