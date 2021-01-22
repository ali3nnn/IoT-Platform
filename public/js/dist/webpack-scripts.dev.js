"use strict";

// require('./jquery-3.3.1.js')
var path = require('path');

var href = window.location.pathname;
console.log(href); // require('./svgGauge/gauge.min.js')

require('./scripts.js'); // require('./fetch3.1.0.js')


if ($(".scale-page").length) {
  console.log("scale.js added");

  require('./scale');
}

if ($(".conveyor-page").length) {
  console.log("conveyor.js added");

  require('./conveyor');
}

if ($(".scanner-page").length) {
  console.log("scanner.js added");

  require('./scanner');
}

if ($(".team-page").length) {
  console.log("team.js added");

  require("./team");
}

if ($(".dashboard-page").length) {
  console.log("dashboardv2.js added"); // require("./dashboard")

  require("./dashboardv2");
}

if ($("#zones-list").length) {// console.log("map.js added")
  // require("./map")
}

if ($(".map-page").length) {
  console.log("map.js added");

  require("./map");
}

if ($(".settings-page").length) {
  console.log("settings.js added");

  require("./settings");
}

if (href == '/register') {
  console.log('register.js added');

  require("./register");
}

if ($("#mySidenav").length) {
  console.log('aside.js added');

  require("./aside");
}

if ($(".custom-map").length) {
  console.log('scrollByDrag.js added');

  require("./scrollByDrag");
}