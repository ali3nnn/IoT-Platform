// MAP PAGE
// ========================================

// Imports
import { post } from 'jquery';
import 'ol';
import { getCenter } from 'ol/extent';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import TileJSON from 'ol/source/TileJSON';
import View from 'ol/View';
import { Icon, Style, Fill, Stroke, Text, Circle, RegularShape } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Snap } from 'ol/interaction';
import { toLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';


import {
  getDistinctValuesFromObject,
  getValuesFromObject,
  // timeoutAsync,
  sendMessage,
  _sendMessage,
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
  timeoutAsync,
  getRandomColor,
  clearLocation
} from './utils.js'
import { colorToGlsl } from 'ol/style/expressions';
// End imports

// const { map } = require("jscharting")

// const {
//   response
// } = require("express")

// const {
//   set
// } = require("ol/transform");

// Global vars
let map, sensorStyle, sensorValue, sensorFeature

// Utils
function getSensorName(sensorFeature = false) {
  let name = sensorFeature.customData.sensorName
  return name
}

function getSensorValue(sensorFeature = false, sensorValue = false) {
  let unitMeasure = ''

  let type = sensorFeature.customData.sensorType
  if (type == 'door')
    unitMeasure = ''
  else if (type == 'temperature')
    unitMeasure = '℃'
  else if (type == 'voltage')
    unitMeasure = 'V'

  if (sensorValue) {
    return sensorValue + ' ' + unitMeasure
  } else {
    return ''
  }
  // value = props.customData.last
  // return value || "20.3°C"
}

function getSensorIcon(sensorFeature = false) {
  let type = sensorFeature.customData.sensorType
  if (type == 'door')
    return '\uf52a'
  else if (type == 'temperature')
    return '\uf2c8'
  else if (type == 'voltage')
    return '\uf0e7'
  else
    return '\uf041'
  // return '/images/ol_logo.png'
}
// End utils

sensorStyle = (sensorFeature = false, sensorValue = false) => {
  return [new Style({
    // image: new Icon({
    //   img: canvas,
    //   imgSize: [canvas.width, canvas.height]
    // }),
    text: new Text({
      scale: 1,
      text: getSensorIcon(sensorFeature = sensorFeature),
      font: 'normal 26px FontAwesome',
      offsetY: -5
    })
  }), new Style({
    text: new Text({
      scale: 1,
      text: getSensorName(sensorFeature = sensorFeature),
      font: 'normal 16px Calibri',
      offsetY: 23
    })
  }), new Style({
    text: new Text({
      scale: 1,
      text: getSensorValue(sensorFeature = sensorFeature, sensorValue = sensorValue),
      font: 'normal 16px Calibri',
      offsetY: 40
    })
  })]
}

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
  <button type="button" class='map-picker map-picker-ol'>I want this map</button>
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
  window.map = createMap()

  // vectorLayer.style = new ol.style.Style({
  //   text: new ol.style.Text({
  //     scale: 1,
  //     text: "redrawn",
  //   })
  // })

  // vectorLayer.redraw()

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

let icon = {
  'door': {
    0: '<i class="fas fa-door-open"></i>',
    1: '<i class="fas fa-door-closed"></i>'
  },
  'temperature': '<i class="fas fa-thermometer-three-quarters"></i>',
  'voltage': '<i class="fas fa-bolt"></i>'
}

// Everything happens if custom-map is present
if ($("#map .custom-map")) {

  // Build undefined sensors
  let undefinedSensorsTemplate = (sensorList) => {

    let sensorToDisplay = ''
    for (let sensor of sensorList) {

      let iconToShow
      if (sensor.sensorType == 'door')
        iconToShow = icon[sensor.sensorType][1]
      else
        iconToShow = icon[sensor.sensorType]

      // console.log(sensor.sensorId, sensor.sensorType, iconToShow)

      sensorToDisplay += `<span class='sensor-disabled sensor-item' name="` + sensor.sensorName + `" type="` + sensor.sensorType + `" sensor='` + sensor.sensorId + `' title="Click aici pentru a adauga senzorul pe harta">

                            <div class='medium-view'>
                              `+ iconToShow + `
                              <span class='sensorName'>`+ sensor.sensorName + `</span>
                              <span class='sensorValue'>No data</span>
                              <span class="not-live pulse"></span>
                            </div>

                          </span>`
    }
    return `<div class='undefinedSensorsWrapper'>
              <div class='undefinedSensorsInner hidden'>` + sensorToDisplay + `</div>
              <div class='undefinedButton'><i class="fas fa-map-marker-question"></i></div>
            </div>`
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

  // console.log(userDataFinal)

  // Append sensors on map
  userDataFinal.forEach(async (sensor, index) => {

    // if NO POSITION was set then put then in corner
    if (!sensor.x || !sensor.y) {
      sensorsWithUndefinedLocation.push(sensor) // @ last itteration append the sensors
    } else {
      // if POSITION was set append them on the map

      // Get location of sensor
      const position = {
        top: parseInt(sensor.y),
        left: parseInt(sensor.x)
      }

      // Icon
      let iconToShow
      if (sensor.sensorType == 'door')
        iconToShow = icon[sensor.sensorType][0]
      else
        iconToShow = icon[sensor.sensorType]

      // Info
      let infoClass = ''
      if (sensor.alerts == 1)
        infoClass = 'alert-active'
      else if (sensor.alerts == 2)
        infoClass = 'alarm-active'
      else if ([3, 4].includes(sensor.alerts))
        infoClass = 'no-power'

      // infoClass = 'alarm-active'

      // console.log(sensor)

      // Append sensor item on map
      $(".custom-map").append(`
            <div name="`+ sensor.sensorName + `" sensor="` + sensor.sensorId + `" type="` + sensor.sensorType + `" class="` + infoClass + ` sensor-disabled sensor-item draggable ui-widget-content" data-toggle="tooltip" data-placement="top" title="` + sensor.sensorId + `">
              <!-- medium view -->
              <div class='medium-view'>
                `+ iconToShow + `
                <span class='sensorName'>`+ sensor.sensorName + `</span>
                <span class='sensorValue'>No data</span>
                <span class="not-live pulse"></span>
              </div>
              <!-- end medium view -->

              <!-- small view -->
              <div class='small-view'>
                <span class='sensorName'>`+ sensor.sensorName + `</span>
              </div>
              <!-- end small view -->
            </div>`)

      // Make sensor draggable
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

    // This is for the last itteration
    if (index == userDataFinal.length - 1 && sensorsWithUndefinedLocation.length) {

      // Append undefined sensors
      $("#map .custom-map").append(undefinedSensorsTemplate(sensorsWithUndefinedLocation))

      // Toggle sensors box
      $(".undefinedButton").on('click', (e) => {
        $(".undefinedSensorsInner").toggleClass("hidden")
      })

      // Define sensor location
      $(".undefinedSensorsInner").on('click', (e) => {
        let sensorElement = e.target.parentElement.parentElement
        let sensorId = sensorElement.getAttribute("sensor")
        let sensorType = sensorElement.getAttribute("type")
        let sensorName = sensorElement.getAttribute("name")
        let sensorClasses = sensorElement.getAttribute("class")

        // Clone & append
        // console.log(sensorElement,sensorId,sensorType,sensorName)
        let sensorCloned = $(".custom-map .undefinedSensorsInner .sensor-item[sensor=" + sensorId + "] .medium-view").clone()
        // console.log(sensorCloned)
        $(".custom-map").append(`<div name="` + sensorName + `" sensor="` + sensorId + `" type="` + sensorType + `" class="` + sensorClasses + `"><div class="medium-view">` + sensorCloned[0].innerHTML + `</div><div class="small-view"><span class="sensorName">` + sensorName + `</span></div></div>`)
        // console.log(sensorCloned)

        // Make it draggable
        // sensorCloned.addClass("draggable")
        $(".sensor-item[sensor='" + sensorId + "']").addClass("draggable")
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
              // console.log(result)
              sensorElement.remove()
            })
          },
        });

        // Remove it from undefined group
        // sensorElement.remove()
      })
    }

    // }
  })
  // End append sensors on map

  // Init values of sensors
  let listOfSensorsId = getValuesFromObject('sensorId', userDataFinal)
  let listOfSensorsType = getValuesFromObject('sensorType', userDataFinal)
  let sensorsTypeJson = arrayToJson(listOfSensorsId, listOfSensorsType)

  // Update all doors at once at runtime
  fetch('/api/v3/query-influx?query=' + 'select value from sensors where sensorId =~ /' + listOfSensorsId.join("|") + '/ group by sensorId order by time desc limit 1')
    .then(async result => {
      result = await result.json()
      result.forEach((item) => {
        updateCurrentValueOnMap(item.sensorId, parseFloat(item.value).toFixed(1), item.time)
        // console.log(item.sensorId, parseFloat(item.value).toFixed(1), item.time)
      })

      // showNotification("Test notification", 0)
      // showNotification("Test notification", 1)
      // showNotification("Test notification", 2)
      // showNotification("Test notification", 3)

    })
  // console.log(listOfSensorsId, listOfSensorsType)

  // updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
}

// ============================
// END Display unassigned sensors

// Send trigger to get current value for all sensors (for this users)
// ============================
userData_raw.forEach(item => {
  sendMessage('socketChannel', {
    topic: 'anysensor/in',
    message: `{"action":"get_value","cId":"${item.sensorId}"}`
  })
})
// ============================

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
  })

  // NEW TOPIC dataPub - live changing from offline to online
  // dataPub {cId: "DAS001TCORA", value: 23.992979}
  if (data.topic == 'dataPub') {
    let msg = JSON.parse(data.message)
    updateCurrentValueOnMap(msg.cId, parseFloat(msg.value).toFixed(1))
  }

  // No power - live changing from no power to power
  if (data.topic == 'dataPub/power') {
    let msg = JSON.parse(data.message)
    if (parseInt(msg.value)) { // add no power class - {"cId":"sensorId","value":1}
      if (!$(".sensor-item[sensor='" + msg.cId + "']").hasClass('no-power')) {
        $(".sensor-item[sensor='" + msg.cId + "']").removeClass("alert-active").removeClass("alarm-active").addClass("no-power")
      }
    } else { // remove no power class - {"cId":"sensorId","value":0}
      if ($(".sensor-item[sensor='" + msg.cId + "']").hasClass('no-power')) {
        $(".sensor-item[sensor='" + msg.cId + "']").removeClass("no-power")
      }
    }
  }

  // TODO: live changing alarm,alert

  // OL MAP REFRESH
  if (mapOption == 'ol' && ['dataPub', 'anysensor/out'].includes(data.topic)) {

    let msg = JSON.parse(data.message)
    // console.log(msg)
    // console.log(vectorLayerFeature)

    let layers = window.map.map.getLayers()
    // window.layers = layers
    // console.log(layers)
    // array_[1].style_[0].text_.text_
    for (const [ol_index, sensor] of Object.entries(layers.array_[1].values_.source.uidIndex_)) {
      if (sensor.customData.sensorId == msg.cId) {
        // console.log(msg.cId, msg.value)
        // console.log(vectorLayerFeature)
        // sensor.setStyle(sensorStyle(sensorFeature = sensor, sensorValue = msg.value))
        for (const feature of window.vectorLayerFeature) {
          // console.log(feature)
          if (feature.customData.sensorId == msg.cId)
            sensor.setStyle(sensorStyle(sensorFeature = feature, sensorValue = msg.value.toFixed(2)))
        }

        // sensor.setStyle([new Style({
        //   text: new Text({
        //     scale: 1,
        //     text: msg.cId + '\n' + msg.value.toFixed(2),
        //     font: 'normal 16px Calibri',
        //     offsetY: -5
        //   })
        // })])
      }
    }

  }

})
// END Connect sensor to MQTT
// ============================

let updateCurrentValueOnMap = (id, value, date = false) => {
  // console.log("updateCurrentValueOnMap", id, value)

  let type = $("#map .sensor-item[sensor='" + id + "']").attr("type")
  let element = $("#map .sensor-item[sensor='" + id + "']")
  let liveElement = $("#map .sensor-item[sensor='" + id + "'] span.pulse")

  element.removeClass("sensor-offline")
  liveElement.removeClass("not-live")

  let symbol = (type) => {
    if (type == 'temperature')
      return '°C'
    else if (type == 'voltage')
      return ' V'
    else
      return ''
  }

  if (date) {
    let currentDate = new Date()
    let oldDate = new Date(date.replace("Z", ""))
    let diff = (currentDate.getTime() - oldDate.getTime()) / 1000
    // if last value is 1 hour old then, sensor is offline
    if (diff > 5 * 60) { // diff > SECONDS - seconds = how many seconds should wait before showing not live
      $("#map .sensor-item[sensor='" + id + "'] .pulse").addClass("not-live")
      $("#map .sensor-item[sensor='" + id + "'][type='temperature']").addClass("sensor-offline")
    }
    else {
      // console.log(id)
      $("#map .sensor-item[sensor='" + id + "'] .pulse").removeClass("not-live")
      $("#map .sensor-item[sensor='" + id + "'][type='temperature']").removeClass("sensor-offline")
    }
  }


  if ($("#map .sensor-disabled.sensor-item[sensor='" + id + "']").length)
    $("#map .sensor-disabled.sensor-item[sensor='" + id + "']").removeClass('sensor-disabled')

  if (type == 'door') {
    // console.log(id, value, icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] i").remove()
    $("#map .sensor-item[sensor='" + id + "'] .medium-view").prepend(icon[type][parseInt(value)])
    $("#map .sensor-item[sensor='" + id + "'] .sensorValue").html(value == 1 ? 'closed' : 'open')
    // change color whep open/closed
    if (value == 1) {
      // green
      // $("#map .sensor-item[sensor='" + id + "']").attr("state","closed")
      $("#map .sensor-item[sensor='" + id + "']").removeClass("state-open").addClass("state-closed")
    } else if (value == 0) {
      // yellow
      // $("#map .sensor-item[sensor='" + id + "']").attr("state","open")
      $("#map .sensor-item[sensor='" + id + "']").removeClass("state-closed").addClass("state-open")
    } else {
      // alarm - red
    }
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
    // console.log(json)
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

  // console.log(userData_raw)

  let result = {}

  window.vectorLayerFeature = []

  // var features = new Array();
  // for (var i = 0; i < coordinates.length; ++i) {
  //   // features.push(new ol.Feature(new ol.geom.Point(coordinates[i])));
  //   appendCoordToHTML(coordinates[i][2], [coordinates[i][0], coordinates[i][1]])
  //   // console.log(coordinates[i][1], coordinates[i][0])
  //   var featureObj = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([coordinates[i][1], coordinates[i][0]])))
  //   // console.log("geom:",featureObj.getGeometry().flatCoordinates)
  //   features.push(featureObj);
  // }

  // new ol.geom.Point(ol.proj.fromLonLat(pos))

  console.log("Map Created")

  // Sensors of this zone
  let search = window.location.search.substring(1);
  search = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')

  let sensors = userData_raw.filter((item) => {
    if (search.id == item.zoneId) {
      return true
    } else {
      return false
    }
  })
  // console.log(sensors)
  // end sensors of this zone

  // Example map layer
  let extent = [0, 0, 720, 550];

  let projection = new ol.proj.Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: extent,
  });

  // Earth Map
  // ---------------
  let mapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
  })
  // ---------------

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
  let features = new Array()
  let undefinedX = 45
  let undefinedY = 26
  let sensorsListToAppend = []
  console.log("sensors", sensors)

  for (const sensor of sensors) {
    if (!sensor.x || !sensor.y || sensor.x == 'null' || sensor.y == 'null') { // [ ] TODO: check when sensor is not defined
      // let feature = new ol.Feature(new ol.geom.Point([undefinedX, undefinedY]))
      // feature['customData'] = { ...sensor, last: null }
      // features.push(feature)
      // undefinedY += 5
      sensorsListToAppend.push(sensor)
      // continue
    } else {
      let feature = new ol.Feature(new ol.geom.Point([sensor.x, sensor.y]))
      feature['customData'] = { ...sensor, last: null }
      features.push(feature)
    }
  }
  console.log("features", features)
  // End get sensor to feature

  var source = new VectorSource({
    // features: [iconFeature],
    features: features
  })

  result["source"] = source

  // var canvas = document.createElement('canvas');
  // canvas.width = 40;
  // canvas.height = 50;
  // var ctx = canvas.getContext('2d');
  // ctx.fillStyle = 'green';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // How sensor appear on map
  // moved up

  let vectorLayer = new VectorLayer({
    source: source,
    style: function (feature) {
      // console.log(feature.get('name'))
      if (!vectorLayerFeature.includes(feature)) {
        vectorLayerFeature.push(feature)
      }
      return sensorStyle(sensorFeature = feature)
    }
  });
  // End exmaple map layer

  result["vectorLayer"] = vectorLayer

  // Real map
  // let raster = new ol.layer.Tile({
  //   source: new ol.source.OSM()
  // });
  // End real map

  // POP up
  let container = document.getElementById('popup');
  let content = document.getElementById('popup-content');
  let closer = document.getElementById('popup-closer');

  let overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
  // END POP up

  let map = new ol.Map({
    // layers: [mapLayer, clusters],
    // layers: [raster, clusters],
    layers: [mapLayer],
    target: 'map',
    overlays: [overlay],
    view: new ol.View({
      // projection: projection, // uncomment this for image map
      // center: getCenter(extent),
      center: ol.proj.fromLonLat([25.82, 44]),
      zoom: 6,
      // maxZoom: 20,
      // center: ol.proj.fromLonLat(getCenterOfMap()),
      // zoom: getZoomOfMap()
    })
  });

  // SEARCH BOX
  // popup
  // let popup = new ol.Overlay.Popup();
  // map.addOverlay(popup);

  //Instantiate with some options and add the Control
  let geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    debug: false,
    autoComplete: true,
    keepOpen: true
  });
  map.addControl(geocoder);

  //Listen when an address is chosen
  geocoder.on('addresschosen', function (evt) {
    console.info(evt);
    window.setTimeout(function () {
      popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
  });
  // END SEARCH BOX

  // CLICK HANDLER
  let sensorsToAppend = (list) => {
    let resultEl = ''
    for (let sensor of list) {
      resultEl += `<div sensorId="${sensor.sensorId}">${sensor.sensorName}</div>`
    }
    return resultEl
  }

  map.on('singleclick', function (evt) {
    if (sensorsListToAppend.length) {
      let coordinate = evt.coordinate;
      let hdms = toStringHDMS(toLonLat(coordinate)); // hdms - normal coordinates with degree, minutes, seconds
      content.innerHTML = `
        <!--<p>You have ${sensorsListToAppend.length} sensors with no location!</p>-->
        <p>Click on a sensor</p>
        <!--<code>${coordinate}</code>-->
        <div class="unset-sensors" coordinates="${coordinate}">
          ${sensorsToAppend(sensorsListToAppend)}
        </div>
      `;
      overlay.setPosition(coordinate);
    } else {
      console.log("All sensors are attached")
    }

  });
  // END CLICK HANDLER

  result["map"] = map

  map.addLayer(vectorLayer)

  // Interactions
  var modify = new Modify({
    source: source,
    style: new Style({
      // image: new RegularShape({
      //   fill: new Fill({color: 'transparent'}),
      //   stroke: new Stroke({color: 'black', width: 2}),
      //   points: 4,
      //   radius: 10,
      //   angle: Math.PI / 4,
      // }),
      image: new Circle({
        radius: 40,
        fill: new Fill({
          color: '#ffc1072b'
          // color: getRandomColor()
        }),
        stroke: new Stroke({ color: '#ffc107cf', width: 2 }),
      }),
    })
  });

  map.addInteraction(modify);

  // Hover over points and do actions
  modify.on('modifyend', function (event) {
    let sensors = event.features.array_
    for (const sensor of sensors) {
      const sensorId = sensor.customData.sensorId
      const x = sensor.geometryChangeKey_.target.flatCoordinates[0]
      const y = sensor.geometryChangeKey_.target.flatCoordinates[1]
      fetch("/api/v3/save-position?x=" + x + "&y=" + y + "&sensor=" + sensorId).then(result => {
        console.log(sensorId, 'modified')
      })
      // console.log(sensor)
    }
  })

  // 0: 281.03851318359375
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

  return result

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

// Hide switch context button
if (window.location.search == '') {
  $(".switch-context").hide()
}

// switch-context button
const goToDashboard = () => {
  let url = window.location.origin + '/map/zone?zone' + window.location.search.replace("?", "")
  window.location.replace(url)
}

$(".switch-context").on('click', () => {
  goToDashboard()
})

// POPUP CLICK HANDLER FOR ITEMS
$(".ol-popup").on('click', event => {
  let sensorId = event.target.attributes.sensorId.value
  let coordinates = event.originalEvent.path[1].attributes.coordinates.value.split(',')

  // let featuresToAppend = []
  // let feature = new ol.Feature(new ol.geom.Point(toLonLat(coordinates)))
  // console.log(window.map)
  // window.map.source.addFeature(feature)

  fetch(`/api/v3/save-position?x=${coordinates[0]}&y=${coordinates[1]}&sensor=${sensorId}`).then(result => {
    if (result.status == 200) {
      location.reload()
    }
  })
})
// END POPUP

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