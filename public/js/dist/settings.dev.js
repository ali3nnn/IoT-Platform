"use strict";

var _utils = require("./utils.js");

// Imports
var fetchAdmins = function fetchAdmins() {
  var response;
  return regeneratorRuntime.async(function fetchAdmins$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          response = fetch('/api/get-team').then(function (result) {
            if (result.status != 200) {
              // user is not superadmin
              $(".admin-settings").remove();
            } else if (result.status == 200) {
              return result.json();
            }
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(response);

        case 3:
          return _context.abrupt("return", _context.sent);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}; // [ ] TODO: should get zones from sess.userData
// console.log("userData_raw", userData_raw)


var fetchZones = function fetchZones() {
  var response;
  return regeneratorRuntime.async(function fetchZones$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          response = fetch('/api/get-zones').then(function (result) {
            var resultJson = result.json(); // console.log(await resultJson)

            if (result.status == 401) {
              // user is not superadmin
              $(".zone-settings").remove();
            } else if (result.status == 200) {
              return resultJson;
            }
          });
          _context2.next = 3;
          return regeneratorRuntime.awrap(response);

        case 3:
          return _context2.abrupt("return", _context2.sent);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // console.log(userData)
// Color yellow setting item


if (window.location.href.indexOf('settings') > -1) {
  $(".settings-route").addClass("link-selected");
} // ADMIN TAB
// ==============================
// Create admin button for modal


$(function () {
  $(".create-admin").on('click', function () {
    $("#create-admin").modal({
      backdrop: 'static'
    });
  });
}); // Append admin list

var company = '';
var listOfUsers;
var fetchAdminsPromise = fetchAdmins().then(function (listOfAdmins) {
  // console.log(listOfAdmins)
  listOfUsers = listOfAdmins;

  if (listOfAdmins != undefined) {
    listOfAdmins.forEach(function (admin) {
      // Add company in form
      if (!company) {
        company = admin.company;
        $("#form-create-admin input[name='company']").attr("value", company); // Append company name in form

        $(".top-container span b").html(company); // Append company name in title for every box
      }

      if (admin.username == username) $(".admin-list table tbody").prepend("<tr username='" + admin.username + "'>\n                                                    <td><p>" + admin.name + "</p></td>\n                                                    <td><p>" + admin.username + "</p></td>\n                                                    <td><p>" + admin.email + "</p></td>\n                                                    <td><span class='remove-user' username='" + admin.username + "'><i class=\"fas fa-user-minus\"></i></span></td>\n                                                </tr>");else $(".admin-list table tbody").append("<tr username='" + admin.username + "'>\n                                                    <td><p>" + admin.name + "</p></td>\n                                                    <td><p>" + admin.username + "</p></td>\n                                                    <td><p>" + admin.email + "</p></td>\n                                                    <td><span class='remove-user' username='" + admin.username + "'><i class=\"fas fa-user-minus\"></i></span></td>\n                                                </tr>");
      $(".remove-user[username='" + admin.username + "']").on('click', function (e) {
        e.preventDefault();
        var username = admin.username;
        var url = '/api/remove-user'; // console.log(url, username)

        var ask = confirm("Do you want to REMOVE the user ?");
        if (ask) $.ajax({
          url: url,
          type: 'POST',
          data: {
            username: username
          },
          success: function success(result) {
            if (result) {
              $(".admin-list tr[username='" + username + "']").slideUp();
            }
          },
          error: function error(err) {
            console.log("err:", err);
          }
        });
      });
    });
    listOfUsers = (0, _utils.getDistinctValuesFromObject)('username', listOfUsers);
    listOfUsers = listOfUsers.filter(function (user, index) {
      return username == user ? false : user;
    });
  }
}); // END ADMIN TAB
// ==============================
// [ ] TODO: Append users checkbox in zoneModal

function getZones(user, obj) {
  var ids_raw = [];
  obj.forEach(function (item) {
    if (item.username === user) ids_raw.push(item.zoneId);
  });
  return ids_raw;
} // Zone modal


var zoneModal = function zoneModal(id, zoneid, location1, location2, location3, custommap, olmap) {
  var path = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
  var listOfZoneAccess = arguments.length > 8 ? arguments[8] : undefined;

  // console.log(listOfZoneAccess)
  // [*] TODO: add unique users
  // [ ] TODO: isChecked
  // Checkbox for user list template
  var checkboxesTemplate = function checkboxesTemplate(name, username, checked) {
    return '<label><input type="checkbox" ' + checked + ' name="' + name + '" value="' + username + '">' + username + '</label>';
  }; // Init checkboxes


  var checkboxes_checked = "";
  var checkboxes_unchecked = "";
  var checkboxes = ""; // Duplicate checker

  var usersUnchecked = [];
  var usersChecked = [];
  var userBuffer = []; // } else {
  // There are some users for some zones

  listOfZoneAccess[1].forEach(function (location, index) {
    if (location.zoneId == zoneid) {
      // Get row with this zone id from list of locations and users
      var zone = listOfZoneAccess[0].filter(function (location, idx) {
        return location.zoneId == zoneid ? location : false;
      }); // console.log(zone[0])
      // If current zone has usersList

      if (zone[0]) {
        // Get unqiue users of it 
        var userAssignated = zone[0].usersList.split(',');
        userAssignated = new Set(userAssignated); // console.log(userAssignated)
        // Loop through each user and check who is assignated and who is not

        listOfUsers.forEach(function (user, index) {
          // console.log()
          // if (index != 0) { // index != 0 because i dont want to show superadmin of this company
          if (userAssignated.has(user)) {
            checkboxes += checkboxesTemplate('username' + index, user, 'checked');
          } else {
            checkboxes += checkboxesTemplate('username' + index, user, '');
          } // }

        });
      } else {
        // if current zone has not an usersList
        listOfUsers.forEach(function (user, index) {
          // if (index != 0) { // index != 0 because i dont want to show superadmin of this company
          checkboxes += checkboxesTemplate('username' + index, user, ''); // }
        });
      }
    }
  }); // }
  // Modal Template

  return "<div class='zone-modal' modalid='" + id + "'>\n            <div class=\"modal modal-zone\" id=\"edit-zone-modal-" + id + "\" aria-labelledby=\"edit-zone-label\"\n                aria-hidden=\"true\" tabindex=\"-1\" role=\"dialog\">\n                <div class=\"modal-dialog fadeInModal modal-dialog-centered\" role=\"document\">\n                    <div class=\"modal-content\">\n\n                        <div class=\"modal-header\">\n                            <h5 class=\"modal-title\" id='edit-zone-label'>Edit zone</h5>\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n\n                        <div class=\"modal-body\">\n                            <form enctype=\"multipart/form-data\" action='/api/edit-zone' method='POST' id=\"form-edit-zone-" + id + "\">  \n                            \n                                <div class=\"form-group\">\n                                    <input type=\"text\" class=\"form-control\" id=\"zoneid\" name=\"zoneid\" readonly value=\"" + zoneid + "\">\n                                </div>\n\n                                <div class=\"form-group\">\n                                    <input type=\"text\" class=\"form-control\" id=\"location1\" name=\"location1\" readonly value=\"" + location1 + "\">\n                                </div>\n\n                                <div class=\"form-group\">\n                                    <input type=\"email\" class=\"form-control\" id=\"location2\" name=\"location2\" readonly value=\"" + location2 + "\">\n                                </div>\n\n                                <div class=\"form-group\">\n                                    <input type=\"text\" class=\"form-control\" id=\"location3\" name=\"location3\" readonly value=\"" + location3 + "\">\n                                </div>\n\n                                <div class=\"form-group\">\n                                    <input type=\"radio\" " + custommap + " name=\"map\" value=\"" + function () {
    return path == 'NULL' || !path ? 'custom' : path;
  }() + "\"> Custom Map " + function () {
    return path == 'NULL' || !path ? '' : '(<a target="_blank" rel="noopener noreferrer" href="/images/custom-maps/' + path + '">Image</a>)';
  }() + " </input> <br>\n                                    <input type=\"radio\" " + olmap + " name=\"map\" value=\"ol\"> OL Map </input>\n                                </div>\n\n                                <div class=\"form-group\">\n                                    <input id=\"image-file\" " + function () {
    return olmap ? 'disabled' : '';
  }() + " name=\"mapimage\" type=\"file\">\n                                </div>\n\n                                <div class=\"form-group form-checkboxes\">\n                                    " + checkboxes + "\n                                </div>\n\n                            </form>\n                        </div>\n\n                        <div class=\"modal-footer\">\n                            <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\"\n                                aria-label=\"Close\">Close</button>\n                            <button type=\"submit\" value=\"submit\" form=\"form-edit-zone-" + id + "\"\n                                class=\"btn btn-primary\">Save</button>\n                        </div>\n\n                    </div>\n                </div>\n            </div>\n            </div>";
}; // END ZONE MODAL
// Append zone list


var zonesAndUserList;
var zonesRaw;
var userDataBuffer; // fetchAdminsPromise.then(() => {

fetchZones().then(function (result) {
  // console.log(result)
  // Get company of user when role=='admin' otherwise it will be set in fetchAdminsPromise
  if (company.length == 0) {
    company = result[0][0].company;
    $(".top-container span b").html(company);
  } // console.log(result[0][0], result[0][0].hasOwnProperty('role'))


  var userRole = {
    superadmin: false,
    admin: false
  };

  if (result[0][0].hasOwnProperty('role')) {
    // console.log("admin")
    userRole.admin = true;
  } else {
    // console.log("superadmin")
    userRole.superadmin = true;
  } // ZONES TAB
  // ==============================


  if (userRole.superadmin) {
    zonesAndUserList = result[0];
    zonesRaw = result[1];
  } else if (userRole.admin) {
    zonesAndUserList = []; // { alerts, battery, closedTimer, max, min, offset, opemTimer,role,sensorId,sensorName,sensorType,x,y, ...userDataBuffer } = result[0];

    zonesRaw = result[0];
  } // Delete all duplicated by zoneId


  zonesRaw = _utils._.uniqBy(zonesRaw, function (e) {
    return e.zoneId;
  }); // console.log(userRole, result)
  // console.log(result)
  // console.log(userData_raw)

  if (!zonesRaw.length) {
    // Append rows to zone-tab
    $(".zone-tab .mid-container table tbody").append("<tr><td>No zone for this team</td><td></td><td></td></tr>");
  }

  zonesRaw.forEach(function (zone) {
    // console.log(zone)
    // Generate unique Id
    var date = new Date();
    var modalId = date.getTime() + Math.floor(Math.random() * 100 + 1); // Append rows to zone-tab
    // console.log(zone.zoneId, zone.map)

    $(".zone-tab .mid-container table tbody").append("<tr zoneid='" + zone.zoneId + "'>\n                    <td>" + zone.location1 + " / " + zone.location2 + " / " + zone.location3 + "</td>\n                    <td>" + function () {
      return zone.map == 'custom' ? 'You need to set and image' : zone.map == 'ol' ? "Standard map" : zone.map == 'NULL' || zone.map == null ? "Set a map" : 'Custom map';
    }() + "</td>\n                    <td><span class='edit-zone' zoneid='" + zone.zoneId + "' modalid='" + modalId + "'><i class=\"fas fa-edit\"></i></span></td>\n                </tr>"); // }
    // Check zone.map

    var custommap, olmap, path;

    if (zone.map == 'ol') {
      custommap = '';
      olmap = 'checked';
      path = '';
    } else if (zone.map == 'custom') {
      custommap = 'checked';
      olmap = '';
      path = '';
    } else if (zone.map != null) {
      custommap = 'checked';
      olmap = '';
      path = zone.map.split('/')[zone.map.split('/').length - 1];
    } else {
      custommap = '';
      olmap = '';
      path = '';
    } // Disable input file if custommap is unchecked initially [??? idk what is this doing]


    if (custommap == 'unchecked') $(".zone-modal #image-file").attr("disabled", true); // Append edit zone modal with unique id

    if (userRole.admin) $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path, [[], []]));else if (userRole.superadmin) $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path, result)); // Mark user checked
    // let usersList
    // result.forEach((zone, index) => {
    //     usersList = new Set(zone.usersList.split(','));
    // })
    // console.log(usersList)
    // let labels = $(".zone-settings .inner-settings .form-checkboxes label input")
    // for (let item of labels) {
    //     let username = $(item).attr("value")
    //     if (usersList.has(username)) {
    //         $(item).attr('checked', true)
    //     }
    // }
    // Open Modal Trigger

    $(".edit-zone[modalid='" + modalId + "']").on('click', function () {
      $("#edit-zone-modal-" + modalId).modal({
        backdrop: 'static'
      });
    }); // Save data

    $("#edit-zone-modal-" + modalId + " button[type='submit']").on('click', function (e) {// e.preventDefault();
      // console.log("clicked!!!")
      // $.ajax({
      //     method: "POST",
      //     url: "/api/edit-zone",
      //     data: { id: zone.zoneId }
      // }).done(function (msg) {
      //     console.log("Data Saved: ", msg);
      // });
    });
  }); // Toggle input file

  $("input[name='map']").on('change', function (e) {
    if (e.target.defaultValue == 'custom') {
      $(".zone-modal input[value='custom']").prop("checked", true);
      $(".zone-modal input[value='ol']").prop("checked", false);
      $(".zone-modal #image-file").attr("disabled", false);
    } else {
      $(".zone-modal input[value='custom']").prop("checked", false);
      $(".zone-modal input[value='ol']").prop("checked", true);
      $(".zone-modal #image-file").attr("disabled", true);
    }
  }); // END ZONES TAB
  // ==============================
}).then(function () {
  // REPORT CONTAINER
  // ==============================
  // Create Report Zone
  var date, month, maxDays;
  zonesRaw.forEach(function (zone) {
    // Sensor counter
    var counter = (0, _utils.getValuesFromObject)('zoneId', userData_raw).filter(function (zoneId) {
      return zoneId == zone.zoneId;
    }).length; // Date

    date = new Date();
    month = (0, _utils.monthChanger)(date.getMonth()); //.slice(0,3) // display one month before current month 

    maxDays;

    if (date.getMonth() == 0) {
      maxDays = 31; //if current month if 0 (January) return maxDays of december last year which is 31
    } else {
      maxDays = (0, _utils.getDaysInMonth)(date.getMonth(), date.getFullYear()); //return maxDays of last month
    } // Append zone


    $(".report-settings .mid-container table tbody").append("<tr><td><div class='form-checkboxes'><label><input type=\"checkbox\" name=\"zone" + zone.zoneId + "\" value=\"" + zone.zoneId + "\">" + zone.location1 + " / " + zone.location2 + " / " + zone.location3 + "</label></div></td><td>" + counter + "</td></tr>");
  }); // Edit button for quick report
  // $(".report-buttons .create-quick-report span").append(` on `+month.slice(0,3))
  // Quick report button

  $(".report-buttons .create-quick-report").on('click', function () {
    var listOfZones = []; // Get checked checkboxes

    $(".report-settings .mid-container table tbody input").each(function (index, item) {
      if ($(item).prop("checked")) {
        listOfZones.push(parseInt($(item).attr('value')));
      }
    });
    if (listOfZones.length) (0, _utils.getMultiReport)(listOfZones);else alert("Please select a zone before creating a report");
  }); // Normal report button

  $(".report-buttons .create-report").on('click', function () {
    var listOfZones = []; // Get checked checkboxes

    $(".report-settings .mid-container table tbody input").each(function (index, item) {
      if ($(item).prop("checked")) {
        listOfZones.push(parseInt($(item).attr('value')));
      }
    });
    var startDate = $(".report-settings input[name='start-date']").val();
    var endDate = $(".report-settings input[name='end-date']").val(); // console.log(startDate, endDate)

    if (listOfZones.length) {
      if (startDate && endDate) {
        var _date = [startDate, endDate];
        (0, _utils.getMultiReport)(listOfZones, _date);
      } else {
        alert("Please select a date before creating a report");
      }
    } else alert("Please select a zone before creating a report");
  }); // END REPORT CONTAINER
  // ==============================
}); // })
// Check inputs of form before submit

var isPassword = function isPassword() {
  var el = $("#form-create-admin input[name='password']");
  return (0, _utils.passwordChecker)(el[0].value) ? false : true;
};

var isUsername = function isUsername() {
  var el = $("#form-create-admin input[name='username']");
  return el[0].value ? true : false;
};

var isName = function isName() {
  var el = $("#form-create-admin input[name='name']");
  return el[0].value ? true : false;
};

var isEmail = function isEmail() {
  var el = $("#form-create-admin input[name='email']");
  return el[0].value ? true : false;
};

var isCompany = function isCompany() {
  var el = $("#form-create-admin input[name='company']");
  return el[0].value ? true : false;
};

$("button[type='submit']").on('click', function _callee(e) {
  var formData, http, url, params;
  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          e.preventDefault();

          if (isPassword() && isUsername() && isName() && isEmail() && isCompany()) {
            formData = $('#form-create-admin').serializeArray().reduce(function (obj, item) {
              obj[item.name] = item.value;
              return obj;
            }, {});
            http = new XMLHttpRequest();
            url = '/api/create-admin';
            params = $('#form-create-admin').serialize();
            http.open('POST', url, true); //Send the proper header information along with the request

            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            http.onreadystatechange = function () {
              //Call a function when the state changes.
              if (http.readyState == 4 && http.status == 200) {
                if (http.responseText == 'User registered!') {
                  $('.modal-footer button[value="submit"]').addClass('btn-success');
                  $('.modal-footer button[value="submit"]').html("Success");
                  setTimeout(function () {
                    location.reload();
                  }, 500);
                } else {
                  $('.modal-footer button[value="submit"]').addClass('btn-danger');
                  $('.modal-footer button[value="submit"]').html("Failed");
                }
              } else {
                console.warn(http);
              }
            };

            http.send(params);
          } else {
            if (isPassword()) $("#form-create-admin input[name='password']").removeClass("input-invalid");
            if (isUsername()) $("#form-create-admin input[name='username']").removeClass("input-invalid");
            if (isName()) $("#form-create-admin input[name='name']").removeClass("input-invalid");
            if (isEmail()) $("#form-create-admin input[name='email']").removeClass("input-invalid");
            if (isCompany()) $("#form-create-admin input[name='company']").removeClass("input-invalid");
            if (!isPassword()) $("#form-create-admin input[name='password']").addClass("input-invalid");
            if (!isUsername()) $("#form-create-admin input[name='username']").addClass("input-invalid");
            if (!isName()) $("#form-create-admin input[name='name']").addClass("input-invalid");
            if (!isEmail()) $("#form-create-admin input[name='email']").addClass("input-invalid");
            if (!isCompany()) $("#form-create-admin input[name='company']").addClass("input-invalid");
          }

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
});