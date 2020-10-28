"use strict";

var _utils = require("./utils.js");

console.log("script.js added"); // BIG TODO: This file should be organized differently. Split code in different files.
// Start imports

var Checker = require('password-checker');

var checker = new Checker(); // End Imports
// Window loader
// ============================

$(window).on('load', function () {
  $("body").addClass("window-loaded");
}); // ============================
// END Window loader
// Aside LOCATIONS
// ============================

var getUserData = function getUserData() {
  var response;
  return regeneratorRuntime.async(function getUserData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch("/api/v3/get-user-data"));

        case 2:
          response = _context.sent;
          return _context.abrupt("return", response.json());

        case 4:
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
          _context2.next = 2;
          return regeneratorRuntime.awrap(getUserData());

        case 2:
          userData = _context2.sent;
          // console.log(userData)
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
                var name;
                if (_location2 > 1) // when there are > 1 counties / regions and not matter how many cities
                  name = "<span class='multi-location'>" + user.location3 + "<span class='location-detail'>" + user.location1 + ", " + user.location2 + "</span>" + "</span>";else if (_location2 == 1 && _location > 1) // when there is one county and more cities
                  name = "<span class='multi-location'>" + user.location3 + "<span class='location-detail'>" + user.location2 + "</span>" + "</span>";else name = "<span class=''>" + user.location3 + "</span>"; // name = `<span class='multi-location'>`+user.location3+`<span class='location-detail'>`+user.location2+`</span>`+`</span>`

                zoneEl.append("<div class=\"zone-item\">\n                                <a href=\"/map/zone?zoneid=" + user.zoneId + "\" class='county-item'><i class=\"fas fa-layer-group\"></i>" + name + "</a>\n                            </div>");
              }
            }); // console.log(bufferAppendedLocations)
          }

          if (unsetSensors) {
            zoneEl.append("<div class=\"zone-item\">\n                        <a href=\"/set-location\" class='no-zone'><i class=\"fas fa-exclamation-circle\"></i><span>You have " + unsetSensors + " new sensors</span></a>\n                    </div>");
          } else if (zoneEl.children().length == 0) {
            zoneEl.append("<div class=\"zone-item\">\n                        <a href=\"#\" class='no-zone'><i class=\"fas fa-exclamation-circle\"></i><span>No sensors available</span></a>\n                    </div>");
          }

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
})(); // ============================
// END Aside LOCATIONS
// Aside MAPS
// ============================
// [ ] TODO: show choose userData or userData_row for maps and locations
// let maps = getValuesFromObject('map', userData_raw)


var zones = (0, _utils.getValuesFromObject)('zoneId', userData_raw);
var location1 = (0, _utils.getValuesFromObject)('location1', userData_raw);
var location2 = (0, _utils.getValuesFromObject)('location2', userData_raw);
var location3 = (0, _utils.getValuesFromObject)('location3', userData_raw); // [*] TODO: display multiple maps

var bufferAppendedMaps = [];
zones.forEach(function (id, index) {
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
// Init sensor form
// ============================
// $("form.location-container").submit(function(e) {
//     e.preventDefault();
// });


$("form.location-container #zone").on('input', function (e) {
  var optionSelected = $("option:selected", this)[0].text;

  if (optionSelected != 'Nothing selected') {
    var _location3 = optionSelected.split('/')[0];
    var _location4 = optionSelected.split('/')[1];
    var _location5 = optionSelected.split('/')[2];
    $("form.location-container input[name=location1]").attr("value", _location3);
    $("form.location-container input[name=location2]").attr("value", _location4);
    $("form.location-container input[name=location3]").attr("value", _location5);
    $("form.location-container input[name=location1]").attr("readonly", 'readonly');
    $("form.location-container input[name=location2]").attr("readonly", 'readonly');
    $("form.location-container input[name=location3]").attr("readonly", 'readonly');
  } else {
    $("form.location-container input[name=location1]").attr("value", '');
    $("form.location-container input[name=location2]").attr("value", '');
    $("form.location-container input[name=location3]").attr("value", '');
    $("form.location-container input[name=location1]").attr("readonly", false);
    $("form.location-container input[name=location2]").attr("readonly", false);
    $("form.location-container input[name=location3]").attr("readonly", false);
  }
}); // ============================
// END Init sensor form
// Password Checker Config

checker.min_length = 6;
checker.max_length = 20;
checker.requireLetters(true);
checker.requireNumbers(true);
checker.requireSymbols(false);
checker.checkLetters(true);
checker.checkNumbers(true);
checker.checkSymbols(true); // Change the letters that are allowed
// Default is: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
// checker.allowed_letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz';
// Default is: 0123456789
// checker.allowed_numbers = '1234567890';
// Default is: _- !\"?$%^&*()+={}[]:;@'~#|<>,.?\\/

checker.allowed_symbols = '-.'; // End Password Checker Config
// var passwordField = document.querySelector('.login-container .charInput:nth-child(4)');
// var otherPasswordFields = document.querySelectorAll('.login-container .charInput:not(:nth-child(4))');
// var registerButton = document.querySelector('.login-container input:last-child');
// var passwordRules = document.querySelector('.login-container .passwordRules');
// var passwordUpperCase = document.querySelector('.login-container .passwordRules li:first-child');
// var passwordLowerCase = document.querySelector('.login-container .passwordRules li:nth-child(2)');
// var passwordDigit = document.querySelector('.login-container .passwordRules li:nth-child(3)');
// var password8Char = document.querySelector('.login-container .passwordRules li:nth-child(4)');

var passwordField = document.querySelector('.login-container .charInput[name="password"]');
var passwordConfirm = document.querySelector('.login-container .charInput[name="passwordConfirm"]');
var registerButton = document.querySelector('.login-container input[name="register"]'); // Input Values

var allInputs = function allInputs() {
  var formName = $('.login-container input[name="name"]').val();
  var formCompany = $('.login-container input[name="company"]').val();
  var formUsername = $('.login-container input[name="username"]').val();
  var formEmail = $('.login-container input[name="email"]').val();
  var formPassword = $('.login-container input[name="password"]').val();
  var formConfirm = $('.login-container input[name="passwordConfirm"]').val(); // console.log(formName)

  var obj = {
    formName: formName,
    formCompany: formCompany,
    formUsername: formUsername,
    formEmail: formEmail,
    formPassword: formPassword,
    formConfirm: formConfirm
  };
  return [obj, (0, _utils.allTrue)(obj)];
}; // Time Helper Debug


function timeDebug(str) {
  var date = new Date();
  date = date.getMilliseconds();
  console.log(str, date);
} //hide the rules


if (registerButton) {
  registerButton.value = "Fill the inputs";
  registerButton.disabled = true;
}

var initialPassword = '';
$('.login-container input').keyup(function (elem) {
  var attrName = $(this)[0].name;
  console.log(attrName, allInputs()[1]);

  if (attrName != 'password' && attrName != 'passwordConfirm') {
    if (allInputs()[1]) {
      registerButton.value = "Register";
      registerButton.disabled = false;
    } else {
      registerButton.value = "Fill the inputs";
      registerButton.disabled = true;
    }
  } else if (attrName == 'password') {
    var passwordMessage = '';

    if (!checker.check(this.value)) {
      passwordMessage = checker.errors[0].message;
      registerButton.value = passwordMessage;
      registerButton.disabled = true;
      registerButton.disabled__custom = false;
    } else {
      registerButton.value = "Confirm the password";
      registerButton.disabled = true;
      initialPassword = this.value;
    }
  } else if (attrName == 'passwordConfirm') {
    if (initialPassword == this.value) {
      // console.log(initialPassword, this.value)
      if (allInputs()[1]) {
        registerButton.value = "Register";
        registerButton.disabled = false;
      } else {
        registerButton.value = "Fill the inputs";
        registerButton.disabled = true;
      }
    } else {
      registerButton.value = "Confirm the password";
      registerButton.disabled = true;
    }
  }
});

if (passwordField) {
  //show the rules when typing and check strongness
  passwordField.addEventListener('input', function (e) {
    e.preventDefault(); // var passwordMessage = ''
    // if (!checker.check(this.value)) {
    //     passwordMessage = checker.errors[0].message
    //     registerButton.value = passwordMessage
    //     registerButton.disabled = true
    //     registerButton.disabled__custom = false
    // } else {
    //     registerButton.value = "Confirm the password"
    //     registerButton.disabled = true
    //     initialPassword = this.value
    // }
  }); //show the rules when typing and check strongness

  passwordConfirm.addEventListener('input', function (e) {
    e.preventDefault(); // if (initialPassword == this.value) {
    //     // console.log(initialPassword, this.value)
    //     if (allInputs()[1]) {
    //         registerButton.value = "Register"
    //         registerButton.disabled = false
    //     } else {
    //         registerButton.value = "Fill the inputs"
    //         registerButton.disabled = true
    //     }
    // } else {
    //     registerButton.value = "Confirm the password"
    //     registerButton.disabled = true
    // }
  });
}

var editButton = document.querySelectorAll('.users-table tbody > tr .edit-btn');
var editUserBox = document.querySelector('.edit-user'); // $("#role_dropdown").prop("selectedIndex", 1);

function eventPath(evt) {
  var path = evt.composedPath && evt.composedPath() || evt.path,
      target = evt.target;

  if (path != null) {
    // Safari doesn't include Window, but it should.
    return path.indexOf(window) < 0 ? path.concat(window) : path;
  }

  if (target === window) {
    return [window];
  }

  function getParents(node, memo) {
    memo = memo || [];
    var parentNode = node.parentNode;

    if (!parentNode) {
      return memo;
    } else {
      return getParents(parentNode, memo.concat(parentNode));
    }
  }

  return [target].concat(getParents(target), window);
}

$(document).ready(function () {
  // pop up functionality
  // Listen for all clicks on the document
  document.addEventListener('click', function (event) {
    var path = event.path || event.composedPath && event.composedPath();
    var el;

    if (path) {
      // You got some path information
      //Old Way
      // var el = event.path[0].parentNode;
      // New Way
      var el = eventPath(event)[0].parentNode;
    } else {// This browser doesn't supply path information
    }

    if (el.classList.contains("popup")) {
      $(".show").removeClass("show");
      el.classList.toggle("show");
    } // If the click happened inside the the container, bail


    if (!event.target.closest(".popup")) {
      // console.log(el)
      $(".show").removeClass("show"); // console.log("click outside")
    } else {// el.addClass("show")
        // console.log("click inside")
      }
  }, false);

  try {// var childs = $(".small-box-container").children().length;
    // $(".small-box-container").addClass("children-" + String(childs))
  } finally {}
}); // Main navbar trick
// TODO: find a better solution
// ================================

try {
  // sidebar navigation
  var openedFinal = function openedFinal() {
    setTimeout(function () {
      sidenav.classList.add("sidenav-opened-final");
      sidenav.classList.remove("sidenav-closed-final");
    }, 150);
  };

  var closedFinal = function closedFinal() {
    // setTimeout(function () {
    sidenav.classList.remove("sidenav-opened-final");
    sidenav.classList.add("sidenav-closed-final"); // }, 200)
  }; // Check if mobile to wrap sidenav or not
  // Run at first load


  var toggleButtons = document.querySelectorAll(".toggleSidenav");
  var openButton = document.querySelector(".open-button");
  var overlay = document.querySelector(".main-overlay");
  var asideLinks = document.querySelectorAll(".sidenav-wrapper a");
  var sidenav = document.getElementById("mySidenav");
  var mainbody = document.getElementById("main");
  var body = document.getElementById('main');
  var except = document.getElementById('mySidenav');
  var flagOpenMenu = false;
  var flagCloseMenu = false;
  var widthOpen = "250px";
  var widthClosed = "50px";
  $(window).on('load', function () {
    var addBodyClass = function addBodyClass() {
      // var date = new Date();
      // var date = date.getTime()
      // console.log(date,(date-date_1)/1000)
      $("body").addClass("window-loaded");
    };

    if (sidenav) {
      if (window.innerWidth > 991) {
        if (!sidenav.classList.contains("sidenav-opened")) {
          // openButton.click()
          // var date_1;
          var openButtonClick = function openButtonClick(callback) {
            // date_1 = new Date();
            // date_1 = date_1.getTime()
            // console.log(date_1)
            openButton.click();
            setTimeout(function () {
              callback();
            }, 150);
          };

          openButtonClick(addBodyClass);
        }
      } else {
        closedFinal.bind()();
        addBodyClass();
      }
    }
  }); // Run when resize and onload

  $(window).resize(function () {
    if (window.innerWidth > 991) {
      // console.log(">",window.innerWidth)
      // if sidenav is closes
      if (!sidenav.classList.contains("sidenav-opened")) {
        openButton.click();
      }
    } else {
      // console.log("<",window.innerWidth)
      // if sidebar is closed
      if (!sidenav.classList.contains("sidenav-opened")) {} // if sidebar is opened
      else {
          overlay.click();
        }
    }
  }); // End Check if mobile to wrap sidenav or not
  // if (window.innerWidth <= 991) {

  openButton.addEventListener('click', function () {
    var date = new Date();
    date = date.getMilliseconds(); // console.log("opened click:", date)

    if (!sidenav.classList.contains("sidenav-opened")) {
      sidenav.classList.add("sidenav-opened");
      overlay.classList.remove("hidden-overlay");

      if (mainbody.getBoundingClientRect().width > 500) {
        mainbody.classList.add("pl-250");
        mainbody.classList.remove("pl-50");
      }
    }

    sidenav.classList.remove("sidenav-closed");
    overlay.classList.remove("hidden-overlay"); // mainbody.classList.remove("pl-250")
    // mainbody.classList.add("pl-50")

    sidenav.classList.toggle("click-open"); // $("#main").css({"margin-left": "50px"})

    for (var i = 0; i < toggleButtons.length; i++) {
      toggleButtons[i].classList.toggle("hidden-button");
    }

    openedFinal.bind()();
  });
  if (window.innerWidth <= 991) $("#mySidenav").hover(function () {
    // console.log("trying to hover in")
    if (!sidenav.classList.contains("click-open")) {
      // $("#main").css({ "margin-left": "250px" })
      sidenav.classList.add("sidenav-opened");

      if (mainbody.getBoundingClientRect().width > 500) {
        mainbody.classList.add("pl-250");
        mainbody.classList.remove("pl-50");
      }

      overlay.classList.remove("hidden-overlay");
      sidenav.classList.remove("sidenav-closed");

      for (var i = 0; i < toggleButtons.length; i++) {
        toggleButtons[i].classList.toggle("hidden-button");
      }
    }

    openedFinal.bind()();
  }, function () {
    // console.log("trying to hover out")
    if (!sidenav.classList.contains("click-open")) {
      closedFinal(); // $("#main").css({ "margin-left": "50px" })

      sidenav.classList.remove("sidenav-opened");

      if (mainbody.getBoundingClientRect().width > 500) {
        mainbody.classList.remove("pl-250");
        mainbody.classList.add("pl-50");
      }

      overlay.classList.add("hidden-overlay");
      sidenav.classList.add("sidenav-closed");

      for (var i = 0; i < toggleButtons.length; i++) {
        toggleButtons[i].classList.toggle("hidden-button");
      }
    }
  });
  body.addEventListener("click", function () {
    if (window.innerWidth <= 991) if (sidenav.classList.contains("click-open")) {
      closedFinal();
      sidenav.classList.remove("click-open");
      sidenav.classList.remove("sidenav-opened");

      if (mainbody.getBoundingClientRect().width > 500) {
        mainbody.classList.remove("pl-250");
        mainbody.classList.add("pl-50");
      }

      overlay.classList.add("hidden-overlay");
      sidenav.classList.add("sidenav-closed");

      for (var i = 0; i < toggleButtons.length; i++) {
        toggleButtons[i].classList.toggle("hidden-button");
      }
    }
  });
  except.addEventListener("click", function (ev) {
    // console.log("click on sidebar");
    ev.stopPropagation(); //this is important! If removed, you'll get both alerts
  }, false);
  document.querySelector(".open-button").addEventListener("click", function (ev) {
    // console.log("click on button");
    ev.stopPropagation(); //this is important! If removed, you'll get both alerts
  }, false); // }
} catch (e) {
  console.warn("It looks like there is no sidebar navigation");
} // ================================
// END Main navbar trick
// Chart.JS


{}
/* <script> */
// chartIt('temperature_1')

function chartIt(selector) {
  var ctx = document.getElementById(selector).getContext('2d');
  xLabels = [20, 30, 25, 40];
  yLabel = [2020, 2019, 2018, 2017];
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: yLabel,
      datasets: [{
        label: 'Average Temperature',
        data: xLabels,
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
} // CARD DATA FETCH
// ========================================
// $("#chart-customizer").ready(function () {
//     let loader = `<div class="boxLoading">Loading...</div>`;
//     document.getElementById('chart-customizer').innerHTML = loader;
//     fetch('https://jsonplaceholder.typicode.com/todos/1')
//         .then(response => response.json())
//         .then(json => {
//             console.log(json)
//             const str = JSON.stringify(json, null, 2)
//             console.log(str)
//             let result = `<h2> Result: </h2><br>`;
//             result += `<p>User id:${json.userId} </p><br>`
//             result += `<p>Title:${json.title} </p>`
//             $(".boxLoading").remove()
//             $('#chart-customizer').append(result)
//         }).catch((e)=>{
//             console.warn(e.message)
//         })
// })
// ========================================
// End CARD DATA FETCH
// chart_TimeSeries('timeseries_1', generateData())
// not used


function chart_TimeSeries(selector, data) {
  var ctx = document.getElementById(selector).getContext('2d');
  var color = Chart.helpers.color;
  var cfg = {
    data: {
      datasets: [{
        label: 'Timeseries chart',
        backgroundColor: "red",
        borderColor: "black",
        data: data,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      }]
    },
    options: {
      animation: {
        duration: 0
      },
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'series',
          offset: true,
          ticks: {
            major: {
              enabled: true,
              fontStyle: 'bold'
            },
            source: 'data',
            autoSkip: true,
            autoSkipPadding: 75,
            maxRotation: 0,
            sampleSize: 100
          },
          afterBuildTicks: function afterBuildTicks(scale, ticks) {
            var majorUnit = scale._majorUnit;
            var firstTick = ticks[0];
            var i, ilen, val, tick, currMajor, lastMajor;
            val = moment(ticks[0].value);

            if (majorUnit === 'minute' && val.second() === 0 || majorUnit === 'hour' && val.minute() === 0 || majorUnit === 'day' && val.hour() === 9 || majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1 || majorUnit === 'year' && val.month() === 0) {
              firstTick.major = true;
            } else {
              firstTick.major = false;
            }

            lastMajor = val.get(majorUnit);

            for (i = 1, ilen = ticks.length; i < ilen; i++) {
              tick = ticks[i];
              val = moment(tick.value);
              currMajor = val.get(majorUnit);
              tick.major = currMajor !== lastMajor;
              lastMajor = currMajor;
            }

            return ticks;
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Closing price ($)'
          }
        }]
      },
      tooltips: {
        intersect: false,
        mode: 'index',
        callbacks: {
          label: function label(tooltipItem, myData) {
            var label = myData.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }

            label += parseFloat(tooltipItem.value).toFixed(2);
            return label;
          }
        }
      }
    }
  };
  var chart = new Chart(ctx, cfg);
}

function generateData() {
  // var unit = document.getElementById('unit').value;
  var unit = 'Day';

  function unitLessThanDay() {
    return unit === 'second' || unit === 'minute' || unit === 'hour';
  }

  function beforeNineThirty(date) {
    return date.hour() < 9 || date.hour() === 9 && date.minute() < 30;
  } // Returns true if outside 9:30am-4pm on a weekday


  function outsideMarketHours(date) {
    if (date.isoWeekday() > 5) {
      return true;
    }

    if (unitLessThanDay() && (beforeNineThirty(date) || date.hour() > 16)) {
      return true;
    }

    return false;
  }

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomBar(date, lastClose) {
    var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
    var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
    return {
      t: date.valueOf(),
      y: close
    };
  }

  var date = moment('Jan 01 1990', 'MMM DD YYYY');
  var now = moment();
  var data = [];
  var lessThanDay = unitLessThanDay();

  for (; data.length < 600 && date.isBefore(now); date = date.clone().add(1, unit).startOf(unit)) {
    if (outsideMarketHours(date)) {
      if (!lessThanDay || !beforeNineThirty(date)) {
        date = date.clone().add(date.isoWeekday() >= 5 ? 8 - date.isoWeekday() : 1, 'day');
      }

      if (lessThanDay) {
        date = date.hour(9).minute(30).second(0);
      }
    }

    data.push(randomBar(date, data.length > 0 ? data[data.length - 1].y : 30));
  }

  return data;
} // chart_lineboundaries('timeseries_1')


function chart_lineboundaries(selector) {
  var presets = window.chartColors;
  var utils = Samples.utils;
  var inputs = {
    min: -100,
    max: 100,
    count: 8,
    decimals: 2,
    continuity: 1
  };

  function generateData(config) {
    return utils.numbers(Chart.helpers.merge(inputs, config || {}));
  }

  function generateLabels(config) {
    return utils.months(Chart.helpers.merge({
      count: inputs.count,
      section: 3
    }, config || {}));
  }

  var options = {
    maintainAspectRatio: false,
    spanGaps: false,
    elements: {
      line: {
        tension: 0.000001
      }
    },
    plugins: {
      filler: {
        propagate: false
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxRotation: 0
        }
      }]
    }
  };
  [false, 'origin', 'start', 'end'].forEach(function (boundary, index) {
    // reset the random seed to generate the same data for all charts
    utils.srand(8);
    new Chart(selector, {
      type: 'line',
      data: {
        labels: generateLabels(),
        datasets: [{
          backgroundColor: utils.transparentize(presets.red),
          borderColor: presets.red,
          data: generateData(),
          label: 'Dataset',
          fill: boundary
        }]
      },
      options: Chart.helpers.merge(options, {
        title: {
          text: 'fill: ' + boundary,
          display: true
        }
      })
    });
  });
} // Comment the following line if you don't want notification to be on all pages


animationInNotification();

function animationInNotification() {
  setTimeout(50, $(".messages").animate({
    right: "0px",
    opacity: "1",
    visibility: "visible"
  }));
} // navigator.usb.getDevices()
// .then(device => {
//   console.log(device.productName);      // "Arduino Micro"
//   console.log(device.manufacturerName); // "Arduino LLC"
// })
// .catch(error => { console.log(error); });
// if (!('usb' in navigator)) throw new Error("Browser does not support WebUSB");
// navigator.usb.getDevices()
//   .then(devices => {
//     const report = "<p>Total devices: " + devices.length + "</p><ul>" + devices.map(d => {
//       return "<li>Product name: " + device.productName + ", serial number " + device.serialNumber + "</li>";
//     }).join('\n') + "</ul>";
//     console.log("report",report)
//     DemoUtils.reportDemoResult(true);
//   })
//   .catch(e => DemoUtils.reportDemoResult(false, {resultDetail: e.toString()}));
// customTimelineCalendar()
// function customTimelineCalendar() {
//     $("#graph-calendar button").click(function(){
//         console.log("test")
//     })
// }
// Async timeout
// let timeout = (ms,f) => {
//     let sleep =  new Promise(resolve => setTimeout(function(){
//         f()
//         // return resolve
//     }, ms))
// }


function timeout(ms, f) {
  var sleep = new Promise(function (resolve) {
    return setTimeout(function () {
      f(); // return resolve
    }, ms);
  });
} // Test async timeout


timeout(3000, function () {
  console.log("3 seconds async timeout");
}); // Set the minimum height of the sidebar

var infos = function infos() {
  var brandH = $("#mySidenav .brand").height();
  var basicItemsCounter = $("#mySidenav .basicItems").length;
  var basicItemsH = $("#mySidenav .basicItems").height();
  var zoneLisH = $("#mySidenav .zone-list").height();
  var settingItemsH = $("#mySidenav .settings-items").height();
  console.log(brandH, basicItemsCounter, basicItemsH, zoneLisH, settingItemsH);
};