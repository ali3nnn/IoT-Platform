"use strict";

var _utils = require("./utils.js");

// Start imports
var getUserData = function getUserData() {
  var response, json;
  return regeneratorRuntime.async(function getUserData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/get-user-data"));

        case 2:
          response = _context.sent;
          json = response.json();
          return _context.abrupt("return", json);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
};

(function _callee() {
  var userData, zoneEl, sensorAlertEl, unsetSensors, _location, _location2, bufferAppendedLocations;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // let userData = await getUserData()
          userData = userData_raw;
          zoneEl = $("#zones-list");
          sensorAlertEl = $("#sensor-alert");
          unsetSensors = 0;

          if (!userData['error']) {
            // [*] TODO: display multiple locationsÎ
            _location = (0, _utils.getDistinctValuesFromObject)('location2', userData).length;
            _location2 = (0, _utils.getDistinctValuesFromObject)('location1', userData).length; // console.log(location1, location2, location3, userData.length)

            bufferAppendedLocations = [];
            userData.forEach(function (user) {
              var aux_checker = JSON.stringify(bufferAppendedLocations);
              var aux_item = JSON.stringify([user.location1, user.location2, user.location3]);
              var hasBeenAppended = aux_checker.indexOf(aux_item);

              if (user.zoneId == 1) {
                // TODO: warning message for unset sensors
                // TIP: normally this shouldnt exists because sensors are assignated when zone is set
                unsetSensors++;
              } else if (hasBeenAppended == -1) {
                bufferAppendedLocations.push([user.location1, user.location2, user.location3]);
                var name; // if (location1 > 1) // when there are > 1 counties / regions and not matter how many cities
                //     name = `<span class='multi-location'>` + user.location3 + `<span class='location-detail'>` + user.location1 + `, ` + user.location2 + `</span>` + `</span>`
                // else if (location1 == 1 && location2 > 1) // when there is one county and more cities
                //     name = `<span class='multi-location'>` + user.location3 + `<span class='location-detail'>` + user.location2 + `</span>` + `</span>`
                // else
                //     name = `<span class=''>` + user.location3 + `</span>`

                name = "<span class='multi-location'>" + user.location3 + "<span class='location-detail'>" + user.location2 + "</span>" + "</span>";
                zoneEl.append("<div class=\"zone-item\">\n                                <a href=\"/map/zone?zoneid=" + user.zoneId + "\" class='county-item'><i class=\"fas fa-layer-group\"></i>" + name + "</a>\n                            </div>");
              }
            }); // console.log(bufferAppendedLocations)
          }

          if (unsetSensors) {
            zoneEl.append("<div class=\"zone-item\">\n                        <a href=\"/set-location\" class='no-zone'><i class=\"fas fa-exclamation-circle\"></i><span>You have " + unsetSensors + " new sensors</span></a>\n                    </div>");
          } else if (zoneEl.children().length == 0) {
            zoneEl.append("<div class=\"zone-item\">\n                        <a href=\"#\" class='no-zone'><i class=\"fas fa-exclamation-circle\"></i><span>No sensors available</span></a>\n                    </div>");
          }

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
})().then(function () {
  var hrefZone = window.location.href;
  var zoneItem = $(".zone-item a[href]"); // console.log(zoneItem.length)

  for (var i = 0; i < zoneItem.length; i++) {
    // console.log(zoneItem[i].href, hrefZone)
    if (zoneItem[i].href == hrefZone) {
      zoneItem[i].classList.add('link-selected');
    }
  }
}); // ============================
// END Aside LOCATIONS
// Aside MAPS
// ============================
// [ ] TODO: choose userData or userData_row for maps and locations
// let maps = getValuesFromObject('map', userData_raw)

var zones = (0, _utils.getValuesFromObject)('zoneId', userData_raw);
var location1 = (0, _utils.getValuesFromObject)('location1', userData_raw);
var location2 = (0, _utils.getValuesFromObject)('location2', userData_raw);
var location3 = (0, _utils.getValuesFromObject)('location3', userData_raw); // [*] TODO: display multiple maps

var bufferAppendedMaps = []; // console.log(zones)

zones.forEach(function (id, index) {
  // Check double append
  var aux_checker = JSON.stringify(bufferAppendedMaps);
  var aux_item = JSON.stringify([location3[index], location2[index], location1[index]]);
  var hasBeenAppended = aux_checker.indexOf(aux_item);

  if (hasBeenAppended == -1) {
    bufferAppendedMaps.push([location3[index], location2[index], location1[index]]);
    var mapsEl = $("#mySidenav #maps-list");
    var name = "<span class='multi-location'>Map " + location3[index] + "<span class='location-detail'>" + location2[index] + "</span>" + "</span>";
    mapsEl.append("<div class=\"map-item\">\n                            <a href=\"/map?id=" + id + "\" class='map-button'>\n                            <i class=\"fas fa-map-marked\"></i>\n                                " + name + "\n                            </a>\n                        </div>");
  }
}); // Color yellow menu item

var href = window.location.href;
var mapItem = $(".map-item a[href]");

for (var i = 0; i < mapItem.length; i++) {
  if (mapItem[i].href == href) {
    mapItem[i].classList.add('link-selected');
  }
} // ============================
// END Aside maps
// Aside height
// ============================


var getOffset = function getOffset() {
  var brandH = $(".sidenav-wrapper .brand").outerHeight();
  var settingsH = $(".sidenav-wrapper .settings-items").outerHeight();
  return brandH + settingsH;
};

var getRemainingHeight = function getRemainingHeight() {
  var sideH = $("#mySidenav").outerHeight(); // let sideH = window.outerHeight

  var offset = getOffset();
  return sideH - offset;
};

var setHeight = function setHeight() {
  var freeSpace = getRemainingHeight();
  $("#maps-list").css({
    "max-height": freeSpace / 2
  });
  $("#zones-list").css({
    "max-height": freeSpace / 2
  });
};

$(window).on('load resize', function () {// setHeight()
}); // ============================
// END Aside height