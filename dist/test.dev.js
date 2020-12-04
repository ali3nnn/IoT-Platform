"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Imports
// ==================================
// const http = require('http') // its a default package of node.js
var express = require('express');

var app = express(); // var http = require('http').Server(app);
// var io = require('socket.io')(http);

var fs = require('fs');

var path = require('path');

var bodyParser = require('body-parser');

var dotenv = require('dotenv');

var cookieParser = require('cookie-parser');

var session = require('express-session');

var hbs = require('express-handlebars');

var bcrypt = require('bcryptjs');

var helmet = require('helmet');

var url = require('url');

var axios = require('axios');

var moment = require('moment');

var formidable = require('formidable');

var removeDiacritics = require('diacritics').remove;

var mime = require('mime');

var _ = require('lodash');

var Handlebars = require('handlebars');

var HandlebarsIntl = require('handlebars-intl');

var Influx = require('influx');

var mysql = require('mysql'); // ==================================
// End Imports
// Security Stuff
// ==================================


app.disable('x-powered-by');
app.use(helmet());
app.set('trust proxy', 1); // ==================================
// End Security Stuff
// Handlebar Custom Helper
// ==================================
// ifEquals

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
}); // for loop

Handlebars.registerHelper('times', function (n, block) {
  var accum = '';

  for (var i = 0; i < n; ++i) {
    accum += block.fn(i);
  }

  return accum;
}); // if conditon HBS

Handlebars.registerHelper('eq', function () {
  var args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(function (expression) {
    return args[0] == expression;
  });
}); // Acces hbs var in js

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
}); // How to use: 
// var county = JSON.parse('{{{json this}}}');
// ==================================
// End Handlebar Custom Helper
// Prototype
// ==================================

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2);
}; // ==================================
// End Prototype
// Middleware
// ==================================


var _require = require('./controllers/auth'),
    authRegister = _require.authRegister,
    authLogin = _require.authLogin,
    authDashboard = _require.authDashboard,
    authSuperAdmin = _require.authSuperAdmin,
    cookieChecker = _require.cookieChecker;

var _require2 = require('./controllers/all_users'),
    showAllUsers = _require2.showAllUsers;

var _require3 = require('./controllers/getInfo'),
    getUserData = _require3.getUserData,
    getCounties = _require3.getCounties,
    getSensorLocation = _require3.getSensorLocation,
    isScaleAvailable = _require3.isScaleAvailable,
    isConveyorAvailable = _require3.isConveyorAvailable,
    isScannerAvailable = _require3.isScannerAvailable,
    mqttOverSocketIoBridge = _require3.mqttOverSocketIoBridge,
    test = _require3.test,
    getDistinctValuesFromObject = _require3.getDistinctValuesFromObject,
    replaceAll = _require3.replaceAll,
    replaceDiacritics = _require3.replaceDiacritics,
    getDaysInMonth = _require3.getDaysInMonth;

var _require4 = require('express'),
    query = _require4.query;

var _require5 = require('buffer'),
    constants = _require5.constants; // ==================================
// End Middleware
// Influx Connection
// ==================================
// Connect to InfluxDB and set the SCHEMA


var influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'anysensor3'
}); // Influx Write - ASYNC

function influxWriter(measurement, country, county, city, location, zone, username, type, sensorId, value) {
  var database = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 'anysensor3';
  var precision = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 's';
  // console.log('Influx Write')
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
} // influxWriter('sensors', 'Romania', 'Dambovita', 'Targoviste', 'Location1', 'Zone1', 'alexbarbu2', 'temperatura', 'sensor200', 100)
// influxWriter('sensors', 'Romania', 'Bihor', 'Oradea', 'Location1', 'Zone1', 'alexbarbu2', 'temperatura', 'sensor300', 10)
// ==================================
// End Influx Connection
// MySQL Connection
// ==================================
// DB Configuration


config_db = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
};
config_verne = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_VERNE
}; // Set the connection to DB - Async
// let db = mysql.createConnection(config_db)
// Connect to DB - Async
// db.connect((err) => {
//     if (err) console.log("Connecting to mysql failed")
//     else console.log("First connection to MySQL", '\r\n')
// })
// Database Connection In Promise

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


var database = new Database(config_db);
var verne = new Database(config_verne); // Second connection to DB

var db = mysql.createConnection(config_db);

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

function addUserVerne(query) {
  return new Promise(function (resolve, reject) {
    // console.log(query)
    verne.query(query).then(function (result) {
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
// Configuration
// ==================================
// initialize session variable


var sess; //secure session variable

app.use(session({
  secret: process.env.SESSION_KEY,
  resave: true,
  saveUninitialized: false
})); // app.use(bodyParser);
//parse url encoded (as sent by html forms)

app.use(express.urlencoded({
  extended: false
})); //parse json bodies (as sent by api)

app.use(express.json()); //initialize cookie parser

app.use(cookieParser(process.env.COOKIE_KEY)); //dir of static files css,img,js

var public_dir = path.join(__dirname, './public'); // set the directory for css/js/img files

app.use(express.static(public_dir)); // Dotenv Path

dotenv.config({
  path: './.env'
}); // app.use(test)
// app.use(trackurl)
// app.use(trackurl)
// app.use(isScaleAvailable)
// app.use(isConveyorAvailable)
// app.use(isScannerAvailable)
// app.use(mqttOverSocketIoBridge)
// ==================================
// End Configuration
// Template Engine HBS
// ==================================
//set the view engine HBS

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: null,
  layoutsDir: path.join(__dirname, 'views'),
  partialsDir: [//  path to your partials
  path.join(__dirname, 'views/partials')]
}));
app.set('view engine', 'hbs'); // ==================================
// END Template Engine HBS
// if the use that acces home page was logged in previously
// make the log in automatically
// based on cookie/session var

var sess; // ==============================================
// ==============================================
// =================== ROUTES ===================
// ==============================================
// ==============================================

app.get('/', function (req, res) {
  // Homepage is disabled and it redirects to /map
  res.redirect('/map'); // sess = req.session;
  // res.render("index", {
  //     username: sess.username,
  //     user_role: sess.user_role,
  //     user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
  // })
}); // getCounties, getSensorLocation, isScaleAvailable, isConveyorAvailable, isScannerAvailable,

app.get("/map", cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session; // console.log(sess)

  res.render("map", {
    username: sess.username,
    role: sess.role,
    userData: sess.userData
  });
});
app.get("/map/zone", cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;

  if (req.query.zoneid) {
    // Back-end
    // [*] TODO: get all sensorid assignated with this zone id
    // let data = []
    // let sensorBuffer = [] // this buffer is use to prevent double inserting of sensors
    // sess.userData.forEach(sensor => {
    //     console.log(sensor.sensorId, sensorBuffer.indexOf(sensor.sensorId))
    //     if (sensorBuffer.indexOf(sensor.sensorId) == -1) {
    //         sensor.zoneId == req.query.zoneid ? data.push(sensor) : null
    //         sensorBuffer.push(sensor.sensorId)
    //     }
    // })
    // sensorBuffer = []
    if (sess.username) res.status(200).render('dashboard', {
      // zoneData: data,
      username: sess.username,
      role: sess.role,
      userData: sess.userData // county: req.params.county,
      // username: sess.username,
      // user_role: sess.user_role,
      // sensorId: sess.sensorId, //this needs to be replaced or removed
      // sensors: sess.sensors, //this contain a list of sensorsId the user has access to - generated by getSensorLocation
      // counties: sess.counties,
      // isScaleAvailable: sess.isScaleAvailable,
      // isConveyorAvailable: sess.isConveyorAvailable,
      // isScannerAvailable: sess.isScannerAvailable,
      // user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
      // user_role_is_admin: sess.user_role == 'admin' ? 1 : 0

    });else {
      res.status(403).render('message', {
        alert: "You are not logged in"
      });
    } // res.status(200).send({
    //     data
    // })
    // Front-End
    // [ ] TODO: display html for each sensor
    // [ ] TODO: update the html with data for each sensor
  } else {
    res.status(200).send({
      error: "You failed to get data from a zone"
    });
  }
}); // WARN: deprecated route

app.get('/map/:county', cookieChecker, authDashboard, getCounties, getSensorLocation, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;
  sess.county = req.params.county; // console.log(sess.username, sess.counties)
  // console.log("/map/" + sess.county)
  // console.log("User:", sess.username)

  if (sess.username) res.status(200).render('dashboard', {
    county: req.params.county,
    username: sess.username,
    user_role: sess.user_role,
    sensorId: sess.sensorId,
    //this needs to be replaced or removed
    sensors: sess.sensors,
    //this contain a list of sensorsId the user has access to - generated by getSensorLocation
    counties: sess.counties,
    isScaleAvailable: sess.isScaleAvailable,
    isConveyorAvailable: sess.isConveyorAvailable,
    isScannerAvailable: sess.isScannerAvailable,
    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
    user_role_is_admin: sess.user_role == 'admin' ? 1 : 0
  });else {
    res.status(403).render('message', {
      alert: "You are not logged in"
    });
  }
});
app.get('/scale-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;
  res.render("scale-dashboard", {
    username: sess.username,
    user_role: sess.user_role,
    sensorId: sess.sensorAccess,
    //this needs to be replaced or removed
    // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
    counties: sess.counties,
    //this contains a list of counties the user has access to - generated by getCounties
    isScaleAvailable: sess.isScaleAvailable,
    isConveyorAvailable: sess.isConveyorAvailable,
    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
    user_role_is_admin: sess.user_role == 'admin' ? 1 : 0
  });
});
app.get('/conveyor-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;
  res.render("conveyor-dashboard", {
    username: sess.username,
    user_role: sess.user_role,
    sensorId: sess.sensorAccess,
    //this needs to be replaced or removed
    // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
    counties: sess.counties,
    //this contains a list of counties the user has access to - generated by getCounties
    isScaleAvailable: sess.isScaleAvailable,
    isConveyorAvailable: sess.isConveyorAvailable,
    isScannerAvailable: sess.isScannerAvailable,
    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
    user_role_is_admin: sess.user_role == 'admin' ? 1 : 0
  });
});
app.get('/scanner-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;
  res.render("scanner-dashboard", {
    username: sess.username,
    user_role: sess.user_role,
    sensorId: sess.sensorAccess,
    //this needs to be replaced or removed
    // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
    counties: sess.counties,
    //this contains a list of counties the user has access to - generated by getCounties
    isScaleAvailable: sess.isScaleAvailable,
    isConveyorAvailable: sess.isConveyorAvailable,
    isScannerAvailable: sess.isScannerAvailable,
    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
    user_role_is_admin: sess.user_role == 'admin' ? 1 : 0
  });
});
app.get('/register', function (req, res) {
  res.render('register');
});
app.get('/settings', cookieChecker, authDashboard, getUserData, function (req, res) {
  sess = req.session;
  res.render('settings', {
    username: sess.username,
    role: sess.role,
    userData: sess.userData
  });
}); // get and post request to /register page

app.post('/register', authRegister, function (req, res) {
  sess = req.session;
  res.redirect('/login');
}); // get and post request to /login page

app.get('/login', function (req, res) {
  res.render('login', {
    username: null
  });
});
app.post('/login', authLogin, function (req, res) {
  sess = req.session;
  sess.check_cookies = 1;
  var url = req.body.redirect || '/map';
  res.redirect(url);
}); // get request to /logout page

app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) console.log(err);else res.redirect('/login');
  });
}); // ADMIN reuqest
//=========================================
//=========================================
// END ADMIN reuqest
// SUPERADMIN reuqest
//=========================================

app.get('/users', authDashboard, getCounties, authSuperAdmin, showAllUsers, function (req, res) {
  var sql = "SELECT id, name, username, email, user_role, reg_date FROM users";
  var data = {};
  database.query(sql).then(function (rows) {
    data.flag = rows.length;
    data.user = sess.username;
    data.result = rows;
    return data;
  }).then(function (data) {
    for (var item in data.result) {
      data.result[item].reg_date = data.result[item].reg_date.toString().split('GMT')[0];
    }

    var dataRender = {
      username: sess.username,
      user_role: sess.user_role,
      user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
      db_results: data.result,
      role_basic: req.body.role == 'basic' ? true : false,
      role_superadmin: req.body.role == 'superadmin' ? true : false,
      message: "Notification test message"
    }; // console.log(dataRender)

    res.render("admin_allusers", dataRender);
  }); // try {
  //     db.query("SELECT id, name, username, email, user_role, reg_date FROM users", (err, result) => {
  //         for (var item in result) {
  //             result[item].reg_date = result[item].reg_date.toString().split('GMT')[0]
  //         }
  //         const data = {
  //             username: sess.username,
  //             user_role: sess.user_role,
  //             user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
  //             db_results: result,
  //             role_basic: req.body.role == 'basic' ? true : false,
  //             role_superadmin: req.body.role == 'superadmin' ? true : false,
  //             message: "Notification test message"
  //         }
  //         // console.log(data)
  //         res.render("admin_allusers", data)
  //     })
  // } catch (err) {
  //     console.log("db query users error:", err)
  // }
}); // Update user

app.post('/update', function _callee(req, res) {
  var hashedPassword;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.body.password.length) {
            _context.next = 4;
            break;
          }

          // console.log("Query:", req.body)
          db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "' WHERE Id='" + req.body.id + "'", function (err, result) {
            if (err) console.error(err);else {
              res.render("admin_allusers", {
                username: sess.username,
                user_role: sess.user_role,
                user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                success: "Database has been updated"
              }); // setTimeout(res.redirect("/users"), 1000);
            }
          });
          _context.next = 8;
          break;

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 6:
          hashedPassword = _context.sent;
          // console.log(hashedPassword)
          db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "', Password='" + hashedPassword + "' WHERE Id='" + req.body.id + "'", function (err, result) {
            if (err) console.error(err);else {
              res.render("admin_allusers", {
                username: sess.username,
                user_role: sess.user_role,
                user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                success: "Database has been updated"
              }); // setTimeout(res.redirect("/users"), 1000);
            }
          });

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Add new sensor

app.get('/add-sensor', authDashboard, authSuperAdmin, function (req, res) {}); //=========================================
// END - SUPERADMIN reuqest
// NEW API ROUTES
//=========================================

app.get('/api/v3/get-user-data', cookieChecker, authDashboard, getUserData, function (req, res) {
  sess = req.session;
  var userData = {};
  userData = sess.userData; // console.log(userData)

  if (userData['error']) {
    res.status(403).send(userData);
  } else {
    res.status(200).send(userData);
  }
}); // api to show page for sensor initialization 

app.get('/api/v3/init-sensor-qr', cookieChecker, authDashboard, getUserData, function _callee2(req, res) {
  var userData, sensorExist, _query;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          sess = req.session;
          getQuery = req.query; // [*] TODO 0: Check if user is admin 
          // [*] TODO 1: check if sensor exists in sensors tabel, if exists it means it is assigned already and show alert message
          // [*] TODO 2: set a new location or pick an old one from other sensors that users has access to
          // [*] TODO 3: insert into sensors and userAccess
          // console.log(sess)

          if (!sess.username) {
            _context2.next = 10;
            break;
          }

          userData = sess.userData; // console.log(userData)

          _context2.next = 6;
          return regeneratorRuntime.awrap(mysqlReader("select * from sensors where sensorId='" + getQuery.sensorid + "';"));

        case 6:
          sensorExist = _context2.sent;

          if (!sensorExist.length) {
            // Get locations
            // const query = "select distinct locations.* from locations inner join sensors on sensors.zoneId = locations.zoneId inner join userAccess on userAccess.sensorId = sensors.sensorId and userAccess.username = '" + sess.username + "'";
            _query = "select locations.* from locations where createdBy = (select company from users where username='" + sess.username + "');";
            mysqlReader(_query).then(function (locations) {
              // console.log("locations",locations)
              res.render('initsensor-qr', {
                username: sess.username,
                sensorid: getQuery.sensorid,
                type: getQuery.type,
                battery: getQuery.battery || 0,
                locations: locations,
                userData: userData
              });
            });
          } else {
            res.send({
              error: "This sensor has been initialized"
            });
          }

          _context2.next = 11;
          break;

        case 10:
          if (sess.username) {
            // TODO: display a graph with values of this sensor
            res.status(403).send("TODO: you are not and admin");
          } else {
            res.status(403).send("TODO: you are not logged in");
          }

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // [ ] TODO: Show alert messages in different cases
// [*] TODO: Add company to mysql
//  api to initialize sensor

app.post('/api/v3/init-sensor-qr', cookieChecker, authDashboard, getUserData, function (req, res) {
  sess = req.session;
  var postQuery = req.body; // console.log(postQuery)

  if (postQuery.location1 && postQuery.location2 && postQuery.location2 && postQuery.location3 && postQuery.sensorName) {
    // Location from dropdown
    if (postQuery.zone == "Nothing selected") {
      // Remove diacritics
      postQuery.location1 = postQuery.location1.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
      postQuery.location2 = postQuery.location2.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
      postQuery.location3 = postQuery.location3.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
      postQuery.sensorName = postQuery.sensorName.normalize('NFKD').replace(/[\u0300-\u036f]/g, ""); // Lowercase

      postQuery.location1 = postQuery.location1.toLowerCase();
      postQuery.location2 = postQuery.location2.toLowerCase();
      postQuery.location3 = postQuery.location3.toLowerCase();
      postQuery.sensorName = postQuery.sensorName.toLowerCase(); // Trim

      postQuery.location1 = postQuery.location1.trim();
      postQuery.location2 = postQuery.location2.trim();
      postQuery.location3 = postQuery.location3.trim();
      postQuery.sensorName = postQuery.sensorName.trim(); // if (postQuery.zoneId) { //idk when goes here
      // let insertQuery
      // if(postQuery.battery)
      //     insertQuery = "INSERT INTO sensors (sensorId, sensorType, sensorName, zoneId, battery) values ('" + postQuery.sensorid + "','" + postQuery.type + "','" + postQuery.sensorName + "'," + int(postQuery.zoneId) + ")"
      // // Insert into sensors
      // mysqlReader(insertQuery)
      //     .then(() => {
      //         // Insert into userAccess
      //         mysqlReader("INSERT INTO userAccess (sensorId, username) values ('" + postQuery.sensorid + "','" + sess.username + "')")
      //             .then(() => {
      //                 // Insert into VerneMQ Table
      //                 addUserVerne(`INSERT INTO vmq_auth_acl (mountpoint, client_id, username, password, publish_acl, subscribe_acl) VALUES ('', '` + postQuery.sensorid + `', '` + postQuery.sensorid + `', md5('dasstecb2b'), '[{"pattern":"#"}]', '[{"pattern":"#"}]');`)
      //                     .then(() => {
      //                         res.redirect("/map")
      //                     })
      //             })
      //     })
      // } else {
      // Insert into locations
      // console.log("INSERT INTO locations (location1, location2, location3, createdBy) values ('" + postQuery.location1 + "','" + postQuery.location2 + "','" + postQuery.location3 + "', '"+sess.company+"')")

      mysqlReader("INSERT INTO locations (location1, location2, location3, createdBy) values ('" + postQuery.location1 + "','" + postQuery.location2 + "','" + postQuery.location3 + "', '" + sess.company + "')").then(function () {
        // Get zoneId
        mysqlReader("select zoneId from locations order by zoneId desc limit 1;").then(function (result) {
          // Insert into sensors
          var insertQuery = "INSERT INTO sensors (sensorId, sensorType, sensorName, zoneId, battery) values ('" + postQuery.sensorid + "','" + postQuery.type + "','" + postQuery.sensorName + "','" + result[0].zoneId + "', '" + postQuery.battery + "')";
          mysqlReader(insertQuery).then(function () {
            // Insert into userAccess
            mysqlReader("INSERT INTO userAccess (sensorId, username) values ('" + postQuery.sensorid + "','" + sess.username + "')").then(function () {
              // Insert into VerneMQ Table
              addUserVerne("INSERT INTO vmq_auth_acl (mountpoint, client_id, username, password, publish_acl, subscribe_acl) VALUES ('', '" + postQuery.sensorid + "', '" + postQuery.sensorid + "', md5('dasstecb2b'), '[{\"pattern\":\"#\"}]', '[{\"pattern\":\"#\"}]');").then(function () {
                res.redirect("/map");
              });
            });
          });
        });
      }); // }
    } else {
      // Location new
      // Get zoneId
      mysqlReader("select zoneId from locations where location1='" + postQuery.location1 + "' and location2='" + postQuery.location2 + "' and location3='" + postQuery.location3 + "';").then(function (result) {
        // Insert into sensors
        var insertQuery = "INSERT INTO sensors (sensorId, sensorType, sensorName, zoneId, battery) values ('" + postQuery.sensorid + "','" + postQuery.type + "','" + postQuery.sensorName + "','" + result[0].zoneId + "', '" + postQuery.battery + "')";
        mysqlReader(insertQuery).then(function (result) {
          // Insert into userAccess
          mysqlReader("INSERT INTO userAccess (sensorId, username) values ('" + postQuery.sensorid + "','" + sess.username + "')").then(function () {
            // Insert into VerneMQ Table
            addUserVerne("INSERT INTO vmq_auth_acl (mountpoint, client_id, username, password, publish_acl, subscribe_acl) VALUES ('', '" + postQuery.sensorid + "', '" + postQuery.sensorid + "', md5('dasstecb2b'), '[{\"pattern\":\"#\"}]', '[{\"pattern\":\"#\"}]');").then(function () {
              res.redirect("/map");
            });
          });
        });
      });
    }
  } else res.send({
    error: "Fields incomplete",
    postQuery: postQuery
  }); // res.send(req.body)

}); // Get influx data for sensorId

app.get('/api/v3/get-sensor-data', function (req, res) {
  // [ ] TODO: Case when there are two series with same sensorId
  // Process time
  var todayRaw = new Date(); // let todayQueryDoor = todayRaw.getFullYear() + '-' + (todayRaw.getMonth() + 1) + '-' + (todayRaw.getDate() - 1 < 10 ? '0' + todayRaw.getDate() - 1 : todayRaw.getDate() - 1) + ' ' + '00:00:00'
  // let todayQueryGeneral = todayRaw.getFullYear() + '-' + (todayRaw.getMonth() + 1) + '-' + (todayRaw.getDate()-1 < 10 ? '0' + todayRaw.getDate()-1 : todayRaw.getDate()-1) + ' ' + '00:00:00'

  var todayQueryDoor = todayRaw.toISOString().split("T")[0] + ' 00:00:00';
  var todayQueryGeneral = todayRaw.toISOString().split("T")[0] + ' 00:00:00';
  var influxQuery;

  if (['door'].includes(req.query.type)) {
    // console.log(req.query.type)
    influxQuery = "SELECT value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQueryDoor + "' and time<now() order by time desc;"; // influxQuery = "SELECT value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQuery + "' and time<now() order by time desc;"
  } else {
    influxQuery = "SELECT mean(value) as value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQueryGeneral + "' and time<now() group by time(5m) order by time desc;";
  } // console.log(influxQuery)


  if (req.query.type == 'door') {
    // console.log(req.query.type, influxQuery)
    influxReader(influxQuery).then(function (result) {
      var paddingStyle = 1; // 1,2,3

      var finalResult = [];
      var finalResultFiltered = [];
      var finalResultFilteredYesterday = [];

      if (paddingStyle == 1) {
        var checkIfToday = function checkIfToday(item) {
          try {
            var day;
            if (typeof item.time == 'string') day = item.time.split('T')[0].split('-')[2];else {
              var time = item.time._nanoISO;
              day = time.split('T')[0].split('-')[2];
            } // console.log(typeof item.time, day, thisDay, day==thisDay)

            return day == thisDay;
          } catch (e) {
            console.log(e);
            return false;
          }
        };

        var checkIfYesterday = function checkIfYesterday(item) {
          try {
            var day;
            if (typeof item.time == 'string') day = item.time.split('T')[0].split('-')[2];else {
              var time = item.time._nanoISO;
              day = time.split('T')[0].split('-')[2];
            } // console.log(typeof item.time, day, thisDay, day==thisDay)

            return day == thisDay - 1;
          } catch (e) {
            console.log(e);
            return false;
          }
        };

        // Push 0 or 1 from current time to last time in influx
        var lastValue = result[0].value;

        if (lastValue == 1) {
          // Fills with 1s
          var lastTimestamp = new Date(result[0].time);
          var currentDate = new Date();
          finalResult.push({
            "time": new Date(currentDate).toISOString(),
            "value": 1,
            "info": "init with current time"
          });
        } else {
          // Fills with 0s
          var _lastTimestamp = new Date(result[0].time);

          var _currentDate = new Date();

          finalResult.push({
            "time": new Date(_currentDate).toISOString(),
            "value": 0,
            "info": "init with current time"
          });
        } // Padding results


        var rightBeforeTime;
        result.forEach(function (item, index) {
          if (item.value == 0) {
            // if item.value == 0
            // get current time
            var time = item.time;
            var timeDate = new Date(time); // push initial value

            finalResult.push({
              "time": item.time,
              "value": 0
            }); //item.value == 0

            if (index != result.length - 1) {
              // if item.value == 0 and not last
              // push 1 right before 0
              rightBeforeTime = new Date(timeDate.getTime() - 1); // push 1 milisecond before 0

              finalResult.push({
                "time": rightBeforeTime.toISOString(),
                "value": 1,
                "info": "rightBefore 0"
              });
            }
          } else {
            // if item.value == 1
            // get current time
            var _time = item.time;

            var _timeDate = new Date(_time); // push initial value


            finalResult.push({
              "time": item.time,
              "value": 1
            }); //item.value == 1

            if (index != result.length - 1) {
              // if item.value == 1 and not last
              // push 0 right before 1
              rightBeforeTime = new Date(_timeDate.getTime() - 1); // push 1 milisecond before 1

              finalResult.push({
                "time": rightBeforeTime.toISOString(),
                "value": 0,
                "info": "rightBefore 1"
              });
            }
          }
        }); // Filter only today's data

        var thisDay = todayRaw.getDate();
        finalResultFiltered = finalResult.filter(checkIfToday);
        finalResultFilteredYesterday = finalResult.filter(checkIfYesterday); // END Filter only today's data
        // Add 1 or 0 at midnight for current day

        var oldestValue;

        if (finalResultFilteredYesterday.length) {
          oldestValue = finalResultFilteredYesterday[0].value; // last value recorded yesterday
          // console.log(oldestValue, oldestValue == 1, oldestValue == 0)

          if (oldestValue == 1) {
            var midnight = new Date();
            midnight = midnight.toISOString().split("T")[0] + 'T00:00:00.000Z'; // console.log(midnight)

            finalResultFiltered.push({
              "time": midnight,
              "value": 1,
              "info": "end with midnight"
            });
          } else {
            var _midnight = new Date();

            _midnight = _midnight.toISOString().split("T")[0] + 'T00:00:00.000Z'; // console.log(midnight)

            finalResultFiltered.push({
              "time": _midnight,
              "value": 0,
              "info": "end with midnight"
            });
          }
        } else {
          oldestValue = finalResult[finalResult.length - 1].value; // earliest value recorded today

          var _midnight2 = new Date();

          _midnight2 = _midnight2.toISOString().split("T")[0] + 'T00:00:00.000Z';

          if (oldestValue == 1) {
            // if sensor started with 1, put at midnight
            finalResultFiltered.push({
              "time": _midnight2,
              "value": null
            });
          } else {
            finalResultFiltered.push({
              "time": _midnight2,
              "value": null
            });
          }
        }
      } else if (paddingStyle == 2) {
        var _checkIfToday = function _checkIfToday(item) {
          try {
            var day;
            if (typeof item.time == 'string') day = item.time.split('T')[0].split('-')[2];else {
              var time = item.time._nanoISO;
              day = time.split('T')[0].split('-')[2];
            } // console.log(typeof item.time, day, thisDay, day==thisDay)

            return day == _thisDay;
          } catch (e) {
            console.log(e);
            return false;
          }
        };

        // Push 0 or 1 from current time to last time in influx
        var _lastValue = result[0].value;

        if (_lastValue == 1) {
          // Fills with 1s
          var _lastTimestamp2 = new Date(result[0].time);

          var _currentDate2 = new Date();

          while (_currentDate2.getTime() - _lastTimestamp2.getTime() > 10 * 60000) {
            //10 * 60000 = 10 min
            finalResult.push({
              "time": new Date(_currentDate2).toISOString(),
              "value": 1
            });

            _currentDate2.setSeconds(_currentDate2.getSeconds() - 10 * 60);
          } // finalResult.push({ "time": lastTimestamp.toISOString(), "value": 1 })

        } else {
          // Fills with 0s
          var _lastTimestamp3 = new Date(result[0].time);

          var _currentDate3 = new Date();

          while (_currentDate3.getTime() - _lastTimestamp3.getTime() > 10 * 60000) {
            //10 * 60000 = 10 min
            finalResult.push({
              "time": new Date(_currentDate3).toISOString(),
              "value": null
            });

            _currentDate3.setSeconds(_currentDate3.getSeconds() - 10 * 60);
          } // finalResult.push({ "time": lastTimestamp.toISOString(), "value": null })

        } // Padding results


        result.forEach(function (item, index) {
          if (item.value == 0) {
            // get current time
            var time = item.time;
            var timeDate = new Date(time); // push initial value

            finalResult.push({
              "time": item.time,
              "value": null
            }); // push 1 right before 0

            var _rightBeforeTime = new Date(timeDate.getTime() - 1);

            finalResult.push({
              "time": _rightBeforeTime.toISOString(),
              "value": 1
            }); // get next time

            var nextTime;

            try {
              nextTime = result[index + 1].time;
            } catch (e) {
              nextTime = result[index].time;
            }

            var nextTimeDate = new Date(nextTime); // start padding

            var newDate = new Date(timeDate.getTime()); // current json time

            while (newDate.getTime() - 1000 * 60 > nextTimeDate.getTime()) {
              newDate.setSeconds(newDate.getSeconds() - 60);
              finalResult.push({
                "time": new Date(newDate).toISOString(),
                "value": 1
              });
            } // finalResult.pop() //remove last item because it goes a bit beyond nextTimeDate

          } else {
            // get current time
            var _time2 = item.time;

            var _timeDate2 = new Date(_time2);

            finalResult.push({
              "time": item.time,
              "value": 1
            }); // push 0 right before 1

            var _rightBeforeTime2 = new Date(_timeDate2.getTime() - 1);

            finalResult.push({
              "time": _rightBeforeTime2.toISOString(),
              "value": null
            }); // get next time

            var _nextTime;

            try {
              _nextTime = result[index + 1].time;
            } catch (e) {
              _nextTime = result[index].time;
            }

            var _nextTimeDate = new Date(_nextTime); // start padding


            var _newDate = new Date(_timeDate2.getTime()); // current json time


            while (_newDate.getTime() - 5 * 1000 > _nextTimeDate.getTime()) {
              _newDate.setSeconds(_newDate.getSeconds() - 5);

              finalResult.push({
                "time": new Date(_newDate).toISOString(),
                "value": null
              });
            }
          }
        }); // Filter only today's data

        var _thisDay = todayRaw.getDate();

        finalResultFiltered = finalResult.filter(_checkIfToday); // END Filter only today's data
      } else if (paddingStyle == 3) {
        var _checkIfToday2 = function _checkIfToday2(item) {
          try {
            var day;
            if (typeof item.time == 'string') day = item.time.split('T')[0].split('-')[2];else {
              var time = item.time._nanoISO;
              day = time.split('T')[0].split('-')[2];
            } // console.log(typeof item.time, day, thisDay, day==thisDay)

            return day == _thisDay2;
          } catch (e) {
            console.log(e);
            return false;
          }
        };

        var _checkIfYesterday = function _checkIfYesterday(item) {
          try {
            var day;
            if (typeof item.time == 'string') day = item.time.split('T')[0].split('-')[2];else {
              var time = item.time._nanoISO;
              day = time.split('T')[0].split('-')[2];
            } // console.log(typeof item.time, day, thisDay, day==thisDay)

            return day == _thisDay2 - 1;
          } catch (e) {
            console.log(e);
            return false;
          }
        };

        // First value - current time
        var _lastValue2 = result[0].value;

        if (_lastValue2 == 1) {
          // Fills with 1s
          var _lastTimestamp4 = new Date(result[0].time);

          var _currentDate4 = new Date();

          finalResult.push({
            "time": new Date(_currentDate4).toISOString(),
            "value": 1
          });
        } else {
          // Fills with 0s
          var _lastTimestamp5 = new Date(result[0].time);

          var _currentDate5 = new Date();

          finalResult.push({
            "time": new Date(_currentDate5).toISOString(),
            "value": null
          });
        } // Add real values


        var _rightBeforeTime3;

        result.forEach(function (item, index) {
          if (item.value == 0) {
            // if item.value == 0
            // get current time
            var time = item.time;
            var timeDate = new Date(time); // push initial value

            finalResult.push({
              "time": item.time,
              "value": null
            }); //item.value == 0
            // push 1 right before 0

            _rightBeforeTime3 = new Date(timeDate.getTime() - 1); // push 1 milisecond before 0

            finalResult.push({
              "time": _rightBeforeTime3.toISOString(),
              "value": 1
            });
          } else {
            // get current time
            var _time3 = item.time;

            var _timeDate3 = new Date(_time3); // push initial value


            finalResult.push({
              "time": item.time,
              "value": 1
            }); //item.value == 1
            // push 0 right before 1

            _rightBeforeTime3 = new Date(_timeDate3.getTime() - 1); // push 1 milisecond before 1

            finalResult.push({
              "time": _rightBeforeTime3.toISOString(),
              "value": null
            });
          }
        }); // Filter only today's data

        var _thisDay2 = todayRaw.getDate();

        finalResultFiltered = finalResult.filter(_checkIfToday2);
        finalResultFilteredYesterday = finalResult.filter(_checkIfYesterday); // console.log(finalResult)
        // END Filter only today's data
        // last value - midnight

        var _oldestValue = finalResultFilteredYesterday[0].value; // last value recorded yesterday
        // console.log(oldestValue, oldestValue == 1, oldestValue == 0)

        if (_oldestValue == 1) {
          var _midnight3 = new Date();

          _midnight3 = _midnight3.toISOString().split("T")[0] + '00:00:00.000Z'; // console.log(midnight)

          finalResultFiltered.push({
            "time": _midnight3,
            "value": 1
          });
        } else {
          var _midnight4 = new Date();

          _midnight4 = _midnight4.toISOString().split("T")[0] + '00:00:00.000Z'; // console.log(midnight)

          finalResultFiltered.push({
            "time": _midnight4,
            "value": 0
          });
        }
      } // Return sensor
      // res.status(200).send({ result, finalResultFiltered })


      res.status(200).send(finalResultFiltered);
    }).catch(function (err) {
      res.send(err);
    });
  } else {
    influxReader(influxQuery).then(function (result) {
      // Fill with null where 0 for door sensors
      // if (req.query.type)
      //     result = result.map((item, index) => {
      //         if (item.value == 0)
      //             return { "time": item.time, "value": null }
      //         else
      //             return item
      //     })
      // Return sensor
      res.send(result);
    }).catch(function (err) {
      res.send(err);
    });
  }
});
app.get('/api/v3/save-settings', function (req, res) {
  sess = req.session; // if (sess.username) {
  // let query = "UPDATE sensors SET " + (() => { return req.query.min ? 'min=' + req.query.min : '' })() + (() => { return req.query.max ? 'max=' + req.query.max : '' })() + (() => { return req.query.xlat ? 'x=\'' + req.query.xlat + '\' ' : '' })() + (() => { return req.query.ylong ? 'y=\'' + req.query.ylong + '\'' : '' })() + " WHERE sensorId=" + req.query.sensorId

  var query = "UPDATE sensors SET " + function () {
    return req.query.min ? 'min=' + req.query.min : 'min=NULL';
  }() + "," + function () {
    return req.query.max ? ' max=' + req.query.max : ' max=NULL';
  }() + "," + function () {
    return req.query.openTimer ? 'openTimer=' + req.query.openTimer : 'openTimer=NULL';
  }() + "," + function () {
    return req.query.closedTimer ? ' closedTimer=' + req.query.closedTimer : ' closedTimer=NULL';
  }() + "," + function () {
    return req.query.xlat ? ' x=\'' + req.query.xlat + '\' ' : ' x=NULL';
  }() + "," + function () {
    return req.query.ylong ? ' y=\'' + req.query.ylong + '\'' : ' y=NULL';
  }() + " WHERE sensorId=" + req.query.sensorId + ';'; // console.log(query)


  mysqlReader(query).then(function (res) {
    res.status(200).send("Values updated!");
  }).catch(function (err) {
    res.status(200).send(err);
  }); // } else {
  //     res.status(403).send("You are not authorized!");
  // }
}); // Route for OTA update 

app.get("/cdn", function (req, res) {
  var filename_raw = req.query.filename;
  var file = '/root/Applications/redesignWorkspaceAnysensor/public/publicDownload/' + filename_raw;
  var filename = path.basename(file);
  var stats = fs.statSync(file);
  var fileSizeInBytes = stats["size"];
  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', fileSizeInBytes);
  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});
app.get('/api/v3/get-interval', function _callee3(req, res) {
  var sensorId, sensorType, start, end, diffRaw, diff, averageTimeInterval, query;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          sess = req.session;
          sensorId = req.query.sensorId;
          // if(sess.userData != undefined)
          //     sess.userData.map(item => {
          //         if(item.sensorId == sensorId) 
          //             sensorType = item.sensorType
          //     })
          // console.log(sensorId, sensorType)
          start = new Date(req.query.start);
          end = new Date(req.query.end);
          diffRaw = end - start;
          diff = diffRaw / (1000 * 60 * 60);

          averageTimeInterval = function averageTimeInterval(diff) {
            if (diff <= 24) return '5m';
            if (diff > 24 && diff <= 24 * 2) return '10m';
            if (diff > 24 * 2 && diff <= 24 * 4) return '1h';
            if (diff > 24 * 4 && diff <= 24 * 7) return '4h';
            if (diff > 24 * 7) return '1d';
          };

          req.query.start = req.query.start.replace("T", " ");
          req.query.start = req.query.start.replace(".000000000Z", "");
          req.query.end = req.query.end.replace("T", " ");
          req.query.end = req.query.end.replace(".000000000Z", "");
          // if(sensorType=='door') {
          //     query = influxQuery = "SELECT value FROM sensors where sensorId='" + sensorId + "' and time>='" + req.query.start + "' and time<="+req.query.end+" order by time desc;"
          // } else if (sensorType=='temperature') {
          query = "select mean(value) as value from sensors where sensorId='" + sensorId + "' and time<='" + req.query.end + "' and time>='" + req.query.start + "' group by time(" + averageTimeInterval(diff) + ") order by time desc"; // }
          // console.log(query)

          if (sess.username) {
            influxReader(query).then(function (result) {
              res.status(200).send({
                result: result
              });
            }).catch(function (err) {
              res.status(200).send({
                err: err
              });
            });
          } else {
            res.status(403).send("You are not logged in!");
          }

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.get("/api/v3/save-position", function (req, res) {
  sess = req.session;

  if (sess.username) {
    var query = "UPDATE sensors SET x='" + req.query.x + "', y='" + req.query.y + "' WHERE sensorId='" + req.query.sensor + "';";
    mysqlReader(query).then(function (result) {
      res.status(200).send("Update performed");
    }).catch(function (err) {
      res.status(400).send("Error");
    });
  } else {
    res.status(403).send("Not logged in");
  }
}); // END NEW API ROUTES
//=========================================
// API Get Data From Different Zones
//=========================================
// get unique elements of list

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
} // Get counties of user


app.get('/api/get-data', function (req, res) {
  var time = new Date(); // console.log("GET DATA", new Date() - time)

  sess = req.session;
  var data = [];

  if (sess.username) {
    // get sensor access from mysql
    var query = "SELECT * FROM sensors WHERE username='" + sess.username + "'";
    mysqlReader(query).then(function _callee5(rows) {
      var rows_, whereQuery, i, queryCounties, counties, cities, locations, zones;
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(rows);

            case 2:
              rows_ = _context5.sent;

              // If user is found in mysql
              if (rows_.length) {
                whereQuery = "where (username='" + sess.username + "') or (";

                for (i = 0; i < rows_.length; i++) {
                  whereQuery += "sensorId='" + rows_[i].sensorId + "'";
                  if (i < rows_.length - 1) whereQuery += " or ";else whereQuery += ")";
                }

                queryCounties = "select distinct(county) as county from ( select county, value from sensors " + whereQuery + " )"; // If user is not found in mysql
              } else {
                // get counties
                queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + sess.username + "')";
              }

              counties = influxReader(queryCounties).then(function _callee4(result) {
                var counties, i;
                return regeneratorRuntime.async(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        counties = [];

                        for (i = 0; i < result.length; i++) {
                          counties.push(result[i].county);
                        }

                        _context4.next = 4;
                        return regeneratorRuntime.awrap(counties);

                      case 4:
                        return _context4.abrupt("return", _context4.sent);

                      case 5:
                      case "end":
                        return _context4.stop();
                    }
                  }
                });
              }); // ================ cities, locations and zones ================
              // ========== are disabled because no need of them all =========
              // ============= and increase the time of response =============
              // // get cities
              // var queryCities = "select distinct(city) as city from (select city, value from sensors where username='"+sess.username+"')"
              // let cities = influxReader(queryCities).then(async (result) => {
              //     // console.log("GET cities", new Date() - time)
              //     let cities = []
              //     for (var i = 0; i < result.length; i++) {
              //         cities.push(result[i].city)
              //     }
              //     // console.log("GET cities", new Date() - time)
              //     return await cities
              // })
              // // get locations
              // var queryLocation = "select distinct(location) as location from (select location, value from sensors where username='"+sess.username+"')"
              // let locations = influxReader(queryLocation).then(async (result) => {
              //     // console.log("GET locations", new Date() - time)
              //     let locations = []
              //     for (var i = 0; i < result.length; i++) {
              //         locations.push(result[i].location)
              //     }
              //     // console.log("GET locations", new Date() - time)
              //     return await locations
              // })
              // // get zones
              // var queryZone = "select distinct(zone) as zone from (select zone, value from sensors where username='"+sess.username+"')"
              // let zones = influxReader(queryZone).then(async (result) => {
              //     // console.log("GET zones", new Date() - time)
              //     let zones = []
              //     for (var i = 0; i < result.length; i++) {
              //         zones.push(result[i].zone)
              //     }
              //     // console.log("GET zones", new Date() - time)
              //     return await zones
              // })

              cities = [0];
              locations = [0];
              zones = [0]; // ================ END ================

              Promise.all([counties, cities, locations, zones]).then(function (result) {
                // console.log("promise all", new Date() - time)
                // build the output
                if (result[0].length && result[1].length && result[2].length && result[3].length) {
                  // console.log("promise all push", new Date() - time)
                  data.push({
                    error: false,
                    message: "Data found",
                    user: sess.username,
                    countiesCounter: result[0].length,
                    counties: result[0].length ? result[0] : "No county found",
                    query: queryCounties,
                    responseTime: new Date() - time + "ms"
                  }); // console.log("promise all push done", new Date() - time)
                } else {
                  data.push({
                    error: true,
                    message: "No data found for this user",
                    user: sess.username
                  });
                } // console.log("GET all", new Date() - time)
                // send the data


                res.status(200).send(data);
              }).catch(function (error) {
                return console.log("Error in promises ".concat(error));
              });

            case 9:
            case "end":
              return _context5.stop();
          }
        }
      });
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  } // console.log("done", new Date() - time)

}); // No longer used - instead I use /api/get-data/last/:county/:sensorQuery

app.get('/api/get-data/type/:sensorId', function (req, res) {
  sess = req.session;
  var data = [];
  var time = new Date(); // console.log(req.originalUrl)

  if (sess.username) {
    // var query = `select distinct(type) as type from sensors where sensorId='`+req.params.sensorId+`' LIMIT 1`
    var query = "select zone, type from (select zone, type, value from sensors where sensorId='" + req.params.sensorId + "') LIMIT 1";
    var type = influxReader(query).then(function (result) {
      // console.log(influxQuery)
      if (result.length) data.push({
        error: false,
        message: "Data found",
        sensorQueried: req.params.sensorId,
        sensorType: result[0].type,
        sensorZone: result[0].zone,
        user: sess.username,
        responseTime: new Date() - time
      });else data.push({
        error: true,
        message: "No data found",
        sensorQueried: req.params.sensorId,
        user: sess.username,
        responseTime: new Date() - time
      });
      return data;
    }).then(function (result) {
      res.status(200).send(result);
    }).catch(function (e) {
      res.status(404).send("Scraping sensor type from influx failed");
    });
  } else {
    var responseTime = new Date() - time;
    data.push({
      error: "you are not logged in",
      responseTime: responseTime
    });
    res.status(403).send(data);
  }
}); // Get all distinct sensorIds from a requested county

app.get('/api/v2/get-data/sensorId/:county', function (req, res) {
  var data = [];
  var time = new Date();
  sess = req.session;

  if (sess.username) {
    var query = "SELECT * FROM sensors WHERE username='" + sess.username + "'";
    mysqlReader(query).then(function _callee6(rows) {
      var mysqlTime, rows_, whereQuery, i, influxQuery, sensorsData;
      return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              mysqlTime = new Date() - time;
              _context6.next = 3;
              return regeneratorRuntime.awrap(rows);

            case 3:
              rows_ = _context6.sent;

              if (rows_.length) {
                whereQuery = "where (username='" + sess.username + "' and county='" + req.params.county + "') or ((";

                for (i = 0; i < rows_.length; i++) {
                  whereQuery += "sensorId='" + rows_[i].sensorId + "'";
                  if (i < rows_.length - 1) whereQuery += " or ";else whereQuery += ")";
                }

                whereQuery += " and county='" + req.params.county + "')"; // var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`
                // whereQuery += `where username='` + sess.username + `' and county='` + req.params.county + `'`

                influxQuery = "show series " + whereQuery;
              } else {
                whereQuery = "where username='" + sess.username + "' and county='" + req.params.county + "'";
                influxQuery = "show series " + whereQuery;
              } // console.log(influxQuery)
              // Get all types of sensors of logged in user and from requested county


              sensorsData = influxReader(influxQuery).then(function (result) {
                // console.log("after fetch", new Date() - time)
                // get sensor type
                var sensorIdList = [];
                var sensorTypeList = [];
                var sensorZoneList = []; // var sensorIdListAux = []

                for (var i = 0; i < result.length; i++) {
                  sensorIdList.push(result[i].key.split('sensorId=')[1].split(',type')[0]);
                }

                for (var i = 0; i < result.length; i++) {
                  sensorTypeList.push(result[i].key.split('type=')[1].split(',username')[0]);
                }

                for (var i = 0; i < result.length; i++) {
                  sensorZoneList.push(result[i].key.split(',zone=')[1]);
                } // build the output


                if (result.length) {
                  data.push({
                    error: false,
                    message: "Data found",
                    county: req.params.county,
                    user: sess.username,
                    sensorIdListLength: sensorIdList.length,
                    sensorIdList: sensorIdList,
                    sensorTypeList: sensorTypeList,
                    sensorZoneList: sensorZoneList,
                    influxResponse: new Date() - time + "ms",
                    mysqlResponse: mysqlTime + "ms",
                    influxQuery: influxQuery
                  });
                } else {
                  data.push({
                    error: true,
                    message: "No data found",
                    county: req.params.county,
                    length: result.length,
                    user: sess.username,
                    influxResponse: new Date() - time + "ms",
                    mysqlResponse: mysqlTime + "ms",
                    influxQuery: influxQuery
                  });
                } // send the output


                res.status(200).send(data);
              }).catch(function (e) {
                res.status(404).send("Scraping sensorId data from influx failed", e);
              });

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      });
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
}); // Get all distinct sensorIds from a requested county - not used

app.get('/api/get-data/sensorId/:county', function (req, res) {
  var time = new Date();
  sess = req.session; // get params
  // const queryObject = url.parse(req.url,true).query;
  // console.log(queryObject);
  // console.log(queryObject);
  // console.log(sess.username)

  var data = []; // Who ask for the data

  if (sess.username) {
    // console.log("if",new Date()-time)
    // req.params.county = req.params.county.toLowerCase()
    // console.log(req.originalUrl)
    // console.log("User:", sess.username);
    // Create the query based on user type
    if (sess.sensorAccess != -1) {// // return evrything that belongs to username and match county and is in a 1day time interval
      // var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
      // // check what sensor type for the user
      // var influxQuery = `select distinct(sensorId) as sensorId from sensors ` + whereQuery
      // return evrything that belongs to username and match county and is in a 1day time interval
      // var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
      // check what sensor type for the user
      // var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`
    } else {} // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
      // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // // check what sensor type for the user
      // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
      // // console.log(influxQuery)
      // select (distinct sensorId), type from ( select sensorId, type, value from sensors where username='demo' and county='bucuresti') group by sensorId
      // get sensor access from mysql


    var query = "SELECT * FROM sensors WHERE username='" + sess.username + "'";
    mysqlReader(query).then(function _callee7(rows) {
      var mysqlTime, rows_, whereQuery, i, influxQuery, sensorsData;
      return regeneratorRuntime.async(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              mysqlTime = new Date() - time;
              _context7.next = 3;
              return regeneratorRuntime.awrap(rows);

            case 3:
              rows_ = _context7.sent;

              if (rows_.length) {
                whereQuery = "where (username='" + sess.username + "' and county='" + req.params.county + "') or ((";

                for (i = 0; i < rows_.length; i++) {
                  whereQuery += "sensorId='" + rows_[i].sensorId + "'";
                  if (i < rows_.length - 1) whereQuery += " or ";else whereQuery += ")";
                }

                whereQuery += " and county='" + req.params.county + "')";
                influxQuery = "select distinct(sensorId) as sensorId from ( select sensorId, value from sensors " + whereQuery + " )";
              } else {
                whereQuery = "where username='" + sess.username + "' and county='" + req.params.county + "'";
                influxQuery = "select distinct(sensorId) as sensorId from ( select sensorId, type, value from sensors " + whereQuery + " )";
              } // console.log(influxQuery)
              // Get all types of sensors of logged in user and from requested county


              sensorsData = influxReader(influxQuery).then(function (result) {
                // console.log("after fetch", new Date() - time)
                // get sensor type
                // var sensorTypeList = []
                var sensorIdList = []; // var sensorIdListAux = []

                for (var i = 0; i < result.length; i++) {
                  sensorIdList.push(result[i].sensorId);
                } // build the output


                if (result.length) {
                  data.push({
                    error: false,
                    message: "Data found",
                    county: req.params.county,
                    user: sess.username,
                    sensorIdListLength: sensorIdList.length,
                    sensorIdList: sensorIdList,
                    influxResponse: new Date() - time + "ms",
                    mysqlResponse: mysqlTime + "ms",
                    influxQuery: influxQuery
                  });
                } else {
                  data.push({
                    error: true,
                    message: "No data found",
                    county: req.params.county,
                    length: result.length,
                    user: sess.username,
                    influxResponse: new Date() - time + "ms",
                    mysqlResponse: mysqlTime + "ms",
                    influxQuery: influxQuery
                  });
                } // send the output


                res.status(200).send(data);
              }).catch(function (e) {
                res.status(404).send("Scraping sensorId data from influx failed", e);
              });

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      });
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
}); // Get last week daily values EXPERIMENT

app.get('/api/experiment/get-data/:county/:sensorQuery', function (req, res) {
  sess = req.session;
  var data = [];
  var time = new Date();

  if (sess.username) {
    // Server side log
    req.params.county = req.params.county.toLowerCase(); // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()
    // the way I check if sensor is counter should be estabilshed after
    // we decide about sensorId template

    var isCounter = req.params.sensorQuery.split('-')[1] == 'c' ? true : false; // console.log(req.originalUrl)
    // console.log('/api/get-data/' + req.params.county + '/' + req.params.sensorQuery)
    // console.log("User:", sess.username);
    // console.log("Access to sensorId:", sess.sensorAccess);
    // console.log(req.params)
    // Get the date for influx query - this day 0 to currentHour

    var today = new Date(); // cannot query for today date starting at 00:00 because influx tz is -1h than romanian tz
    // set today 00:00 as yesterday 23:00

    today.setDate(today.getDate() - 1);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z'; // console.log(">> TODAY start:", today)
    // Mean of last week - experiment
    // ==========================================

    var lastweekTodayStart = new Date();
    lastweekTodayStart.setDate(lastweekTodayStart.getDate() - 8);
    var dd = String(lastweekTodayStart.getDate()).padStart(2, '0');
    var mm = String(lastweekTodayStart.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = lastweekTodayStart.getFullYear();
    lastweekTodayStart = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z'; // console.log(">> lastweekTodayStart start:", lastweekTodayStart)

    var lastweekTodayStop = new Date();
    lastweekTodayStop.setDate(lastweekTodayStop.getDate() - 7);
    var dd = String(lastweekTodayStop.getDate()).padStart(2, '0');
    var mm = String(lastweekTodayStop.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = lastweekTodayStop.getFullYear();
    lastweekTodayStop = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z'; // console.log(">> lastweekTodayStop start:", lastweekTodayStop)
    // ==========================================
    // END Mean of last week - experiment
    // console.log("api req date:", today)

    if (sess.sensorAccess != -1) {
      // return evrything that belongs to username and match county and is in a 1day time interval
      var whereQueryExperiment = "where county='" + req.params.county + "' and sensorId='" + req.params.sensorQuery + "' and time>='" + lastweekTodayStart + "' and time<'" + lastweekTodayStop + "'"; // var whereQuery = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<now()`
      // if (isCounter) {
      //     // check what sensor type for the user
      //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // } else {
      //     // check what sensor type for the user
      //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // }

      if (isCounter) {
        // check what sensor type for the user
        var influxQuery = "select sum(value) as value from sensors " + whereQuery + " GROUP BY time(5m) ORDER BY time DESC";
      } else {
        // check what sensor type for the user
        // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
        var influxQueryExperiment = "select mean(value) as value, last(type) as type from sensors " + whereQueryExperiment + " GROUP BY time(5m) ORDER BY time DESC";
      } // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

    } else {} // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
      // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // // check what sensor type for the user
      // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
      // // console.log(influxQuery)
      // get sensor zone
      // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"


    var query = "SHOW TAG VALUES WITH KEY IN (\"type\", \"zone\") WHERE sensorId='" + req.params.sensorQuery + "'";
    var sensorZoneAndType = influxReader(query).then(function (res) {
      // console.log(res)
      return res;
    }); // console.log(query, res[0])
    // console.log(influxQuery)

    var resultInfluxDb = influxReader(influxQueryExperiment).then(function _callee8(result) {
      var sensorZoneAndType_, i;
      return regeneratorRuntime.async(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(sensorZoneAndType);

            case 2:
              sensorZoneAndType_ = _context8.sent;

              // console.log(sensorZoneAndType_)
              // console.log(sensorZoneAndType_[0].value)
              // console.log(sensorZoneAndType_[1].value)
              if (result.length) {
                data.push({
                  error: false,
                  message: "Data found",
                  county: req.params.county,
                  // sensorType: sensorZoneAndType_.type,
                  // sensorZone: sensorZoneAndType_.zone,
                  sensorType: sensorZoneAndType_[0].value,
                  sensorZone: sensorZoneAndType_[1].value,
                  sensorQueried: req.params.sensorQuery,
                  sensorReadings: result.length,
                  user: sess.username,
                  responseTime: new Date() - time + "ms",
                  influxQueryExperiment: influxQueryExperiment,
                  sensorAverage: []
                });

                for (i = 0; i < result.length; i++) {
                  data[0].sensorAverage.push({
                    sensorValue: result[i].value,
                    sensorTime: result[i].time
                  });
                }
              } else {
                data.push({
                  error: true,
                  message: "No data found",
                  county: req.params.county,
                  sensorQueried: req.params.sensorQuery,
                  sensorType: sensorZoneAndType_.type,
                  sensorZone: sensorZoneAndType_.zone,
                  sensorReadings: result.length,
                  responseTime: new Date() - time,
                  influxQueryExperiment: influxQueryExperiment,
                  user: sess.username
                });
              }

              return _context8.abrupt("return", data);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      });
    }).then(function _callee9(result) {
      return regeneratorRuntime.async(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              res.status(200).send(result);

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      });
    }).catch(function (e) {
      res.status(404).send("Scraping sensor data from influx failed");
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
}); // Get today' values of a sensor

app.get('/api/get-data/:county/:sensorQuery', function (req, res) {
  sess = req.session;
  var data = [];
  var time = new Date(); // console.log(sess.username, req.params)

  if (sess.username) {
    // Server side log
    req.params.county = req.params.county.toLowerCase(); // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()
    // the way I check if sensor is counter should be estabilshed after
    // we decide about sensorId template

    var isCounter = req.params.sensorQuery.split('-')[1] == 'c' ? true : false; // console.log(req.originalUrl)
    // console.log('/api/get-data/' + req.params.county + '/' + req.params.sensorQuery)
    // console.log("User:", sess.username);
    // console.log("Access to sensorId:", sess.sensorAccess);
    // console.log(req.params)
    // Get the date for influx query - this day 0 to currentHour

    var today = new Date(); // cannot query for today date starting at 00:00 because influx tz is -1h than romanian tz
    // set today 00:00 as yesterday 23:00

    today.setDate(today.getDate() - 1);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z'; // console.log(">> TODAY start:",today)
    // Mean of last week - experiment
    // ==========================================
    // var lastweekTodayStart = new Date();
    // lastweekTodayStart.setDate(lastweekTodayStart.getDate() - 8)
    // var dd = String(lastweekTodayStart.getDate()).padStart(2, '0');
    // var mm = String(lastweekTodayStart.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = lastweekTodayStart.getFullYear();
    // lastweekTodayStart = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';
    // console.log(">> lastweekTodayStart start:",lastweekTodayStart)
    // var lastweekTodayStop = new Date();
    // lastweekTodayStop.setDate(lastweekTodayStop.getDate() - 7)
    // var dd = String(lastweekTodayStop.getDate()).padStart(2, '0');
    // var mm = String(lastweekTodayStop.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = lastweekTodayStop.getFullYear();
    // lastweekTodayStop = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';
    // console.log(">> lastweekTodayStop start:",lastweekTodayStop)
    // ==========================================
    // END Mean of last week - experiment
    // console.log("api req date:", today)

    if (sess.sensorAccess != -1) {
      // return evrything that belongs to username and match county and is in a 1day time interval
      // var whereQueryExperiment = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + lastweekTodayStart + `' and time<'`+lastweekTodayStop+`'`
      var whereQuery = "where county='" + req.params.county + "' and sensorId='" + req.params.sensorQuery + "' and time>='" + today + "' and time<now()"; // if (isCounter) {
      //     // check what sensor type for the user
      //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // } else {
      //     // check what sensor type for the user
      //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // }

      if (isCounter) {
        // check what sensor type for the user
        var influxQuery = "select sum(value) as value from sensors " + whereQuery + " GROUP BY time(1h) ORDER BY time DESC";
      } else {
        // check what sensor type for the user
        var influxQuery = "select mean(value) as value, last(type) as type from sensors " + whereQuery + " GROUP BY time(1h) ORDER BY time DESC"; // var influxQueryExperiment = `select mean(value) as value, last(type) as type from sensors ` + whereQueryExperiment + ` GROUP BY time(1h) ORDER BY time DESC`
      } // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

    } else {} // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
      // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // // check what sensor type for the user
      // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
      // // console.log(influxQuery)
      // get sensor zone
      // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"


    var query = "SHOW TAG VALUES WITH KEY IN (\"type\", \"zone\") WHERE sensorId='" + req.params.sensorQuery + "'";
    var sensorZoneAndType = influxReader(query).then(function (res) {
      // console.log(res)
      return res;
    }); // console.log(query, res[0])
    // console.log(influxQuery)

    var resultInfluxDb = influxReader(influxQuery).then(function _callee10(result) {
      var sensorZoneAndType_, i;
      return regeneratorRuntime.async(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(sensorZoneAndType);

            case 2:
              sensorZoneAndType_ = _context10.sent;

              // console.log(sensorZoneAndType_)
              // console.log(sensorZoneAndType_[0].value)
              // console.log(sensorZoneAndType_[1].value)
              if (result.length) {
                data.push({
                  error: false,
                  message: "Data found",
                  county: req.params.county,
                  // sensorType: sensorZoneAndType_.type,
                  // sensorZone: sensorZoneAndType_.zone,
                  sensorType: sensorZoneAndType_[0].value,
                  sensorZone: sensorZoneAndType_[1].value,
                  sensorQueried: req.params.sensorQuery,
                  sensorReadings: result.length,
                  user: sess.username,
                  responseTime: new Date() - time + "ms",
                  influxQuery: influxQuery,
                  sensorAverage: []
                });

                for (i = 0; i < result.length; i++) {
                  data[0].sensorAverage.push({
                    sensorValue: result[i].value,
                    sensorTime: result[i].time
                  });
                }
              } else {
                data.push({
                  error: true,
                  message: "No data found",
                  county: req.params.county,
                  sensorQueried: req.params.sensorQuery,
                  sensorType: sensorZoneAndType_.type,
                  sensorZone: sensorZoneAndType_.zone,
                  sensorReadings: result.length,
                  responseTime: new Date() - time,
                  influxQuery: influxQuery,
                  user: sess.username
                });
              }

              return _context10.abrupt("return", data);

            case 5:
            case "end":
              return _context10.stop();
          }
        }
      });
    }).then(function _callee11(result) {
      return regeneratorRuntime.async(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              res.status(200).send(result);

            case 1:
            case "end":
              return _context11.stop();
          }
        }
      });
    }).catch(function (e) {
      res.status(404).send("Scraping sensor data from influx failed");
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
}); // Get today' values of a sensor API v2

app.get('/api/v2/get-data/:county/:sensorQuery', function (req, res) {
  sess = req.session;
  var data = [];
  var time = new Date(); // console.log(sess.username, req.params)

  if (sess.username) {
    // Server side log
    req.params.county = req.params.county.toLowerCase(); // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()
    // the way I check if sensor is counter should be estabilshed after
    // we decide about sensorId template

    var isCounter = req.params.sensorQuery.split('-')[1] == 'c' ? true : false; // console.log(req.originalUrl)
    // console.log('/api/get-data/' + req.params.county + '/' + req.params.sensorQuery)
    // console.log("User:", sess.username);
    // console.log("Access to sensorId:", sess.sensorAccess);
    // console.log(req.params)
    // Get the date for influx query - this day 0 to currentHour

    var today__raw = new Date(); // this is -1h romanian timezone

    var today__raw_2 = new Date(); // this is -1h romanian timezone
    // console.log("today__raw", today__raw);
    // cannot query for today date starting at 00:00 because influx tz is -1h than romanian tz
    // set today 00:00 as yesterday 23:00

    today__raw.setDate(today__raw.getDate() - 1);
    var dd = String(today__raw.getDate()).padStart(2, '0');
    var mm = String(today__raw.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = today__raw.getFullYear();
    today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';
    var dd = String(today__raw_2.getDate()).padStart(2, '0');
    var mm = String(today__raw_2.getMonth() + 1).padStart(2, '0'); //January is 0!

    dd = parseInt(dd).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    todayEnd = "'" + yyyy + '-' + mm + '-' + dd + 'T23:00:00Z' + "'"; // todayEnd = "now()"
    // console.log(">> TODAY start:", today)
    // console.log(">> TODAY end:", todayEnd)
    // Mean of last week - experiment
    // ==========================================
    // var lastweekTodayStart = new Date();
    // lastweekTodayStart.setDate(lastweekTodayStart.getDate() - 8)
    // var dd = String(lastweekTodayStart.getDate()).padStart(2, '0');
    // var mm = String(lastweekTodayStart.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = lastweekTodayStart.getFullYear();
    // lastweekTodayStart = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';
    // console.log(">> lastweekTodayStart start:",lastweekTodayStart)
    // var lastweekTodayStop = new Date();
    // lastweekTodayStop.setDate(lastweekTodayStop.getDate() - 7)
    // var dd = String(lastweekTodayStop.getDate()).padStart(2, '0');
    // var mm = String(lastweekTodayStop.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = lastweekTodayStop.getFullYear();
    // lastweekTodayStop = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';
    // console.log(">> lastweekTodayStop start:",lastweekTodayStop)
    // ==========================================
    // END Mean of last week - experiment
    // console.log("api req date:", today)

    if (sess.sensorAccess != -1) {
      // return evrything that belongs to username and match county and is in a 1day time interval
      // var whereQueryExperiment = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + lastweekTodayStart + `' and time<'`+lastweekTodayStop+`'`
      var whereQuery = "where county='" + req.params.county + "' and sensorId='" + req.params.sensorQuery + "' and time>='" + today + "' and time<=" + todayEnd + ""; // if (isCounter) {
      //     // check what sensor type for the user
      //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // } else {
      //     // check what sensor type for the user
      //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // }

      if (isCounter) {
        // check what sensor type for the user
        var influxQuery = "select sum(value) as value from sensors " + whereQuery + " GROUP BY time(5m) ORDER BY time DESC";
      } else {
        // check what sensor type for the user
        var influxQuery = "select mean(value) as value, last(type) as type from sensors " + whereQuery + " GROUP BY time(5m) ORDER BY time DESC";
      } // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

    } else {} // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
      // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // // check what sensor type for the user
      // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
      // // console.log(influxQuery)
      // get sensor zone
      // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"


    var query = "SHOW TAG VALUES WITH KEY IN (\"type\", \"zone\") WHERE sensorId='" + req.params.sensorQuery + "'";
    var sensorZoneAndType = influxReader(query).then(function (res) {
      // console.log(res)
      return res;
    }); // console.log(query, res[0])
    // console.log(influxQuery)

    var resultInfluxDb = influxReader(influxQuery).then(function _callee12(result) {
      var sensorZoneAndType_, i;
      return regeneratorRuntime.async(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(sensorZoneAndType);

            case 2:
              sensorZoneAndType_ = _context12.sent;

              // console.log(sensorZoneAndType_)
              // console.log(sensorZoneAndType_[0].value)
              // console.log(sensorZoneAndType_[1].value)
              if (result.length) {
                data.push({
                  error: false,
                  message: "Data found",
                  county: req.params.county,
                  // sensorType: sensorZoneAndType_.type,
                  // sensorZone: sensorZoneAndType_.zone,
                  sensorType: sensorZoneAndType_[0].value,
                  sensorZone: sensorZoneAndType_[1].value,
                  sensorQueried: req.params.sensorQuery,
                  sensorReadings: result.length,
                  user: sess.username,
                  responseTime: new Date() - time + "ms",
                  influxQuery: influxQuery,
                  sensorAverage: []
                });

                for (i = 0; i < result.length; i++) {
                  data[0].sensorAverage.push({
                    sensorValue: result[i].value,
                    sensorTime: result[i].time
                  });
                }
              } else {
                data.push({
                  error: true,
                  message: "No data found",
                  county: req.params.county,
                  sensorQueried: req.params.sensorQuery,
                  sensorType: sensorZoneAndType_.type,
                  sensorZone: sensorZoneAndType_.zone,
                  sensorReadings: result.length,
                  responseTime: new Date() - time,
                  influxQuery: influxQuery,
                  user: sess.username
                });
              }

              return _context12.abrupt("return", data);

            case 5:
            case "end":
              return _context12.stop();
          }
        }
      });
    }).then(function _callee13(result) {
      return regeneratorRuntime.async(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              res.status(200).send(result);

            case 1:
            case "end":
              return _context13.stop();
          }
        }
      });
    }).catch(function (e) {
      res.status(404).send({
        e: e,
        query: query,
        influxQuery: influxQuery
      }); // res.status(404).send(influxQuery)
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
});
app.get('/api/get-data/last/:county/:sensorQuery', function (req, res) {
  sess = req.session;
  var data = [];
  var time = new Date();

  if (sess.username) {
    // Server side log
    req.params.county = req.params.county.toLowerCase(); // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()
    // console.log(req.originalUrl)
    // console.log("User:", sess.username);
    // console.log("Access to sensorId:", sess.sensorAccess);
    // console.log(req.params)
    // Get the date for influx query - this day 0 to currentHour

    var today = new Date();
    today.setDate(today.getDate() - 1);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

    if (sess.sensorAccess != -1) {
      // // return evrything that belongs to username and match county and is in a 1day time interval
      // var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<now()`
      // // check what sensor type for the user
      // var influxQuery = `select last(value) as value, type from sensors ` + whereQuery + ` GROUP BY sensorId  ORDER BY time DESC`
      // return evrything that belongs to username and match county and is in a 1day time interval
      var whereQuery = "where county='" + req.params.county + "' and sensorId='" + req.params.sensorQuery + "' and time>='" + today + "' and time<now()"; // check what sensor type for the user

      var influxQuery = "select last(value) as value from sensors " + whereQuery + " GROUP BY sensorId  ORDER BY time DESC";
    } else {} // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
    // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
    // // check what sensor type for the user
    // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
    // // console.log(influxQuery)
    // console.log("---->",influxQuery)


    var resultInfluxDb = influxReader(influxQuery).then(function (result) {
      // console.log(result)
      if (result.length) {
        data.push({
          error: false,
          message: "Data found",
          county: req.params.county,
          sensorQueried: req.params.sensorQuery,
          // sensorType: result[0].type,
          // sensorLive: result[0].live,
          lastValue: {
            value: result[0].value,
            time: result[0].time
          },
          user: sess.username,
          responseTime: new Date() - time
        }); // for (var i = 0; i < result.length; i++) {
        //     data[0].sensorAverage.push({
        //         sensorValue: result[i].value,
        //         sensorTime: result[i].time
        //     })
        // }
      } else {
        data.push({
          error: true,
          message: "No data found",
          county: req.params.county,
          sensorQueried: req.params.sensorQuery,
          lastValue: result,
          user: sess.username,
          responseTime: new Date() - time
        });
      }

      return data;
    }).then(function (result) {
      res.status(200).send(result);
    }).catch(function (e) {
      res.status(404).send("Scraping sensor data from influx failed");
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
});
app.get('/api/get-interval/:step', function (req, res) {
  sess = req.session;
  var data = []; // console.log("--->",req.params.step)

  var time = new Date(); // console.log('/api/get-interval/...')
  // console.log("---")
  // console.log(req.params)
  // console.log(req.query.county)
  // console.log(req.query.sensorQuery)
  // console.log("---")
  // sess.username = "1"

  if (sess.username) {
    if (sess.sensorAccess != -1) {
      // return evrything that belongs to username and match county and is in a 1day time interval
      var whereQuery = "where county='" + req.query.county + "' and sensorId='" + req.query.sensorQuery + "' and time>='" + req.query.start + "' and time<'" + req.query.end + "'"; // group by
      // console.log(req.params.step)

      switch (req.params.step) {
        case '30mins':
          var groupBy = "GROUP BY time(30m) ORDER BY time DESC";
          break;

        case '10mins':
          var groupBy = "GROUP BY time(10m) ORDER BY time DESC";
          break;

        case '1mins':
          var groupBy = "GROUP BY time(1m) ORDER BY time DESC";
          break;

        case 'hourly':
          var groupBy = "GROUP BY time(1h) ORDER BY time DESC";
          break;

        case 'hourlyS':
          var groupBy = "GROUP BY time(2h) ORDER BY time DESC";
          break;

        case 'daily':
          var groupBy = "GROUP BY time(1d) ORDER BY time DESC";
          break;

        case 'dailyS':
          var groupBy = "GROUP BY time(1w) ORDER BY time DESC";
          break;

        default:
          var groupBy = "GROUP BY time(1h) ORDER BY time DESC";
      } // check what sensor type for the user
      // var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` ` + groupBy + ` `
      // check what sensor type for the user


      var influxQuery = "select mean(value) as value from sensors " + whereQuery + " " + groupBy + " "; // console.log(influxQuery)
    } else {} // work in progress
      // var whereQuery = `where county='` + req.params.county + `' and time>='` + today + `' and time<now()`
      // var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
      // // check what sensor type for the user
      // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
      // console.log(influxQuery)
      // console.log(influxQuery)


    var resultInfluxDb = influxReader(influxQuery).then(function (result) {
      if (result.length) {
        data.push({
          error: false,
          message: "Data found",
          county: req.query.county,
          sensorQueried: req.query.sensorQuery,
          start: req.query.start,
          end: req.query.end,
          step: req.params.step,
          // sensorType: result[0].type,
          // sensorLive: result[0].live,
          sensorReadings: result.length,
          user: sess.username,
          query: influxQuery,
          sensorAverage: [],
          responseTime: new Date() - time + "ms"
        }); // var sensorType = false

        for (var i = 0; i < result.length; i++) {
          data[0].sensorAverage.push({
            sensorValue: result[i].value,
            sensorTime: result[i].time,
            sensorType: result[i].type
          }); // if (result[i].type != null && sensorType == false) {
          //     data[0].push({
          //         sensorType: result[i].type
          //     })
          //     sensorType = true
          // }
        }
      } else {
        data.push({
          error: true,
          message: "No data found",
          county: req.query.county,
          sensorQueried: req.query.sensorQuery,
          start: req.query.start,
          end: req.query.end,
          sensorReadings: result.length,
          user: sess.username,
          query: influxQuery
        });
      }

      return data;
    }).then(function (result) {
      res.status(200).send(result);
    }).catch(function (e) {
      res.status(404).send("Scraping sensor data from influx failed");
    });
  } else {
    data.push({
      error: "you are not logged in"
    });
    res.status(403).send(data);
  }
}); // API for python
// get images for mail

app.get("/graficMail", function (req, res) {
  //use the url to parse the requested url and get the image name
  var query = url.parse(req.url, true).query;
  var pic = query.image; //read the image using fs and send the image content back in the response

  fs.readFile('/root/Applications/IoT-Platform/public/images/graficMail/' + pic, function (err, content) {
    if (err) {
      res.writeHead(400, {
        'Content-type': 'text/html'
      }); // console.log(err);

      res.end("No such image");
    } else {
      //specify the content type in the response will be an image
      res.writeHead(200, {
        'Content-type': 'image/jpg'
      });
      res.end(content);
    }
  });
}); // get counties of user

app.get('/api/:username/get-counties', function (req, res) {
  var time = new Date();
  var data = [];
  var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + req.params.username + "')";
  var counties = influxReader(queryCounties).then(function _callee14(result) {
    var counties, i;
    return regeneratorRuntime.async(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            counties = [];

            for (i = 0; i < result.length; i++) {
              counties.push(result[i].county);
            }

            _context14.next = 4;
            return regeneratorRuntime.awrap(counties);

          case 4:
            return _context14.abrupt("return", _context14.sent);

          case 5:
          case "end":
            return _context14.stop();
        }
      }
    });
  });
  var cities = [0];
  var locations = [0];
  var zones = [0]; // ================ END ================

  Promise.all([counties, cities, locations, zones]).then(function (result) {
    // console.log("promise all", new Date() - time)
    // build the output
    if (result[0].length && result[1].length && result[2].length && result[3].length) {
      // console.log("promise all push", new Date() - time)
      data.push({
        error: false,
        message: "Data found",
        user: req.params.username,
        countiesCounter: result[0].length,
        counties: result[0].length ? result[0] : "No county found",
        responseTime: new Date() - time + "ms"
      }); // console.log("promise all push done", new Date() - time)
    } else {
      data.push({
        error: true,
        message: "No data found for this user",
        user: req.params.username
      });
    } // send the data


    res.status(200).send(data);
  }).catch(function (error) {
    return console.log("Error in promises ".concat(error));
  });
}); // get sensors

app.get('/api/:username/:county/get-sensors', function (req, res) {
  var time = new Date();
  var data = []; // return evrything that belongs to username and match county and is in a 1day time interval

  var whereQuery = "where username='" + req.params.username + "' and county='" + req.params.county + "'"; // check what sensor type for the user

  var influxQuery = "select distinct(sensorId) as sensorId from ( select sensorId, value from sensors " + whereQuery + " )";
  var sensorsData = influxReader(influxQuery).then(function (result) {
    // console.log("after fetch", new Date() - time)
    // get sensor type
    // var sensorTypeList = []
    var sensorIdList = []; // var sensorIdListAux = []

    for (var i = 0; i < result.length; i++) {
      sensorIdList.push(result[i].sensorId);
    } // build the output


    if (result.length) {
      data.push({
        error: false,
        message: "Data found",
        county: req.params.county,
        user: req.params.username,
        sensorIdListLength: sensorIdList.length,
        sensorIdList: sensorIdList,
        responseTime: new Date() - time + "ms"
      });
    } else {
      data.push({
        error: true,
        message: "No data found",
        county: req.params.county,
        length: result.length,
        user: req.params.username,
        responseTime: new Date() - time + "ms"
      });
    } // send the output


    res.status(200).send(data);
  }).catch(function (e) {
    res.status(404).send("Scraping sensorId data from influx failed", e);
  });
}); // get last value

app.get('/api/:sensor/get-value', function (req, res) {
  var time = new Date();
  var data = [];
  var whereQuery = "where sensorId='" + req.params.sensor + "'";
  var influxQuery = "select last(value) as value, username, country, county, city, zone from sensors " + whereQuery + " ORDER BY time DESC LIMIT 1"; // console.log(influxQuery)

  var resultInfluxDb = influxReader(influxQuery).then(function (result) {
    // console.log(result)
    if (result.length) {
      data.push({
        error: false,
        message: "Data found",
        sensorQueried: req.params.sensor,
        country: result[0].country,
        county: result[0].county,
        city: result[0].city,
        zone: result[0].zone,
        username: result[0].username,
        lastValue: {
          value: result[0].value,
          time: result[0].time
        },
        responseTime: new Date() - time + "ms"
      });
    } else {
      data.push({
        error: true,
        message: "No data found",
        sensorQueried: req.params.sensor,
        lastValue: result,
        responseTime: new Date() - time + "ms"
      });
    }

    return data;
  }).then(function (result) {
    res.status(200).send(result);
  }).catch(function (e) {
    res.status(404).send("Scraping sensor data from influx failed");
  });
}); // get last value for a list of sensors or for a single sensor

app.get('/api/get-last-value', function (req, res) {
  var time = new Date();
  var data = [];
  if (req.query.sensorId) var influxQuery = "select last(value), county, country, city, location, zone, username, sensorId, type from sensors where sensorId='" + req.query.sensorId + "'";else if (req.query.sensorIdList) {
    var whereQuery = '';
    sensorId = '` + req.query.sensorId + `';
    var sensorListCounter = 0;
    var list = req.query.sensorIdList.split(',');
    list.forEach(function (sensorId) {
      whereQuery += "sensorId='" + sensorId + "'";
      sensorListCounter++;

      if (sensorListCounter < list.length) {
        whereQuery += " or ";
      }
    });
    var influxQuery = "select last(value), county, country, city, location, zone, username, sensorId, type from sensors where (" + whereQuery + ") group by sensorId"; // res.send(influxQuery)
  }
  var resultInfluxDb = influxReader(influxQuery).then(function (result) {
    if (result.length) {
      var sensorCounter = 0;
      result.forEach(function (sensor) {
        data.push({
          sensorIndex: sensorCounter++,
          sensorQueried: sensor.sensorId,
          type: sensor.type,
          country: sensor.country,
          county: sensor.county,
          city: sensor.city,
          zone: sensor.zone,
          username: sensor.username,
          value: sensor.last,
          time: sensor.time,
          responseTime: new Date() - time + "ms"
        });
      });
    } else {
      data.push({
        error: true,
        message: "No data found",
        lastValue: result,
        responseTime: new Date() - time + "ms"
      });
    }

    return data;
  }).then(function (result) {
    res.status(200).send(result);
  }).catch(function (e) {
    res.status(404).send("Scraping sensor data from influx failed");
  });
}); // get avg on last 10 min and compare with limits

app.get('/api/v2/sensors-alert', function _callee15(req, res) {
  var time, sqlQuery, getMysqlAlerts, json, sensorToWatch, whereQuery, counter, today, timeStart, influxQuery, resultInfluxDb;
  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          // console.log(req.url)
          time = new Date(); // var data = []

          sqlQuery = "select * from alerts";
          getMysqlAlerts = mysqlReader(sqlQuery);
          _context15.next = 5;
          return regeneratorRuntime.awrap(getMysqlAlerts);

        case 5:
          json = _context15.sent;
          sensorToWatch = [];
          whereQuery = '';
          counter = 0;
          json.forEach(function (sensor) {
            sensorToWatch.push({
              sensorId: sensor.sensorId,
              min: sensor.min,
              max: sensor.max
            });
            whereQuery += 'sensorId=\'' + sensor.sensorId + '\' ';
            if (counter < json.length - 1) whereQuery += 'or ';
            counter++;
          }); // Get the date

          today = new Date();
          timeStart = new Date(today.getTime() - 10 * 60000); // var timeStart = String(timeStart).split(" ")

          timeStart = timeStart.valueOf(); // console.log(today, timeStart)
          // var influxQuery = `select mean(value), last(county) as county, last(country) as country, last(city) as city, last(location) as location, last(zone) as zone, last(username) as username, last(sensorId) as sensorId, last(type) as type, last(time) as time from (select * from sensors where (` + whereQuery + `) and time>`+timeStart+` and time<now()) group by sensorId, username order by time desc`

          influxQuery = "select country, county, city, location, zone, type, sensorId, username, value from sensors where (" + whereQuery + ") and (time > now()-5s and time < now()) group by sensorId,username order by time desc limit 600"; // console.log(influxQuery)

          resultInfluxDb = influxReader(influxQuery).then(function (result) {
            var alertList = [];
            var alertListMin = [];
            var alertListMax = [];
            var data = [];
            var graph = [];
            var sensorIndex = 0;

            if (result.length) {
              var sensorCounter = 0;
              result.forEach(function (sensor) {
                var sensorAlertFlag = false;
                var max = 0;
                var min = 0; // console.log(sensor)
                // graph.push(sensor.value)
                // graph = []

                sensorToWatch.forEach(function (watch) {
                  if (sensor.sensorId == watch.sensorId) {
                    // graph.push([sensor.time, sensor.value])
                    if (sensor.value < watch.min && !alertListMin.includes(sensor.sensorId)) {
                      data.push({
                        sensorIndex: sensorCounter++,
                        sensorQueried: sensor.sensorId,
                        type: sensor.type,
                        country: sensor.country,
                        county: sensor.county,
                        city: sensor.city.toUpperCase(),
                        zone: sensor.zone.toUpperCase(),
                        username: sensor.username,
                        min: watch.min,
                        max: watch.max,
                        mean: sensor.value,
                        alert: "min" // graph
                        // time: sensor.time,

                      }); // watch.min = sensor.value

                      alertListMin.push(sensor.sensorId); // alertList.push(sensor.sensorId)
                    }

                    if (sensor.value > watch.max && !alertListMax.includes(sensor.sensorId)) {
                      data.push({
                        sensorIndex: sensorCounter++,
                        sensorQueried: sensor.sensorId,
                        type: sensor.type,
                        country: sensor.country,
                        county: sensor.county,
                        city: sensor.city.toUpperCase(),
                        zone: sensor.zone.toUpperCase(),
                        username: sensor.username,
                        min: watch.min,
                        max: watch.max,
                        mean: sensor.value,
                        alert: "max" // graph
                        // time: sensor.time,

                      }); // watch.max = sensor.value

                      alertListMax.push(sensor.sensorId); // alertList.push(sensor.sensorId)
                    }
                  }
                });
              }); // insert values for email graphic
              // if we have 3 sensors in alert, each sensor will contain for all 3 sensor the last values

              result.forEach(function (sensor) {
                sensorToWatch.forEach(function (watch) {
                  if (sensor.sensorId == watch.sensorId) {
                    graph.push([sensor.sensorId, sensor.time, sensor.value]);
                    data.forEach(function (json) {
                      if (json.sensorQueried == watch.sensorId) {
                        json.graph = graph;
                      }
                    });
                  }
                });
              }); // delete duplicates created above

              data.forEach(function (sensor) {
                graph = [];
                sensor.graph.forEach(function (item) {
                  if (item[0] == sensor.sensorQueried) {
                    graph.push({
                      time: item[1],
                      value: item[2]
                    });
                  }
                });
                sensor.graph = graph;
              });
            } else {
              data.push({
                error: true,
                message: "No data found",
                responseTime: new Date() - time + "ms"
              });
            }

            return data;
          }).then(function (result) {
            res.status(200).send(result);
          }).catch(function (e) {
            res.status(404).send("Scraping sensor data from influx failed");
          });

        case 15:
        case "end":
          return _context15.stop();
      }
    }
  });
}); //=========================================
// END - API Get Data From Different Zones
// Sensor Settings
//=========================================
// Device makes a get request to /api/sensor-config?get=1 to get a new configuration
// When device received the configuration it makes a new get request to /api/sensor-config?ack=sensorid with ack param = with sensorId previously received
// When ack param received, store that sensorId in database
// And next time when api is called it will return a new sensorId
// [ ] TODO: store sensors in database

var sensorIncrement = 1;
app.get('/api/sensor-config', function (req, res) {
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function getId() {
    var id = sensorIncrement;
    return pad(id, 3, 0);
  }

  if (req.query.get) {
    // A device wants to be alive
    var _sensorId = "DAS" + getId() + "TCORA";

    var config = {
      "network": {
        "ssid": "onef",
        "pass": "cersenin"
      },
      "server": {
        "host": "anysensor.ro",
        "port": 883
      },
      "sensor": {
        "calibration": 1,
        "interval": 1000,
        "client_id": _sensorId,
        "user_id": _sensorId,
        "user_key": "dasstecb2b"
      }
    };
    res.status(200).send(config);
  } else if (req.query.ack) {
    sensorIncrement++; // Device succesfully received the configuration. Store it in database.

    var _config = {
      message: "Sensor " + req.query.ack + " stored in database"
    };
    res.status(200).send(_config);
  } else if (req.query.inc) {
    res.status(400).send({
      inc: sensorIncrement
    });
  } else {
    res.status(400).send({
      error: "no parameters received",
      get: req.query.get,
      ack: req.query.ack
    });
  }
}); // Manage Sensor API

app.get('/api/manage-sensors', authDashboard, function (req, res) {
  sess = req.session;
  var data = {};

  if (sess.sensorAccess == 0) {
    data.flag = 0;
    data.result = "You don't have any sensor attached to your account";
    res.status(200).send(data);
  } else if (sess.sensorAccess == -1) {
    data.flag = -1;
    data.result = "Superadmin - work in progress";
    res.status(200).send(data);
  } else {
    var sql = "SELECT * FROM sensors WHERE sensorId IN (" + sess.sensorAccess.join(",") + ")"; // console.log(sql)

    database.query(sql).then(function (rows) {
      data.flag = rows.length;
      data.user = sess.username;
      data.result = rows;
      res.status(200).send(data);
    });
  }
}); // Sensor Settings Update

app.post('/api/manage-sensors/update', authDashboard, function _callee16(req, res) {
  var sql;
  return regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          sess = req.session;
          form = req.body;

          if (sess.sensorAccess.includes(parseInt(form.id))) {
            sql = 'UPDATE sensors SET county="' + form.county + '", city="' + form.city + '", street="' + form.street + '", sensorName="' + form.name + '" WHERE sensorId = "' + form.id + '"';
            database.query(sql).then(function (res) {
              if (res) console.log("User", sess.username, "updated sensor", form.id);else console.log("Failed update: user", sess.username, "tried to update sensor", form.id);
            });
            req.session.message = "Update has been performed";
            res.redirect('/manage-sensors');
          } else {
            res.send('No update was made to database because sensor ID was changed');
          }

        case 3:
        case "end":
          return _context16.stop();
      }
    }
  });
}); // Manage Sensors Dashboard

app.get('/manage-sensors', authDashboard, function (req, res) {
  sess = req.session;

  if (req.session.message) {
    var data = {
      message: req.session.message,
      username: sess.username,
      user_role: sess.user_role,
      sensorId: sess.sensorId,
      user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    };
  } else {
    var data = {
      username: sess.username,
      user_role: sess.user_role,
      sensorId: sess.sensorId,
      user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    };
  }

  req.session.message = ''; // clear the message 

  res.render('manage-sensors', data);
}); // Set a new device

app.get('/set-new-device', authDashboard, function (req, res) {
  sess = req.session;
  req.session.message = 'Hi, ' + sess.username + '!';
  var data = {
    message: req.session.message,
    username: sess.username,
    user_role: sess.user_role,
    sensorId: sess.sensorId,
    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
  };
  req.session.message = ''; // console.log(data)

  res.render('set-new-device', data);
}); // Sensor Location

app.get('/api/read-location', function (req, res) {
  sess = req.session;
  if (req.query.sensorId) var query = "SELECT * FROM sensorLocation WHERE sensorId='" + req.query.sensorId + "'";else var query = "SELECT * FROM sensorLocation";
  var time = new Date();
  var sensorLocation = mysqlReader(query).then(function _callee17(rows) {
    return regeneratorRuntime.async(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return regeneratorRuntime.awrap(rows);

          case 2:
            return _context17.abrupt("return", _context17.sent);

          case 3:
          case "end":
            return _context17.stop();
        }
      }
    });
  });
  Promise.all([sensorLocation]).then(function (result) {
    res.send({
      result: result[0],
      responseTime: new Date() - time + "ms"
    });
  });
}); // Sensor Alert

app.get('/api/read-alerts', function (req, res) {
  sess = req.session;
  if (req.query.sensorId) var query = "SELECT * FROM alerts WHERE sensorId='" + req.query.sensorId + "'";else var query = "SELECT * FROM alerts";
  var time = new Date();
  var mysqlAlerts = mysqlReader(query).then(function _callee18(rows) {
    return regeneratorRuntime.async(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return regeneratorRuntime.awrap(rows);

          case 2:
            return _context18.abrupt("return", _context18.sent);

          case 3:
          case "end":
            return _context18.stop();
        }
      }
    });
  });
  Promise.all([mysqlAlerts]).then(function (result) {
    res.send({
      result: result[0],
      responseTime: new Date() - time + "ms"
    });
  });
});
app.get('/api/set-alerts', function (req, res) {
  sess = req.session; // console.log(req.query)

  var mysqlReturn = [];

  if (req.query.min || req.query.max) {
    var query = "SELECT * FROM alerts WHERE sensorId=" + req.query.sensorId;
    var mysqlResult = mysqlReader(query).then(function _callee19(rows) {
      return regeneratorRuntime.async(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return regeneratorRuntime.awrap(rows);

            case 2:
              return _context19.abrupt("return", _context19.sent);

            case 3:
            case "end":
              return _context19.stop();
          }
        }
      });
    });
    Promise.all([mysqlResult]).then(function (result) {
      var sensorExists = result[0].length;

      if (sensorExists) {
        var queryUpdate = "UPDATE alerts SET min=" + req.query.min + ", max=" + req.query.max + ", sensorType=" + req.query.sensorType + " WHERE sensorId=" + req.query.sensorId + ";";
        mysqlWriter(queryUpdate).then(function (result) {
          // io.sockets.emit('message', {
          //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
          //     send: "Alerts updated",
          //     time: new Date()
          // })
          mysqlReturn.push({
            "updateAlerts": true,
            "query": query,
            "message": result
          });

          if (!(req.query.lat || req.query.long)) {
            res.json(mysqlReturn);
          } // res.send({
          //     "update": true,
          //     "query": query,
          //     "message": result
          // })

        });
      } else {
        var query = "INSERT INTO alerts (sensorId, min, max, sensorType) VALUES (" + req.query.sensorId + ", " + req.query.min + ", " + req.query.max + ", " + req.query.sensorType + ");";
        mysqlWriter(query).then(function (result) {
          // io.sockets.emit('message', {
          //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
          //     send: "Alerts updated",
          //     time: new Date()
          // })
          mysqlReturn.push({
            "insertAlerts": true,
            "query": query,
            "message": result
          });

          if (!(req.query.lat || req.query.long)) {
            res.json(mysqlReturn);
          } // res.send({
          //     "insert": true,
          //     "query": query,
          //     "message": result
          // })

        });
      }
    }).catch(function (error) {
      mysqlReturn.push({
        error: error
      });

      if (!(req.query.lat || req.query.long)) {
        res.json(mysqlReturn);
      } // io.sockets.emit('message', {
      //     send: "Error when updating the alerts",
      //     time: new Date()
      // })

    });
  }

  if (req.query.lat || req.query.long) {
    var query = "SELECT * FROM sensorLocation WHERE sensorId=" + req.query.sensorId;

    var _mysqlResult = mysqlReader(query).then(function _callee20(rows) {
      return regeneratorRuntime.async(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return regeneratorRuntime.awrap(rows);

            case 2:
              return _context20.abrupt("return", _context20.sent);

            case 3:
            case "end":
              return _context20.stop();
          }
        }
      });
    });

    Promise.all([_mysqlResult]).then(function (result) {
      var sensorExists = result[0].length;

      if (sensorExists) {
        var queryUpdate = "UPDATE sensorLocation SET coord='" + req.query.lat + "," + req.query.long + "' WHERE sensorId=" + req.query.sensorId + ";";
        mysqlWriter(queryUpdate).then(function (result) {
          // io.sockets.emit('message', {
          //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
          //     send: "Alerts updated",
          //     time: new Date()
          // })
          mysqlReturn.push({
            "updateCoord": true,
            "query": query,
            "message": result
          });
          res.json(mysqlReturn); // res.send({
          //     "update": true,
          //     "query": query,
          //     "message": result
          // })
        });
      } else {
        var query = "INSERT INTO sensorLocation (sensorId, coord) VALUES (" + req.query.sensorId + ", '" + req.query.lat + "," + req.query.long + "');";
        mysqlWriter(query).then(function (result) {
          // io.sockets.emit('message', {
          //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
          //     send: "Alerts updated",
          //     time: new Date()
          // })
          mysqlReturn.push({
            "insertCoord": true,
            "query": query,
            "message": result
          });
          res.json(mysqlReturn); // res.send({
          //     "insert": true,
          //     "query": query,
          //     "message": result
          // })
        });
      }
    }).catch(function (error) {
      // console.error(`Error in promises ${error}`)
      mysqlReturn.push({
        error: error
      });
      res.json(mysqlReturn); // io.sockets.emit('message', {
      //     send: "Error when updating the alerts",
      //     time: new Date()
      // })
    });
  }
}); // End Sensor Alert
//=========================================
// END - Sensor Settings
// Settings Page
//=========================================
// Get all users with the same company

app.get('/api/get-team', function (req, res) {
  sess = req.session;

  if (sess.role == "superadmin") {
    mysqlReader("select name, username, email, company from users where company = (select company from users where username='" + sess.username + "');").then(function (result) {
      res.status(200).send(result);
    });
  } else {
    res.status(401).send("You are not logged in!");
  }
});
app.post('/api/create-admin', function (req, res) {
  sess = req.session;

  if (sess.role = "superadmin") {
    var _req$body = req.body,
        name = _req$body.name,
        _username = _req$body.username,
        email = _req$body.email,
        company = _req$body.company,
        password = _req$body.password; // console.log(name,
    //     username,
    //     email,
    //     company,
    //     password)
    // password do not match
    // if (password != passwordConfirm) {
    //     return res.status(412).send("Passwords do not match!")
    // }
    // all fields required
    // const allField = allTrue({
    //     name,
    //     username,
    //     email,
    //     company,
    //     password,
    //     passwordConfirm
    // })
    // if (!allField) {
    //     return res.status(412).send("All fields are required!")
    // }

    var checkUsername = mysqlReader("SELECT username FROM users WHERE username='" + _username + "'"); // const checkCompany = mysqlReader("SELECT company FROM users WHERE company='" + company + "'")

    Promise.all([checkUsername]).then(function _callee21(result, err) {
      var hashedPassword, credentials;
      return regeneratorRuntime.async(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              if (!err) {
                _context21.next = 4;
                break;
              }

              return _context21.abrupt("return", res.status(412).send("Try again!"));

            case 4:
              if (!result[0].length) {
                _context21.next = 8;
                break;
              }

              return _context21.abrupt("return", res.status(412).send("Username is already used!"));

            case 8:
              _context21.next = 10;
              return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

            case 10:
              hashedPassword = _context21.sent;
              //register the user into db
              credentials = {
                name: name,
                username: _username,
                email: email,
                company: company,
                password: hashedPassword,
                role: 'admin'
              };
              db.query("INSERT INTO users SET ?", credentials, function (err, result) {
                if (err) return res.status(412).send("Try again!");else {
                  // console.log("New user registration")
                  return res.status(200).send("User registered!");
                }
              });

            case 13:
            case "end":
              return _context21.stop();
          }
        }
      });
    });
  }
}); // Get distinct locations for sensors that belong to company of superadmin

app.get('/api/get-zones', function (req, res) {
  sess = req.session; // console.log(sess.userData)

  if (sess.role == "superadmin") {
    // It returns a list of locations and users associated with that location
    var getZonesAndUserList = mysqlReader("select locations.*, GROUP_CONCAT(users.username) as usersList\n            from sensors\n            join locations on locations.zoneId = sensors.zoneId\n            join userAccess on sensors.sensorId = userAccess.sensorId\n            join users on users.company = '" + sess.company + "' and users.username = userAccess.username\n            group by sensors.zoneId;"); // It returns a list of locations created by a user

    var getZones = mysqlReader("select * from locations where createdBy='" + sess.company + "'");
    Promise.all([getZonesAndUserList, getZones]).then(function (result) {
      // console.log(result[0].length, result[0])
      res.status(200).send(result);
    });
  } else if (sess.role == "admin") {
    // It returns a list of locations and users associated with that location
    // let getZonesAndUserList = mysqlReader(`select locations.*
    //     from sensors
    //     join locations on locations.zoneId = sensors.zoneId
    //     join users on users.company = '`+ sess.company + `' and users.username = `+sess.username+`
    //     group by sensors.zoneId;`)
    // let getZonesAndUserList = sess.userData
    // It returns a list of locations created by a user
    // let getZones = mysqlReader(`select * from locations where createdBy='` + sess.company + `'`)
    var _getZones = sess.userData;
    Promise.all([_getZones]).then(function (result) {
      // console.log(result[0].length, result[0])
      res.status(200).send(result);
    }); // res.status(200).send(undefined)
  } else {
    res.status(401).send("You are not logged in!");
  }
}); // Route active for settings page - edit zone form

app.post('/api/edit-zone', authDashboard, function _callee23(req, res) {
  var form;
  return regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          sess = req.session;
          form = new formidable.IncomingForm();
          form.parse(req, function _callee22(err, fields, files) {
            var zoneid, location1, location2, location3, map, userList, getSensorList, finalSensorList, dropUserAccess, userListFinal, key, valuesToInsert, grantUserAccess, _grantUserAccess;

            return regeneratorRuntime.async(function _callee22$(_context22) {
              while (1) {
                switch (_context22.prev = _context22.next) {
                  case 0:
                    // console.log(fields)
                    // Get username list raw
                    zoneid = fields.zoneid, location1 = fields.location1, location2 = fields.location2, location3 = fields.location3, map = fields.map, userList = _objectWithoutProperties(fields, ["zoneid", "location1", "location2", "location3", "map"]); // console.log(fields.zoneid, userList)
                    // Get all sensors in a zoneId

                    _context22.next = 3;
                    return regeneratorRuntime.awrap(mysqlReader("select group_concat(sensors.sensorId) as sensorId from sensors where sensors.zoneId = " + fields.zoneid));

                  case 3:
                    getSensorList = _context22.sent;
                    // [ ] TODO: each zone MUST be associated with a sensorId, otherwise there will be problem with assigantion of user @ that zone
                    finalSensorList = '';
                    getSensorList[0].sensorId.split(',').forEach(function (item, index) {
                      finalSensorList += "'" + item + "'";
                      if (index != getSensorList[0].sensorId.split(',').length - 1) finalSensorList += ',';
                    }); // Drop all access for sensors in this zone

                    if (!(sess.role == 'superadmin')) {
                      _context22.next = 12;
                      break;
                    }

                    _context22.next = 9;
                    return regeneratorRuntime.awrap(mysqlReader("delete from userAccess where sensorId IN (" + finalSensorList + ")"));

                  case 9:
                    dropUserAccess = _context22.sent;
                    _context22.next = 13;
                    break;

                  case 12:
                    if (sess.role == 'admin') dropUserAccess = true;

                  case 13:
                    // Get user list
                    userListFinal = [];

                    for (key in userList) {
                      userListFinal.push(userList[key]);
                    } // Prepare values for sql query: ('DAS008TCORA','alex.barbu3'),('DAS008TCORA','alex.barbu2')


                    valuesToInsert = function valuesToInsert() {
                      var returnRaw = "";
                      userListFinal.forEach(function (user, index) {
                        getSensorList[0].sensorId.split(',').forEach(function (itemSensor, indexSensor) {
                          returnRaw += "('" + itemSensor + "','" + user + "')";
                          returnRaw += ',';
                        });
                      });
                      returnRaw = returnRaw.substring(0, returnRaw.length - 1);
                      return returnRaw;
                    }; // if there are user to give access for => grant access for them
                    // if leave sensor access dropped from above


                    if (!valuesToInsert()) {
                      _context22.next = 26;
                      break;
                    }

                    if (!(sess.role == 'superadmin')) {
                      _context22.next = 23;
                      break;
                    }

                    _context22.next = 20;
                    return regeneratorRuntime.awrap(mysqlReader("insert into userAccess (sensorId, username) VALUES " + valuesToInsert()));

                  case 20:
                    _grantUserAccess = _context22.sent;
                    _context22.next = 24;
                    break;

                  case 23:
                    if (sess.role == 'admin') _grantUserAccess = true;

                  case 24:
                    _context22.next = 27;
                    break;

                  case 26:
                    grantUserAccess = true;

                  case 27:
                    Promise.all([dropUserAccess, grantUserAccess]).then(function (result) {
                      // console.log("PROMISE ALL", fields)
                      if (fields.map == 'custom') {
                        if (files.mapimage.size) {
                          // Get tmp path
                          var oldpath = files.mapimage.path; // Build path of image

                          var filename = files.mapimage.name.toLowerCase().split('.');
                          var asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
                          var date = new Date();
                          filename = date.getTime() + '_' + asciiStr + '.' + filename[1];
                          var newpath = './public/images/custom-maps/' + filename; // Save image

                          fs.rename(oldpath, newpath, function (err) {
                            if (err) res.status(404).send({
                              error: err
                            });else {
                              mysqlReader("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.zoneid + "").then(function (result) {
                                res.redirect("/settings");
                              }).catch(function (err) {
                                res.status(200).send({
                                  error: err
                                });
                              });
                            }
                          });
                        } else {
                          var hasImageSetted = false;

                          if (hasImageSetted) {// console.log("Map has the same image")
                          } else {
                            mysqlReader("UPDATE locations SET map='custom' where zoneId=" + fields.zoneid + "").then(function (result) {
                              res.redirect("/settings");
                            }).catch(function (err) {
                              res.status(200).send({
                                error: err
                              });
                            });
                          }
                        }
                      } else if (fields.map == 'ol') {
                        mysqlReader("UPDATE locations SET map='ol' where zoneId=" + fields.zoneid + "").then(function (result) {
                          res.redirect("/settings");
                        }).catch(function (err) {
                          res.status(400).send({
                            error: err
                          });
                        });
                      } else {
                        // console.log("No map selected")
                        res.redirect("/settings"); // mysqlReader("UPDATE locations SET map='NULL' where zoneId=" + fields.zoneid + "").then((result) => {
                        //     res.redirect("/settings")
                        // }).catch((err) => {
                        //     res.status(200).send({ error: err });
                        // })
                      }
                    });

                  case 28:
                  case "end":
                    return _context22.stop();
                }
              }
            });
          });

        case 3:
        case "end":
          return _context23.stop();
      }
    }
  });
});
app.post('/api/update-map', function _callee24(req, res) {
  var body, hasAccess, hasUserAccess;
  return regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          sess = req.session;
          body = req.body;

          if (!(sess.role == 'superadmin')) {
            _context24.next = 13;
            break;
          }

          // [*] check if user has access to map id
          hasAccess = mysqlReader("select locations.zoneId from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');").then(function (result) {
            return result.some(function (el) {
              return el.zoneId == body.id;
            });
          }).then(function (access) {
            return access;
          }); // [ ] perform the update
          // console.log(await hasAccess)

          _context24.next = 6;
          return regeneratorRuntime.awrap(hasAccess);

        case 6:
          if (!_context24.sent) {
            _context24.next = 10;
            break;
          }

          mysqlReader("UPDATE locations SET map='" + body.map + "' where zoneId=" + body.id + "").then(function () {
            res.status(200).send({
              message: "updated",
              error: false
            });
          });
          _context24.next = 11;
          break;

        case 10:
          res.status(403).send({
            message: "use has not access",
            error: true
          });

        case 11:
          _context24.next = 17;
          break;

        case 13:
          if (!sess.username) {
            _context24.next = 17;
            break;
          }

          _context24.next = 16;
          return regeneratorRuntime.awrap(mysqlReader("select locations.zoneId from locations inner join sensors on sensors.zoneId = locations.zoneId inner join userAccess on (userAccess.sensorId = sensors.sensorId and userAccess.username = '" + sess.username + "');"));

        case 16:
          hasUserAccess = _context24.sent;

        case 17:
        case "end":
          return _context24.stop();
      }
    }
  });
});
app.post('/api/upload-image', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // console.log(fields, files)
    var oldpath = files.map.path; // Build path of image

    var filename = files.map.name.toLowerCase().split('.');
    var asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
    var date = new Date();
    filename = date.getTime() + '_' + asciiStr + '.' + filename[1];
    var newpath = './public/images/custom-maps/' + filename; // console.log(fields.id, oldpath, newpath)
    // Save image

    fs.rename(oldpath, newpath, function (err) {
      if (err) res.status(404).send({
        error: err
      });else {
        mysqlReader("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.id + "").then(function (result) {
          // res.status(200).send({ error: false });
          res.redirect('/map?id=' + fields.id);
        }).catch(function (err) {
          res.status(200).send({
            error: err
          });
        });
      }
    });
  }); // console.log(req.body)
});
app.post('/api/v2/upload-image', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var reader = new FileReader(fields.userfile);
    console.log(reader);
    console.log(fields, files);
    var oldpath = files.map.path; // Build path of image

    var filename = files.map.name.toLowerCase().split('.');
    var asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
    var date = new Date();
    filename = date.getTime() + '_' + asciiStr + '.' + filename[1];
    var newpath = './public/images/custom-maps/' + filename; // Save image

    fs.rename(oldpath, newpath, function (err) {
      if (err) res.status(404).send({
        "href": fields.href
      });else {
        console.log("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.id + "");
        res.status(200).send({
          "href": fields.href
        }); // mysqlReader().then((result) => {
        //     res.status(200).send({ error: false });
        // }).catch((err) => {
        //     res.status(200).send({ error: err });
        // })
      }
    });
  });
}); // Mysql interface

app.get('/api/mysql', function _callee25(req, res) {
  return regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          mysqlReader(req.query.q).then(function (result) {
            res.status(200).send(result);
          });

        case 1:
        case "end":
          return _context25.stop();
      }
    }
  });
}); //=========================================
// END Settings Page
// Team Page
//=========================================

app.get('/api/v2/sensors-access', function (req, res) {
  var time = new Date();
  var data = []; // console.log(req.query.username)

  if (req.query.username) {
    var query = "SELECT * FROM sensors WHERE username='" + req.query.username + "'";
    var mysqlResult = mysqlReader(query).then(function _callee26(rows) {
      return regeneratorRuntime.async(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return regeneratorRuntime.awrap(rows);

            case 2:
              return _context26.abrupt("return", _context26.sent);

            case 3:
            case "end":
              return _context26.stop();
          }
        }
      });
    });
    Promise.all([mysqlResult]).then(function (result) {
      // console.log(new Date() - time)
      if (result[0].length) {
        var sensorQuery = 'or ';
        resultCounter = 0;
        result[0].forEach(function (element) {
          if (resultCounter < result[0].length - 1) sensorQuery += "sensorId='" + element.sensorId + "' or ";else sensorQuery += "sensorId='" + element.sensorId + "'";
          resultCounter++;
        });
        var whereQuery = "username='" + req.query.username + "' " + sensorQuery + " ";
      } else {
        var whereQuery = "username='" + req.query.username + "'";
      } // var influxQuery = "select zone, username, sensorId from (select * from sensors where " + whereQuery + ") group by sensorId limit 1;"


      var influxQuery = "show series where " + whereQuery; // console.log(influxQuery)

      var influxResult = influxReader(influxQuery).then(function _callee27(result) {
        return regeneratorRuntime.async(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                _context27.next = 2;
                return regeneratorRuntime.awrap(result);

              case 2:
                return _context27.abrupt("return", _context27.sent);

              case 3:
              case "end":
                return _context27.stop();
            }
          }
        });
      });
      Promise.all([influxResult]).then(function (result) {
        result[0].forEach(function (element) {
          data.push({
            // result: element.key,
            error: false,
            query: req.query.username,
            sensorId: element.key.split(",")[5].split("=")[1],
            belongsTo: element.key.split(",")[7].split("=")[1],
            zone: element.key.split(",")[8].split("=")[1].split("\\ ").join(' '),
            county: element.key.split(",")[3].split("=")[1].split("\\ ").join(' ')
          });
        });

        if (result[0].length == 0) {
          data.push({
            error: "No zone assigned",
            query: req.query.username
          });
        }

        res.send({
          influxQuery: influxQuery,
          responseTime: new Date() - time + "ms",
          data: data
        });
      }).catch(function (error) {
        return console.log("Error in promises ".concat(error));
      });
    });
  } else {
    res.send("You forgot to write a username: example /api/sensor-access?username=demo");
  }
}); //no longer usd

app.get('/api/sensors-access', function (req, res) {
  var time = new Date();
  var data = []; // console.log(req.query.username)

  if (req.query.username) {
    var query = "SELECT * FROM sensors WHERE username='" + req.query.username + "'";
    var mysqlResult = mysqlReader(query).then(function _callee28(rows) {
      return regeneratorRuntime.async(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.next = 2;
              return regeneratorRuntime.awrap(rows);

            case 2:
              return _context28.abrupt("return", _context28.sent);

            case 3:
            case "end":
              return _context28.stop();
          }
        }
      });
    });
    Promise.all([mysqlResult]).then(function (result) {
      // console.log(new Date() - time)
      if (result[0].length) {
        var sensorQuery = 'or ';
        resultCounter = 0;
        result[0].forEach(function (element) {
          if (resultCounter < result[0].length - 1) sensorQuery += "sensorId='" + element.sensorId + "' or ";else sensorQuery += "sensorId='" + element.sensorId + "'";
          resultCounter++;
        });
        var whereQuery = "username='" + req.query.username + "' " + sensorQuery + " ";
      } else {
        var whereQuery = "username='" + req.query.username + "'";
      }

      var influxQuery = "select zone, username, sensorId from (select * from sensors where " + whereQuery + ") group by sensorId limit 1;"; // console.log(influxQuery)

      var influxResult = influxReader(influxQuery).then(function _callee29(result) {
        return regeneratorRuntime.async(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                _context29.next = 2;
                return regeneratorRuntime.awrap(result);

              case 2:
                return _context29.abrupt("return", _context29.sent);

              case 3:
              case "end":
                return _context29.stop();
            }
          }
        });
      });
      Promise.all([influxResult]).then(function (result) {
        // console.log(new Date() - time)
        // console.log(result[0])
        result[0].forEach(function (element) {
          data.push({
            zone: element.zone,
            query: req.query.username,
            belongsTo: element.username,
            sensorId: element.sensorId
          });
        });

        if (result[0].length == 0) {
          data.push({
            error: "No zone assigned",
            query: req.query.username
          });
        }

        res.send({
          influxQuery: influxQuery,
          responseTime: new Date() - time + "ms",
          data: data
        });
      }).catch(function (error) {
        return console.log("Error in promises ".concat(error));
      });
    });
  } else {
    res.send("You forgot to write a username: example /api/sensor-access?username=demo");
  }
});
app.get('/api/get-users', function (req, res) {
  var time = new Date();
  var query = "SELECT Id, Name, Username, Email, User_role, company FROM users";
  var mysqlResult = mysqlReader(query).then(function _callee30(rows) {
    return regeneratorRuntime.async(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            _context30.next = 2;
            return regeneratorRuntime.awrap(rows);

          case 2:
            return _context30.abrupt("return", _context30.sent);

          case 3:
          case "end":
            return _context30.stop();
        }
      }
    });
  });
  Promise.all([mysqlResult]).then(function (result) {
    res.send(result);
  }).catch(function (error) {
    return console.log("Error in promises ".concat(error));
  });
});
app.get('/api/edit-user', getCounties, function _callee39(req, res) {
  var influxQuery, zoneQuery, zoneCounter, sqlQuery, query, hashedPassword;
  return regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          sess = req.session; // console.log(req.url)

          if (!(req.query.password.length == 0)) {
            _context39.next = 7;
            break;
          }

          // get the sensorIds of selected zone
          if (req.query.zones) {
            // console.log(req.query.zones)
            if (typeof req.query.zones == 'string') {
              influxQuery = "show series where zone='" + req.query.zones + "' and username='" + sess.username + "'"; // console.log(influxQuery)

              influxReader(influxQuery).then(function (result) {
                return result[0].key.split("sensorId=")[1].split(",")[0];
              }).then(function _callee31(sensorId) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee31$(_context31) {
                  while (1) {
                    switch (_context31.prev = _context31.next) {
                      case 0:
                        // delete all sensor assigments of this user
                        sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
                        mysqlWriter(sqlQuery);
                        return _context31.abrupt("return", sensorId);

                      case 3:
                      case "end":
                        return _context31.stop();
                    }
                  }
                });
              }).then(function _callee32(sensorId) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee32$(_context32) {
                  while (1) {
                    switch (_context32.prev = _context32.next) {
                      case 0:
                        // insert sensorId and username into sensors mysql table 
                        sqlQuery = "INSERT INTO sensors (sensorId, username) VALUES ('" + sensorId + "', '" + req.query.username + "')";
                        mysqlWriter(sqlQuery);

                      case 2:
                      case "end":
                        return _context32.stop();
                    }
                  }
                });
              });
            } else if (_typeof(req.query.zones) == 'object') {
              zoneQuery = '';
              zoneCounter = 0;
              req.query.zones.forEach(function (zone) {
                zoneQuery += "zone='" + zone + "'";
                if (zoneCounter < req.query.zones.length - 1) zoneQuery += ' or ';
                zoneCounter++;
              });
              influxQuery = "show series where (" + zoneQuery + ") and username='" + sess.username + "'"; // console.log(influxQuery)

              influxReader(influxQuery).then(function (result) {
                var sensorsList = []; // console.log(result)

                result.forEach(function (series) {
                  sensorsList.push(series.key.split("sensorId=")[1].split(",")[0]);
                });
                return sensorsList;
              }).then(function _callee33(sensorsList) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee33$(_context33) {
                  while (1) {
                    switch (_context33.prev = _context33.next) {
                      case 0:
                        // delete all assigments of this user
                        sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
                        mysqlWriter(sqlQuery);
                        return _context33.abrupt("return", sensorsList);

                      case 3:
                      case "end":
                        return _context33.stop();
                    }
                  }
                });
              }).then(function _callee34(sensorsList) {
                return regeneratorRuntime.async(function _callee34$(_context34) {
                  while (1) {
                    switch (_context34.prev = _context34.next) {
                      case 0:
                        // insert sensorId and username into sensors mysql table 
                        sensorsList.forEach(function (sensorId) {
                          var sqlQuery = "INSERT INTO sensors (sensorId, username) VALUES ('" + sensorId + "', '" + req.query.username + "')";
                          mysqlWriter(sqlQuery);
                        }); // res.redirect('/team')

                      case 1:
                      case "end":
                        return _context34.stop();
                    }
                  }
                });
              });
            }
          } else {
            // if no zone selected - delete all zones assigned to this user
            sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
            mysqlWriter(sqlQuery); // res.redirect('/team')
          }

          query = "UPDATE users SET Name='" + req.query.name + "', Username='" + req.query.username + "', Email='" + req.query.email + "' WHERE Id='" + req.query.id + "';";
          mysqlWriter(query).then(function (response) {
            res.redirect("/team"); // res.send({
            //     sql: req.query,
            //     influxQuery,
            //     username: sess.username,
            //     url: req.url
            // })
          }).catch(function (err) {
            res.send(err);
          });
          _context39.next = 14;
          break;

        case 7:
          // get the sensorIds of selected zone
          if (req.query.zones) {
            // console.log(typeof req.query.zones)
            if (typeof req.query.zones == 'string') {
              influxQuery = "show series where username='" + sess.username + "' and zone='" + req.query.zones + "'";
              influxReader(influxQuery).then(function (result) {
                return result[0].key.split("sensorId=")[1].split(",")[0];
              }).then(function _callee35(sensorId) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee35$(_context35) {
                  while (1) {
                    switch (_context35.prev = _context35.next) {
                      case 0:
                        // delete all assigments of this user
                        sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
                        mysqlWriter(sqlQuery);
                        return _context35.abrupt("return", sensorId);

                      case 3:
                      case "end":
                        return _context35.stop();
                    }
                  }
                });
              }).then(function _callee36(sensorId) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee36$(_context36) {
                  while (1) {
                    switch (_context36.prev = _context36.next) {
                      case 0:
                        // console
                        // insert sensorId and username into sensors mysql table 
                        sqlQuery = "INSERT INTO sensors (sensorId, username) VALUES ('" + sensorId + "', '" + req.query.username + "')";
                        mysqlWriter(sqlQuery); // res.redirect('/team')

                      case 2:
                      case "end":
                        return _context36.stop();
                    }
                  }
                });
              });
            } else if (_typeof(req.query.zones) == 'object') {
              zoneQuery = '';
              zoneCounter = 0;
              req.query.zones.forEach(function (zone) {
                zoneQuery += "zone='" + zone + "'";
                if (zoneCounter < req.query.zones.length - 1) zoneQuery += ' or ';
                zoneCounter++;
              });
              influxQuery = "show series where username='" + sess.username + "' and (" + zoneQuery + ")"; // console.log(influxQuery)

              influxReader(influxQuery).then(function (result) {
                var sensorsList = []; // console.log(result)

                result.forEach(function (series) {
                  sensorsList.push(series.key.split("sensorId=")[1].split(",")[0]);
                });
                return sensorsList;
              }).then(function _callee37(sensorsList) {
                var sqlQuery;
                return regeneratorRuntime.async(function _callee37$(_context37) {
                  while (1) {
                    switch (_context37.prev = _context37.next) {
                      case 0:
                        // delete all assigments of this user
                        sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
                        mysqlWriter(sqlQuery);
                        return _context37.abrupt("return", sensorsList);

                      case 3:
                      case "end":
                        return _context37.stop();
                    }
                  }
                });
              }).then(function _callee38(sensorsList) {
                return regeneratorRuntime.async(function _callee38$(_context38) {
                  while (1) {
                    switch (_context38.prev = _context38.next) {
                      case 0:
                        // insert sensorId and username into sensors mysql table 
                        sensorsList.forEach(function (sensorId) {
                          var sqlQuery = "INSERT INTO sensors (sensorId, username) VALUES ('" + sensorId + "', '" + req.query.username + "')";
                          mysqlWriter(sqlQuery);
                        }); // res.redirect('/team')

                      case 1:
                      case "end":
                        return _context38.stop();
                    }
                  }
                });
              });
            }
          } else {
            // if no zone selected - delete all zones assigned to this user
            sqlQuery = "DELETE FROM sensors WHERE username='" + req.query.username + "'";
            mysqlWriter(sqlQuery); // res.redirect('/team')
          } // encrypt the password


          _context39.next = 10;
          return regeneratorRuntime.awrap(bcrypt.hash(req.query.password, 10));

        case 10:
          hashedPassword = _context39.sent;
          // update the table
          query = "UPDATE users SET Name='" + req.query.name + "', Username='" + req.query.username + "', Email='" + req.query.email + "', Password='" + hashedPassword + "' WHERE Id='" + req.query.id + "';";
          mysqlWriter(query);
          res.redirect("/team"); // res.send([query, req.query.password, hashedPassword])

        case 14:
        case "end":
          return _context39.stop();
      }
    }
  });
});
app.get('/api/add-user', function (req, res) {
  sess = req.session;

  if (sess.username) {
    // console.log(req.query)
    var sql = "SELECT Username from users where username='" + req.query.username + "'";
    mysqlReader(sql).then(function _callee40(response) {
      var hashedPassword, sql;
      return regeneratorRuntime.async(function _callee40$(_context40) {
        while (1) {
          switch (_context40.prev = _context40.next) {
            case 0:
              if (!response.length) {
                _context40.next = 4;
                break;
              }

              res.send({
                error: "username already exists"
              });
              _context40.next = 9;
              break;

            case 4:
              _context40.next = 6;
              return regeneratorRuntime.awrap(bcrypt.hash(req.query.password, 10));

            case 6:
              hashedPassword = _context40.sent;
              sql = "INSERT INTO users (Name, Username, Password, Email, User_role, company) VALUES ('" + req.query.name + "','" + req.query.username + "','" + hashedPassword + "','" + req.query.email + "','basic','" + req.query.company + "');";
              mysqlReader(sql);

            case 9:
            case "end":
              return _context40.stop();
          }
        }
      });
    });
    res.redirect("/team");
  } else {
    res.render("login", {
      alert: "Username `" + username + "` is not registered!"
    });
  }
}); // Active route for settings page

app.post('/api/remove-user', function _callee41(req, res) {
  var queryGetSensorId, getSensorId;
  return regeneratorRuntime.async(function _callee41$(_context41) {
    while (1) {
      switch (_context41.prev = _context41.next) {
        case 0:
          queryGetSensorId = "select sensorId from userAccess where username='" + req.body.username + "'";
          _context41.next = 3;
          return regeneratorRuntime.awrap(mysqlReader(queryGetSensorId).then(function (result) {
            if (result.length) result.forEach(function (sensor) {
              var queryRemoveUserAccess = "delete from userAccess where username='" + req.body.username + "'";
              mysqlReader(queryRemoveUserAccess).then(function (result) {
                var queryRemoveSensor = "delete from sensors where sensorId='" + sensor.sensorId + "'";
                mysqlReader(queryRemoveSensor);
                var queryRemoveUser = "delete from users where username='" + req.body.username + "'";
                mysqlReader(queryRemoveUser);
              });
            });else {
              var queryRemoveUser = "delete from users where username='" + req.body.username + "'";
              mysqlReader(queryRemoveUser);
            }
          }));

        case 3:
          getSensorId = _context41.sent;
          Promise.all([getSensorId]).then(function (result) {
            // res.redirect('/settings')
            res.status(200).send(result);
          }).catch(function (err) {
            // console.log(err)
            res.status(500).send(err);
          }); // const queryRemoveSensors = `delete from sensors where username='` + req.query.username + `'`
          // let removeSensors = await mysqlReader(queryRemoveSensors)
          // Promise.all([removeUser, removeSensors]).then((response) => {
          //     console.log(response)
          // })
          // res.redirect('/team')

        case 5:
        case "end":
          return _context41.stop();
      }
    }
  });
});
app.get('/team', cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, function (req, res) {
  sess = req.session;
  res.render("team", {
    username: sess.username,
    role: sess.role,
    userData: sess.userData
  });
}); //=========================================
// End Team Page
// Scale, Conveyor, Scanner API
//=========================================

app.get("/api/conveyor", function (req, res) {
  if (req.query.setStatus) {
    var status = req.query.setStatus == 'off' ? 0 : 1;
    mysqlReader("INSERT INTO conveyor_noriel (status) VALUES (" + status + ")").then(function (result) {
      res.send(result);
    });
  } else {
    var statusConveyor = mysqlReader("select * from conveyor_noriel order by timestamp desc limit 1").then(function _callee42(rows) {
      return regeneratorRuntime.async(function _callee42$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              _context42.t0 = res;
              _context42.next = 3;
              return regeneratorRuntime.awrap(rows);

            case 3:
              _context42.t1 = _context42.sent;

              _context42.t0.send.call(_context42.t0, _context42.t1);

            case 5:
            case "end":
              return _context42.stop();
          }
        }
      });
    });
  }
});
app.get("/api/get-voltage", function (req, res) {
  // example: /api/get-voltage?source1&source2
  sess = req.session;
  var time = new Date();
  var data = [];

  if ("source1" in req.query && "source2" in req.query) {
    var influxQuery = "select last(value), county, country, city, location, zone, username, sensorId, type from sensors where username='" + sess.username + "' and (sensorId =~ /source1*/ or sensorId =~ /source2*/) group by sensorId order by time desc";
  } else if ("source1" in req.query) {
    var influxQuery = "select last(value), county, country, city, location, zone, username, sensorId, type from sensors where username='" + sess.username + "' and (sensorId =~ /source1*/) group by sensorId order by time desc";
  }

  var resultInfluxDb = influxReader(influxQuery).then(function (result) {
    if (result.length) {
      result.forEach(function (sensor) {
        data.push({
          sensorQueried: sensor.sensorId,
          type: sensor.type,
          country: sensor.country,
          county: sensor.county,
          city: sensor.city,
          zone: sensor.zone,
          username: sensor.username,
          value: sensor.last,
          time: sensor.time,
          responseTime: new Date() - time + "ms"
        });
      });
    } else {
      data.push({
        error: true,
        message: "No data found",
        influxQuery: influxQuery,
        lastValue: result,
        responseTime: new Date() - time + "ms"
      });
    }

    return data;
  }).then(function (result) {
    res.status(200).send(result);
  }).catch(function (e) {
    res.status(404).send("Scraping power source data from influx failed");
  });
}); // getting the scale recordings from mysql for logged user

app.get("/api/get-scale-recordings", function (req, res) {
  sess = req.session;

  if (sess.username) {
    if (sess.isScaleAvailable.tableExist) {
      // var query = "select * from scale_" + sess.username + " where date(timestamp) = CURDATE()"
      var query = "SELECT * FROM scale_" + sess.username + " where date(timestamp) = CURDATE()";
      mysqlReader(query).then(function (result) {
        res.send(result);
      });
    }
  }
}); // insert scale recording without login

app.get("/api/v2/send-scale-recordings", function (req, res) {
  // var sqlQuery = "INSERT INTO scale_" + req.query.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", " + req.query.wms + "); "
  var sqlQuery = "INSERT INTO scale_" + req.query.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", 0); ";
  mysqlReader(sqlQuery).then(function (result) {
    res.send({
      url: req.originalUrl,
      result: result
    });
  });
}); // insert scale recording

app.get("/api/send-scale-recordings", function (req, res) {
  sess = req.session;

  if (sess.username) {
    if (req.query.wms) {
      var sqlQuery = "INSERT INTO scale_" + sess.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", " + req.query.wms + "); ";
    } else {
      var sqlQuery = "INSERT INTO scale_" + sess.username + " (barcode, value) VALUES (" + req.query.barcode + ", " + req.query.weight + "); ";
    }

    mysqlReader(sqlQuery).then(function (result) {
      res.send({
        url: req.originalUrl,
        result: result
      });
    });
  }
}); // getting the scanner recordings from mysql for logged user

app.get("/api/get-scanner-recordings", function (req, res) {
  sess = req.session;

  if (sess.username) {
    if (sess.isScannerAvailable.tableExist) {
      mysqlReader("DELETE FROM scanner_" + sess.username + " WHERE timestamp < current_date ");
      mysqlReader("SELECT * FROM scanner_" + sess.username + " order by timestamp asc").then(function (result) {
        res.send(result);
      });
    }
  }
}); // insert scanner recordings

app.get("/api/send-scanner-recordings", function (req, res) {
  sess = req.session;

  if (sess.username) {
    mysqlReader("INSERT INTO scanner_" + sess.username + " (barcode, status) VALUES (" + req.query.barcode + ", " + req.query.status + "); ").then(function (result) {
      res.send({
        url: req.originalUrl,
        result: result
      });
    });
  }
});
app.get("/api/request-scanner-config", function (req, res) {
  sess = req.session;

  if (sess.username) {
    mysqlReader("SELECT * FROM request_" + sess.username).then(function (result) {
      res.send(result);
    }).catch(function (err) {
      res.send(err);
    });
  }
});
app.get("/api/socketio-access", function (req, res) {
  sess = req.session;
  var data = {};

  if (sess.username) {
    mysqlReader("SELECT * FROM socketioAccess").then(function (result) {
      result.forEach(function (item) {
        if (item.username == sess.username) {
          res.send({
            success: true
          });
        } else {
          res.send({
            success: false
          });
        }
      });
    }).catch(function (err) {
      res.send(err);
    });
  } else {
    res.send({
      success: false
    });
  }
}); //=========================================
// End Scale, Conveyor, Scanner API
// PROXY
//=========================================

app.post("/proxy", function (req, res) {
  axios.post(req.query.url, req.body).then(function (response) {
    console.log("url:", req.query.url);
    console.log("body:", req.body);
    console.log("response:", response.data);
    res.send(response.data);
  });
}); //=========================================
// END PROXY
// ROUTE FOR VUE
//=========================================

app.get("/api/vue/influx", function _callee43(req, res) {
  var query, result;
  return regeneratorRuntime.async(function _callee43$(_context43) {
    while (1) {
      switch (_context43.prev = _context43.next) {
        case 0:
          // console.log(req.query)
          query = req.query.query;
          _context43.next = 3;
          return regeneratorRuntime.awrap(influxReader(query));

        case 3:
          result = _context43.sent;
          res.send(result);

        case 5:
        case "end":
          return _context43.stop();
      }
    }
  });
}); //=========================================
// END ROUTE FOR VUE
// Admin Page
//=========================================

app.get("/admin", authDashboard, function _callee44(req, res) {
  return regeneratorRuntime.async(function _callee44$(_context44) {
    while (1) {
      switch (_context44.prev = _context44.next) {
        case 0:
          res.send("Admin page");

        case 1:
        case "end":
          return _context44.stop();
      }
    }
  });
}); //=========================================
// END Admin Page
// CSV

app.get("/api/csv", function (req, res) {
  var query = "select mean(value) as value from sensors where sensorId='sensor22' group by time(1d) limit 100";
  var query2 = "select time,value from sensors where sensorId='DAS001TDEMO' order by time desc limit 200";
  var query3 = "select mean(value) as value from sensors where sensorId='DAS001TDEMO' group by time(1h)";
  var result = influxReader(query3).then(function (resultQuery) {
    // res.send(resultQuery)
    var csvData = [["ds", "y"]];
    resultQuery.forEach(function (result) {
      var hour = result.time._nanoISO.split("T")[0] + " " + result.time._nanoISO.split("T")[1].split("Z")[0].split(".")[0];

      if (result.value) csvData.push([hour, result.value]);
    });
    var csvContent = "";
    csvData.forEach(function (rowArray) {
      var row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); // console.log("csvContent:", csvContent.length)

    res.send(csvContent);
  });
});
app.post('/api/v3/multi-report/hourly', function (req, res) {
  sess = req.session; // if (sess.username) {
  // console.log(req.body)

  function changeTimezone(date, ianatz) {
    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    })); // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours

    var diff = date.getTime() - invdate.getTime(); // so 12:00 in Toronto is 17:00 UTC

    return new Date(date.getTime() - diff); // needs to substract
  } // Init vars


  var today,
      year,
      month,
      hOffset,
      start,
      end,
      customDate = req.body['date[]']; // Preprocess timestamp
  // console.log(customDate)

  start = customDate[0] + ' 00:00:00';
  end = customDate[1] + ' 23:59:59'; // console.log(start,end)
  // Prepare sensor list for Influx query

  var sensors = "";
  var listOfSensorsId = req.body['listOfSensorsId[]'];
  var listOfSensorsType = req.body['listOfSensorsType[]'];
  var queryDoor;
  var queryTemperature; // Build a query for each sensorId of a type

  var sensorDataBundle = [];

  if (typeof listOfSensorsId == 'string') {
    listOfSensorsId = new Array(listOfSensorsId);
    listOfSensorsType = new Array(listOfSensorsType);
  } // Get distinct sensorTypes to build different querys


  var sensorTypes = {
    isTemperature: false,
    isDoor: false
  };

  var distinctSensorsType = _.sortedUniq(listOfSensorsType);

  distinctSensorsType.forEach(function _callee45(item, index) {
    var sensorIds, query, _query2;

    return regeneratorRuntime.async(function _callee45$(_context45) {
      while (1) {
        switch (_context45.prev = _context45.next) {
          case 0:
            // Get sensorIds of current sensorType
            sensorIds = listOfSensorsId.filter(function (id, idx) {
              if (listOfSensorsType[idx] == item) return id;
            }); // Query for DOOR

            if (item == 'door') {
              console.log(item, sensorIds);
              sensorTypes.isDoor = true; // Return how many times a door has been open or closed in an hour

              query = "select value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId order by time desc"; // Make the request

              queryDoor = influxReader(query);
            } else if (item == 'temperature') {
              // Query for TEMPERATURE
              console.log(item, sensorIds);
              sensorTypes.isTemperature = true; // Return average of temperature for each hour

              _query2 = "select mean(value) as value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId,time(1h) order by time desc"; // Make the request

              queryTemperature = influxReader(_query2);
            }

          case 2:
          case "end":
            return _context45.stop();
        }
      }
    });
  });
  var listOfPromises = [];
  if (sensorTypes.isDoor) listOfPromises.push(queryDoor);
  if (sensorTypes.isTemperature) listOfPromises.push(queryTemperature);
  Promise.all(listOfPromises).then(function (results) {
    // console.log("promise all")
    // console.log(start, end)
    // console.log("Doors:", results[0].groupRows.length)
    // Door results
    if (sensorTypes.isDoor) results[0].groupRows.forEach(function (sensor, idx) {
      // console.log("sensor:", sensor.tags.sensorId)
      // Process the result
      var oldHour, oldDay, oldMonth, oldYear;
      var hourlyOpenDoor = [];
      var hourlyOpenDoorTimer = 0;
      var dailyOpenDoor = [];
      var dailyOpenDoorBlank = [];
      var dailyOpenDoorTimer = 0; // Fill hourlyOpenDoor with all hours between start & end
      // let dayStart = start.split(" ")

      dayStart = new Date(start); // new Date() creates a date with 2 hours less than inserted

      dayStart.setTime(dayStart.getTime() - dayStart.getTimezoneOffset() * 60 * 1000); // adjust the date
      // let dayEnd = end.split(" ")

      dayEnd = new Date(end); // new Date() creates a date with 2 hours less than inserted

      dayEnd.setTime(dayEnd.getTime() - dayEnd.getTimezoneOffset() * 60 * 1000); // adjust the date

      console.log(dayStart, dayEnd);

      for (var d = dayStart; d <= dayEnd; d.setHours(d.getHours() + 1)) {
        var time = d.toISOString(); // let time = d.toLocaleString()

        hourlyOpenDoor.push({
          time: time,
          value: null,
          sensorId: null
        });
      } // console.log(hourlyOpenDoor)
      // Remap the time and values (minutes when door is opened by hour)


      sensor.rows.forEach(function (data, index) {
        var time = data.time._nanoISO.split("T")[0];

        var currentTime = new Date();
        var newYear = time.split("-")[0];
        var newMonth = time.split("-")[1];
        var newDay = time.split("-")[2];

        var newHour = data.time._nanoISO.split("T")[1].split(":")[0];

        var newState = data.value;

        if (newHour != oldHour) {
          if (oldHour != undefined) {
            hourlyOpenDoor.push({
              time: oldYear + '-' + oldMonth + '-' + oldDay + 'T' + oldHour + ':00:00.000Z',
              value: Math.round(hourlyOpenDoorTimer * 100) / 100,
              sensorId: data.sensorId
            });
          }

          hourlyOpenDoorTimer = 0;
          oldHour = newHour;
        }

        if (oldDay != newDay) {
          oldDay = newDay;
        }

        if (newMonth != oldMonth) {
          oldMonth = newMonth;
        }

        if (newYear != oldYear) {
          oldYear = newYear;
        }

        if (newState == 0) {
          var currentTimeInflux = data.time.getNanoTime();
          var previousTime; // try {

          previousTime = sensor.rows[index - 1].time.getNanoTime(); // } catch(e) {
          //     previousTime = currentTime.getTime() * 1000000
          // }

          var duration = previousTime - currentTimeInflux;
          var millis = duration / 1000000;
          var seconds = millis / 1000;
          var mins = seconds / 60;
          hourlyOpenDoorTimer += mins; // console.log(new Date(previousTime / 1000000), new Date(currentTimeInflux / 1000000), dailyOpenDoorTimer)
        }

        if (index == sensor.rows.length - 1) {
          hourlyOpenDoor.push({
            time: oldYear + '-' + oldMonth + '-' + oldDay + 'T' + oldHour + ':00:00.000Z',
            value: Math.round(hourlyOpenDoorTimer * 100) / 100,
            sensorId: data.sensorId
          });
        }
      });
      hourlyOpenDoor = _.orderBy(hourlyOpenDoor, "value", "asc"); //ordering so not-null values are firsts

      hourlyOpenDoor = _.uniqBy(hourlyOpenDoor, "time"); //removing duplicates

      hourlyOpenDoor = _.orderBy(hourlyOpenDoor, "time", "desc"); //ordering by timestamp

      console.log(hourlyOpenDoor); // Replace results into original location

      sensor.rows = hourlyOpenDoor;
    }); // Return the results
    // console.log("promises:",listOfPromises)

    if (listOfPromises.length == 2) // if there are 2 promises - then it is a door and a temperature
      sensorDataBundle = results[0].groupRows.concat(results[1].groupRows);else // if there is 1 promise - the it is either door or temperature
      sensorDataBundle = results[0].groupRows; // sensorDataBundle.push(results[0].groupRows) // door - processed above
    // sensorDataBundle.push(results[1].groupRows) // temeprature - processend in query
    // If query has been made

    res.status(200).send(sensorDataBundle);
  });
});
app.post('/api/v3/multi-report', function (req, res) {
  sess = req.session; // if (sess.username) {
  // console.log(req.body)

  function changeTimezone(date, ianatz) {
    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    })); // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours

    var diff = date.getTime() - invdate.getTime(); // so 12:00 in Toronto is 17:00 UTC

    return new Date(date.getTime() - diff); // needs to substract
  } // Get date custom or predefined


  var today,
      year,
      month,
      hOffset,
      start,
      end,
      customDate = req.body['date[]'];

  if (customDate) {
    // goes here for custom report
    start = customDate[0] + ' 00:00:00';
    end = customDate[1] + ' 23:59:59';
  } else {
    // goes here for quick report
    today = new Date();
    year = today.getFullYear();
    month = today.getMonth();
    hOffset = 0;
    start = new Date(year, month - 1, 1, 0 + hOffset, 0, 0);
    end = new Date(year, month, 0, 23 + hOffset, 59, 59);
    start = changeTimezone(start, "Europe/Bucharest");
    end = changeTimezone(end, "Europe/Bucharest");
    start = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + (start.getDate() < 10 ? '0' + start.getDate() : start.getDate()) + ' ' + '00:00:00';
    end = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + (end.getDate() < 10 ? '0' + end.getDate() : end.getDate()) + ' ' + '23:59:59'; // start = start.replaceAll('/','-').replaceAll(',','').replace('-1 ','-01 ')
    // end = end.replaceAll('/','-').replaceAll(',','')
  } // Prepare sensor list for Influx query


  var sensors = "";
  var listOfSensorsId = req.body['listOfSensorsId[]'];
  var listOfSensorsType = req.body['listOfSensorsType[]'];
  var queryDoor;
  var queryTemperature; // Build a query for each sensorId of a type

  var sensorDataBundle = [];

  if (typeof listOfSensorsId == 'string') {
    listOfSensorsId = new Array(listOfSensorsId);
    listOfSensorsType = new Array(listOfSensorsType);
  } // Get distinct sensorTypes to build different querys


  var sensorTypes = {
    isTemperature: false,
    isDoor: false
  };

  var distinctSensorsType = _.sortedUniq(listOfSensorsType);

  distinctSensorsType.forEach(function _callee46(item, index) {
    var sensorIds, query, _query3;

    return regeneratorRuntime.async(function _callee46$(_context46) {
      while (1) {
        switch (_context46.prev = _context46.next) {
          case 0:
            // Get sensorIds of current sensorType
            sensorIds = listOfSensorsId.filter(function (id, idx) {
              if (listOfSensorsType[idx] == item) return id;
            }); // Query for DOOR

            if (item == 'door') {
              console.log(item, sensorIds);
              sensorTypes.isDoor = true; // Return how many times a door has been open or closed in an hour

              query = "select value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId order by time desc"; // Make the request

              queryDoor = influxReader(query);
            } else if (item == 'temperature') {
              console.log(item, sensorIds);
              sensorTypes.isTemperature = true; // Return average of temperature for each hour

              _query3 = "select mean(value) as value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId,time(1d) order by time desc"; // Make the request

              queryTemperature = influxReader(_query3);
            }

          case 2:
          case "end":
            return _context46.stop();
        }
      }
    });
  });
  var listOfPromises = [];
  if (sensorTypes.isDoor) listOfPromises.push(queryDoor);
  if (sensorTypes.isTemperature) listOfPromises.push(queryTemperature);
  Promise.all(listOfPromises).then(function (results) {
    // console.log("promise all", sensorTypes)
    // console.log(start, end)
    // console.log("Doors:", results[0].groupRows.length)
    // Door results
    if (sensorTypes.isDoor) results[0].groupRows.forEach(function (sensor, idx) {
      // console.log("sensor:", sensor.tags.sensorId)
      // Process the result
      var oldHour, oldDay, oldMonth, oldYear;
      var hourlyOpenDoor = [];
      var hourlyOpenDoorTimer = 0;
      var dailyOpenDoor = [];
      var dailyOpenDoorBlank = [];
      var dailyOpenDoorTimer = 0; // Fill dailyOpenDoor with all dates between start to end

      var dayStart = start.split(" ")[0];
      dayStart = new Date(dayStart);
      var dayEnd = end.split(" ")[0];
      dayEnd = new Date(dayEnd);

      for (var d = dayStart; d <= dayEnd; d.setDate(d.getDate() + 1)) {
        var time = d.toISOString();
        dailyOpenDoor.push({
          time: time,
          value: null,
          sensorId: null
        });
      } // Remap the time and values (minutes when door is opened by hour)


      sensor.rows.forEach(function (data, index) {
        var time = data.time._nanoISO.split("T")[0];

        var currentTime = new Date();
        var newYear = time.split("-")[0];
        var newMonth = time.split("-")[1];
        var newDay = time.split("-")[2];

        var newHour = data.time._nanoISO.split("T")[1].split(":")[0];

        var newState = data.value;

        if (newHour != oldHour) {
          oldHour = newHour;
        }

        if (oldDay != newDay) {
          if (oldDay != undefined) {
            dailyOpenDoor.push({
              time: oldYear + '-' + oldMonth + '-' + oldDay + 'T00:00:00.000Z',
              value: Math.round(dailyOpenDoorTimer * 100) / 100,
              sensorId: data.sensorId
            });
          }

          dailyOpenDoorTimer = 0; // reset timer at each hour

          oldDay = newDay;
        }

        if (newMonth != oldMonth) {
          oldMonth = newMonth;
        }

        if (newYear != oldYear) {
          oldYear = newYear;
        }

        if (newState == 0) {
          var currentTimeInflux = data.time.getNanoTime();
          var previousTime; // try {

          previousTime = sensor.rows[index - 1].time.getNanoTime(); // } catch(e) {
          //     previousTime = currentTime.getTime() * 1000000
          // }

          var duration = previousTime - currentTimeInflux;
          var millis = duration / 1000000;
          var seconds = millis / 1000;
          var mins = seconds / 60;
          dailyOpenDoorTimer += mins; // console.log(new Date(previousTime / 1000000), new Date(currentTimeInflux / 1000000), dailyOpenDoorTimer)
        }

        if (index == sensor.rows.length - 1) {
          dailyOpenDoor.push({
            time: oldYear + '-' + oldMonth + '-' + oldDay + 'T00:00:00.000Z',
            value: Math.round(dailyOpenDoorTimer * 100) / 100,
            sensorId: data.sensorId
          });
        }
      });
      dailyOpenDoor = _.orderBy(dailyOpenDoor, "value", "asc"); //ordering so not-null values are firsts

      dailyOpenDoor = _.uniqBy(dailyOpenDoor, "time"); //removing duplicates

      dailyOpenDoor = _.orderBy(dailyOpenDoor, "time", "desc"); //ordering by timestamp
      // console.log(dailyOpenDoor)
      // Replace results into original location

      sensor.rows = dailyOpenDoor;
    }); // Return the results
    // console.log("promises:",listOfPromises.length)

    if (listOfPromises.length == 2) // if there are 2 promises - then it is a door and a temperature
      sensorDataBundle = results[0].groupRows.concat(results[1].groupRows);else // if there is 1 promise - the it is either door or temperature
      sensorDataBundle = results[0].groupRows; // sensorDataBundle.push(results[0].groupRows) // door - processed above
    // sensorDataBundle.push(results[1].groupRows) // temeprature - processend in query
    // If query has been made

    res.status(200).send(sensorDataBundle);
  });
});
app.get('/api/v3/query-influx', function (req, res) {
  sess = req.session;
  influxReader(req.query.query).then(function (result) {
    res.status(200).send(result);
  }).catch(function (error) {
    res.status(200).send(error);
  });
});
var PORT = 5002;
app.listen(PORT, console.log("NodeJS started on port ".concat(PORT))).on('error', function (err) {
  console.log(err);
});