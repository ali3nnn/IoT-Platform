// MAP PAGE
// ========================================

// Imports
import { post } from 'jquery';
import {
  getDistinctValuesFromObject,
  getValuesFromObject,
  // timeoutAsync,
  // sendMessage,
  // delay,
  // displayTimeoutAndVanish,
  // liveWeight,
  // liveGate,
  // insertStatus,
  // getConveyorStatus,
  // showNotification,
  arrayToJson,
  getLocationObj,
  searchToObj,
  timeoutAsync
} from './utils.js'
// End imports

// const { map } = require("jscharting")

// const {
//   response
// } = require("express")

// const {
//   set
// } = require("ol/transform");

/*var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point([2898477.708941509, 5530897.323059931]),
      name: 'Null Island',
      population: 4000,
      rainfall: 500
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0, 0],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'https://openlayers.org/en/v3.20.1/examples/data/icon.png',
        scale: 20
      })
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });

    var map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([26.08, 44.45]),
        zoom: 7
      })
    });*/

/*var feature = new ol.Feature({
  // geometry: new ol.geom.Point(ol.proj.fromLonLat([26.08, 44.45]))
  geometry: new ol.geom.Point([2898477.708941509, 5530897.323059931]),
})*/

/* const fillStyle = new ol.style.Fill({
       color: [255, 0, 0, 1]
     })
 
     const strokeStyle = new ol.style.Stroke({
       color: [0, 255, 0, 1],
       width: 1.2
     })
 
     const circleStyle = new ol.style.Circle({
       fill: new ol.style.Fill({
         color: [0, 0, 255, 1]
       }),
       radius: 7,
       stroke: strokeStyle
     })
 
     var iconStyle = new Style({
       image: new Icon({
         anchor: [0.5, 46],
         anchorXUnits: 'fraction',
         anchorYUnits: 'pixels',
         src: 'https://openlayers.org/en/v3.20.1/examples/data/icon.png'
       })
     });
 
     var layer = new ol.layer.Vector({
       source: new ol.source.Vector({
         features: [feature]
       }),
       style: new ol.style.Style({
         fill: fillStyle,
         stroke: strokeStyle,
         image: circleStyle
       })
     });
 
     map.addLayer(layer);*/

// if (ol.Map.prototype.getLayer === undefined) {
//   ol.Map.prototype.getLayer = function (id) {
//     var layer;
//     this.getLayers().forEach(function (lyr) {
//       if (id == lyr.get('id')) {
//         layer = lyr;
//       }
//     });
//     return layer;
//   }
// }

// detect map container
// let getLocation = async (sensorId) => {
//   let response = await fetch("/api/read-location/?sensorId=" + sensorId)
//   return response.json()
// }

function showNotification(message, error = 0) {

  if (error == 0)
    $("notification").append(`<div class="messages hideMe">
                                  <div class="alert alert-info mt-3 mb-0" role="alert">
                                  <i class="fas fa-barcode"></i>
                                      <background></background>
                                      ` + message + `
                                  </div>
                              </div>`).show('slow');
  else if (error == 1)
    $("notification").append(`<div class="messages hideMe">
                                  <div class="alert alert-danger mt-3 mb-0" role="alert">
                                      <i class="fas fa-exclamation-triangle"></i>
                                      <background></background>
                                      ` + message + `
                                  </div>
                              </div>`).show('slow');

  else if (error == 2)
    $("notification").append(`<div class="messages hideMe">
                                      <div class="alert alert-success mt-3 mb-0" role="alert">
                                          <i class="fas fa-print"></i>
                                          <background></background>
                                          ` + message + `
                                      </div>
                              </div>`).show('slow');

  else if (error == 3)
    $("notification").append(`<div class="messages hideMe">
                                      <div class="alert alert-info mt-3 mb-0" role="alert">
                                          <i class="fas fa-times-circle"></i>
                                          <background></background>
                                          ` + message + `
                                      </div>
                              </div>`).show('slow');

  else if (error == 4)
    $("notification").append(`<div class="messages hideMe">
                              <div class="alert alert-info mt-3 mb-0" role="alert">
                                  <background></background>
                                  ` + message + `
                              </div>
                          </div>`).show('slow');

}

// Display Map
// ============================

// Search to json
let searchObj = searchToObj(window.location.search)

let splash = `<div class='splash-inner'>

<div class='ol-option'>
  <h4>World map</h4>
  <button type="button" class='map-picker map-picker-ol' disabled>I want this map</button>
  <div class='ol-map'>
    <img src='../images/ol.jpeg' />
    <background></background>
  </div>
</div>
<div class='path-option'>
    <h4>Custom Map</h4>
    <button type="button" class='map-picker map-picker-custom'>I want my custom map</button>
    <div class='path-map'>
      <img src='../images/custom.jpeg' />
      <background></background>
    </div>
</div>

</div>`

// let imageUploader = (id, href) => `<div class='uploadOutter'><div class="uploadWrapper">
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

let imageUploader = (id) => {
  return `<div><form id="upload-form" enctype="multipart/form-data" action="/api/upload-image" method="post">
  <div class="custom-file">
    <span><i class="fas fa-file-image"></i></span>
    <input id="image-file" name="map" type="file">
  </div>
  <input id="zone-id" class='hidden' name="id" type="number" readonly value="`+ id + `">
  </form></div>`
}

// Check map option (null, ol, custom)
let mapOption
if (!userData_raw.error)
  userData_raw.forEach(sensor => {
    if (sensor.zoneId == searchObj.id) {
      mapOption = sensor.map
    }
  })


// Do magic stuff
if ((!mapOption || mapOption == 'NULL') && searchObj.id) {

  // show splash
  $("#map").append(splash)

  // button functionality - ol
  $(".map-picker-ol").on('click', () => {
    $(".map-picker-ol").html("Loading...")
    // [*] get url data
    let params = new URLSearchParams(location.search);
    let id = params.get('id')
    let map = 'ol'
    // [*] save into mysql option selected
    $.ajax({
      method: "POST",
      url: "/api/update-map",
      data: { id, map }
    })
      .done(function (msg) {
        console.log("Data Saved: ", msg);
        window.location.reload()
      });
    // [ ] reload the page with new query
  })

  // button functionality - custom
  $(".map-picker-custom").on('click', () => {
    $(".map-picker-custom").html("Loading...")
    // [*] get url data
    let params = new URLSearchParams(location.search);
    let id = params.get('id')
    let map = 'custom'
    // [*] save into mysql option selected
    $.ajax({
      method: "POST",
      url: "/api/update-map",
      data: { id, map }
    })
      .done(function (msg) {
        window.location.reload()
        console.log("Data Saved: ", msg);
      });
    // [ ] reload the page with new query
  })

} else if (mapOption == 'ol') {
  // show ol
  // console.log(userData_raw)
  createMap()
} else if (mapOption == 'custom') {
  // show prompt to upload the image
  let params = new URLSearchParams(location.search);
  let id = params.get('id')
  $("#map").append(imageUploader(id))
  let fileInput = $('#image-file');
  fileInput.on("input", (e) => {
    let fileName = e.target.files[0].name;
    console.log("file added", fileName, e.target.files[0])
    $("#upload-form").trigger('submit')
  })

  // $('.custom-file > span').on({
  //   'mouseenter': function () {
  //     $('.custom-file').addClass('input-hovered');
  //   },
  //   'mouseleave': function () {
  //     $('.custom-file').remove('input-hovered');
  //   }
  // })

} else if (mapOption != 'NULL' && searchObj.id) {
  // console.log(userData_raw)

  let src = mapOption.split('./public')[1]

  $("#map").append(`<div class='custom-map dragscroll'> <img class='custom-image' src='` + src + `' /> </div>`)

  // [ ] TODO: to implement scroll by dragging: http://qnimate.com/javascript-scroll-by-dragging/

} else {
  $("div#map").append(`<span>choose an option</span>`)
}

$(".dragscroll img").on('mouseover', (el) => {
  $(el.target).parent().removeAttr('nochilddrag')
})

$(".dragscroll img").on('mouseout', (el) => {
  $(el.target).parent().attr('nochilddrag', true)
})

// ============================
// END Display Map

// Display unassigned sensors
// ============================
// Everything happens if custom-map is present
if ($("#map .custom-map")) {

  // undefinedSensorsTemplate
  let undefinedSensorsTemplate = (sensorList) => {
    let sensorToDisplay = ''
    for (let sensor of sensorList) {
      sensorToDisplay += `<span class='sensor-item' type="` + sensor.sensorType + `" sensor='` + sensor.sensorId + `'><i class="fad fa-signal-stream"></i><span class='sensorName'>` + sensor.sensorName + `</span><span class='sensorValue'></span></span>`
    }
    return `<div class='undefinedSensorsWrapper'><div class='undefinedSensorsInner hidden'>` + sensorToDisplay + `</div><div class='undefinedButton'><i class="fas fa-map-marker-question"></i></div></div>`
  }

  // Get query from URL
  const url = new URL(location.href)
  const zoneId = url.searchParams.get('id')

  let sensorsInThisZone = []
  let sensorsWithUndefinedLocation = []

  // Filter JSON with sensors by zoneId
  let userDataFinal
  if (!userData_raw.error)
    userDataFinal = userData_raw.filter((item, index) => {
      if (item.zoneId == zoneId)
        return item
    })
  else
    userDataFinal = []

  // Append sensors on map
  userDataFinal.forEach(async (sensor, index) => {

    // if (sensor.zoneId == zoneId) {
    // sensorsInThisZone.push(sensor)

    // if no position was set then put then in corner
    if (!sensor.x || !sensor.y) {

      // Push all the sensors without a location
      sensorsWithUndefinedLocation.push(sensor)

      // This is for the last itteration
      if (index == userDataFinal.length - 1) {

        // Append undefined sensors to their box
        $("#map .custom-map").append(undefinedSensorsTemplate(sensorsWithUndefinedLocation))

        // Toggle sensors box
        $(".undefinedButton").on('click', (e) => {
          $(".undefinedSensorsInner").toggleClass("hidden")
        })

        // When you click on a sensor it should be removed from current location and appended to custom-map
        $(".undefinedSensorsInner").on('click', (e) => {
          let sensorElement = e.target.parentElement
          let sensorId = sensorElement.getAttribute("sensor")
          let sensorName = $(sensorElement).children(".sensorName")[0].innerText
          $(".custom-map").append(`
                  <div sensor="` + sensorId + `" class="sensor-item draggable ui-widget-content" data-toggle="tooltip" data-placement="top"  title="` + sensorId + `">
                    <i class="fad fa-signal-stream"></i>
                    <span class='sensorName'>`+ sensorName + `</span>
                    <span class='sensorValue'>No data</span>
                  </div>`)

          $(`.draggable[sensor='` + sensorId + `']`).draggable({
            grid: [1, 1],
            create: function (event, ui) {
              // console.log(ui.position)
              $(this).position({
                my: "left+" + 0 + ", top+" + 0,
                at: "left top",
                of: $('.custom-map')
              });
            },
            start: function (event, ui) {
              // console.log("start", ui.position)
            },
            drag: function (event, ui) {
              console.log("drag", ui.position)
            },
            stop: function (event, ui) {
              const sensorId = $(this).attr('sensor')
              fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(result => {
                console.log(result)
              })
            },
          });

          sensorElement.remove()
        })
      }

    } else { // if position was set append them on the map

      // Get location of sensor
      const position = {
        top: parseInt(sensor.y),
        left: parseInt(sensor.x)
      }

      let icon = {
        'door': '<i class="fas fa-door-closed"></i>',
        'temperature':'<i class="fad fa-signal-stream"></i>'
      }

      // console.log(sensor.sensorId, icon[sensor.sensorType])

      // Sensor on map
      $(".custom-map").append(`
            <div sensor="` + sensor.sensorId + `" type="` + sensor.sensorType + `" class="sensor-item draggable ui-widget-content" data-toggle="tooltip" data-placement="top" title="` + sensor.sensorId + `">
              `+ icon[sensor.sensorType] +`
              <span class='sensorName'>`+ sensor.sensorName + `</span>
              <span class='sensorValue'>No data</span>
            </div>`)

      // Make sensor on map draggable
      $(`.draggable[sensor='` + sensor.sensorId + `']`).draggable({
        grid: [1, 1],
        create: function (event, ui) {

          $(this).css('top', position.top)
          $(this).css('left', position.left)

        },
        stop: function (event, ui) {
          const sensorId = $(this).attr('sensor')
          // Update position of sensor on map
          fetch("/api/v3/save-position?x=" + ui.position.left + "&y=" + ui.position.top + "&sensor=" + sensorId).then(result => {
            // console.log(result)
          })
        },
      });

    }

    // }
  })
  // End append sensors on map

  // Init values of sensors
  let listOfSensorsId = getValuesFromObject('sensorId', userDataFinal)
  let listOfSensorsType = getValuesFromObject('sensorType', userDataFinal)
  let sensorsTypeJson = arrayToJson(listOfSensorsId, listOfSensorsType)

  fetch('/api/v3/query-influx?query=' + 'select value from sensors where sensorId =~ /' + listOfSensorsId.join("|") + '/ group by sensorId order by time desc limit 1')
    .then(async result => {
      result = await result.json()
      // console.log(result, sensorsTypeJson)
      result.forEach((item)=>{
        // console.log(item.sensorId, parseFloat(item.value).toFixed(1))
        updateCurrentValueOnMap(item.sensorId, parseFloat(item.value).toFixed(1))
      })

      showNotification("Test notification", 0)
      showNotification("Test notification", 1)
      showNotification("Test notification", 2)
      showNotification("Test notification", 3)
      
    })
  // console.log(listOfSensorsId, listOfSensorsType)

  // updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
}

// ============================
// END Display unassigned sensors

// Connect sensor to MQTT
// ============================
var socketChannel = 'socketChannel'
socket.on(socketChannel, async (data) => {

  // OLD WAY - @depracated
  // Loop through each current value box
  let currentValueBox = $(".sensor-item span.sensorValue")
  currentValueBox.each((index, item) => {
    // get sensor id for each current value box 
    let sensorId = $(item).parent().attr("sensor")
    let sensorType = $(item).parent().attr("type")

    // get value of topic that contains this I
    if (data.topic.includes(sensorId)) {
      // Generate symbol
      let symbol = () => {
        if (sensorType == 'temperature')
          return '°C'
        else if (sensorType != 'temperature')
          return ' V'
      }
      // Append value and symbol
      $(item).html(parseFloat(data.message).toFixed(1) + symbol())
    }

    // NEW TOPIC dataPub
    // dataPub {cId: "DAS001TCORA", value: 23.992979}
    if (data.topic == 'dataPub') {
      let msg = JSON.parse(data.message)
      updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
    }

  })

})

let updateCurrentValueOnMap = (id, value) => {
  let type = $("#map .sensor-item[sensor='" + id + "']").attr("type")
  let symbol = (type) => {
    if (type == 'temperature')
      return '°C'
    else if (type == 'voltage')
      return ' V'
    else
      return ''
  }
  let icon = {
    'door': {
      0: '<i class="fas fa-door-open"></i>',
      1: '<i class="fas fa-door-closed"></i>'
    },
    'temperature':'<i class="fad fa-signal-stream"></i>'
  }
  
  if(type == 'door') {
    // console.log(id, value, icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] i").remove()
    $("#map .sensor-item[sensor='" + id + "']").prepend(icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value == 1 ? 'closed':'open')
  } else {
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value + symbol(type))
  }
}
// ============================
// END Connect sensor to MQTT

// cluster

// get coordinates
let getSensorLocation = async () => {
  let response = await fetch("/api/read-location")
  return response.json()
}

let lastValueOf = async (sensorId) => {
  let response = await fetch("/api/get-last-value/?sensorIdList=" + sensorId)
  return response.json()
}

var sensorDictionary
let lastValue = []
// var time = new Date()
// sensorId = sess.sensors passed from backend

// [ ] TODO: refactor the way map get sensor values, locations, type, alerts.

if (typeof sensorId !== 'undefined') {
  var sensorsCoord = []
  let sensorLocation = (async () => {
    return await getSensorLocation();
  })().then((json) => {
    // console.log("then1")
    console.log(json)
    json.result.forEach(sensor => {
      // console.log(sensorId, sensor)
      if (sensorId.includes(sensor.sensorId)) {
        // console.log(sensor.coord.split(','))
        var numbers = sensor.coord.split(',').map(Number);
        numbers.push(sensor.sensorId)
        // console.log(numbers)
        sensorsCoord.push(numbers)
      }
    })
    return sensorsCoord
  })
    .then(async response => {
      var sensorList = ''
      var sensorCounter = 0
      // console.log(response)
      response.forEach(async sensor => {
        sensorCounter++
        if (sensorCounter != response.length)
          sensorList += sensor[2] + ','
        else
          sensorList += sensor[2]
      })

      // console.log(sensorList, sensorList.length)
      if (sensorList.length) {
        let sensorLatestValueJson = await lastValueOf(sensorList);

        sensorLatestValueJson.forEach(sensor => {
          lastValue.push([sensor.sensorQueried, sensor.value])
        })

        return await [response, lastValue]
      } else {
        return await [response, [NaN, NaN]]
      }



    })
    .then(response => {

      // console.log(response[1], response[1].length)

      if (response[0]) {
        var coordinates = response[0]
      } else {
        var coordinates = []
      }

      // console.log("coordinates", coordinates)
      // create the map with pins for each sensor location in coordinates variable
      var map, clusters
      createMap(coordinates, response[1])

      sensorDictionary = coordinates

      // append html markers for temperatures of each sensor location
      if ($("#map")) {
        var sensorPos = {}
        var sensorCounter = 0

        sensorDictionary.forEach(sensor => {
          var pos = [sensor[1], sensor[0]]
          var posG = new ol.geom.Point(ol.proj.fromLonLat(pos))
          // console.log(pos, posG.flatCoordinates)
          sensorDictionary[sensorCounter] = [posG.flatCoordinates, sensor[2]]
          sensorCounter++
        })

        // console.log(sensorPos)
      }




    })
}


// function appendCoordToHTML(sensorId, coord) {
//   var bodyEl = $("body")
//   bodyEl.attr(sensorId, coord)
// }

$("body").attr("location", "")
var attributeLocationBody = {}

function appendCoordToHTML(sensorId, coord) {
  var bodyEl = $("body")
  // bodyEl.attr(sensorId, coord)
  attributeLocationBody[sensorId] = coord
  var value = JSON.stringify(attributeLocationBody)
  bodyEl.attr("location", value)
}

// Aux Functions for getZoomOfMap()
function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; //distance in meter
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
// End Aux Functions for getZoomOfMap()

function getZoomOfMap() {
  var locationObj = getLocationObj()

  var coordToCalc = []
  for (var item in locationObj) {
    coordToCalc.push(locationObj[item])
  }

  if (coordToCalc.length == 2)
    var dist = getDistanceFromLatLon(coordToCalc[0][1], coordToCalc[0][0], coordToCalc[1][1], coordToCalc[1][0])
  else if (coordToCalc.length == 1)
    var dist = 2000000
  else if (coordToCalc.length >= 3)
    var dist = 2000000


  // console.log("length:", coordToCalc.length)
  // console.log("dist:", dist)

  let zoom;

  if (dist >= 100000 && dist < 200000) {
    zoom = 9
  } else if (dist >= 50000 && dist < 100000) {
    zoom = 11
  } else if (dist >= 6000 && dist < 50000) {
    zoom = 12
  } else if (dist >= 1500 && dist < 6000) {
    zoom = 15
  } else if (dist < 1500) {
    zoom = 17
  } else {
    zoom = 6
  }

  // console.log("zoom", zoom)
  // console.log("map_range", map_range(dist, 0, 100000, 18, 6))

  return zoom
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getCenterOfMap() {
  // var bodyEl = $("body")
  // var location = []
  // location.push(bodyEl.attr("location"))
  var locationObj = getLocationObj()

  var latAvg = 0
  var longAvg = 0
  var contor = 0

  for (var loc in locationObj) {
    latAvg += locationObj[loc][0]
    longAvg += locationObj[loc][1]
    contor++
  }

  latAvg = latAvg / contor
  longAvg = longAvg / contor

  // getPerfectZoomForMap(longAvg, latAvg)
  console.log("center of map", longAvg, latAvg)
  return [longAvg, latAvg]
}

function createMap(coordinates = '', sensorValuesJson = '') {

  var features = new Array();
  for (var i = 0; i < coordinates.length; ++i) {
    // features.push(new ol.Feature(new ol.geom.Point(coordinates[i])));
    appendCoordToHTML(coordinates[i][2], [coordinates[i][0], coordinates[i][1]])
    // console.log(coordinates[i][1], coordinates[i][0])
    var featureObj = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([coordinates[i][1], coordinates[i][0]])))
    // console.log("geom:",featureObj.getGeometry().flatCoordinates)
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
    var val = undefined
    // var val = sensorValuesJson

    sensorDictionary.forEach(sensor => {
      // console.log(sensor[1], sensor[0], pinLocation, sensor[0].equals(pinLocation) === true)

      // this loads too many times - it may be slow when there will be more sensors
      // console.log(sensor[1], sensorValuesJson)

      if (sensor[0].equals(pinLocation) === true) {

        // console.log(sensor[1], sensor[0].equals(pinLocation) === true, sensorValuesJson)

        sensorValuesJson.forEach(sensorVal => {
          if (sensor[1] == sensorVal[0]) {
            if (sensor[1].includes("source")) {
              val = parseFloat(sensorVal[1]) + "V"
            } else {
              val = parseFloat(sensorVal[1]) + "°C"
            }
          }

        })

        // val = sensorValuesJson[sensor[1]]

        // val = parseFloat(val)
        // val = sensor[1]
        // val = await latest[0].value
      }
    })

    if (val == undefined) {
      return "undefined"
    } else {
      return val
    }

  }

  var pinLocation
  // let latestValue

  var clusters = new ol.layer.Vector({
    source: clusterSource,
    style: function (feature) {

      var size = feature.get('features').length;

      pinLocation = feature.getGeometry().flatCoordinates

      var style
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
        return style
      } else if (!style && size <= 1) {
        // style when single
        style = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: '/images/ol_logo.png',
            scale: 0.05,
            radius: 10,
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

        return style

      }

    }
  });

  var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  // timeout(1000, function () {
  var map = new ol.Map({
    layers: [raster, clusters],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat(getCenterOfMap()),
      zoom: getZoomOfMap()
    })
  });

  // Helper
  map.on('click', function (e) {
    console.log(map.getView().getZoom())
  })

} //create map function


function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// Warn if overriding existing method
if (Array.prototype.equals)
  console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;

  // compare lengths - can save a lot of time 
  if (this.length != array.length)
    return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i]))
        return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
  enumerable: false
});