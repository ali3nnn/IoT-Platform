// require('./jquery-3.3.1.js')
const path = require('path');

require('./svgGauge/gauge.min.js')
require('./scripts.js')
require('./fetch3.1.0.js')

if ($(".scale-page").length) {
    console.log("scale.js added")
    require('./scale')
}

if ($(".conveyor-page").length) {
    console.log("conveyor.js added")
    require('./conveyor')
}

if ($(".scanner-page").length) {
    console.log("scanner.js added")
    require('./scanner')
}

if ($(".team-page").length) {
    console.log("team.js added")
    require("./team")
}

if ($(".dashboard-page").length) {
    console.log("dashboard.js added")
    require("./dashboard")
}

if ($("#zones-list").length) {
    console.log("map.js added")
    require("./map")
}

if ($(".custom-map-page").length) {
    console.log("custom-map.js added")
    require("./custom-map")
}