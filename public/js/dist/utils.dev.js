"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendMessage = sendMessage;
exports.delay = delay;
exports.displayTimeoutAndVanish = displayTimeoutAndVanish;
exports.liveWeight = liveWeight;
exports.liveWeightTable = liveWeightTable;
exports.liveGate = liveGate;
exports.scaleInput = scaleInput;
exports.filterColumn = filterColumn;
exports.showNotification = showNotification;
exports.getLocationObj = getLocationObj;
exports.passwordCheckerPromise = passwordCheckerPromise;
exports.passwordChecker = passwordChecker;
exports.allTrue = allTrue;
exports.getDistinctValuesFromObject = getDistinctValuesFromObject;
exports.getValuesFromObject = getValuesFromObject;
exports.searchToObj = searchToObj;
exports.getConveyorStatus = exports.insertStatus = exports.timeoutAsync = void 0;

// Start imports
var Checker = require('password-checker'); // End Imports


var timeoutAsync = function timeoutAsync(ms, f) {
  var sleep = new Promise(function (resolve) {
    return setTimeout(function () {
      f();
    }, ms);
  });
};

exports.timeoutAsync = timeoutAsync;

function sendMessage(topic, msg) {
  // send a status message to get the gate status
  socket.emit(topic, msg);
}

function delay(ms) {
  return regeneratorRuntime.async(function delay$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          }));

        case 2:
          return _context.abrupt("return", _context.sent);

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}

function displayTimeoutAndVanish(element, timeout) {
  var el = $(element);
  var timeout_ = timeout / 1000;
  var x = setInterval(function () {
    timeout_ -= 1;
    el.html(timeout_ + " sec");
  }, 1000);
  timeoutAsync(timeout, function () {
    el.fadeOut(500);
    clearInterval(x);
  });
}

function liveWeight(payloadJson) {
  var scaleTitle = $(".scale-info h3");
  var barcodeTitle = $(".scale-info p");
  payloadJson = JSON.parse(payloadJson);
  scaleTitle.html(payloadJson.weight + "g");
  barcodeTitle.html(payloadJson.barcode);
}

function liveWeightTable(payloadJson, tableColumn) {
  // Live card insert
  var scaleTitle = $(".scale-info h3");
  var barcodeTitle = $(".scale-info p");

  if (typeof payloadJson == 'string') {
    payloadJson = JSON.parse(payloadJson);
  } // console.log(payloadJson.weight)


  scaleTitle.html(payloadJson.weight + "g");
  barcodeTitle.html(payloadJson.barcode); // MySQL insert
  // if (payloadJson.wms)
  //   sendScaleRecordings(payloadJson.barcode, payloadJson.weight, payloadJson.wms)
  // else
  //   sendScaleRecordings(payloadJson.barcode, payloadJson.weight)

  if (payloadJson.wms == undefined) payloadJson.wms = 0; // Remove no data text

  if ($(".table-wrapper .text-center").length) {
    $(".table-wrapper .text-center").remove();
  }

  var tbody = $(".table-wrapper table tbody"); // Sync the timestamp (mysql - local timezone)

  var timestamp = new Date();
  timestamp = timestamp.toLocaleString('en-US', {
    timeZone: 'Europe/Bucharest',
    timeStyle: "medium",
    dateStyle: "long"
  }); // Insert new data into table

  var index = $(".table-wrapper table tbody tr:first-child th").html();

  if (index == undefined) {
    index = 0;
  }

  index = parseInt(index) + 1;
  if (payloadJson.wms) var elClass = 'last-row-animation-good';else var elClass = 'last-row-animation-good';
  tbody.prepend("<tr class=\"" + elClass + "\" timestamp=\"" + timestamp + "\" barcode=\"" + payloadJson.barcode + "\">\n                          <th scope=\"row\">" + index + "</th>\n                          <td>" + payloadJson.wms + "</td>\n                          <td>" + payloadJson.barcode + "</td>\n                          <td>" + payloadJson.weight + "g</td>\n                          <td>" + timestamp.split(", ")[0] + ", " + timestamp.split(", ")[1] + "</td>\n                      </tr>"); // Filter again
  // try {
  //     filterColumn(tableColumn)
  // } catch(e) {
  //     console.warn(e)
  // }
}

var oneTime = true; // var statusConor = 0

function liveGate(status) {
  var gate = $(".gate-info");
  var gateTitle = $(".gate-info h3");

  if (status == 0) {
    // gate is closed
    gate.attr("status", "closed"); // document.querySelector(".gate-info").style.background = "#28a745"

    gateTitle.html("Closed");

    if (!isConveyorEnabled()) {
      insertStatus("on"); // insert status into DB

      switchConveyorToggle();
    } // showNotification("Gate is closed", 4)

  } else if (status == 1) {
    // gate is open
    gate.attr("status", "open"); // document.querySelector(".gate-info").style.background = "#dc3545"

    gateTitle.html("Open"); // isConveyorEnabled()

    if (!isConveyorEnabled()) {
      insertStatus("on"); // insert status into DB

      switchConveyorToggle();
    } // showNotification("Gate is open", 4)

  } else {
    timeoutAsync(2000, function () {});
  } // When page is loading first time
  // And toggle is on
  // And gate is unknown
  // => toggle should be off


  timeoutAsync(1000, function () {
    // wait 5000 sec to receive gate status
    if (gateTitle.text() == "Unknown") {
      if (isConveyorEnabled()) {
        insertStatus("off"); // insert status into DB

        switchConveyorToggle();
      } // showNotification("Conveyor is stopped", 0)
      // showNotification("Conveyor is stopped", 1)
      // showNotification("Conveyor is stopped", 2)


      if (oneTime) {
        // showNotification("Conveyor is stopped", 1)
        oneTime = false;
      }
    }
  });
}

function isConveyorEnabled() {
  var switchConveyor = $("#switch-conveyor");
  var switchConveyorState = switchConveyor[0].checked;
  return switchConveyorState;
}

function switchConveyorToggle() {
  var switchConveyor = $("#switch-conveyor");
  switchConveyor[0].checked = !switchConveyor[0].checked;
}

function scaleInput(tableColumn) {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("scaleInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("scaleTable");
  tr = table.getElementsByTagName("tr"); // Loop through all table rows, and hide those who don't match the search query

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[tableColumn]; //   console.log(i, td)

    if (td) {
      txtValue = td.textContent || td.innerText; // console.log(i, td, txtValue)

      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function filterColumn(id_input, id_table, tableColumn) {
  // Declare variables
  var input = {
    value: ''
  };
  var filter, table, tr, td, i, txtValue;
  input = document.getElementById(id_input);
  filter = input.value.toUpperCase();
  table = document.getElementById(id_table);
  tr = table.getElementsByTagName("tr"); // Loop through all table rows, and hide those who don't match the search query

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[tableColumn]; //   console.log(i, td)

    if (td) {
      txtValue = td.textContent || td.innerText; // console.log(i, td, txtValue)

      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
} // insert status of conveyor into mysql


var insertStatus = function insertStatus(status) {
  return regeneratorRuntime.async(function insertStatus$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // status = on / off
          $.ajax({
            url: "/api/conveyor?setStatus=" + status + "",
            type: 'GET'
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // get all values of a sensor


exports.insertStatus = insertStatus;

var getConveyorStatus = function getConveyorStatus(sensor) {
  var response;
  return regeneratorRuntime.async(function getConveyorStatus$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/conveyor"));

        case 2:
          response = _context3.sent;
          return _context3.abrupt("return", response.json());

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.getConveyorStatus = getConveyorStatus;

function showNotification(message) {
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (error == 0) $("notification").append("<div class=\"messages hideMe\">\n                                    <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                    <i class=\"fas fa-barcode\"></i>\n                                        <background></background>\n                                        " + message + "\n                                    </div>\n                                </div>").show('slow');else if (error == 1) $("notification").append("<div class=\"messages hideMe\">\n                                    <div class=\"alert alert-danger mt-3 mb-0\" role=\"alert\">\n                                        <i class=\"fas fa-exclamation-triangle\"></i>\n                                        <background></background>\n                                        " + message + "\n                                    </div>\n                                </div>").show('slow');else if (error == 2) $("notification").append("<div class=\"messages hideMe\">\n                                        <div class=\"alert alert-success mt-3 mb-0\" role=\"alert\">\n                                            <i class=\"fas fa-print\"></i>\n                                            <background></background>\n                                            " + message + "\n                                        </div>\n                                </div>").show('slow');else if (error == 3) $("notification").append("<div class=\"messages hideMe\">\n                                        <div class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n                                            <i class=\"fas fa-times-circle\"></i>\n                                            <background></background>\n                                            " + message + "\n                                        </div>\n                                </div>").show('slow');else if (error == 4) $("notification").append("<div class=\"messages hideMe\">\n                                        <div class=\"alert alert-success mt-3 mb-0\" role=\"alert\">\n                                            <i class=\"fas fa-info-circle\"></i>\n                                            <background></background>\n                                            " + message + "\n                                        </div>\n                                </div>").show('slow');else if (error == 'top') {
    if ($(".new-message").length) {
      $("#main .new-message").hide().prepend("<div>" + message + "</div>").slideToggle(500, function () {
        timeoutAsync(7000, function () {
          $('#main .new-message > div:last-child').slideToggle(1000);
        });
      });
    }
  }
}

function getLocationObj() {
  var bodyEl = $("body");
  var location = [];

  if (bodyEl.attr("location")) {
    location.push(bodyEl.attr("location"));
    var locationObj = JSON.parse(location); // if($("body").hasClass("map-page")) {
    //   showNotification("You have <b>"+location.length+" "+ (location.length>1 ? `sensors` : `sensor`) +"</b> on map!", error = 4)
    // }

    return locationObj;
  } else {
    // return coordinates of bucharest (lon,lat)
    // showNotification("You have no sensor assigned!", error = 4)
    return {
      "bucharest": [44.439663, 26.096306]
    };
  }
}

function passwordCheckerPromise(value) {
  var promise = new Promise(function (resolve, reject) {
    var checker = new Checker();
    var error = false;
    checker.min_length = 6;
    checker.max_length = 20;
    checker.requireLetters(true);
    checker.requireNumbers(true);
    checker.requireSymbols(false);
    checker.checkLetters(true);
    checker.checkNumbers(true);
    checker.checkSymbols(true);
    checker.allowed_symbols = '-.';

    if (!checker.check(value)) {
      error = checker.errors[0].message;
    } else {
      error = false;
    }

    resolve(error);
  });
  return promise;
}

function passwordChecker(value) {
  var checker = new Checker();
  var error = false;
  checker.min_length = 6;
  checker.max_length = 20;
  checker.requireLetters(true);
  checker.requireNumbers(true);
  checker.requireSymbols(false);
  checker.checkLetters(true);
  checker.checkNumbers(true);
  checker.checkSymbols(true);
  checker.allowed_symbols = '-.';

  if (!checker.check(value)) {
    error = checker.errors[0].message;
  } else {
    error = false;
  }

  return error;
}

function allTrue(obj) {
  for (var o in obj) {
    if (!obj[o]) return false;
  }

  return true;
}

function getDistinctValuesFromObject(val, obj) {
  var flags = [],
      output = [],
      l,
      i;
  l = obj.length;

  for (i = 0; i < l; i++) {
    if (flags[obj[i][val]]) continue;
    flags[obj[i][val]] = true;
    output.push(obj[i][val]);
  }

  return output;
}

function getValuesFromObject(val, obj) {
  var flags = [],
      output = [],
      l,
      i;
  l = obj.length;

  for (i = 0; i < l; i++) {
    // if (flags[obj[i][val]]) continue;
    // flags[obj[i][val]] = true;
    output.push(obj[i][val]);
  }

  return output;
}

function searchToObj(val) {
  var search = val.split('?')[1];
  var searchobj = {};

  if (search) {
    search = search.split('&');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = search[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var el = _step.value;
        searchobj[el.split('=')[0]] = el.split('=')[1];
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
  }

  return searchobj;
}