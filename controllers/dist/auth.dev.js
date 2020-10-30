"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var mysql = require('mysql');

var Influx = require('influx');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs'); // const cookieParser = require('cookie-parser')


var dotenv = require("dotenv"); // enable debugging


var _dotenv$config = dotenv.config({
  debug: true
}),
    parsed = _dotenv$config.parsed,
    error = _dotenv$config.error; // was there an error?
// console.error(error)
// what was parsed?
// console.log(parsed)
// compare to process.env
// console.dir(process.env)
//config db info


config_db = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
};
var db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
}); // Influx Connection
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


function allTrue(obj) {
  for (var o in obj) {
    if (!obj[o]) return false;
  }

  return true;
}

var authRegister = function authRegister(req, res, next) {
  var _req$body = req.body,
      name = _req$body.name,
      username = _req$body.username,
      email = _req$body.email,
      company = _req$body.company,
      password = _req$body.password,
      passwordConfirm = _req$body.passwordConfirm;
  console.log(name, username, email, company, password, passwordConfirm); // password do not match

  if (password != passwordConfirm) {
    return res.render('register', {
      alert: "Passwords do not match!"
    });
  } // all fields required


  var allField = allTrue({
    name: name,
    username: username,
    email: email,
    company: company,
    password: password,
    passwordConfirm: passwordConfirm
  });

  if (!allField) {
    return res.render('register', {
      alert: 'All fields are required!'
    });
  }

  var checkUsername = mysqlReader("SELECT username FROM users WHERE username='" + username + "'");
  var checkCompany = mysqlReader("SELECT company FROM users WHERE company='" + company + "'");
  Promise.all([checkUsername, checkCompany]).then(function _callee(result, err) {
    var hashedPassword, credentials;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!err) {
              _context.next = 5;
              break;
            }

            console.log(err);
            return _context.abrupt("return", res.render('register', {
              alert: 'Try again!'
            }));

          case 5:
            if (!result[0].length) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return", res.render('register', {
              alert: 'That username is in use'
            }));

          case 9:
            if (!result[1].length) {
              _context.next = 13;
              break;
            }

            return _context.abrupt("return", res.render('register', {
              alert: 'That company is in use'
            }));

          case 13:
            _context.next = 15;
            return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

          case 15:
            hashedPassword = _context.sent;
            //register the user into db
            credentials = {
              name: name,
              username: username,
              email: email,
              company: company,
              password: hashedPassword,
              role: 'superadmin'
            };
            db.query("INSERT INTO users SET ?", credentials, function (err, result) {
              if (err) return res.render('register', {
                alert: 'Try again!'
              });else {
                console.log("New user registration");
                next();
              }
            });

          case 18:
          case "end":
            return _context.stop();
        }
      }
    });
  }); // check duplicate username
  // db.query("SELECT username FROM users WHERE username = ?", [username], async (err, result) => {
  //     // alert duplicate username
  //     if (err) console.log("There is a problem authRegister 1", err)
  //     else if (result.length) return res.render('register', {
  //         alert: 'That username is in use'
  //     })
  //     let hashedPassword = await bcrypt.hash(password, 10)
  //     //register the user into db
  //     const credentials = {
  //         name: name,
  //         username: username,
  //         email: email,
  //         company: company,
  //         password: hashedPassword,
  //         role: 'superadmin'
  //     }
  //     // insert username in db
  //     db.query("INSERT INTO users SET ?", credentials, (err, result) => {
  //         if (err)
  //             console.log("Problem with insert 1", err)
  //         else {
  //             console.log("New user registration")
  //             // create a map view for this company
  //             db.query("INSERT INTO maps SET ?", {
  //                 company
  //             }, (err, result) => {
  //                 if (err)
  //                     console.log("Problem with insert 2", err)
  //                 else {
  //                     console.log("New map registration")
  //                     next()
  //                 }
  //             })
  //         }
  //     })
  // })
};

function writeCookie(attr, text, res) {
  console.log("Write cookie:", attr, text);
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    signed: true
  };
  res.cookie(attr, text, cookieOptions);
} //auth controller login


var authLogin = function authLogin(req, res, next) {
  var _req$body2, username, password, remember, sql_query;

  return regeneratorRuntime.async(function authLogin$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          // take the data from form body
          _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password, remember = _req$body2.remember; //start the session for future login

          sess = req.session; // check if username exist

          if (!(!username || !password)) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(400).render('login', {
            message: 'You forgot to type username or password'
          }));

        case 7:
          // check user the is trying to login
          console.log("Login try:", username, '\r\n');
          sql_query = "SELECT username, password, role, company FROM users WHERE username = '" + username + "'";
          db.query(sql_query, function _callee2(err, result) {
            var passwordComparator;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (err) console.log("There is a problem authLogin 1");

                    if (!result.length) {
                      _context2.next = 19;
                      break;
                    }

                    _context2.next = 4;
                    return regeneratorRuntime.awrap(bcrypt.compare(password, result[0].password));

                  case 4:
                    passwordComparator = _context2.sent;
                    console.log(result[0].username, passwordComparator);

                    if (!(result[0].username != username || !passwordComparator)) {
                      _context2.next = 10;
                      break;
                    }

                    return _context2.abrupt("return", res.render('login', {
                      alert: 'Username or password is wrong'
                    }));

                  case 10:
                    // Set Cookie if checked
                    if (remember == '1') {
                      writeCookie("username", result[0].username, res);
                    } // set other sess variables


                    sess.username = result[0].username;
                    sess.role = result[0].role;
                    sess.admin = result[0].user_role == 'admin' ? 1 : 0;
                    sess.check_cookies = 0; // 1 - check cookie; 0 - don't check cookie

                    console.log("Logged in: ", sess.username, " role:", sess.role);
                    next();

                  case 17:
                    _context2.next = 20;
                    break;

                  case 19:
                    res.render("login", {
                      alert: "Username `" + username + "` is not registered!"
                    });

                  case 20:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });

        case 10:
          _context3.next = 15;
          break;

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](0);
          console.log("Error:", _context3.t0);

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 12]]);
};

var authDashboard = function authDashboard(req, res, next) {
  // check if user is logged
  sess = req.session;
  var time = new Date();
  var data = []; // console.log("authDashboard")
  // console.log(sess.counties)
  // var url = req.originalUrl
  // if(url="/admin") {
  //     next()
  // }

  if (sess.username) {
    next();
  } else res.render("login", {
    alert: "You are not logged in",
    redirect: req.originalUrl
  });
};

var authSuperAdmin = function authSuperAdmin(req, res, next) {
  // get session variable
  sess = req.session;

  if (sess.super_admin == 1) {
    // console.log("this user is superadmin")
    next();
  } else {
    // console.log("this user is NOT superadmin")
    res.render('login', {
      alert: "Login with your superadmin account!"
    });
  }
};

var cookieChecker = function cookieChecker(req, res, next) {
  var username_cookie, sql_query;
  return regeneratorRuntime.async(function cookieChecker$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // get session variable
          sess = req.session; // check cookie

          username_cookie = req.signedCookies.username; // if user has already logged in don't check cookies anymore

          if (sess.username) {
            next();
          } else if (username_cookie) {
            sql_query = "SELECT username, password, role FROM users WHERE username = '" + username_cookie + "'";
            db.query(sql_query, function (err, result) {
              if (result.length) {
                sess.username = result[0].username;
                sess.role = result[0].role;
                next();
              } else {
                next();
              }
            });
          } else {
            next();
          }

        case 3:
        case "end":
          return _context4.stop();
      }
    }
  });
};

module.exports = {
  authRegister: authRegister,
  authLogin: authLogin,
  authDashboard: authDashboard,
  authSuperAdmin: authSuperAdmin,
  cookieChecker: cookieChecker // getCounties,
  // getSensorLocation

};