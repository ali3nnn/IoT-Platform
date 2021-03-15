"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.states_dict = exports.conveyorItem = exports.newItemsConveyorLayout = exports.conveyorLayout = exports.conveyor = exports.conveyorLive = exports.newItemLive = exports.doorLive = exports.graphView = exports.currentValueView = void 0;

var _utils = require("./utils.js");

var humanizeDuration = require("humanize-duration");

var currentValueView = function currentValueView(alertClass2, sensor) {
  return "\n<article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\" battery=\"" + sensor.sensorMeta.battery + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Current Value\n        </h3>\n        <span class='card-settings-button'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n    </div>\n\n    <div class=\"card-body\">\n       <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n            <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                <span class=\"currentValue\">0</span>\n                " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.min) ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> ';
  }() + "\n                " + function () {
    return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.max) ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> ';
  }() + "\n            </div>\n            <p class='update-time-gauge'><span class=\"not-live pulse\"></span><span class=\"time\">Waiting to be updated...</span></p>\n        </div>\n    </div>\n\n    <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n        <span class='card-settings-button-alert tooltip_test'>\n            <i class=\"fas fa-bell\"></i>\n            <span class=\"tooltiptext\">New feature is coming!</span>\n        </span>\n        <span class='card-settings-button-update tooltip_test'>\n            <i class=\"fas fa-save\"></i>\n            <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n        </span>\n        <span class='card-settings-button-inner'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n        <div class='settings-wrapper'>\n            <div class=\"slidecontainer\">\n\n                <p class='label-input'>Min: </p>\n                <input type=\"number\" name=\"minAlert\" " + function () {
    return sensor.sensorMeta.min ? 'value="' + sensor.sensorMeta.min + '"' : 'placeholder="Set min alert"';
  }() + " class=\"input input-min\">\n                <p class='label-input'>Max: </p>\n                <input type=\"number\" name=\"maxAlert\" " + function () {
    return sensor.sensorMeta.max ? 'value="' + sensor.sensorMeta.max + '"' : 'placeholder="Set max alert"';
  }() + " class=\"input input-max\">\n\n            <button id=\"clearLocation\" type=\"button\" onclick=\"fetch('/api/v3/clear-location?sensorId=".concat(sensor.sensorMeta.sensorId, "')\">Clear location</button>\n\n                <!-- <p class='label-input'>Lat: </p>\n                <input type=\"number\" name=\"xLat\" ") + function () {
    return sensor.sensorMeta.x ? 'value="' + sensor.sensorMeta.x + '"' : 'placeholder="Set x position"';
  }() + " class=\"input input-lat\">\n    \n                <p class='label-input'>Long: </p>\n                <input type=\"number\" name=\"yLong\" " + function () {
    return sensor.sensorMeta.y ? 'value="' + sensor.sensorMeta.y + '"' : 'placeholder="Set y position"';
  }() + " class=\"input input-long\"> -->\n\n            </div>\n        </div>\n    </div>\n</article>\n";
};

exports.currentValueView = currentValueView;

var graphView = function graphView(sensor, sensorData) {
  return "\n\n<article class=\"card height-control " + sensor.sensorMeta.sensorId + "-card graph-" + sensor.sensorMeta.sensorId + "\" sensorType=\"" + sensor.sensorMeta.sensorType + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensorData='" + sensorData + "'>\n\n    <div class=\"card-header\">\n\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            <div class='edit-sensor-name'><i class=\"far fa-edit\"></i></div>\n            <span>" + sensor.sensorMeta.sensorName + "</span> |\n            <b>" + sensor.sensorMeta.sensorId + "</b>\n        </h3>\n\n        <div class=\"card-tools\">\n            <ul class=\"pagination pagination-sm\">\n\n                <li class=\"page-item\">\n                    <div id=\"reportrange\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                        <i class=\"fa fa-calendar\"></i>&nbsp;\n                        <span></span> <i class=\"fa fa-caret-down\"></i>\n                    </div>\n                </li>\n\n                <li class=\"page-item\">\n                    <div id=\"report\" class=\"tooltip_test\" style=\"background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%\">\n                        <i class=\"fas fa-file-csv\"></i>\n                        <span class=\"tooltiptext\">Download CSV</span>\n                    </div>\n                </li>\n\n            </ul>\n        </div>\n\n    </div>\n    \n\n    <div class=\"card-body\">\n        <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-graph-spinner'>\n            <span>Loading...</span>\n        </a> \n        <div class=\"" + sensor.sensorMeta.sensorId + "-graph-calendar graph-calendar\">\n            Time interval for " + sensor.sensorMeta.sensorId + " \n            <input name=\"dates\" value=\"Button Change\"> \n        </div> \n    </div>\n    \n</article>";
};

exports.graphView = graphView;

var doorLive = function doorLive(alertClass2, sensor) {
  return "\n<article class=\"card height-control " + alertClass2 + " live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\" battery=\"" + sensor.sensorMeta.battery + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Door live\n        </h3>\n        <span class='card-settings-button'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n    </div>\n\n    <div class=\"card-body\">\n       <div class=\"" + sensor.sensorMeta.sensorId + "-currentValue\">\n            <div id=\"" + sensor.sensorMeta.sensorId + "-gauge\" class=\"gauge-container two\">\n                <span class=\"doorState\" state=\"unknown\">\n                    <i class=\"fas fa-door-closed\"></i>\n                    <i class=\"fas fa-door-open\"></i>\n                </span>\n                " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.openTimer) ? '<span class=\'openTimer\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: ' + sensor.sensorMeta.openTimer + '</span> ' : '<span class=\'openTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: <i class="fas fa-infinity"></i></span> ';
  }() + "\n                " + function () {
    return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.closedTimer) ? '<span class=\'closedTimer\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: ' + sensor.sensorMeta.closedTimer + '</span> ' : '<span class=\'closedTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: <i class="fas fa-infinity"></i></span> ';
  }() + "\n            </div>\n            <p class='update-time-gauge'><span class=\"not-live pulse\"></span><span class=\"time\">Waiting to be updated...</span></p>\n        </div>\n    </div>\n\n    <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n        <span class='card-settings-button-alert tooltip_test'>\n            <i class=\"fas fa-bell\"></i>\n            <span class=\"tooltiptext\">New feature is coming!</span>\n        </span>\n        <span class='card-settings-button-update tooltip_test'>\n            <i class=\"fas fa-save\"></i>\n            <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n        </span>\n        <span class='card-settings-button-inner'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n        <div class='settings-wrapper'>\n            <div class=\"slidecontainer\">\n\n                <p class='label-input'>Open:</p>\n                <input type=\"number\" name=\"openAlert\" " + function () {
    return sensor.sensorMeta.openTimer ? 'value="' + sensor.sensorMeta.openTimer + '"' : '';
  }() + "placeholder=\"Set open limit in seconds\" class=\"input input-open\">\n                <p class='label-input'>Closed:</p>\n                <input type=\"number\" name=\"closedAlert\" " + function () {
    return sensor.sensorMeta.closedTimer ? 'value="' + sensor.sensorMeta.closedTimer + '"' : '';
  }() + "placeholder=\"Set closed limit in seconds\" class=\"input input-closed\">\n\n            </div>\n        </div>\n    </div>\n</article>\n";
};

exports.doorLive = doorLive;

var newItemLive = function newItemLive(sensor) {
  return "\n<article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\">\n\n<div class=\"card-header\">\n    <h3 class=\"card-title\">\n        <i class='update-icon'></i>\n        Live Update\n    </h3>\n</div>\n\n<div class=\"card-body\">\n    <div class=\"" + sensor.sensorMeta.sensorId + "-newItem\">\n\n        <a href=\"#\" class='spinner " + sensor.sensorMeta.sensorId + "-newItem-spinner'>\n            <span>Loading...</span>\n        </a>\n\n        <div id=\"" + sensor.sensorMeta.sensorId + "-floatinBall\" class=\"hidden-element\"></div>\n\n    </div>\n</div>";
};

exports.newItemLive = newItemLive;

var conveyorLive = function conveyorLive(sensor, sensorData) {
  return "\n<article class=\"card height-control live-card-" + sensor.sensorMeta.sensorId + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensortype=\"" + sensor.sensorMeta.sensorType + "\" battery=\"" + sensor.sensorMeta.battery + "\">\n\n    <div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            Conveyor Usage\n        </h3>\n        <span class='card-settings-button'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n    </div>\n\n    <div class=\"card-body\">\n        <div class=\"usage-monitor\">\n        \n        </div>\n    </div>\n\n    <div class='card-alerts-settings alert-" + sensor.sensorMeta.sensorId + "'>\n        <span class='card-settings-button-alert tooltip_test'>\n            <i class=\"fas fa-bell\"></i>\n            <span class=\"tooltiptext\">New feature is coming!</span>\n        </span>\n        <span class='card-settings-button-update tooltip_test'>\n            <i class=\"fas fa-save\"></i>\n            <span class=\"tooltiptext\">By clicking you will update alerts and location!</span>\n        </span>\n        <span class='card-settings-button-inner'>\n            <i class=\"far fa-sliders-h\"></i>\n        </span>\n        <div class='settings-wrapper'>\n\n        </div>\n    </div>\n\n</article>\n";
};

exports.conveyorLive = conveyorLive;

var conveyor = function conveyor(sensor, sensorData) {
  return "\n<article class=\"card height-control " + sensor.sensorMeta.sensorId + "-card controller-" + sensor.sensorMeta.sensorId + "\" sensorType=\"" + sensor.sensorMeta.sensorType + "\" sensorId=\"" + sensor.sensorMeta.sensorId + "\" sensorData='" + sensorData + "'>\n\n    <!--<div class=\"card-header\">\n        <h3 class=\"card-title\">\n            <i class='update-icon'></i>\n            <div class='edit-sensor-name'><i class=\"far fa-edit\"></i></div>\n            <span>" + sensor.sensorMeta.sensorName + "</span> |\n            <b>" + sensor.sensorMeta.sensorId + "</b>\n        </h3>\n    </div>-->\n\n    <div class=\"card-body\">\n        <div class=\"card-body-inner\">\n            <div class=\"state-button\">\n                <div class=\"grid-inner\">\n                    <div status=\"" + sensor.sensorMeta.status + "\" safety=\"" + sensor.sensorMeta.safety + "\" class=\"state-btn-inner " + function () {
    if (sensor.sensorMeta.status == 1 && sensor.sensorMeta.safety == 0) return 'active';
    return '';
  }() + "\">\n                        <input type=\"checkbox\" class=\"cb-value\" " + function () {
    if (sensor.sensorMeta.safety == 1) return 'disabled';
    return '';
  }() + "/>\n                        <span class=\"round-btn\"></span>\n                    </div>\n                    <span class=\"conveyor-info-title\">Status</span>\n                    <span class=\"conveyor-info-message\">" + function () {
    if (sensor.sensorMeta.status == 1) {
      if (sensor.sensorMeta.safety == 0) return 'RUN';
    } else {
      if (sensor.sensorMeta.safety == 1) {
        return 'E-STOP';
      }

      return 'STOP';
    }
  }() + "</span>\n                </div>\n            </div>\n            <div class=\"last-status\">\n                    <div class=\"grid-inner\">\n                        <i class=\"fas fa-history\"></i>\n                        <span class=\"conveyor-info-title\">Ultimul status</span>\n                        <span class=\"conveyor-info-message\">" + function () {
    if (sensor.sensorMeta.statusTime) {
      var h = sensor.sensorMeta.statusTime.split("T")[1].split(":")[0];
      var m = sensor.sensorMeta.statusTime.split("T")[1].split(":")[1];
      var time = sensor.sensorMeta.statusTime.split('T')[1].slice(0, 5);
      var day = sensor.sensorMeta.statusTime.split("T")[0].slice(5).split('-')[1];
      var month = sensor.sensorMeta.statusTime.split("T")[0].slice(5).split('-')[0];
      var today = new Date();
      var monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      today = today.toLocaleDateString().slice(0, 2); // console.log(today, day)

      if (today == day) return time;
      return time + " " + day + " " + " " + monthNames[parseInt(month)].slice(0, 3);
    }
  }() + "</span>\n                    </div>\n            </div> \n            <div class=\"usage-today\" seconds=\"" + function () {
    var status = sensor.sensorMeta.status;
    var safety = sensor.sensorMeta.safety;
    var seconds = sensor.sensorMeta.usageToday || 0;
    var statusTime, currentTime;

    if (parseInt(status) && !parseInt(safety)) {
      statusTime = new Date(sensor.sensorMeta.statusTime); // 2 hours back than current time

      statusTime = new Date(statusTime.getTime() - 2 * 60 * 60 * 1000); // sync hours

      currentTime = new Date(); // current time is local time ro

      var diff = parseInt((currentTime - statusTime) / 1000); // console.log(seconds, diff)

      seconds += diff - 16;
    } // console.log({
    //     statusTime,
    //     currentTime,
    //     today: sensor.sensorMeta.usageToday,
    //     status,
    //     safety
    // })
    // console.log("sensor.sensorMeta.usageToday:",sensor.sensorMeta.usageToday, status)


    return seconds;
  }() + "\">\n                <div class=\"grid-inner\">\n                    <i class=\"fas fa-calendar-day\"></i>\n                    <span class=\"conveyor-info-title\">Folosire astazi</span>\n                    <span class=\"conveyor-info-message\">\n                    " + function () {
    var status = sensor.sensorMeta.status;
    var seconds = sensor.sensorMeta.usageToday || 0;

    if (parseInt(status)) {
      var statusTime = new Date(sensor.sensorMeta.statusTime); // 2 hours back than current time

      statusTime = new Date(statusTime.getTime() - 2 * 60 * 60 * 1000); // sync hours

      var currentTime = new Date(); // current time is local time ro

      var diff = parseInt((currentTime - statusTime) / 1000); // console.log(seconds, diff)

      seconds += diff - 16; // console.log(seconds)
    }

    var result = humanizeDuration(seconds * 1000, {
      language: "en",
      spacer: "",
      // units: ["h", "m", "s"],
      units: ["h", "m"],
      round: true
    });
    result = result.replaceAll("hours", "h");
    result = result.replaceAll("hour", "h");
    result = result.replaceAll("minutes", "m");
    result = result.replaceAll("minute", "m");
    result = result.replaceAll("seconds", "s");
    result = result.replaceAll("second", "s");
    result = result.replaceAll(",", "");
    return result;
  }() + "\n                    </span>\n                </div>\n            </div> \n            <div class=\"usage-total\" seconds=\"" + function () {
    if (sensor.sensorMeta.usageTotal) return sensor.sensorMeta.usageTotal;
  }() + "\">\n                <div class=\"grid-inner\">\n                    <i class=\"fas fa-clock\"></i>\n                    <span class=\"conveyor-info-title\">Folosire totala</span>\n                    <span class=\"conveyor-info-message\">" + function () {
    var seconds = sensor.sensorMeta.usageTotal;
    var result = humanizeDuration(seconds * 1000, {
      language: "en",
      spacer: "",
      // units: ["h", "m", "s"],
      units: ["h", "m"],
      round: true
    });
    result = result.replaceAll("hours", "h");
    result = result.replaceAll("hour", "h");
    result = result.replaceAll("minutes", "m");
    result = result.replaceAll("minute", "m");
    result = result.replaceAll(",", "");
    return result;
  }() + "</span>\n                </div>\n            </div> \n            <div class=\"usage-left\">\n                <div class=\"grid-inner\">\n                    <i class=\"fas fa-tools\"></i>\n                    <span class=\"conveyor-info-title\">Mentenanta in</span>\n                    <span class=\"conveyor-info-message\">" + function () {
    if (sensor.sensorMeta.service) return sensor.sensorMeta.service + ' s';else return '<i class="fas fa-infinity"></i>';
  }() + "</span>\n                </div>\n            </div> \n        </div>\n    </div>\n    \n</article>";
}; // export let conveyorLayout = (sensor) => `
// <article class="card height-control conveyor-layout ` + sensor.sensorMeta.sensorId + `-card controller-` + sensor.sensorMeta.sensorId + `" sensorType="` + sensor.sensorMeta.sensorType + `" sensorId="` + sensor.sensorMeta.sensorId + `"'>
// </article>`


exports.conveyor = conveyor;

var conveyorLayout = function conveyorLayout(sensor) {
  return "\n<div class='conveyor-layout'>\n    <div class='conveyor-layout-inner'>\n    <!-- TIGANEALA -->\n        " + function () {
    if (username.toLowerCase() == 'pharmafarm') {
      // add an image
      return '<img src="/images/custom-maps/pharmafarm.jpg"/>';
    } else {
      if ((0, _utils.imageExists)("/images/custom-maps/" + username.toLowerCase() + ".jpg")) {
        return '<img src="/images/custom-maps/' + username.toLowerCase() + '.jpg"/>';
      }
    }

    return '';
  }() + "\n    <!-- END TIGANEALA -->\n    </div>\n    " + newItemsConveyorLayout() + "\n</div>";
};

exports.conveyorLayout = conveyorLayout;

var newItemsConveyorLayout = function newItemsConveyorLayout(sensor) {
  return "\n<div class='new-items-conveyor'>\n    \n</div>";
};

exports.newItemsConveyorLayout = newItemsConveyorLayout;

var conveyorItem = function conveyorItem(sensor, draggable) {
  var info = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    name: name
  };
  return "\n<div name=\"" + sensor.sensorName + "\" sensor=\"" + sensor.sensorId + "\" type=\"" + sensor.sensorType + "\" state=\"" + sensor.status + "\" class=\"sensor-item " + draggable + " ui-widget-content tooltip_test\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + sensor.sensorId + "\" " + function () {
    if (sensor.x && sensor.y) return 'style="top: ' + sensor.y + 'px; left: ' + sensor.x + 'px"';
  }() + ">  \n  <!-- medium view -->\n  <div class='medium-view'>\n    " + null + "\n    <span class='sensorName'>" + sensor.sensorName + "</span>\n    <span class='sensorValue'>No data</span>\n    <span class=\"not-live pulse\"></span>\n  </div>\n  <!-- end medium view -->\n\n  " + function () {
    // console.log(sensor)
    if (sensor.sensorType == 'gate') return '<i class="fas fa-door-open"></i>';else if (sensor.sensorType == 'safety') return '<i class="fas fa-exclamation-triangle"></i>';else if (sensor.sensorType == 'segment') return '<i class="fas fa-box-open"></i>';else return ''; // if(sensor.sensorType == 'segment')
    //     return '<i class="fas fa-grip-lines-vertical"></i><i class="fas fa-grip-lines-vertical"></i>'
  }() + "\n\n    <!-- small view -->\n    <div class='small-view'>\n        <span class='sensorName'>Nume: " + sensor.sensorName + "</span>\n    </div>\n    <!-- end small view -->\n        \n  <!-- tooltip -->\n  <span class=\"tooltiptext\">\n    <name>Nume: " + info.name + "</name>\n    " + (sensor.status ? '<br><state>Status: ' + states_dict[sensor.status] + '</state>' : '') + "\n    " + function () {
    if (sensor.statusTime) {
      var h = sensor.statusTime.split("T")[1].split(":")[0];
      var m = sensor.statusTime.split("T")[1].split(":")[1];
      var time = sensor.statusTime.split('T')[1].slice(0, 5);
      var day = sensor.statusTime.split("T")[0].slice(5).split('-')[1];
      var month = sensor.statusTime.split("T")[0].slice(5).split('-')[0];
      var today = new Date(); // console.log(sensor.sensorType, sensor.statusTime, today)

      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      today = today.toLocaleDateString().slice(0, 2);
      if (today == day) return '<br><date>De la: ' + time + '</date>';
      return '<br><date>De la: ' + time + "<br>" + day + " " + " " + monthNames[parseInt(month)].slice(0, 3) + '</date>';
    } else {
      return '<br><date></date>';
    }
  }() + "\n    " + function () {
    if (sensor.usageTotal) {
      var usage;

      if (sensor.sensorType != 'gate') {
        usage = humanizeDuration(sensor.usageTotal * 1000, {
          language: "en",
          spacer: "",
          // units: ["h", "m", "s"],
          units: ["h", "m"],
          round: true
        });
        usage = usage.replaceAll("hours", "h");
        usage = usage.replaceAll("hour", "h");
        usage = usage.replaceAll("minutes", "m");
        usage = usage.replaceAll("minute", "m");
        usage = usage.replaceAll(",", "");
      } else {
        usage = sensor.usageTotal;
      }

      return '<br><usage>Folosire: ' + usage + '</usage>';
    } else {
      return '<br><usage></usage>';
    }
  }() + "\n  </span>\n  <!-- end tooltip -->\n\n</div>";
}; // export let states_dict = {
//     "run": "is running",
//     "stop": "is stopped",
//     "energy": "stand by",
//     "acc": "in accumulation",
//     "error": "error",
//     "open": "is open",
//     "closed": "is closed",
//     "close": "is closed",
//     "press": "emergency button pressed",
//     "released": "emergency button ok"
// }


exports.conveyorItem = conveyorItem;
var states_dict = {
  "run": "pornit",
  "stop": "oprit",
  "energy": "standby",
  "acc": "acumulare",
  "error": "eroare",
  "open": "deschis",
  "closed": "inchis",
  "close": "inchis",
  "press": "apasata",
  "released": "ridicata"
};
exports.states_dict = states_dict;