// MAP PAGE
// ========================================

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
if (typeof sensorId !== 'undefined') {
  var sensorsCoord = []
  let sensorLocation = (async () => {
      json = await getSensorLocation();
    })().then(() => {
      // console.log("then1")
      // console.log(json.result)
      json.result.forEach(sensor => {
        // console.log(sensorId, sensor)
        if (sensorId.includes(sensor.sensorId)) {
          // console.log(sensor.coord.split(','))
          numbers = sensor.coord.split(',').map(Number);
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

      // console.log(sensorList)

      let sensorLatestValueJson = await lastValueOf(sensorList);
      sensorLatestValueJson.forEach(sensor=>{
        lastValue.push([sensor.sensorQueried, sensor.value])
      })

      return await [response, lastValue]

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

  return [longAvg, latAvg]
}

// function getPerfectZoomForMap(lon, lat) {
//   // Assume that Earth is a perfect sphere with radius R = 6373 km:
//   R = 6373
//   x = R * Math.cos(lat) * Math.cos(lon)
//   y = R * Math.cos(lat) * Math.sin(lon)
//   z = R * Math.sin(lat)
//   dist = Math.sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2)
//   console.log("Radius:",r)
// }

function getLocationObj() {
  var bodyEl = $("body")
  var location = []
  location.push(bodyEl.attr("location"))
  var locationObj = JSON.parse(location)
  return locationObj
}

// function createDictionary(sensorId = null, pos = null) {
//   // console.log("createDictionary", sensorId, pos)
//   var dictionary = {}
//   dictionary[sensorId] = pos
//   // dictionary.push([sensorId, pos])
//   console.log("createDictionary", dictionary)
//   return dictionary
// }

function createMap(coordinates, sensorValuesJson) {

  console.log("Add coordinates to body attr:", coordinates)
  // console.log("sensorValuesJson")
  sensorValuesJson.forEach(sensor => {
    console.log(sensor)
  })

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

  // function getLatestValue(pinLocation) {

  //   return new Promise((resolve, reject) => {

  //     sensorDictionary.forEach(async sensor => {
  //       if (sensor[0].equals(pinLocation) === true) {
  //         let latest = await lastValueOf(sensor[1])
  //         // console.log(sensor[1], latest[0].value)
  //         // val = sensor[1]
  //         let val = await latest[0].value
  //         resolve(val)
  //       }
  //     })

  //   })

  // }

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
          if(sensor[1]==sensorVal[0]) {
            if(sensor[1].includes("source")) {
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

  clusters = new ol.layer.Vector({
    source: clusterSource,
    style: function (feature) {

      var size = feature.get('features').length;
      // var style = styleCache[size];

      pinLocation = feature.getGeometry().flatCoordinates

      // latestValue = getLatestValue(pinLocation).then(async result => {
      //   return await result
      // })

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
        // console.log("wait 3 sec")
        // Promise.all([latestValue]).then(result => {
        // console.log("PROMISE done", result.toString())
        // console.log(style[0])
        // style.getText().text_ = "test2"
        // })
        // setTimeout(function () {
        //   console.log("waited 3 seconds")
        //   console.log(style.getText().text_)
        //   return style
        // }, 3000)
        return style

      }

      // console.log(style.getText().text_)

      // return style;

    }
  });

  var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });


  // timeout(1000, function () {
  map = new ol.Map({
    layers: [raster, clusters],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat(getCenterOfMap()),
      zoom: 6
    })
  });

  // Promise.all([latestValue]).then(result => {
  // console.log("PROMISE done", result.toString())
  // console.log(style[0])
  // style.getText().text_ = "test2"
  // console.log(clusters)

  // style.getText().setText(feature.get('name'));
  // clusters.setStyle(new ol.style.Style({
  //   text: new ol.style.Text({
  //     text: result.toString(),
  //     padding: [1, 0, 0, 4],
  //     // text: getLatestValue(pinLocation).toString(),
  //     placement: 'point',
  //     scale: 2,
  //     textAlign: 'center',
  //     textBaseline: 'middle',
  //     offsetX: 2,
  //     offsetY: -40,
  //     backgroundFill: new ol.style.Fill({
  //       color: 'black'
  //     }),
  //     fill: new ol.style.Fill({
  //       color: 'white'
  //     })
  //   })
  // }))
  // })

  // distance.addEventListener('input', function () {
  //   cluster.setDistance(parseInt(distance.value, 10));
  // });

  // })

  // click

  // map.on('click', function (e) {

  // console.log(e.coordinate, map.getView().getZoom(), features.length)

  //     }
  // });

  // map.addLayer(vectorLayer)
  // var layers = map.getLayers().array_
  // map.removeLayer(layers)
  // map.addLayer(clusters)

  // clusters.getSource().clear();
  // clusters.setVisible(true);
  // clusters.getSource().addFeatures(new ol.Feature(new ol.geom.Point(e.coordinate)));

  // })

  // map.getView().on('change:resolution', function (e) {

  //     var layers = map.getLayers().array_
  //     console.log(layersList, layers.length, map.getView().getZoom())

  //     if (layers.length > 1) {
  //         if (map.getView().getZoom() > 8) {

  //             //layers[layers.length - 1].setVisible(true)
  //         }
  //         if (map.getView().getZoom() <= 8) {

  //             //layers[layers.length - 1].setVisible(false)
  //         }
  //     }

  // });

} //create map function

// function name() {
// var marker = new ol.Overlay({
//   position: ol.proj.fromLonLat(pos),
//   positioning: 'center-center',
//   element: document.querySelectorAll('.temeprature-marker[sensorid="'+sensorId+'"]'),
//   stopEvent: false
// });
// map.addOverlay(marker);

// var feature = new ol.Feature({
//   geometry: new ol.geom.Point(ol.proj.fromLonLat([pos[0],pos[1]])),
// })

// const fillStyle = new ol.style.Fill({
//   color: [255, 0, 0, 1]
// })

// const strokeStyle = new ol.style.Stroke({
//   color: [0, 255, 0, 1],
//   width: 1.2
// })

// const circleStyle = new ol.style.Circle({
//   fill: new ol.style.Fill({
//     color: [0, 0, 255, 1]
//   }),
//   radius: 20,
//   stroke: strokeStyle
// })


// var layer = new ol.layer.Vector({
//   source: new ol.source.Vector({
//     features: [feature]
//   }),
//   style: new ol.style.Style({
//     fill: fillStyle,
//     stroke: strokeStyle,
//     image: circleStyle,
//     text: new ol.style.Text({
//       text: '25',
//       placement: 'point',
//       scale: 2,
//       textAlign: 'center',
//       textBaseline: 'middle',
//       offsetX: 0,
//       offsetY: 0,
//       fill: new ol.style.Fill({
//         color: 'white'
//       })
//     })
//   })
// });



// map.addLayer(layer);

// }



// const getZonesAsync = async () => {
//     const result = await getZones()
//     return result
// }

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