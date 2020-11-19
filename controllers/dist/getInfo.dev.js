"use strict";

var _this3 = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var mysql = require('mysql');

var Influx = require('influx');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs'); // Influx Connection
// ==================================
// Connect to InfluxDB and set the SCHEMA


var influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'anysensor3'
}); // Influx Write - ASYNC

function influxWriter(measurement, country, county, city, location, zone, username, type, sensorId, value) {
  var database = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 'anysensor3';
  var precision = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 's';
  console.log('Influx Write');
  influx.writePoints([{
    measurement: measurement,
    tags: {
      country: country,
      county: county,
      city: city,
      location: location,
      zone: zone,
      username: username,
      type: type,
      sensorId: sensorId
    },
    fields: {
      value: value
    }
  }], {
    database: database,
    precision: precision
  }).catch(function (error) {
    console.error("Error saving data to InfluxDB! ".concat(err.stack));
  });
} // Influx Query - PROMISE


function influxReader(query) {
  return new Promise(function (resolve, reject) {
    // console.log(query)
    influx.query(query).then(function (result) {
      return resolve(result);
    }).catch(function (error) {
      return reject(error);
    });
  });
} // ==================================
// End Influx Connection
// MySQL Connection
// ==================================
// DB Configuration


config_db = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
}; // Database Connection In Promise

var Database =
/*#__PURE__*/
function () {
  function Database(config) {
    _classCallCheck(this, Database);

    this.connection = mysql.createConnection(config); // console.log("Second connection to MySQL in promise")
  }

  _createClass(Database, [{
    key: "query",
    value: function query(sql, args) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.connection.query(sql, args, function (err, rows) {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.connection.end(function (err) {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }]);

  return Database;
}(); // Set and connect to DB - Promise


database = new Database(config_db);

function mysqlReader(query) {
  return new Promise(function (resolve, reject) {
    // console.log(query)
    database.query(query).then(function (result) {
      return resolve(result);
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function mysqlWriter(query) {
  return new Promise(function (resolve, reject) {
    // console.log(query)
    database.query(query).then(function (result) {
      return resolve(result);
    }).catch(function (error) {
      return reject(error);
    });
  });
} // ==================================
// End MySQL Connection
// Middlewares
// ==================================


var getUserData = function getUserData(req, res, next) {
  var userData, query;
  return regeneratorRuntime.async(function getUserData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          sess = req.session;
          userData = {}; // select company from users where username='"+sess.username+"'

          if (sess.role == 'superadmin') {
            // const query = "select sensors.*, locations.*, users.company from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');"
            // const query = "select DISTINCTROW sensors.*, locations.*, users.company from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');"
            // const query = "select sensors.*, locations.*, GROUP_CONCAT(userAccess.username) as userList, GROUP_CONCAT(users.email) as emailListfrom from sensors join userAccess on userAccess.sensorId = sensors.sensorId join users on userAccess.username = users.username and users.company = (select company from users where username='" + sess.username + "') join locations where sensors.zoneId=locations.zoneId group by sensors.sensorId;"
            // mysqlReader(query).then(async (rows) => {
            //     if (rows.length) {
            //         userData = rows
            //         userData["error"] = false
            //         sess.userData = userData
            //     } else {
            //         mysqlReader(`select sensors.*, locations.*
            //         from sensors 
            //         join locations where sensors.zoneId=locations.zoneId and locations.createdBy = (select company from users where username='`+sess.username+`')
            //         group by sensors.sensorId;`).then((result)=>{
            //             // console.log(result)
            //             if(result) {
            //                 userData = result
            //                 userData["error"] = false
            //             } else {
            //                 userData["error"] = "No data found"
            //             }
            //             sess.userData = userData
            //         })
            //     }
            // }).
            mysqlReader("select sensors.*, locations.*\n                from sensors \n                join locations where sensors.zoneId=locations.zoneId and locations.createdBy = (select company from users where username='" + sess.username + "')\n                group by sensors.sensorId;").then(function (result) {
              // console.log(result)
              if (result) {
                userData = result;
                userData["error"] = false;
              } else {
                userData["error"] = "No data found";
              }

              sess.userData = userData;
            }).then(function () {
              // Set session varriable
              // sess.userData = userData // set list of sensors that are assigned to company of superadmin
              // Set sess.company variable
              mysqlReader("SELECT company FROM users where username='" + sess.username + "'").then(function (result) {
                sess.company = result[0].company;
              }).then(function () {
                next();
              });
            });
          } else {
            query = "select userAccess.username, sensors.*, locations.* from userAccess inner join sensors on sensors.sensorId=userAccess.sensorId and userAccess.username='" + sess.username + "' inner join locations on locations.zoneId=sensors.zoneId;";
            mysqlReader(query).then(function _callee(rows) {
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (rows.length) {
                        userData = rows;
                        userData["error"] = false;
                      } else {
                        userData["error"] = "No data found";
                      } // set list of sensors that are assigned to this user
                      // sess.userData = userData


                    case 1:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            }).then(function () {
              // Set sess.company variable
              mysqlReader("SELECT company, role FROM users where username='" + sess.username + "'").then(function (result) {
                // console.log(result, userData)
                // sess.company = result[0].company
                // sess.role = result[0].role
                var userDataFull = userData.map(function (item, index) {
                  return _objectSpread({}, item, {
                    company: result[0].company,
                    role: result[0].role
                  });
                });
                sess.userData = userDataFull;
              }).then(function () {
                next();
              });
            });
          }

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

var getCounties = function getCounties(req, res, next) {
  var time, data, query;
  return regeneratorRuntime.async(function getCounties$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          sess = req.session;
          sess.counties = [];
          console.log("getcounties:", sess.username);
          time = new Date();
          data = [];

          if (sess.username) {
            query = "select userAccess.username, sensors.*, locations.* from userAccess inner join sensors on sensors.sensorId=userAccess.sensorId and userAccess.username='" + sess.username + "' inner join locations on locations.zoneId=sensors.zoneId;";
            mysqlReader(query).then(function _callee2(rows) {
              return regeneratorRuntime.async(function _callee2$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      if (rows.length) {
                        // TODO - continue from here
                        sess.userData = rows[0];
                        console.log(rows[0]); // var whereQuery = `where (username='` + sess.username + `') or (`
                        // for (var i = 0; i < rows_.length; i++) {
                        //     whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                        //     if (i < rows_.length - 1) whereQuery += ` or `
                        //     else whereQuery += `)`
                        // }
                        // // var queryCounties = `select distinct(county) as county from ( select county, value from sensors ` + whereQuery + ` )`
                        // var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") ` + whereQuery
                      } else {
                        console.log("not found", rows); // get counties
                        // var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + sess.username + "')"
                        // var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") WHERE username='` + sess.username + `'`
                      } // console.log("queryCounties:", queryCounties)
                      // let counties = influxReader(queryCounties).then(async (result) => {
                      //     var counties = []
                      //     for (var i = 0; i < result.length; i++) {
                      //         // counties.push(result[i].county)
                      //         counties.push(result[i].value)
                      //     }
                      //     console.log("counties", counties)
                      //     return await counties
                      // })
                      // Promise.all([counties]).then((result) => {
                      //     // build the output
                      //     if (result[0].length) {
                      //         data.push({
                      //             error: false,
                      //             message: "Data found",
                      //             user: sess.username,
                      //             countiesCounter: result[0].length,
                      //             counties: result[0].length ? result[0] : "No county found",
                      //             query: queryCounties,
                      //             responseTime: new Date() - time + "ms",
                      //         })
                      //         sess.counties = data[0].counties
                      //     } else {
                      //         data.push({
                      //             error: true,
                      //             message: "No sensor in influx for this user",
                      //             user: sess.username
                      //         })
                      //         sess.counties = []
                      //     }
                      //     console.log("data", data)
                      //     // console.log(sess.username, "getCounties 2", sess.counties)
                      //     next()
                      // }).catch(error => console.log(`Error in promise for GETCOUNTY ${error}`))


                    case 1:
                    case "end":
                      return _context3.stop();
                  }
                }
              });
            }); // console.log(sess.username, "getCounties 3", sess.counties)

            next();
          } else res.render("login", {
            alert: "You are not logged in"
          });

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
};

var getSensorLocation = function getSensorLocation(req, res, next) {
  return regeneratorRuntime.async(function getSensorLocation$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // sess = req.session;
          // sess.sensors = []
          // var time = new Date()
          // var data = []
          // if (sess.username) {
          //     if (sess.sensors == undefined || sess.sensors.length == 0) {
          //         const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"
          //         mysqlReader(query).then(async (rows) => {
          //             let rows_ = await rows
          //             // console.log(await rows)
          //             if (rows_.length) {
          //                 var whereQuery = `where (username='` + sess.username + `') or (`
          //                 for (var i = 0; i < rows_.length; i++) {
          //                     whereQuery += `sensorId='` + rows_[i].sensorId + `'`
          //                     if (i < rows_.length - 1) whereQuery += ` or `
          //                     else whereQuery += `)`
          //                 }
          //                 // var querySensorId = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`
          //                 var querySensorId = `SHOW TAG VALUES WITH KEY IN ("sensorId") ` + whereQuery
          //             } else {
          //                 // get counties
          //                 // var querySensorId = `select distinct(sensorId) as sensorId from (select sensorId, value from sensors where username='` + sess.username + `')`
          //                 var querySensorId = `SHOW TAG VALUES WITH KEY IN ("sensorId") WHERE username='` + sess.username + `'`
          //             }
          //             // console.log(querySensorId)
          //             let sensors = influxReader(querySensorId).then(async (result) => {
          //                 var sensors = []
          //                 for (var i = 0; i < result.length; i++) {
          //                     // sensors.push(result[i].sensorId)
          //                     sensors.push(result[i].value)
          //                 }
          //                 return await sensors
          //             })
          //             Promise.all([sensors]).then((result) => {
          //                 // build the output
          //                 if (result[0].length) {
          //                     data.push({
          //                         error: false,
          //                         message: "Data found",
          //                         user: sess.username,
          //                         sensorCounter: result[0].length,
          //                         sensors: result[0].length ? result[0] : "No sensor found",
          //                         query: querySensorId,
          //                         responseTime: new Date() - time + "ms",
          //                     })
          //                     sess.sensors = data[0].sensors
          //                     // sess.data = data
          //                 } else {
          //                     data.push({
          //                         error: true,
          //                         message: "No data found for this user",
          //                         user: sess.username
          //                     })
          //                     // sess.data = []
          //                 }
          //                 // console.log(sess.username, "getCounties 2", sess.counties)
          //                 // console.log(sess.sensors)
          //                 next()
          //             }).catch(error => console.log(`Error in promise for GETSENSORLOCATION ${error}`))
          //         })
          //     } else {
          //         next()
          //     }
          // } else {
          //     // console.log("test")
          //     res.render("login", {
          //         alert: "You are not logged in"
          //     })
          // }
          next();

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
};

var isScaleAvailable = function isScaleAvailable(req, res, next) {
  return regeneratorRuntime.async(function isScaleAvailable$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          next(); // sess = req.sessio n;
          // var time = new Date()
          // var data = {}
          // if (sess.username) {
          //     if (sess.isScaleAvailable == undefined || sess.isScaleAvailable.length == 0) {
          //         const query = "SHOW TABLES LIKE 'scale_" + sess.username + "'";
          //         mysqlReader(query)
          //             .then(rows => {
          //                 data['tableExist'] = rows.length ? true : false
          //                 if (rows.length) {
          //                     mysqlReader("SELECT count(*) as count FROM scale_" + sess.username + "")
          //                         .then(count => {
          //                             data['count'] = count[0].count
          //                             data["responseTime"] = new Date() - time
          //                         }).then(() => {
          //                             sess.isScaleAvailable = data
          //                             next()
          //                         })
          //                 } else {
          //                     data['count'] = 0
          //                     data["responseTime"] = new Date() - time
          //                     sess.isScaleAvailable = data
          //                     next()
          //                 }
          //             })
          //     } else {
          //         next()
          //     }
          // } else {
          //     next()
          // }

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
};

var isConveyorAvailable = function isConveyorAvailable(req, res, next) {
  return regeneratorRuntime.async(function isConveyorAvailable$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          next(); // sess = req.session;
          // var time = new Date()
          // var data = {}
          // if (sess.username) {
          //     if (sess.isConveyorAvailable == undefined || sess.isConveyorAvailable.length == 0) {
          //         const query = "SHOW TABLES LIKE 'conveyor_" + sess.username + "'";
          //         mysqlReader(query)
          //             .then(rows => {
          //                 data['tableExist'] = rows.length ? true : false
          //                 if (rows.length) {
          //                     mysqlReader("SELECT count(*) as count FROM conveyor_" + sess.username + "")
          //                         .then(count => {
          //                             data['count'] = count[0].count
          //                             data["responseTime"] = new Date() - time
          //                         }).then(() => {
          //                             sess.isConveyorAvailable = data
          //                             next()
          //                         })
          //                 } else {
          //                     data['count'] = 0
          //                     data["responseTime"] = new Date() - time
          //                     sess.isConveyorAvailable = data
          //                     next()
          //                 }
          //             })
          //     } else {
          //         next()
          //     }
          // } else {
          //     next()
          // }

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
};

var isScannerAvailable = function isScannerAvailable(req, res, next) {
  return regeneratorRuntime.async(function isScannerAvailable$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          next(); // sess = req.session;
          // var time = new Date()
          // var data = {}
          // if (sess.username) {
          //     if (sess.isScannerAvailable == undefined || sess.isScannerAvailable.length == 0) {
          //         // console.log(sess.isScannerAvailable, "up")
          //         const query = "SHOW TABLES LIKE 'scanner_" + sess.username + "'";
          //         mysqlReader(query)
          //             .then(rows => {
          //                 data['tableExist'] = rows.length ? true : false
          //                 if (rows.length) {
          //                     mysqlReader("SELECT count(*) as count FROM scanner_" + sess.username + "")
          //                         .then(count => {
          //                             data['count'] = count[0].count
          //                             data["responseTime"] = new Date() - time
          //                         }).then(() => {
          //                             // console.log(data)
          //                             sess.isScannerAvailable = data
          //                             next()
          //                         })
          //                 } else {
          //                     data['count'] = 0
          //                     data["responseTime"] = new Date() - time
          //                     sess.isScannerAvailable = data
          //                     next()
          //                 }
          //             })
          //     } else {
          //         // console.log(sess.isScannerAvailable, "down")
          //         next()
          //     }
          // } else {
          //     next()
          // }

        case 1:
        case "end":
          return _context8.stop();
      }
    }
  });
};

var mqttOverSocketIoBridge = function mqttOverSocketIoBridge(req, res, next) {
  next();
}; // This is a test middleware that is used at every route


var test = function test(req, res, next) {
  // console.log("--->>>", req.originalUrl)
  // Allow request from url like /api/url_path?admin=target_username
  if (req.query.admin) {
    req.session.username = req.query.admin;
  } // End


  res.append('Access-Control-Allow-Origin', ['*']);
  next();
}; // Utils


var getDistinctValuesFromObject = function getDistinctValuesFromObject(val, obj) {
  var flags = [],
      output = [],
      l = obj.length,
      i;

  for (i = 0; i < l; i++) {
    if (flags[obj[i][val]]) continue;
    flags[obj[i][val]] = true;
    output.push(obj[i][val]);
  }

  return output;
};

var replaceAll = function replaceAll(str1, str2, ignore) {
  // String.prototype.replaceAll = function(str1, str2, ignore) {
  return _this3.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2); // }
};

var replaceDiacritics = function replaceDiacritics(str, ignore) {
  var diacritics = 'áàâäãéèëêíìïîóòöôõúùüûñçăşţ';
  var result;
  diacritics.split('').forEach(function (letter) {
    result = str.replace(new RegExp(letter.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str.replace(/\$/g, "$$$$") : str);
  });
  return result;
};

var getDaysInMonth = function getDaysInMonth(m, y) {
  // Here January is 1 based
  //Day 0 is the last day in the previous month
  return new Date(year, month, 0).getDate(); // Here January is 0 based
  // return new Date(year, month+1, 0).getDate();
}; // Keep track url
// const trackurl = (req,res,next) => {
//     if(req.originalUrl!='undefined')
//         req.session.trackurl += ","+req.originalUrl
//     console.log(">>",req.originalUrl, req.session.trackurl)
//     next()
// }
// ==================================
// End Middlewares


module.exports = {
  getUserData: getUserData,
  getCounties: getCounties,
  getSensorLocation: getSensorLocation,
  isScaleAvailable: isScaleAvailable,
  isConveyorAvailable: isConveyorAvailable,
  isScannerAvailable: isScannerAvailable,
  mqttOverSocketIoBridge: mqttOverSocketIoBridge,
  test: test,
  getDistinctValuesFromObject: getDistinctValuesFromObject,
  replaceAll: replaceAll,
  replaceDiacritics: replaceDiacritics,
  getDaysInMonth: getDaysInMonth // trackurl

};