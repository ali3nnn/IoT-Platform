"use strict";

var _utils = require("./utils.js");

// Imports
var fetchAdmins = function fetchAdmins() {
  var response;
  return regeneratorRuntime.async(function fetchAdmins$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          response = fetch('/api/get-team');
          _context.next = 3;
          return regeneratorRuntime.awrap(response);

        case 3:
          return _context.abrupt("return", _context.sent.json());

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

var fetchZones = function fetchZones() {
  var response;
  return regeneratorRuntime.async(function fetchZones$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          response = fetch('/api/get-zones');
          _context2.next = 3;
          return regeneratorRuntime.awrap(response);

        case 3:
          return _context2.abrupt("return", _context2.sent.json());

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // Color yellow setting item


if (window.location.href.indexOf('settings') > -1) {
  $(".settings-route").addClass("link-selected");
} // Create admin button for modal


$(function () {
  $(".create-admin").on('click', function () {
    $("#create-admin").modal({
      backdrop: 'static'
    });
  });
}); // Append admin list

var company = '';
fetchAdmins().then(function (listOfAdmins) {
  listOfAdmins.forEach(function (admin) {
    // console.log(admin)
    // Add company in form
    if (!company) {
      company = admin.company;
      $("#form-create-admin input[name='company']").attr("value", company); // Append company name in form

      $(".top-container span b").html(company); // Append company name in title
    }

    $(".admin-list table tbody").append("<tr username='" + admin.username + "'>\n                                                <td>" + admin.name + "</td>\n                                                <td>" + admin.username + "</td>\n                                                <td>" + admin.email + "</td>\n                                                <td><span class='remove-user' username='" + admin.username + "'><i class=\"fas fa-user-minus\"></i></span></td>\n                                            </tr>");
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
}); // Zone modal

var zoneModal = function zoneModal(id, zoneid, location1, location2, location3, custommap, olmap) {
  var path = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
  return "<div class='zone-modal' modalid='" + id + "'>\n<div class=\"modal modal-zone\" id=\"edit-zone-modal-" + id + "\" aria-labelledby=\"edit-zone-label\"\n    aria-hidden=\"true\" tabindex=\"-1\" role=\"dialog\">\n    <div class=\"modal-dialog fadeInModal modal-dialog-centered\" role=\"document\">\n        <div class=\"modal-content\">\n\n            <div class=\"modal-header\">\n                <h5 class=\"modal-title\" id='edit-zone-label'>Edit zone</h5>\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                    <span aria-hidden=\"true\">&times;</span>\n                </button>\n            </div>\n\n            <div class=\"modal-body\">\n                <form enctype=\"multipart/form-data\" action='/api/edit-zone' method='POST' id=\"form-edit-zone-" + id + "\">\n                    <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" id=\"zoneid\" name=\"zoneid\" readonly value=\"" + zoneid + "\">\n                    </div>\n\n                    <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" id=\"location1\" name=\"location1\" readonly value=\"" + location1 + "\">\n                    </div>\n\n                    <div class=\"form-group\">\n                        <input type=\"email\" class=\"form-control\" id=\"location2\" name=\"location2\" readonly value=\"" + location2 + "\">\n                    </div>\n\n                    <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" id=\"location3\" name=\"location3\" readonly value=\"" + location3 + "\">\n                    </div>\n\n                    <div class=\"form-group\">\n                        <input type=\"radio\" " + custommap + " name=\"map\" value=\"custom\"> Custom Map " + function () {
    return path ? '(<a target="_blank" rel="noopener noreferrer" href="/images/custom-maps/' + path + '">Image</a>)' : '';
  }() + " </input> <br>\n                        <input type=\"radio\" " + olmap + " name=\"map\" value=\"ol\"> OL Map </input>\n                    </div>\n\n                    <div class=\"form-group\">\n                        <input id=\"image-file\" " + function () {
    return olmap ? 'disabled' : '';
  }() + " name=\"mapimage\" type=\"file\">\n                    </div>\n\n                </form>\n            </div>\n\n            <div class=\"modal-footer\">\n                <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\"\n                    aria-label=\"Close\">Close</button>\n                <button type=\"submit\" value=\"submit\" form=\"form-edit-zone-" + id + "\"\n                    class=\"btn btn-primary\">Save</button>\n            </div>\n\n        </div>\n    </div>\n</div>\n</div>";
}; // Append zone list


fetchZones().then(function (result) {
  console.log(result);
  result.forEach(function (zone) {
    // Generate unique Id
    var date = new Date();
    var modalId = date.getTime() + Math.floor(Math.random() * 100 + 1);
    $(".zone-tab table tbody").append("<tr zoneid='" + zone.zoneId + "'>\n                    <td>" + zone.location1 + " / " + zone.location2 + " / " + zone.location3 + "</td>\n                    <td>7</td>\n                    <td>username</td>\n                    <td>" + function () {
      return zone.map == 'custom' ? 'You need to set and image' : zone.map == 'ol' ? "Standard map" : zone.map == 'NULL' ? "Set a map" : 'Custom map';
    }() + "</td>\n                    <td><span class='edit-zone' zoneid='" + zone.zoneId + "' modalid='" + modalId + "'><i class=\"fas fa-edit\"></i></span></td>\n                </tr>"); // Check zone.map

    var custommap, olmap, path;

    if (zone.map == 'ol') {
      custommap = '';
      olmap = 'checked';
      path = '';
    } else if (zone.map == 'custom') {
      custommap = 'checked';
      olmap = '';
      path = '';
    } else if (zone.map) {
      custommap = 'checked';
      olmap = '';
      path = zone.map.split('/')[zone.map.split('/').length - 1];
    } else {
      custommap = '';
      olmap = '';
      path = '';
    } // Disable input file if custommap is unchecked initially


    if (custommap == 'unchecked') $(".zone-modal #image-file").attr("disabled", true); // Append modal with unique id

    $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path)); // Open Modal 

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
  });
}); // Check inputs of form before submit

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