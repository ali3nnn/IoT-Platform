"use strict";

var _jquery = require("jquery");

require("ol");

var _extent = require("ol/extent");

var _Feature = _interopRequireDefault(require("ol/Feature"));

var _Map = _interopRequireDefault(require("ol/Map"));

var _Overlay = _interopRequireDefault(require("ol/Overlay"));

var _Point = _interopRequireDefault(require("ol/geom/Point"));

var _TileJSON = _interopRequireDefault(require("ol/source/TileJSON"));

var _View = _interopRequireDefault(require("ol/View"));

var _style = require("ol/style");

var _layer = require("ol/layer");

var _GeoJSON = _interopRequireDefault(require("ol/format/GeoJSON"));

var _Vector = _interopRequireDefault(require("ol/source/Vector"));

var _interaction = require("ol/interaction");

var _proj = require("ol/proj");

var _coordinate = require("ol/coordinate");

var _utils = require("./utils.js");

var _expressions = require("ol/style/expressions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// End imports
// const { map } = require("jscharting")
// const {
//   response
// } = require("express")
// const {
//   set
// } = require("ol/transform");
// Global vars
var map, sensorStyle, sensorValue, sensorFeature; // Utils

function getSensorName() {
  var sensorFeature = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var name = sensorFeature.customData.sensorName;
  return name;
}

function getSensorValue() {
  var sensorFeature = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var sensorValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var unitMeasure = '';
  var type = sensorFeature.customData.sensorType;
  if (type == 'door') unitMeasure = '';else if (type == 'temperature') unitMeasure = '℃';else if (type == 'voltage') unitMeasure = 'V';

  if (sensorValue) {
    return sensorValue + ' ' + unitMeasure;
  } else {
    return '';
  } // value = props.customData.last
  // return value || "20.3°C"

}

function getSensorIcon() {
  var sensorFeature = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var type = sensorFeature.customData.sensorType;
  if (type == 'door') return "\uF52A";else if (type == 'temperature') return "\uF2C8";else if (type == 'voltage') return "\uF0E7";else return "\uF041"; // return '/images/ol_logo.png'
} // End utils


sensorStyle = function sensorStyle() {
  var sensorFeature = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var sensorValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return [new _style.Style({
    // image: new Icon({
    //   img: canvas,
    //   imgSize: [canvas.width, canvas.height]
    // }),
    text: new _style.Text({
      scale: 1,
      text: getSensorIcon(sensorFeature = sensorFeature),
      font: 'normal 26px FontAwesome',
      offsetY: -5
    })
  }), new _style.Style({
    text: new _style.Text({
      scale: 1,
      text: getSensorName(sensorFeature = sensorFeature),
      font: 'normal 16px Calibri',
      offsetY: 23
    })
  }), new _style.Style({
    text: new _style.Text({
      scale: 1,
      text: getSensorValue(sensorFeature = sensorFeature, sensorValue = sensorValue),
      font: 'normal 16px Calibri',
      offsetY: 40
    })
  })];
}; // detect map container
// let getLocation = async (sensorId) => {
//   let response = await fetch("/api/read-location/?sensorId=" + sensorId)
//   return response.json()
// }


function showNotification(message) {
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (error == 0) $("notification").append("<div class=\"messages hideMe\">\n                                  <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                  <i class=\"fas fa-barcode\"></i>\n                                      <background></background>\n                                      " + message + "\n                                  </div>\n                              </div>").show('slow');else if (error == 1) $("notification").append("<div class=\"messages hideMe\">\n                                  <div class=\"alert alert-danger mt-3 mb-0\" role=\"alert\">\n                                      <i class=\"fas fa-exclamation-triangle\"></i>\n                                      <background></background>\n                                      " + message + "\n                                  </div>\n                              </div>").show('slow');else if (error == 2) $("notification").append("<div class=\"messages hideMe\">\n                                      <div class=\"alert alert-success mt-3 mb-0\" role=\"alert\">\n                                          <i class=\"fas fa-print\"></i>\n                                          <background></background>\n                                          " + message + "\n                                      </div>\n                              </div>").show('slow');else if (error == 3) $("notification").append("<div class=\"messages hideMe\">\n                                      <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                          <i class=\"fas fa-times-circle\"></i>\n                                          <background></background>\n                                          " + message + "\n                                      </div>\n                              </div>").show('slow');else if (error == 4) $("notification").append("<div class=\"messages hideMe\">\n                              <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                  <background></background>\n                                  " + message + "\n                              </div>\n                          </div>").show('slow');
} // Display Map
// ============================
// Search to json


var searchObj = (0, _utils.searchToObj)(window.location.search);
var splash = "<div class='splash-inner'>\n\n<div class='ol-option'>\n  <h4>World map</h4>\n  <button type=\"button\" class='map-picker map-picker-ol'>I want this map</button>\n  <div class='ol-map'>\n    <img src='../images/ol.jpeg' />\n    <background></background>\n  </div>\n</div>\n<div class='path-option'>\n    <h4>Custom Map</h4>\n    <button type=\"button\" class='map-picker map-picker-custom'>I want my custom map</button>\n    <div class='path-map'>\n      <img src='../images/custom.jpeg' />\n      <background></background>\n    </div>\n</div>\n\n</div>"; // let imageUploader = (id, href) => `<div class='uploadOutter'><div class="uploadWrapper">
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
  window.map = createMap(); // vectorLayer.style = new ol.style.Style({
  //   text: new ol.style.Text({
  //     scale: 1,
  //     text: "redrawn",
  //   })
  // })
  // vectorLayer.redraw()
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

var icon = {
  'door': {
    0: '<i class="fas fa-door-open"></i>',
    1: '<i class="fas fa-door-closed"></i>'
  },
  'temperature': '<i class="fas fa-thermometer-three-quarters"></i>',
  'voltage': '<i class="fas fa-bolt"></i>'
}; // Everything happens if custom-map is present

if ($("#map .custom-map")) {
  // Build undefined sensors
  var undefinedSensorsTemplate = function undefinedSensorsTemplate(sensorList) {
    var sensorToDisplay = '';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = sensorList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var sensor = _step.value;
        var iconToShow = void 0;
        if (sensor.sensorType == 'door') iconToShow = icon[sensor.sensorType][1];else iconToShow = icon[sensor.sensorType]; // console.log(sensor.sensorId, sensor.sensorType, iconToShow)

        sensorToDisplay += "<span class='sensor-disabled sensor-item' name=\"" + sensor.sensorName + "\" type=\"" + sensor.sensorType + "\" sensor='" + sensor.sensorId + "' title=\"Click aici pentru a adauga senzorul pe harta\">\n\n                            <div class='medium-view'>\n                              " + iconToShow + "\n                              <span class='sensorName'>" + sensor.sensorName + "</span>\n                              <span class='sensorValue'>No data</span>\n                              <span class=\"not-live pulse\"></span>\n                            </div>\n\n                          </span>";
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

    return "<div class='undefinedSensorsWrapper'>\n              <div class='undefinedSensorsInner hidden'>" + sensorToDisplay + "</div>\n              <div class='undefinedButton'><i class=\"fas fa-map-marker-question\"></i></div>\n            </div>";
  }; // Get query from URL


  var url = new URL(location.href);
  var zoneId = url.searchParams.get('id');
  var sensorsInThisZone = [];
  var sensorsWithUndefinedLocation = []; // Filter JSON with sensors by zoneId

  var userDataFinal;
  if (!userData_raw.error) userDataFinal = userData_raw.filter(function (item, index) {
    if (item.zoneId == zoneId) return item;
  });else userDataFinal = []; // console.log(userDataFinal)
  // Append sensors on map

  userDataFinal.forEach(function _callee(sensor, index) {
    var position, iconToShow, infoClass;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // if NO POSITION was set then put then in corner
            if (!sensor.x || !sensor.y) {
              sensorsWithUndefinedLocation.push(sensor); // @ last itteration append the sensors
            } else {
              // if POSITION was set append them on the map
              // Get location of sensor
              position = {
                top: parseInt(sensor.y),
                left: parseInt(sensor.x)
              }; // Icon

              if (sensor.sensorType == 'door') iconToShow = icon[sensor.sensorType][0];else iconToShow = icon[sensor.sensorType]; // Info

              infoClass = '';
              if (sensor.alerts == 1) infoClass = 'alert-active';else if (sensor.alerts == 2) infoClass = 'alarm-active';else if ([3, 4].includes(sensor.alerts)) infoClass = 'no-power'; // infoClass = 'alarm-active'
              // console.log(sensor)
              // Append sensor item on map

              $(".custom-map").append("\n            <div name=\"" + sensor.sensorName + "\" sensor=\"" + sensor.sensorId + "\" type=\"" + sensor.sensorType + "\" class=\"" + infoClass + " sensor-disabled sensor-item draggable ui-widget-content\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + sensor.sensorId + "\">\n              <!-- medium view -->\n              <div class='medium-view'>\n                " + iconToShow + "\n                <span class='sensorName'>" + sensor.sensorName + "</span>\n                <span class='sensorValue'>No data</span>\n                <span class=\"not-live pulse\"></span>\n              </div>\n              <!-- end medium view -->\n\n              <!-- small view -->\n              <div class='small-view'>\n                <span class='sensorName'>" + sensor.sensorName + "</span>\n              </div>\n              <!-- end small view -->\n            </div>"); // Make sensor draggable

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
            } // This is for the last itteration


            if (index == userDataFinal.length - 1 && sensorsWithUndefinedLocation.length) {
              // Append undefined sensors
              $("#map .custom-map").append(undefinedSensorsTemplate(sensorsWithUndefinedLocation)); // Toggle sensors box

              $(".undefinedButton").on('click', function (e) {
                $(".undefinedSensorsInner").toggleClass("hidden");
              }); // Define sensor location

              $(".undefinedSensorsInner").on('click', function (e) {
                var sensorElement = e.target.parentElement.parentElement;
                var sensorId = sensorElement.getAttribute("sensor");
                var sensorType = sensorElement.getAttribute("type");
                var sensorName = sensorElement.getAttribute("name");
                var sensorClasses = sensorElement.getAttribute("class"); // Clone & append
                // console.log(sensorElement,sensorId,sensorType,sensorName)

                var sensorCloned = $(".custom-map .undefinedSensorsInner .sensor-item[sensor=" + sensorId + "] .medium-view").clone(); // console.log(sensorCloned)

                $(".custom-map").append("<div name=\"" + sensorName + "\" sensor=\"" + sensorId + "\" type=\"" + sensorType + "\" class=\"" + sensorClasses + "\"><div class=\"medium-view\">" + sensorCloned[0].innerHTML + "</div><div class=\"small-view\"><span class=\"sensorName\">" + sensorName + "</span></div></div>"); // console.log(sensorCloned)
                // Make it draggable
                // sensorCloned.addClass("draggable")

                $(".sensor-item[sensor='" + sensorId + "']").addClass("draggable");
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
                      // console.log(result)
                      sensorElement.remove();
                    });
                  }
                }); // Remove it from undefined group
                // sensorElement.remove()
              });
            } // }


          case 2:
          case "end":
            return _context.stop();
        }
      }
    });
  }); // End append sensors on map
  // Init values of sensors

  var listOfSensorsId = (0, _utils.getValuesFromObject)('sensorId', userDataFinal);
  var listOfSensorsType = (0, _utils.getValuesFromObject)('sensorType', userDataFinal);
  var sensorsTypeJson = (0, _utils.arrayToJson)(listOfSensorsId, listOfSensorsType); // Update all doors at once at runtime

  fetch('/api/v3/query-influx?query=' + 'select value from sensors where sensorId =~ /' + listOfSensorsId.join("|") + '/ group by sensorId order by time desc limit 1').then(function _callee2(result) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(result.json());

          case 2:
            result = _context2.sent;
            result.forEach(function (item) {
              updateCurrentValueOnMap(item.sensorId, parseFloat(item.value).toFixed(1), item.time); // console.log(item.sensorId, parseFloat(item.value).toFixed(1), item.time)
            }); // showNotification("Test notification", 0)
            // showNotification("Test notification", 1)
            // showNotification("Test notification", 2)
            // showNotification("Test notification", 3)

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    });
  }); // console.log(listOfSensorsId, listOfSensorsType)
  // updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
} // ============================
// END Display unassigned sensors
// Send trigger to get current value for all sensors (for this users)
// ============================


userData_raw.forEach(function (item) {
  (0, _utils.sendMessage)('socketChannel', {
    topic: 'anysensor/in',
    message: "{\"action\":\"get_value\",\"cId\":\"".concat(item.sensorId, "\"}")
  });
}); // ============================
// Connect sensor to MQTT
// ============================

var socketChannel = 'socketChannel';
socket.on(socketChannel, function _callee3(data) {
  var currentValueBox, msg, _msg, _msg2, layers, _i, _Object$entries, _Object$entries$_i, ol_index, sensor, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, feature;

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
            }
          }); // NEW TOPIC dataPub - live changing from offline to online
          // dataPub {cId: "DAS001TCORA", value: 23.992979}

          if (data.topic == 'dataPub') {
            msg = JSON.parse(data.message);
            updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1));
          } // No power - live changing from no power to power


          if (data.topic == 'dataPub/power') {
            _msg = JSON.parse(data.message);

            if (parseInt(_msg.value)) {
              // add no power class - {"cId":"sensorId","value":1}
              if (!$(".sensor-item[sensor='" + _msg.cId + "']").hasClass('no-power')) {
                $(".sensor-item[sensor='" + _msg.cId + "']").removeClass("alert-active").removeClass("alarm-active").addClass("no-power");
              }
            } else {
              // remove no power class - {"cId":"sensorId","value":0}
              if ($(".sensor-item[sensor='" + _msg.cId + "']").hasClass('no-power')) {
                $(".sensor-item[sensor='" + _msg.cId + "']").removeClass("no-power");
              }
            }
          } // TODO: live changing alarm,alert
          // OL MAP REFRESH


          if (!(mapOption == 'ol' && ['dataPub', 'anysensor/out'].includes(data.topic))) {
            _context3.next = 33;
            break;
          }

          _msg2 = JSON.parse(data.message); // console.log(msg)
          // console.log(vectorLayerFeature)

          layers = window.map.map.getLayers(); // window.layers = layers
          // console.log(layers)
          // array_[1].style_[0].text_.text_

          _i = 0, _Object$entries = Object.entries(layers.array_[1].values_.source.uidIndex_);

        case 8:
          if (!(_i < _Object$entries.length)) {
            _context3.next = 33;
            break;
          }

          _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), ol_index = _Object$entries$_i[0], sensor = _Object$entries$_i[1];

          if (!(sensor.customData.sensorId == _msg2.cId)) {
            _context3.next = 30;
            break;
          }

          // console.log(msg.cId, msg.value)
          // console.log(vectorLayerFeature)
          // sensor.setStyle(sensorStyle(sensorFeature = sensor, sensorValue = msg.value))
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context3.prev = 14;

          for (_iterator2 = window.vectorLayerFeature[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            feature = _step2.value;
            // console.log(feature)
            if (feature.customData.sensorId == _msg2.cId) sensor.setStyle(sensorStyle(sensorFeature = feature, sensorValue = _msg2.value.toFixed(2)));
          } // sensor.setStyle([new Style({
          //   text: new Text({
          //     scale: 1,
          //     text: msg.cId + '\n' + msg.value.toFixed(2),
          //     font: 'normal 16px Calibri',
          //     offsetY: -5
          //   })
          // })])


          _context3.next = 22;
          break;

        case 18:
          _context3.prev = 18;
          _context3.t0 = _context3["catch"](14);
          _didIteratorError2 = true;
          _iteratorError2 = _context3.t0;

        case 22:
          _context3.prev = 22;
          _context3.prev = 23;

          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }

        case 25:
          _context3.prev = 25;

          if (!_didIteratorError2) {
            _context3.next = 28;
            break;
          }

          throw _iteratorError2;

        case 28:
          return _context3.finish(25);

        case 29:
          return _context3.finish(22);

        case 30:
          _i++;
          _context3.next = 8;
          break;

        case 33:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[14, 18, 22, 30], [23,, 25, 29]]);
}); // END Connect sensor to MQTT
// ============================

var updateCurrentValueOnMap = function updateCurrentValueOnMap(id, value) {
  var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  // console.log("updateCurrentValueOnMap", id, value)
  var type = $("#map .sensor-item[sensor='" + id + "']").attr("type");
  var element = $("#map .sensor-item[sensor='" + id + "']");
  var liveElement = $("#map .sensor-item[sensor='" + id + "'] span.pulse");
  element.removeClass("sensor-offline");
  liveElement.removeClass("not-live");

  var symbol = function symbol(type) {
    if (type == 'temperature') return '°C';else if (type == 'voltage') return ' V';else return '';
  };

  if (date) {
    var currentDate = new Date();
    var oldDate = new Date(date.replace("Z", ""));
    var diff = (currentDate.getTime() - oldDate.getTime()) / 1000; // if last value is 1 hour old then, sensor is offline

    if (diff > 5 * 60) {
      // diff > SECONDS - seconds = how many seconds should wait before showing not live
      $("#map .sensor-item[sensor='" + id + "'] .pulse").addClass("not-live");
      $("#map .sensor-item[sensor='" + id + "'][type='temperature']").addClass("sensor-offline");
    } else {
      // console.log(id)
      $("#map .sensor-item[sensor='" + id + "'] .pulse").removeClass("not-live");
      $("#map .sensor-item[sensor='" + id + "'][type='temperature']").removeClass("sensor-offline");
    }
  }

  if ($("#map .sensor-disabled.sensor-item[sensor='" + id + "']").length) $("#map .sensor-disabled.sensor-item[sensor='" + id + "']").removeClass('sensor-disabled');

  if (type == 'door') {
    // console.log(id, value, icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] i").remove();
    $("#map .sensor-item[sensor='" + id + "'] .medium-view").prepend(icon[type][parseInt(value)]);
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value == 1 ? 'closed' : 'open'); // change color whep open/closed

    if (value == 1) {
      // green
      // $("#map .sensor-item[sensor='" + id + "']").attr("state","closed")
      $("#map .sensor-item[sensor='" + id + "']").removeClass("state-open").addClass("state-closed");
    } else if (value == 0) {
      // yellow
      // $("#map .sensor-item[sensor='" + id + "']").attr("state","open")
      $("#map .sensor-item[sensor='" + id + "']").removeClass("state-closed").addClass("state-open");
    } else {// alarm - red
    }
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
    // console.log(json)
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
  // console.log(userData_raw)
  var result = {};
  window.vectorLayerFeature = []; // var features = new Array();
  // for (var i = 0; i < coordinates.length; ++i) {
  //   // features.push(new ol.Feature(new ol.geom.Point(coordinates[i])));
  //   appendCoordToHTML(coordinates[i][2], [coordinates[i][0], coordinates[i][1]])
  //   // console.log(coordinates[i][1], coordinates[i][0])
  //   var featureObj = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([coordinates[i][1], coordinates[i][0]])))
  //   // console.log("geom:",featureObj.getGeometry().flatCoordinates)
  //   features.push(featureObj);
  // }
  // new ol.geom.Point(ol.proj.fromLonLat(pos))

  console.log("Map Created"); // Sensors of this zone

  var search = window.location.search.substring(1);
  search = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  var sensors = userData_raw.filter(function (item) {
    if (search.id == item.zoneId) {
      return true;
    } else {
      return false;
    }
  }); // console.log(sensors)
  // end sensors of this zone
  // Example map layer

  var extent = [0, 0, 720, 550];
  var projection = new ol.proj.Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: extent
  }); // Earth Map
  // ---------------

  var mapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
  }); // ---------------
  // Uncomment this for image map
  // ---------------
  // let mapLayer = new ol.layer.Image({
  //   source: new ol.source.ImageStatic({
  //     attributions: '© <a href="www.github.com/ali3nnn">Made by Alex Barbu</a>',
  //     url: '/images/custom-maps/1605774980151_descarcare3.jpeg',
  //     projection: projection,
  //     imageExtent: extent,
  //   })
  // })
  // ---------------
  // Example simple pin
  // let iconFeature = new Feature({
  //   geometry: new Point([10, 500]),
  //   name: 'Null Island',
  //   population: 4000,
  //   rainfall: 500,
  // });
  // End Example simple pin
  // let dragStyle = new ol.style.Style({
  //   image: new ol.style.Circle({
  //     radius: 20,
  //     fill: new ol.style.Fill({
  //       color: '#ffc107'
  //     })
  //   }),
  //   text: new ol.style.Text({
  //     scale: 2.8,
  //     text: "D",
  //     fill: new ol.style.Fill({
  //       color: 'black'
  //     })
  //   })
  // });
  // Get sensor to feature

  var features = new Array();
  var undefinedX = 45;
  var undefinedY = 26;
  var sensorsListToAppend = [];
  console.log("sensors", sensors);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = sensors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var sensor = _step3.value;

      if (!sensor.x || !sensor.y || sensor.x == 'null' || sensor.y == 'null') {
        // [ ] TODO: check when sensor is not defined
        // let feature = new ol.Feature(new ol.geom.Point([undefinedX, undefinedY]))
        // feature['customData'] = { ...sensor, last: null }
        // features.push(feature)
        // undefinedY += 5
        sensorsListToAppend.push(sensor); // continue
      } else {
        var feature = new ol.Feature(new ol.geom.Point([sensor.x, sensor.y]));
        feature['customData'] = _objectSpread({}, sensor, {
          last: null
        });
        features.push(feature);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  console.log("features", features); // End get sensor to feature

  var source = new _Vector.default({
    // features: [iconFeature],
    features: features
  });
  result["source"] = source; // var canvas = document.createElement('canvas');
  // canvas.width = 40;
  // canvas.height = 50;
  // var ctx = canvas.getContext('2d');
  // ctx.fillStyle = 'green';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // How sensor appear on map
  // moved up

  var vectorLayer = new _layer.Vector({
    source: source,
    style: function style(feature) {
      // console.log(feature.get('name'))
      if (!vectorLayerFeature.includes(feature)) {
        vectorLayerFeature.push(feature);
      }

      return sensorStyle(sensorFeature = feature);
    }
  }); // End exmaple map layer

  result["vectorLayer"] = vectorLayer; // Real map
  // let raster = new ol.layer.Tile({
  //   source: new ol.source.OSM()
  // });
  // End real map
  // POP up

  var container = document.getElementById('popup');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');
  var overlay = new _Overlay.default({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });

  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  }; // END POP up


  var map = new ol.Map({
    // layers: [mapLayer, clusters],
    // layers: [raster, clusters],
    layers: [mapLayer],
    target: 'map',
    overlays: [overlay],
    view: new ol.View({
      // projection: projection, // uncomment this for image map
      // center: getCenter(extent),
      center: ol.proj.fromLonLat([25.82, 44]),
      zoom: 6 // maxZoom: 20,
      // center: ol.proj.fromLonLat(getCenterOfMap()),
      // zoom: getZoomOfMap()

    })
  }); // SEARCH BOX
  // popup
  // let popup = new ol.Overlay.Popup();
  // map.addOverlay(popup);
  //Instantiate with some options and add the Control

  var geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    debug: false,
    autoComplete: true,
    keepOpen: true
  });
  map.addControl(geocoder); //Listen when an address is chosen

  geocoder.on('addresschosen', function (evt) {
    console.info(evt);
    window.setTimeout(function () {
      popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
  }); // END SEARCH BOX
  // CLICK HANDLER

  var sensorsToAppend = function sensorsToAppend(list) {
    var resultEl = '';
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = list[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var sensor = _step4.value;
        resultEl += "<div sensorId=\"".concat(sensor.sensorId, "\">").concat(sensor.sensorName, "</div>");
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return resultEl;
  };

  map.on('singleclick', function (evt) {
    if (sensorsListToAppend.length) {
      var coordinate = evt.coordinate;
      var hdms = (0, _coordinate.toStringHDMS)((0, _proj.toLonLat)(coordinate)); // hdms - normal coordinates with degree, minutes, seconds

      content.innerHTML = "\n        <!--<p>You have ".concat(sensorsListToAppend.length, " sensors with no location!</p>-->\n        <p>Click on a sensor</p>\n        <!--<code>").concat(coordinate, "</code>-->\n        <div class=\"unset-sensors\" coordinates=\"").concat(coordinate, "\">\n          ").concat(sensorsToAppend(sensorsListToAppend), "\n        </div>\n      ");
      overlay.setPosition(coordinate);
    } else {
      console.log("All sensors are attached");
    }
  }); // END CLICK HANDLER

  result["map"] = map;
  map.addLayer(vectorLayer); // Interactions

  var modify = new _interaction.Modify({
    source: source,
    style: new _style.Style({
      // image: new RegularShape({
      //   fill: new Fill({color: 'transparent'}),
      //   stroke: new Stroke({color: 'black', width: 2}),
      //   points: 4,
      //   radius: 10,
      //   angle: Math.PI / 4,
      // }),
      image: new _style.Circle({
        radius: 40,
        fill: new _style.Fill({
          color: '#ffc1072b' // color: getRandomColor()

        }),
        stroke: new _style.Stroke({
          color: '#ffc107cf',
          width: 2
        })
      })
    })
  });
  map.addInteraction(modify); // Hover over points and do actions

  modify.on('modifyend', function (event) {
    var sensors = event.features.array_;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      var _loop = function _loop() {
        var sensor = _step5.value;
        var sensorId = sensor.customData.sensorId;
        var x = sensor.geometryChangeKey_.target.flatCoordinates[0];
        var y = sensor.geometryChangeKey_.target.flatCoordinates[1];
        fetch("/api/v3/save-position?x=" + x + "&y=" + y + "&sensor=" + sensorId).then(function (result) {
          console.log(sensorId, 'modified');
        }); // console.log(sensor)
      };

      for (var _iterator5 = sensors[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }); // 0: 281.03851318359375
  // 1: 319.3243408203125
  // var draw, snap; // global so we can remove them later
  // var typeSelect = document.getElementById('type');
  // function addInteractions() {
  //   draw = new Draw({
  //     source: source,
  //     type: typeSelect.value,
  //   });
  //   map.addInteraction(draw);
  //   snap = new Snap({ source: source });
  //   map.addInteraction(snap);
  // }
  // /**
  //  * Handle change event.
  //  */
  // typeSelect.onchange = function () {
  //   map.removeInteraction(draw);
  //   map.removeInteraction(snap);
  //   addInteractions();
  // };
  // addInteractions();
  // Helper
  // map.on('click', function (e) {
  //   console.log(map.getView().getZoom())
  // })

  return result;
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
}); // Hide switch context button

if (window.location.search == '') {
  $(".switch-context").hide();
} // switch-context button


var goToDashboard = function goToDashboard() {
  var url = window.location.origin + '/map/zone?zone' + window.location.search.replace("?", "");
  window.location.replace(url);
};

$(".switch-context").on('click', function () {
  goToDashboard();
}); // POPUP CLICK HANDLER FOR ITEMS

$(".ol-popup").on('click', function (event) {
  var sensorId = event.target.attributes.sensorId.value;
  var coordinates = event.originalEvent.path[1].attributes.coordinates.value.split(','); // let featuresToAppend = []
  // let feature = new ol.Feature(new ol.geom.Point(toLonLat(coordinates)))
  // console.log(window.map)
  // window.map.source.addFeature(feature)

  fetch("/api/v3/save-position?x=".concat(coordinates[0], "&y=").concat(coordinates[1], "&sensor=").concat(sensorId)).then(function (result) {
    if (result.status == 200) {
      location.reload();
    }
  });
}); // END POPUP
// test
// let markers = new OpenLayers.Layer.Markers("Markers");
// markers.id = "Markers";
// window.map.addLayer(markers);
// window.map.events.register("click", window.map, function (e) {
//   //var position = this.events.getMousePosition(e);
//   var position = map.getLonLatFromPixel(e.xy);
//   var size = new OpenLayers.Size(21, 25);
//   var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
//   var icon = new OpenLayers.Icon('images/mark.png', size, offset);
//   var markerslayer = map.getLayer('Markers');
//   markerslayer.addMarker(new OpenLayers.Marker(position, icon));
// });
// end test