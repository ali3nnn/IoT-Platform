// Imports
// ==================================
const http = require('http') // its a default package of node.js
const express = require('express')

var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

var fs = require('fs');

const path = require('path')
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const hbs = require('express-handlebars');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const url = require('url');
const axios = require('axios')
const moment = require('moment')
const formidable = require('formidable');
const removeDiacritics = require('diacritics').remove;
// global.fetch = require("node-fetch");
const mime = require('mime');
// const { exec } = require("child_process");
const _ = require('lodash');

const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');

const Influx = require('influx');
const mysql = require('mysql');

// ==================================
// End Imports

// Security Stuff
// ==================================
app.disable('x-powered-by')
app.use(helmet())
app.set('trust proxy', 1)
// ==================================
// End Security Stuff

// Handlebar Custom Helper
// ==================================

// ifEquals
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// for loop
Handlebars.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

// if conditon HBS
Handlebars.registerHelper('eq', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(function (expression) {
        return args[0] == expression;
    });
});

// Acces hbs var in js
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});
// How to use: 
// var county = JSON.parse('{{{json this}}}');

// ==================================
// End Handlebar Custom Helper

// Prototype
// ==================================
Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}
// ==================================
// End Prototype

// Middleware
// ==================================
const {
    authRegister,
    authLogin,
    authDashboard,
    authSuperAdmin,
    cookieChecker,
    // getCounties,
    // getSensorLocation
} = require('./controllers/auth')

const {
    showAllUsers
} = require('./controllers/all_users')

const {
    getUserData,
    getCounties,
    getSensorLocation,
    isScaleAvailable,
    isConveyorAvailable,
    isScannerAvailable,
    mqttOverSocketIoBridge,
    test,
    getDistinctValuesFromObject,
    replaceAll,
    replaceDiacritics,
    getDaysInMonth
    // trackurl
} = require('./controllers/getInfo');
const {
    query
} = require('express');
const { constants } = require('buffer');
// ==================================
// End Middleware

// Influx Connection
// ==================================

// Connect to InfluxDB and set the SCHEMA
const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'anysensor3',
})

// Influx Write - ASYNC
function influxWriter(measurement, country, county, city, location, zone, username, type, sensorId, value, database = 'anysensor3', precision = 's') {
    // console.log('Influx Write')
    influx.writePoints([{
        measurement,
        tags: {
            country,
            county,
            city,
            location,
            zone,
            username,
            type,
            sensorId,
        },
        fields: {
            value
        }
    }], {
        database,
        precision,
    })
        .catch(error => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        });
}

// Influx Query - PROMISE
function influxReader(query) {
    return new Promise((resolve, reject) => {
        // console.log(query)
        influx.query(query)
            .then(result => {
                return resolve(result)
            })
            .catch(error => {
                return reject(error)
            });
    })
}

// influxWriter('sensors', 'Romania', 'Dambovita', 'Targoviste', 'Location1', 'Zone1', 'alexbarbu2', 'temperatura', 'sensor200', 100)
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
}

config_verne = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_VERNE
}

// Set the connection to DB - Async
// let db = mysql.createConnection(config_db)

// Connect to DB - Async
// db.connect((err) => {
//     if (err) console.log("Connecting to mysql failed")
//     else console.log("First connection to MySQL", '\r\n')
// })

// Database Connection In Promise
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
        // console.log("Second connection to MySQL in promise")
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

// Set and connect to DB - Promise
const database = new Database(config_db)
const verne = new Database(config_verne)

// Second connection to DB
const db = mysql.createConnection(config_db)

function mysqlReader(query) {
    return new Promise((resolve, reject) => {
        // console.log(query)
        database.query(query)
            .then(result => {
                return resolve(result)
            })
            .catch(error => {
                return reject(error)
            });
    })
}

function addUserVerne(query) {
    return new Promise((resolve, reject) => {
        // console.log(query)
        verne.query(query)
            .then(result => {
                return resolve(result)
            })
            .catch(error => {
                return reject(error)
            });
    })
}

function mysqlWriter(query) {
    return new Promise((resolve, reject) => {
        // console.log(query)
        database.query(query)
            .then(result => {
                return resolve(result)
            })
            .catch(error => {
                return reject(error)
            });
    })
}

// ==================================
// End MySQL Connection

// Configuration
// ==================================
// initialize session variable
var sess;
//secure session variable
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: false
}));
// app.use(bodyParser);
//parse url encoded (as sent by html forms)
app.use(express.urlencoded({
    extended: false
}))
//parse json bodies (as sent by api)
app.use(express.json())
//initialize cookie parser
app.use(cookieParser(process.env.COOKIE_KEY))
//dir of static files css,img,js
const public_dir = path.join(__dirname, './public')
// set the directory for css/js/img files
app.use(express.static(public_dir))
// Dotenv Path
dotenv.config({
    path: './.env'
})
app.use(test)
// app.use(trackurl)
// app.use(trackurl)
// app.use(isScaleAvailable)
// app.use(isConveyorAvailable)
// app.use(isScannerAvailable)
// app.use(mqttOverSocketIoBridge)
// ==================================
// End Configuration


// View Engine HBS
// ==================================
//set the view engine HBS
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: null,
    layoutsDir: path.join(__dirname, 'views'),
    partialsDir: [
        //  path to your partials
        path.join(__dirname, 'views/partials'),
    ]
}))

app.set('view engine', 'hbs')
// ==================================
// END View Engine HBS

// if the use that acces home page was logged in previously
// make the log in automatically
// based on cookie/session var
var sess


// ==============================================
// ==============================================
// =================== ROUTES ===================
// ==============================================
// ==============================================

app.get('/', (req, res) => {

    // Homepage is disabled and it redirects to /map
    res.redirect('/map');

    // sess = req.session;
    // res.render("index", {
    //     username: sess.username,
    //     user_role: sess.user_role,
    //     user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    // })

});
// getCounties, getSensorLocation, isScaleAvailable, isConveyorAvailable, isScannerAvailable,
app.get("/map", cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session;
    // console.log(sess)
    res.render("map", {
        username: sess.username,
        role: sess.role,
        userData: sess.userData
    })
})

app.get("/map/zone", cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
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

        if (sess.username)
            res.status(200).render('dashboard', {
                // zoneData: data,
                username: sess.username,
                role: sess.role,
                userData: sess.userData
                // county: req.params.county,
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
            })
        else {
            res.status(403).render('message', {
                alert: "You are not logged in"
            })
        }

        // res.status(200).send({
        //     data
        // })

        // Front-End
        // [ ] TODO: display html for each sensor
        // [ ] TODO: update the html with data for each sensor


    } else {
        res.status(200).send({
            error: "You failed to get data from a zone"
        })
    }
})

// WARN: deprecated route
app.get('/map/:county', cookieChecker, authDashboard, getCounties, getSensorLocation, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {

    sess = req.session
    sess.county = req.params.county
    // console.log(sess.username, sess.counties)

    // console.log("/map/" + sess.county)
    // console.log("User:", sess.username)

    if (sess.username)
        res.status(200).render('dashboard', {
            county: req.params.county,
            username: sess.username,
            user_role: sess.user_role,
            sensorId: sess.sensorId, //this needs to be replaced or removed
            sensors: sess.sensors, //this contain a list of sensorsId the user has access to - generated by getSensorLocation
            counties: sess.counties,
            isScaleAvailable: sess.isScaleAvailable,
            isConveyorAvailable: sess.isConveyorAvailable,
            isScannerAvailable: sess.isScannerAvailable,
            user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
            user_role_is_admin: sess.user_role == 'admin' ? 1 : 0
        })
    else {
        res.status(403).render('message', {
            alert: "You are not logged in"
        })
    }

})

app.get('/scale-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
    res.render("scale-dashboard", {
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorAccess, //this needs to be replaced or removed
        // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
        counties: sess.counties, //this contains a list of counties the user has access to - generated by getCounties
        isScaleAvailable: sess.isScaleAvailable,
        isConveyorAvailable: sess.isConveyorAvailable,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
        user_role_is_admin: sess.user_role == 'admin' ? 1 : 0,
    })
})

app.get('/conveyor-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
    res.render("conveyor-dashboard", {
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorAccess, //this needs to be replaced or removed
        // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
        counties: sess.counties, //this contains a list of counties the user has access to - generated by getCounties
        isScaleAvailable: sess.isScaleAvailable,
        isConveyorAvailable: sess.isConveyorAvailable,
        isScannerAvailable: sess.isScannerAvailable,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
        user_role_is_admin: sess.user_role == 'admin' ? 1 : 0,
    })
})

app.get('/scanner-dashboard', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
    res.render("scanner-dashboard", {
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorAccess, //this needs to be replaced or removed
        // sensors: sess.sensors, //this contains a list of sensorsId the user has access to - generated by getSensorLocation
        counties: sess.counties, //this contains a list of counties the user has access to - generated by getCounties
        isScaleAvailable: sess.isScaleAvailable,
        isConveyorAvailable: sess.isConveyorAvailable,
        isScannerAvailable: sess.isScannerAvailable,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
        user_role_is_admin: sess.user_role == 'admin' ? 1 : 0,
    })
})

app.get('/register', (req, res) => {
    res.render('register')
});

app.get('/settings', cookieChecker, authDashboard, getUserData, (req, res) => {
    sess = req.session
    res.render('settings', {
        username: sess.username,
        role: sess.role,
        userData: sess.userData
    })
})

// get and post request to /register page
app.post('/register', authRegister, (req, res) => {
    sess = req.session;
    res.redirect('/login')
});

// get and post request to /login page
app.get('/login', (req, res) => {
    res.render('login', {
        username: null
    })
});

app.post('/login', authLogin, (req, res) => {
    sess = req.session;
    sess.check_cookies = 1
    const url = req.body.redirect || '/map'
    res.redirect(url)
});

// get request to /logout page
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.log(err);
        else res.redirect('/login');
    });
});

// ADMIN reuqest
//=========================================

//=========================================
// END ADMIN reuqest

// SUPERADMIN reuqest
//=========================================
app.get('/users', authDashboard, getCounties, authSuperAdmin, showAllUsers, function (req, res) {

    var sql = "SELECT id, name, username, email, user_role, reg_date FROM users"
    var data = {}
    database.query(sql)
        .then(rows => {
            data.flag = rows.length
            data.user = sess.username
            data.result = rows
            return data
        })
        .then((data) => {

            for (var item in data.result) {
                data.result[item].reg_date = data.result[item].reg_date.toString().split('GMT')[0]
            }

            const dataRender = {
                username: sess.username,
                user_role: sess.user_role,
                user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                db_results: data.result,
                role_basic: req.body.role == 'basic' ? true : false,
                role_superadmin: req.body.role == 'superadmin' ? true : false,
                message: "Notification test message"
            }

            // console.log(dataRender)

            res.render("admin_allusers", dataRender)
        });

    // try {
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

});

// Update user
app.post('/update', async (req, res) => {

    //UPDATE into db
    if (!req.body.password.length) {
        // console.log("Query:", req.body)
        db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "' WHERE Id='" + req.body.id + "'", (err, result) => {
            if (err) console.error(err)
            else {
                res.render("admin_allusers", {
                    username: sess.username,
                    user_role: sess.user_role,
                    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                    success: "Database has been updated"
                })
                // setTimeout(res.redirect("/users"), 1000);
            }
        })
    } else {
        // console.log("password changed")
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        // console.log(hashedPassword)
        db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "', Password='" + hashedPassword + "' WHERE Id='" + req.body.id + "'", (err, result) => {
            if (err) console.error(err)
            else {
                res.render("admin_allusers", {
                    username: sess.username,
                    user_role: sess.user_role,
                    user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                    success: "Database has been updated"
                })
                // setTimeout(res.redirect("/users"), 1000);
            }
        })
    }


    // res.send(200)
})

// Add new sensor
app.get('/add-sensor', authDashboard, authSuperAdmin, (req, res) => {

})
//=========================================
// END - SUPERADMIN reuqest

// NEW API ROUTES
//=========================================
app.get('/api/v3/get-user-data', cookieChecker, authDashboard, getUserData, (req, res) => {
    sess = req.session;
    var userData = {}
    userData = sess.userData
    // console.log(userData)
    if (userData['error']) {
        res.status(403).send(userData);
    } else {
        res.status(200).send(userData);
    }
})

// api to show page for sensor initialization 
app.get('/api/v3/init-sensor-qr', cookieChecker, authDashboard, getUserData, async (req, res) => {
    sess = req.session
    getQuery = req.query

    // [*] TODO 0: Check if user is admin 
    // [*] TODO 1: check if sensor exists in sensors tabel, if exists it means it is assigned already and show alert message
    // [*] TODO 2: set a new location or pick an old one from other sensors that users has access to
    // [*] TODO 3: insert into sensors and userAccess

    // console.log(sess)

    if (sess.username) {
        const userData = sess.userData
        // console.log(userData)
        const sensorExist = await mysqlReader("select * from sensors where sensorId='" + getQuery.sensorid + "';")
        if (!sensorExist.length) {
            // Get locations
            // const query = "select distinct locations.* from locations inner join sensors on sensors.zoneId = locations.zoneId inner join userAccess on userAccess.sensorId = sensors.sensorId and userAccess.username = '" + sess.username + "'";
            const query = "select locations.* from locations where createdBy = (select company from users where username='" + sess.username + "');"
            mysqlReader(query)
                .then(locations => {
                    // console.log("locations",locations)
                    res.render('initsensor-qr', {
                        username: sess.username,
                        sensorid: getQuery.sensorid,
                        type: getQuery.type,
                        battery: getQuery.battery || 0,
                        locations,
                        userData,
                    })
                })
        } else {
            res.send({
                error: "This sensor has been initialized"
            })
        }
    } else if (sess.username) {
        // TODO: display a graph with values of this sensor
        res.status(403).send("TODO: you are not and admin")
    } else {
        res.status(403).send("TODO: you are not logged in")
    }
})

// [ ] TODO: Show alert messages in different cases
// [*] TODO: Add company to mysql
//  api to initialize sensor
app.post('/api/v3/init-sensor-qr', cookieChecker, authDashboard, getUserData, (req, res) => {
    sess = req.session
    const postQuery = req.body
    // console.log(postQuery)
    if (postQuery.location1 && postQuery.location2 && postQuery.location2 && postQuery.location3 && postQuery.sensorName) {
        // Location from dropdown
        if (postQuery.zone == "Nothing selected") {

            // Remove diacritics
            postQuery.location1 = postQuery.location1.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
            postQuery.location2 = postQuery.location2.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
            postQuery.location3 = postQuery.location3.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
            postQuery.sensorName = postQuery.sensorName.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");

            // Lowercase
            postQuery.location1 = postQuery.location1.toLowerCase();
            postQuery.location2 = postQuery.location2.toLowerCase();
            postQuery.location3 = postQuery.location3.toLowerCase();
            postQuery.sensorName = postQuery.sensorName.toLowerCase();

            // Trim
            postQuery.location1 = postQuery.location1.trim();
            postQuery.location2 = postQuery.location2.trim();
            postQuery.location3 = postQuery.location3.trim();
            postQuery.sensorName = postQuery.sensorName.trim();

            // if (postQuery.zoneId) { //idk when goes here
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
            mysqlReader("INSERT INTO locations (location1, location2, location3, createdBy) values ('" + postQuery.location1 + "','" + postQuery.location2 + "','" + postQuery.location3 + "', '" + sess.company + "')")
                .then(() => {
                    // Get zoneId
                    mysqlReader("select zoneId from locations order by zoneId desc limit 1;").then(result => {
                        // Insert into sensors
                        let insertQuery = "INSERT INTO sensors (sensorId, sensorType, sensorName, zoneId, battery) values ('" + postQuery.sensorid + "','" + postQuery.type + "','" + postQuery.sensorName + "','" + result[0].zoneId + "', '" + postQuery.battery + "')"
                        mysqlReader(insertQuery)
                            .then(() => {
                                // Insert into userAccess
                                mysqlReader("INSERT INTO userAccess (sensorId, username) values ('" + postQuery.sensorid + "','" + sess.username + "')")
                                    .then(() => {
                                        // Insert into VerneMQ Table
                                        addUserVerne(`INSERT INTO vmq_auth_acl (mountpoint, client_id, username, password, publish_acl, subscribe_acl) VALUES ('', '` + postQuery.sensorid + `', '` + postQuery.sensorid + `', md5('dasstecb2b'), '[{"pattern":"#"}]', '[{"pattern":"#"}]');`)
                                            .then(() => {
                                                res.redirect("/map")
                                            })
                                    })
                            })
                    })

                })
            // }


        } else {
            // Location new

            // Get zoneId
            mysqlReader("select zoneId from locations where location1='" + postQuery.location1 + "' and location2='" + postQuery.location2 + "' and location3='" + postQuery.location3 + "';")
                .then(result => {
                    // Insert into sensors
                    let insertQuery = "INSERT INTO sensors (sensorId, sensorType, sensorName, zoneId, battery) values ('" + postQuery.sensorid + "','" + postQuery.type + "','" + postQuery.sensorName + "','" + result[0].zoneId + "', '" + postQuery.battery + "')"
                    mysqlReader(insertQuery)
                        .then((result) => {
                            // Insert into userAccess
                            mysqlReader("INSERT INTO userAccess (sensorId, username) values ('" + postQuery.sensorid + "','" + sess.username + "')")
                                .then(() => {
                                    // Insert into VerneMQ Table
                                    addUserVerne(`INSERT INTO vmq_auth_acl (mountpoint, client_id, username, password, publish_acl, subscribe_acl) VALUES ('', '` + postQuery.sensorid + `', '` + postQuery.sensorid + `', md5('dasstecb2b'), '[{"pattern":"#"}]', '[{"pattern":"#"}]');`)
                                        .then(() => {
                                            res.redirect("/map")
                                        })
                                })
                        })
                })

        }


    } else
        res.send({
            error: "Fields incomplete",
            postQuery
        })

    // res.send(req.body)
})

// Get influx data for sensorId
app.get('/api/v3/get-sensor-data', (req, res) => {

    // [ ] TODO: Case when there are two series with same sensorId

    // Process time
    let todayRaw = new Date();
    // let todayQueryDoor = todayRaw.getFullYear() + '-' + (todayRaw.getMonth() + 1) + '-' + (todayRaw.getDate() - 1 < 10 ? '0' + todayRaw.getDate() - 1 : todayRaw.getDate() - 1) + ' ' + '00:00:00'
    // let todayQueryGeneral = todayRaw.getFullYear() + '-' + (todayRaw.getMonth() + 1) + '-' + (todayRaw.getDate()-1 < 10 ? '0' + todayRaw.getDate()-1 : todayRaw.getDate()-1) + ' ' + '00:00:00'
    let todayQueryDoor = todayRaw.toISOString().split("T")[0] + ' 00:00:00'
    let todayQueryGeneral = todayRaw.toISOString().split("T")[0] + ' 00:00:00'

    let influxQuery
    if (['door'].includes(req.query.type)) {
        // console.log(req.query.type)
        influxQuery = "SELECT value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQueryDoor + "' and time<now() order by time desc;"
        // influxQuery = "SELECT value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQuery + "' and time<now() order by time desc;"
    } else {
        influxQuery = "SELECT mean(value) as value FROM sensors where sensorId='" + req.query.id + "' and time>='" + todayQueryGeneral + "' and time<now() group by time(5m) order by time desc;"
    }

    // console.log(influxQuery)

    if (req.query.type == 'door') {

        // console.log(req.query.type, influxQuery)

        influxReader(influxQuery).then(result => {

            let paddingStyle = 1 // 1,2,3

            let finalResult = []
            let finalResultFiltered = []
            let finalResultFilteredYesterday = []

            if (paddingStyle == 1) {

                // Push 0 or 1 from current time to last time in influx
                let lastValue = result[0].value
                if (lastValue == 1) { // Fills with 1s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    finalResult.push({ "time": new Date(currentDate).toISOString(), "value": 1, "info": "init with current time" })
                } else { // Fills with 0s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    finalResult.push({ "time": new Date(currentDate).toISOString(), "value": 0, "info": "init with current time" })
                }

                // Padding results
                let rightBeforeTime
                result.forEach((item, index) => {
                    if (item.value == 0) { // if item.value == 0
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        // push initial value
                        finalResult.push({ "time": item.time, "value": 0 }) //item.value == 0
                        if (index != result.length - 1) { // if item.value == 0 and not last
                            // push 1 right before 0
                            rightBeforeTime = new Date(timeDate.getTime() - 1) // push 1 milisecond before 0
                            finalResult.push({ "time": rightBeforeTime.toISOString(), "value": 1, "info": "rightBefore 0" })
                        }
                    } else { // if item.value == 1
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        // push initial value
                        finalResult.push({ "time": item.time, "value": 1 }) //item.value == 1
                        if (index != result.length - 1) { // if item.value == 1 and not last
                            // push 0 right before 1
                            rightBeforeTime = new Date(timeDate.getTime() - 1) // push 1 milisecond before 1
                            finalResult.push({ "time": rightBeforeTime.toISOString(), "value": 0, "info": "rightBefore 1" })
                        }
                    }
                })

                // Filter only today's data
                let thisDay = todayRaw.getDate()

                function checkIfToday(item) {
                    try {
                        let day
                        if (typeof item.time == 'string')
                            day = item.time.split('T')[0].split('-')[2]
                        else {
                            let time = item.time._nanoISO
                            day = time.split('T')[0].split('-')[2]
                        }
                        // console.log(typeof item.time, day, thisDay, day==thisDay)
                        return day == thisDay
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }

                function checkIfYesterday(item) {
                    try {
                        let day
                        if (typeof item.time == 'string')
                            day = item.time.split('T')[0].split('-')[2]
                        else {
                            let time = item.time._nanoISO
                            day = time.split('T')[0].split('-')[2]
                        }
                        // console.log(typeof item.time, day, thisDay, day==thisDay)
                        return day == thisDay - 1
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }

                finalResultFiltered = finalResult.filter(checkIfToday)
                finalResultFilteredYesterday = finalResult.filter(checkIfYesterday)
                // END Filter only today's data

                // Add 1 or 0 at midnight for current day
                let oldestValue
                if (finalResultFilteredYesterday.length) {
                    oldestValue = finalResultFilteredYesterday[0].value // last value recorded yesterday
                    // console.log(oldestValue, oldestValue == 1, oldestValue == 0)
                    if (oldestValue == 1) {
                        let midnight = new Date()
                        midnight = midnight.toISOString().split("T")[0] + 'T00:00:00.000Z'
                        // console.log(midnight)
                        finalResultFiltered.push({ "time": midnight, "value": 1, "info": "end with midnight" })
                    } else {
                        let midnight = new Date()
                        midnight = midnight.toISOString().split("T")[0] + 'T00:00:00.000Z'
                        // console.log(midnight)
                        finalResultFiltered.push({ "time": midnight, "value": 0, "info": "end with midnight" })
                    }
                }
                else {
                    oldestValue = finalResult[finalResult.length - 1].value // earliest value recorded today
                    let midnight = new Date()
                    midnight = midnight.toISOString().split("T")[0] + 'T00:00:00.000Z'
                    if(oldestValue==1) { // if sensor started with 1, put at midnight
                        finalResultFiltered.push({ "time": midnight, "value": null })
                    } else {
                        finalResultFiltered.push({ "time": midnight, "value": null })
                    }
                }

            } else if (paddingStyle == 2) {

                // Push 0 or 1 from current time to last time in influx
                let lastValue = result[0].value
                if (lastValue == 1) { // Fills with 1s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    while (currentDate.getTime() - lastTimestamp.getTime() > 10 * 60000) { //10 * 60000 = 10 min
                        finalResult.push({ "time": new Date(currentDate).toISOString(), "value": 1 })
                        currentDate.setSeconds(currentDate.getSeconds() - 10 * 60)
                    }
                    // finalResult.push({ "time": lastTimestamp.toISOString(), "value": 1 })
                } else { // Fills with 0s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    while (currentDate.getTime() - lastTimestamp.getTime() > 10 * 60000) { //10 * 60000 = 10 min
                        finalResult.push({ "time": new Date(currentDate).toISOString(), "value": null })
                        currentDate.setSeconds(currentDate.getSeconds() - 10 * 60)
                    }
                    // finalResult.push({ "time": lastTimestamp.toISOString(), "value": null })
                }

                // Padding results
                result.forEach((item, index) => {
                    if (item.value == 0) {
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        // push initial value
                        finalResult.push({ "time": item.time, "value": null })
                        // push 1 right before 0
                        let rightBeforeTime = new Date(timeDate.getTime() - 1)
                        finalResult.push({ "time": rightBeforeTime.toISOString(), "value": 1 })
                        // get next time
                        let nextTime
                        try {
                            nextTime = result[index + 1].time
                        } catch (e) {
                            nextTime = result[index].time
                        }
                        let nextTimeDate = new Date(nextTime)
                        // start padding
                        let newDate = new Date(timeDate.getTime()) // current json time
                        while (newDate.getTime() - 1000 * 60 > nextTimeDate.getTime()) {
                            newDate.setSeconds(newDate.getSeconds() - 60);
                            finalResult.push({ "time": new Date(newDate).toISOString(), "value": 1 })
                        }
                        // finalResult.pop() //remove last item because it goes a bit beyond nextTimeDate
                    } else {
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        finalResult.push({ "time": item.time, "value": 1 })
                        // push 0 right before 1
                        let rightBeforeTime = new Date(timeDate.getTime() - 1)
                        finalResult.push({ "time": rightBeforeTime.toISOString(), "value": null })
                        // get next time
                        let nextTime
                        try {
                            nextTime = result[index + 1].time
                        } catch (e) {
                            nextTime = result[index].time
                        }
                        let nextTimeDate = new Date(nextTime)
                        // start padding
                        let newDate = new Date(timeDate.getTime()) // current json time
                        while (newDate.getTime() - 5 * 1000 > nextTimeDate.getTime()) {
                            newDate.setSeconds(newDate.getSeconds() - 5);
                            finalResult.push({ "time": new Date(newDate).toISOString(), "value": null })
                        }
                    }
                })

                // Filter only today's data
                let thisDay = todayRaw.getDate()

                function checkIfToday(item) {
                    try {
                        let day
                        if (typeof item.time == 'string')
                            day = item.time.split('T')[0].split('-')[2]
                        else {
                            let time = item.time._nanoISO
                            day = time.split('T')[0].split('-')[2]
                        }
                        // console.log(typeof item.time, day, thisDay, day==thisDay)
                        return day == thisDay
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }

                finalResultFiltered = finalResult.filter(checkIfToday)
                // END Filter only today's data


            } else if (paddingStyle == 3) {

                // First value - current time
                let lastValue = result[0].value
                if (lastValue == 1) { // Fills with 1s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    finalResult.push({ "time": new Date(currentDate).toISOString(), "value": 1 })
                } else { // Fills with 0s
                    let lastTimestamp = new Date(result[0].time)
                    let currentDate = new Date()
                    finalResult.push({ "time": new Date(currentDate).toISOString(), "value": null })
                }

                // Add real values
                let rightBeforeTime
                result.forEach((item, index) => {
                    if (item.value == 0) { // if item.value == 0
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        // push initial value
                        finalResult.push({ "time": item.time, "value": null }) //item.value == 0
                        // push 1 right before 0
                        rightBeforeTime = new Date(timeDate.getTime() - 1) // push 1 milisecond before 0
                        finalResult.push({ "time": rightBeforeTime.toISOString(), "value": 1 })
                    } else {
                        // get current time
                        let time = item.time
                        let timeDate = new Date(time)
                        // push initial value
                        finalResult.push({ "time": item.time, "value": 1 }) //item.value == 1
                        // push 0 right before 1
                        rightBeforeTime = new Date(timeDate.getTime() - 1) // push 1 milisecond before 1
                        finalResult.push({ "time": rightBeforeTime.toISOString(), "value": null })
                    }
                })

                // Filter only today's data
                let thisDay = todayRaw.getDate()

                function checkIfToday(item) {
                    try {
                        let day
                        if (typeof item.time == 'string')
                            day = item.time.split('T')[0].split('-')[2]
                        else {
                            let time = item.time._nanoISO
                            day = time.split('T')[0].split('-')[2]
                        }
                        // console.log(typeof item.time, day, thisDay, day==thisDay)
                        return day == thisDay
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }

                function checkIfYesterday(item) {
                    try {
                        let day
                        if (typeof item.time == 'string')
                            day = item.time.split('T')[0].split('-')[2]
                        else {
                            let time = item.time._nanoISO
                            day = time.split('T')[0].split('-')[2]
                        }
                        // console.log(typeof item.time, day, thisDay, day==thisDay)
                        return day == thisDay - 1
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }

                finalResultFiltered = finalResult.filter(checkIfToday)
                finalResultFilteredYesterday = finalResult.filter(checkIfYesterday)
                // console.log(finalResult)
                // END Filter only today's data

                // last value - midnight
                let oldestValue = finalResultFilteredYesterday[0].value // last value recorded yesterday
                // console.log(oldestValue, oldestValue == 1, oldestValue == 0)
                if (oldestValue == 1) {
                    let midnight = new Date()
                    midnight = midnight.toISOString().split("T")[0] + '00:00:00.000Z'
                    // console.log(midnight)
                    finalResultFiltered.push({ "time": midnight, "value": 1 })
                } else {
                    let midnight = new Date()
                    midnight = midnight.toISOString().split("T")[0] + '00:00:00.000Z'
                    // console.log(midnight)
                    finalResultFiltered.push({ "time": midnight, "value": 0 })
                }
            }

            // Return sensor
            // res.status(200).send({ result, finalResultFiltered })
            res.status(200).send(finalResultFiltered)

        }).catch(err => {
            res.send(err)
        })

    } else {
        influxReader(influxQuery).then(result => {

            // Fill with null where 0 for door sensors
            // if (req.query.type)
            //     result = result.map((item, index) => {
            //         if (item.value == 0)
            //             return { "time": item.time, "value": null }
            //         else
            //             return item
            //     })

            // Return sensor
            res.send(result)

        }).catch(err => {
            res.send(err)
        })
    }

})

app.get('/api/v3/save-settings', (req, res) => {
    sess = req.session

    // if (sess.username) {
    // let query = "UPDATE sensors SET " + (() => { return req.query.min ? 'min=' + req.query.min : '' })() + (() => { return req.query.max ? 'max=' + req.query.max : '' })() + (() => { return req.query.xlat ? 'x=\'' + req.query.xlat + '\' ' : '' })() + (() => { return req.query.ylong ? 'y=\'' + req.query.ylong + '\'' : '' })() + " WHERE sensorId=" + req.query.sensorId
    let query = "UPDATE sensors SET " +
        (() => { return req.query.min ? 'min=' + req.query.min : 'min=NULL' })() + "," +
        (() => { return req.query.max ? ' max=' + req.query.max : ' max=NULL' })() + "," +
        (() => { return req.query.openTimer ? 'openTimer=' + req.query.openTimer : 'openTimer=NULL' })() + "," +
        (() => { return req.query.closedTimer ? ' closedTimer=' + req.query.closedTimer : ' closedTimer=NULL' })() + "," +
        (() => { return req.query.xlat ? ' x=\'' + req.query.xlat + '\' ' : ' x=NULL' })() + "," +
        (() => { return req.query.ylong ? ' y=\'' + req.query.ylong + '\'' : ' y=NULL' })() +
        " WHERE sensorId=" + req.query.sensorId + ';'

    // console.log(query)

    mysqlReader(query)
        .then((res) => {
            res.status(200).send("Values updated!");
        })
        .catch((err) => {
            res.status(200).send(err);
        })

    // } else {
    //     res.status(403).send("You are not authorized!");
    // }
})

// Route for OTA update 
app.get("/cdn", (req, res) => {

    let filename_raw = req.query.filename
    let file = '/root/Applications/redesignWorkspaceAnysensor/public/publicDownload/' + filename_raw;
    let filename = path.basename(file);
    let stats = fs.statSync(file)
    let fileSizeInBytes = stats["size"]
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', fileSizeInBytes);

    let filestream = fs.createReadStream(file);
    filestream.pipe(res);
})

app.get('/api/v3/get-interval', async (req, res) => {
    sess = req.session

    let sensorId = req.query.sensorId
    let sensorType

    // if(sess.userData != undefined)
    //     sess.userData.map(item => {
    //         if(item.sensorId == sensorId) 
    //             sensorType = item.sensorType
    //     })

    // console.log(sensorId, sensorType)

    let start = new Date(req.query.start)
    let end = new Date(req.query.end)
    let diffRaw = end - start
    let diff = diffRaw / (1000 * 60 * 60)
    let averageTimeInterval = (diff) => {
        if (diff <= 24)
            return '5m'
        if (diff > 24 && diff <= 24 * 2)
            return '10m'
        if (diff > 24 * 2 && diff <= 24 * 4)
            return '1h'
        if (diff > 24 * 4 && diff <= 24 * 7)
            return '4h'
        if (diff > 24 * 7)
            return '1d'
    }

    req.query.start = req.query.start.replace("T", " ")
    req.query.start = req.query.start.replace(".000000000Z", "")

    req.query.end = req.query.end.replace("T", " ")
    req.query.end = req.query.end.replace(".000000000Z", "")

    let query
    // if(sensorType=='door') {
    //     query = influxQuery = "SELECT value FROM sensors where sensorId='" + sensorId + "' and time>='" + req.query.start + "' and time<="+req.query.end+" order by time desc;"
    // } else if (sensorType=='temperature') {
        query = "select mean(value) as value from sensors where sensorId='" + sensorId + "' and time<='" + req.query.end + "' and time>='" + req.query.start + "' group by time(" + averageTimeInterval(diff) + ") order by time desc"
    // }
    // console.log(query)

    if (sess.username) {
        influxReader(query).then(result => {
            res.status(200).send({ result });
        }).catch(err => {
            res.status(200).send({ err });
        })

    } else {
        res.status(403).send("You are not logged in!");
    }
})

app.get("/api/v3/save-position", (req, res) => {
    sess = req.session
    if (sess.username) {
        const query = "UPDATE sensors SET x='" + req.query.x + "', y='" + req.query.y + "' WHERE sensorId='" + req.query.sensor + "';"
        mysqlReader(query).then((result) => {
            res.status(200).send("Update performed");
        }).catch(err => {
            res.status(400).send("Error");
        })
    } else {
        res.status(403).send("Not logged in");
    }
})

// END NEW API ROUTES
//=========================================


// API Get Data From Different Zones
//=========================================

// get unique elements of list
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// Get counties of user
app.get('/api/get-data', (req, res) => {

    var time = new Date()
    // console.log("GET DATA", new Date() - time)

    sess = req.session;

    var data = []

    if (sess.username) {

        // get sensor access from mysql
        const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"

        mysqlReader(query).then(async (rows) => {
            let rows_ = await rows
            // If user is found in mysql
            if (rows_.length) {

                var whereQuery = `where (username='` + sess.username + `') or (`

                for (var i = 0; i < rows_.length; i++) {

                    whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                    if (i < rows_.length - 1) whereQuery += ` or `
                    else whereQuery += `)`
                }

                var queryCounties = `select distinct(county) as county from ( select county, value from sensors ` + whereQuery + ` )`

                // If user is not found in mysql
            } else {

                // get counties
                var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + sess.username + "')"

            }

            let counties = influxReader(queryCounties).then(async (result) => {

                var counties = []
                for (var i = 0; i < result.length; i++) {
                    counties.push(result[i].county)
                }

                return await counties

            })

            // ================ cities, locations and zones ================
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

            var cities = [0]
            var locations = [0]
            var zones = [0]

            // ================ END ================

            Promise.all([counties, cities, locations, zones]).then((result) => {

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
                        responseTime: new Date() - time + "ms",
                    })
                    // console.log("promise all push done", new Date() - time)
                } else {
                    data.push({
                        error: true,
                        message: "No data found for this user",
                        user: sess.username
                    })
                }

                // console.log("GET all", new Date() - time)

                // send the data
                res.status(200).send(data)

            }).catch(error => console.log(`Error in promises ${error}`))

        })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }

    // console.log("done", new Date() - time)
})

// No longer used - instead I use /api/get-data/last/:county/:sensorQuery
app.get('/api/get-data/type/:sensorId', (req, res) => {
    sess = req.session
    let data = []
    var time = new Date()
    // console.log(req.originalUrl)

    if (sess.username) {

        // var query = `select distinct(type) as type from sensors where sensorId='`+req.params.sensorId+`' LIMIT 1`
        var query = `select zone, type from (select zone, type, value from sensors where sensorId='` + req.params.sensorId + `') LIMIT 1`

        let type = influxReader(query).then((result) => {
            // console.log(influxQuery)
            if (result.length)
                data.push({
                    error: false,
                    message: "Data found",
                    sensorQueried: req.params.sensorId,
                    sensorType: result[0].type,
                    sensorZone: result[0].zone,
                    user: sess.username,
                    responseTime: new Date() - time
                })
            else
                data.push({
                    error: true,
                    message: "No data found",
                    sensorQueried: req.params.sensorId,
                    user: sess.username,
                    responseTime: new Date() - time
                })

            return data

        }).then((result) => {
            res.status(200).send(result)
        }).catch((e) => {
            res.status(404).send("Scraping sensor type from influx failed")
        })

    } else {
        var responseTime = new Date() - time
        data.push({
            error: "you are not logged in",
            responseTime
        })
        res.status(403).send(data)
    }
})

// Get all distinct sensorIds from a requested county
app.get('/api/v2/get-data/sensorId/:county', (req, res) => {
    var data = []
    var time = new Date()
    sess = req.session;
    if (sess.username) {
        const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"
        mysqlReader(query).then(async (rows) => {

            var mysqlTime = new Date - time

            let rows_ = await rows

            if (rows_.length) {

                var whereQuery = `where (username='` + sess.username + `' and county='` + req.params.county + `') or ((`

                for (var i = 0; i < rows_.length; i++) {

                    whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                    if (i < rows_.length - 1) whereQuery += ` or `
                    else whereQuery += `)`
                }

                whereQuery += ` and county='` + req.params.county + `')`
                // var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`

                // whereQuery += `where username='` + sess.username + `' and county='` + req.params.county + `'`
                var influxQuery = `show series ` + whereQuery

            } else {

                var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
                var influxQuery = `show series ` + whereQuery

            }

            // console.log(influxQuery)

            // Get all types of sensors of logged in user and from requested county
            let sensorsData = influxReader(influxQuery).then((result) => {

                // console.log("after fetch", new Date() - time)

                // get sensor type
                var sensorIdList = []
                var sensorTypeList = []
                var sensorZoneList = []
                // var sensorIdListAux = []

                for (var i = 0; i < result.length; i++) {
                    sensorIdList.push(result[i].key.split('sensorId=')[1].split(',type')[0])
                }

                for (var i = 0; i < result.length; i++) {
                    sensorTypeList.push(result[i].key.split('type=')[1].split(',username')[0])
                }

                for (var i = 0; i < result.length; i++) {
                    sensorZoneList.push(result[i].key.split(',zone=')[1])
                }

                // build the output
                if (result.length) {
                    data.push({
                        error: false,
                        message: "Data found",
                        county: req.params.county,
                        user: sess.username,
                        sensorIdListLength: sensorIdList.length,
                        sensorIdList,
                        sensorTypeList,
                        sensorZoneList,
                        influxResponse: new Date() - time + "ms",
                        mysqlResponse: mysqlTime + "ms",
                        influxQuery
                    })
                } else {
                    data.push({
                        error: true,
                        message: "No data found",
                        county: req.params.county,
                        length: result.length,
                        user: sess.username,
                        influxResponse: new Date() - time + "ms",
                        mysqlResponse: mysqlTime + "ms",
                        influxQuery
                    })
                }

                // send the output
                res.status(200).send(data)

            })
                .catch((e) => {
                    res.status(404).send("Scraping sensorId data from influx failed", e)
                })
        });
    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }
})

// Get all distinct sensorIds from a requested county - not used
app.get('/api/get-data/sensorId/:county', (req, res) => {

    var time = new Date()

    sess = req.session

    // get params
    // const queryObject = url.parse(req.url,true).query;
    // console.log(queryObject);
    // console.log(queryObject);

    // console.log(sess.username)

    let data = []

    // Who ask for the data
    if (sess.username) {

        // console.log("if",new Date()-time)

        // req.params.county = req.params.county.toLowerCase()
        // console.log(req.originalUrl)
        // console.log("User:", sess.username);

        // Create the query based on user type
        if (sess.sensorAccess != -1) {
            // // return evrything that belongs to username and match county and is in a 1day time interval
            // var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
            // // check what sensor type for the user
            // var influxQuery = `select distinct(sensorId) as sensorId from sensors ` + whereQuery

            // return evrything that belongs to username and match county and is in a 1day time interval
            // var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
            // check what sensor type for the user
            // var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`

        } else {
            // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // // console.log(influxQuery)
        }

        // select (distinct sensorId), type from ( select sensorId, type, value from sensors where username='demo' and county='bucuresti') group by sensorId


        // get sensor access from mysql
        const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"
        mysqlReader(query).then(async (rows) => {

            var mysqlTime = new Date - time

            let rows_ = await rows

            if (rows_.length) {


                var whereQuery = `where (username='` + sess.username + `' and county='` + req.params.county + `') or ((`

                for (var i = 0; i < rows_.length; i++) {

                    whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                    if (i < rows_.length - 1) whereQuery += ` or `
                    else whereQuery += `)`
                }

                whereQuery += ` and county='` + req.params.county + `')`

                var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`

            } else {


                var whereQuery = `where username='` + sess.username + `' and county='` + req.params.county + `'`
                var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, type, value from sensors ` + whereQuery + ` )`

            }

            // console.log(influxQuery)

            // Get all types of sensors of logged in user and from requested county
            let sensorsData = influxReader(influxQuery).then((result) => {

                // console.log("after fetch", new Date() - time)

                // get sensor type
                // var sensorTypeList = []
                var sensorIdList = []
                // var sensorIdListAux = []

                for (var i = 0; i < result.length; i++) {

                    sensorIdList.push(result[i].sensorId)

                }

                // build the output
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
                        influxQuery
                    })
                } else {
                    data.push({
                        error: true,
                        message: "No data found",
                        county: req.params.county,
                        length: result.length,
                        user: sess.username,
                        influxResponse: new Date() - time + "ms",
                        mysqlResponse: mysqlTime + "ms",
                        influxQuery
                    })
                }

                // send the output
                res.status(200).send(data)

            })
                .catch((e) => {
                    res.status(404).send("Scraping sensorId data from influx failed", e)
                })
        });

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }


})

// Get last week daily values EXPERIMENT
app.get('/api/experiment/get-data/:county/:sensorQuery', (req, res) => {
    sess = req.session
    let data = []
    var time = new Date()

    if (sess.username) {

        // Server side log
        req.params.county = req.params.county.toLowerCase()
        // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()

        // the way I check if sensor is counter should be estabilshed after
        // we decide about sensorId template
        var isCounter = (req.params.sensorQuery.split('-')[1] == 'c' ? true : false)

        // console.log(req.originalUrl)
        // console.log('/api/get-data/' + req.params.county + '/' + req.params.sensorQuery)
        // console.log("User:", sess.username);
        // console.log("Access to sensorId:", sess.sensorAccess);
        // console.log(req.params)

        // Get the date for influx query - this day 0 to currentHour
        var today = new Date();
        // cannot query for today date starting at 00:00 because influx tz is -1h than romanian tz
        // set today 00:00 as yesterday 23:00
        today.setDate(today.getDate() - 1)
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        // console.log(">> TODAY start:", today)

        // Mean of last week - experiment
        // ==========================================
        var lastweekTodayStart = new Date();
        lastweekTodayStart.setDate(lastweekTodayStart.getDate() - 8)
        var dd = String(lastweekTodayStart.getDate()).padStart(2, '0');
        var mm = String(lastweekTodayStart.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = lastweekTodayStart.getFullYear();
        lastweekTodayStart = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        // console.log(">> lastweekTodayStart start:", lastweekTodayStart)

        var lastweekTodayStop = new Date();
        lastweekTodayStop.setDate(lastweekTodayStop.getDate() - 7)
        var dd = String(lastweekTodayStop.getDate()).padStart(2, '0');
        var mm = String(lastweekTodayStop.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = lastweekTodayStop.getFullYear();
        lastweekTodayStop = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        // console.log(">> lastweekTodayStop start:", lastweekTodayStop)
        // ==========================================
        // END Mean of last week - experiment

        // console.log("api req date:", today)

        if (sess.sensorAccess != -1) {

            // return evrything that belongs to username and match county and is in a 1day time interval
            var whereQueryExperiment = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + lastweekTodayStart + `' and time<'` + lastweekTodayStop + `'`
            // var whereQuery = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<now()`

            // if (isCounter) {
            //     // check what sensor type for the user
            //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // } else {
            //     // check what sensor type for the user
            //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // }

            if (isCounter) {
                // check what sensor type for the user
                var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(5m) ORDER BY time DESC`
            } else {
                // check what sensor type for the user
                // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
                var influxQueryExperiment = `select mean(value) as value, last(type) as type from sensors ` + whereQueryExperiment + ` GROUP BY time(5m) ORDER BY time DESC`
            }

            // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

        } else {
            // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // // console.log(influxQuery)
        }

        // get sensor zone
        // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"
        var query = `SHOW TAG VALUES WITH KEY IN ("type", "zone") WHERE sensorId='` + req.params.sensorQuery + `'`
        let sensorZoneAndType = influxReader(query).then((res) => {
            // console.log(res)
            return res
        })

        // console.log(query, res[0])
        // console.log(influxQuery)

        let resultInfluxDb = influxReader(influxQueryExperiment).then(async (result) => {

            let sensorZoneAndType_ = await sensorZoneAndType
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
                    influxQueryExperiment,
                    sensorAverage: []
                })
                for (var i = 0; i < result.length; i++) {
                    data[0].sensorAverage.push({
                        sensorValue: result[i].value,
                        sensorTime: result[i].time
                    })
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
                    influxQueryExperiment,
                    user: sess.username
                })
            }

            return data

        })
            .then(async (result) => {
                res.status(200).send(result)
            }).catch((e) => {
                res.status(404).send("Scraping sensor data from influx failed")
            })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }

})

// Get today' values of a sensor
app.get('/api/get-data/:county/:sensorQuery', (req, res) => {
    sess = req.session
    let data = []
    var time = new Date()

    // console.log(sess.username, req.params)

    if (sess.username) {

        // Server side log
        req.params.county = req.params.county.toLowerCase()
        // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()

        // the way I check if sensor is counter should be estabilshed after
        // we decide about sensorId template
        var isCounter = (req.params.sensorQuery.split('-')[1] == 'c' ? true : false)

        // console.log(req.originalUrl)
        // console.log('/api/get-data/' + req.params.county + '/' + req.params.sensorQuery)
        // console.log("User:", sess.username);
        // console.log("Access to sensorId:", sess.sensorAccess);
        // console.log(req.params)

        // Get the date for influx query - this day 0 to currentHour
        var today = new Date();
        // cannot query for today date starting at 00:00 because influx tz is -1h than romanian tz
        // set today 00:00 as yesterday 23:00
        today.setDate(today.getDate() - 1)
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        // console.log(">> TODAY start:",today)

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
            var whereQuery = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<now()`

            // if (isCounter) {
            //     // check what sensor type for the user
            //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // } else {
            //     // check what sensor type for the user
            //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // }

            if (isCounter) {
                // check what sensor type for the user
                var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            } else {
                // check what sensor type for the user
                var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
                // var influxQueryExperiment = `select mean(value) as value, last(type) as type from sensors ` + whereQueryExperiment + ` GROUP BY time(1h) ORDER BY time DESC`
            }

            // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

        } else {
            // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // // console.log(influxQuery)
        }

        // get sensor zone
        // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"
        var query = `SHOW TAG VALUES WITH KEY IN ("type", "zone") WHERE sensorId='` + req.params.sensorQuery + `'`
        let sensorZoneAndType = influxReader(query).then((res) => {
            // console.log(res)
            return res
        })

        // console.log(query, res[0])
        // console.log(influxQuery)

        let resultInfluxDb = influxReader(influxQuery).then(async (result) => {

            let sensorZoneAndType_ = await sensorZoneAndType
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
                    influxQuery,
                    sensorAverage: []
                })
                for (var i = 0; i < result.length; i++) {
                    data[0].sensorAverage.push({
                        sensorValue: result[i].value,
                        sensorTime: result[i].time
                    })
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
                    influxQuery,
                    user: sess.username
                })
            }

            return data

        })
            .then(async (result) => {
                res.status(200).send(result)
            }).catch((e) => {
                res.status(404).send("Scraping sensor data from influx failed")
            })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }

})

// Get today' values of a sensor API v2
app.get('/api/v2/get-data/:county/:sensorQuery', (req, res) => {
    sess = req.session
    let data = []
    var time = new Date()

    // console.log(sess.username, req.params)

    if (sess.username) {

        // Server side log
        req.params.county = req.params.county.toLowerCase()
        // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()

        // the way I check if sensor is counter should be estabilshed after
        // we decide about sensorId template
        var isCounter = (req.params.sensorQuery.split('-')[1] == 'c' ? true : false)

        // console.log(req.originalUrl)
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
        today__raw.setDate(today__raw.getDate() - 1)
        var dd = String(today__raw.getDate()).padStart(2, '0');
        var mm = String(today__raw.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today__raw.getFullYear();
        today = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        var dd = String(today__raw_2.getDate()).padStart(2, '0');
        var mm = String(today__raw_2.getMonth() + 1).padStart(2, '0'); //January is 0!
        dd = (parseInt(dd)).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })
        todayEnd = "'" + yyyy + '-' + mm + '-' + dd + 'T23:00:00Z' + "'";
        // todayEnd = "now()"

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
            var whereQuery = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<=` + todayEnd + ``

            // if (isCounter) {
            //     // check what sensor type for the user
            //     var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // } else {
            //     // check what sensor type for the user
            //     var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // }

            if (isCounter) {
                // check what sensor type for the user
                var influxQuery = `select sum(value) as value from sensors ` + whereQuery + ` GROUP BY time(5m) ORDER BY time DESC`
            } else {
                // check what sensor type for the user
                var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(5m) ORDER BY time DESC`
            }

            // select mean(value) as value from sensors where username='alexbarbu2' and county='constanta' and sensorId='sensor22' and time < now() GROUP BY time(1h) ORDER BY time DESC

        } else {
            // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // // console.log(influxQuery)
        }

        // get sensor zone
        // var query = "select type, zone from (select type, zone, value from sensors where sensorId='" + req.params.sensorQuery + "') limit 1"
        var query = `SHOW TAG VALUES WITH KEY IN ("type", "zone") WHERE sensorId='` + req.params.sensorQuery + `'`
        let sensorZoneAndType = influxReader(query).then((res) => {
            // console.log(res)
            return res
        })

        // console.log(query, res[0])
        // console.log(influxQuery)

        let resultInfluxDb = influxReader(influxQuery).then(async (result) => {

            let sensorZoneAndType_ = await sensorZoneAndType
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
                    influxQuery,
                    sensorAverage: []
                })
                for (var i = 0; i < result.length; i++) {
                    data[0].sensorAverage.push({
                        sensorValue: result[i].value,
                        sensorTime: result[i].time
                    })
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
                    influxQuery,
                    user: sess.username
                })
            }

            return data

        })
            .then(async (result) => {
                res.status(200).send(result)
            }).catch((e) => {
                res.status(404).send({
                    e,
                    query,
                    influxQuery
                })
                // res.status(404).send(influxQuery)
            })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }

})

app.get('/api/get-data/last/:county/:sensorQuery', (req, res) => {
    sess = req.session
    let data = []
    var time = new Date()
    if (sess.username) {

        // Server side log
        req.params.county = req.params.county.toLowerCase()
        // req.params.sensorQuery = req.params.sensorQuery.toLowerCase()
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
            var whereQuery = `where county='` + req.params.county + `' and sensorId='` + req.params.sensorQuery + `' and time>='` + today + `' and time<now()`
            // check what sensor type for the user
            var influxQuery = `select last(value) as value from sensors ` + whereQuery + ` GROUP BY sensorId  ORDER BY time DESC`

        } else {
            // var whereQuery = `where county='`+req.params.county+`' and time>='`+today+`' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // // console.log(influxQuery)
        }
        // console.log("---->",influxQuery)
        let resultInfluxDb = influxReader(influxQuery).then((result) => {

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
                })
                // for (var i = 0; i < result.length; i++) {
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
                })
            }

            return data


        }).then((result) => {
            res.status(200).send(result)
        }).catch((e) => {
            res.status(404).send("Scraping sensor data from influx failed")
        })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }
})

app.get('/api/get-interval/:step', (req, res) => {
    sess = req.session
    let data = []
    // console.log("--->",req.params.step)
    var time = new Date()
    // console.log('/api/get-interval/...')
    // console.log("---")
    // console.log(req.params)
    // console.log(req.query.county)
    // console.log(req.query.sensorQuery)
    // console.log("---")
    // sess.username = "1"

    if (sess.username) {

        if (sess.sensorAccess != -1) {

            // return evrything that belongs to username and match county and is in a 1day time interval
            var whereQuery = `where county='` + req.query.county + `' and sensorId='` + req.query.sensorQuery + `' and time>='` + req.query.start + `' and time<'` + req.query.end + `'`

            // group by
            // console.log(req.params.step)
            switch (req.params.step) {
                case '30mins':
                    var groupBy = `GROUP BY time(30m) ORDER BY time DESC`
                    break;
                case '10mins':
                    var groupBy = `GROUP BY time(10m) ORDER BY time DESC`
                    break;
                case '1mins':
                    var groupBy = `GROUP BY time(1m) ORDER BY time DESC`
                    break;
                case 'hourly':
                    var groupBy = `GROUP BY time(1h) ORDER BY time DESC`
                    break;
                case 'hourlyS':
                    var groupBy = `GROUP BY time(2h) ORDER BY time DESC`
                    break;
                case 'daily':
                    var groupBy = `GROUP BY time(1d) ORDER BY time DESC`
                    break;
                case 'dailyS':
                    var groupBy = `GROUP BY time(1w) ORDER BY time DESC`
                    break;
                default:
                    var groupBy = `GROUP BY time(1h) ORDER BY time DESC`
            }

            // check what sensor type for the user
            // var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` ` + groupBy + ` `

            // check what sensor type for the user
            var influxQuery = `select mean(value) as value from sensors ` + whereQuery + ` ` + groupBy + ` `

            // console.log(influxQuery)

        } else {

            // work in progress
            // var whereQuery = `where county='` + req.params.county + `' and time>='` + today + `' and time<now()`
            // var influxQuery = `select mean(value) as value, last(type) as type, last(value) as live from sensors ` + whereQuery + ` GROUP BY time(1h) ORDER BY time DESC`
            // // check what sensor type for the user
            // var influxQuery = `select * from sensors ` + whereQuery + ` ORDER BY time DESC`
            // console.log(influxQuery)
        }

        // console.log(influxQuery)
        let resultInfluxDb = influxReader(influxQuery).then((result) => {
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
                })
                // var sensorType = false
                for (var i = 0; i < result.length; i++) {
                    data[0].sensorAverage.push({
                        sensorValue: result[i].value,
                        sensorTime: result[i].time,
                        sensorType: result[i].type
                    })
                    // if (result[i].type != null && sensorType == false) {
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
                })
            }

            return data

        }).then((result) => {
            res.status(200).send(result)
        }).catch((e) => {
            res.status(404).send("Scraping sensor data from influx failed")
        })

    } else {
        data.push({
            error: "you are not logged in"
        })
        res.status(403).send(data)
    }
})

// API for python

// get images for mail
app.get("/graficMail", (req, res) => {
    //use the url to parse the requested url and get the image name
    var query = url.parse(req.url, true).query;
    var pic = query.image;

    //read the image using fs and send the image content back in the response
    fs.readFile('/root/Applications/IoT-Platform/public/images/graficMail/' + pic, function (err, content) {
        if (err) {
            res.writeHead(400, {
                'Content-type': 'text/html'
            })
            // console.log(err);
            res.end("No such image");
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200, {
                'Content-type': 'image/jpg'
            });
            res.end(content);
        }
    });
})

// get counties of user
app.get('/api/:username/get-counties', (req, res) => {

    var time = new Date()
    var data = []

    var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + req.params.username + "')"

    let counties = influxReader(queryCounties).then(async (result) => {
        var counties = []
        for (var i = 0; i < result.length; i++) {
            counties.push(result[i].county)
        }

        return await counties

    })

    var cities = [0]
    var locations = [0]
    var zones = [0]

    // ================ END ================

    Promise.all([counties, cities, locations, zones]).then((result) => {

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
            })
            // console.log("promise all push done", new Date() - time)
        } else {
            data.push({
                error: true,
                message: "No data found for this user",
                user: req.params.username
            })
        }

        // send the data
        res.status(200).send(data)

    }).catch(error => console.log(`Error in promises ${error}`))

})

// get sensors
app.get('/api/:username/:county/get-sensors', (req, res) => {
    var time = new Date()
    var data = []

    // return evrything that belongs to username and match county and is in a 1day time interval
    var whereQuery = `where username='` + req.params.username + `' and county='` + req.params.county + `'`
    // check what sensor type for the user
    var influxQuery = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`

    let sensorsData = influxReader(influxQuery).then((result) => {

        // console.log("after fetch", new Date() - time)

        // get sensor type
        // var sensorTypeList = []
        var sensorIdList = []
        // var sensorIdListAux = []

        for (var i = 0; i < result.length; i++) {

            sensorIdList.push(result[i].sensorId)

        }

        // build the output
        if (result.length) {
            data.push({
                error: false,
                message: "Data found",
                county: req.params.county,
                user: req.params.username,
                sensorIdListLength: sensorIdList.length,
                sensorIdList: sensorIdList,
                responseTime: new Date() - time + "ms"
            })
        } else {
            data.push({
                error: true,
                message: "No data found",
                county: req.params.county,
                length: result.length,
                user: req.params.username,
                responseTime: new Date() - time + "ms"
            })
        }

        // send the output
        res.status(200).send(data)

    })
        .catch((e) => {
            res.status(404).send("Scraping sensorId data from influx failed", e)
        })

})

// get last value
app.get('/api/:sensor/get-value', (req, res) => {
    var time = new Date()
    var data = []

    var whereQuery = `where sensorId='` + req.params.sensor + `'`
    var influxQuery = `select last(value) as value, username, country, county, city, zone from sensors ` + whereQuery + ` ORDER BY time DESC LIMIT 1`

    // console.log(influxQuery)

    let resultInfluxDb = influxReader(influxQuery).then((result) => {

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
            })
        } else {
            data.push({
                error: true,
                message: "No data found",
                sensorQueried: req.params.sensor,
                lastValue: result,
                responseTime: new Date() - time + "ms"
            })
        }

        return data


    }).then((result) => {
        res.status(200).send(result)
    }).catch((e) => {
        res.status(404).send("Scraping sensor data from influx failed")
    })

})

// get last value for a list of sensors or for a single sensor
app.get('/api/get-last-value', (req, res) => {
    var time = new Date()
    var data = []
    if (req.query.sensorId)
        var influxQuery = `select last(value), county, country, city, location, zone, username, sensorId, type from sensors where sensorId='` + req.query.sensorId + `'`
    else if (req.query.sensorIdList) {

        var whereQuery = ''

        sensorId = '` + req.query.sensorId + `'

        var sensorListCounter = 0
        var list = req.query.sensorIdList.split(',')
        list.forEach(sensorId => {
            whereQuery += `sensorId='` + sensorId + `'`
            sensorListCounter++
            if (sensorListCounter < list.length) {
                whereQuery += ` or `
            }
        })

        var influxQuery = `select last(value), county, country, city, location, zone, username, sensorId, type from sensors where (` + whereQuery + `) group by sensorId`
        // res.send(influxQuery)
    }

    let resultInfluxDb = influxReader(influxQuery).then((result) => {

        if (result.length) {

            var sensorCounter = 0
            result.forEach(sensor => {
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
                })
            })


        } else {
            data.push({
                error: true,
                message: "No data found",
                lastValue: result,
                responseTime: new Date() - time + "ms"
            })
        }

        return data


    }).then((result) => {
        res.status(200).send(result)
    }).catch((e) => {
        res.status(404).send("Scraping sensor data from influx failed")
    })
})

// get avg on last 10 min and compare with limits
app.get('/api/v2/sensors-alert', async (req, res) => {

    // console.log(req.url)

    var time = new Date()
    // var data = []

    var sqlQuery = "select * from alerts"
    let getMysqlAlerts = mysqlReader(sqlQuery)

    const json = await getMysqlAlerts
    var sensorToWatch = []
    var whereQuery = ''
    var counter = 0;

    json.forEach(sensor => {

        sensorToWatch.push({
            sensorId: sensor.sensorId,
            min: sensor.min,
            max: sensor.max
        })

        whereQuery += 'sensorId=\'' + sensor.sensorId + '\' '

        if (counter < json.length - 1)
            whereQuery += 'or '
        counter++
    })

    // Get the date
    var today = new Date()
    var timeStart = new Date(today.getTime() - 10 * 60000);
    // var timeStart = String(timeStart).split(" ")
    var timeStart = timeStart.valueOf();
    // console.log(today, timeStart)

    // var influxQuery = `select mean(value), last(county) as county, last(country) as country, last(city) as city, last(location) as location, last(zone) as zone, last(username) as username, last(sensorId) as sensorId, last(type) as type, last(time) as time from (select * from sensors where (` + whereQuery + `) and time>`+timeStart+` and time<now()) group by sensorId, username order by time desc`
    var influxQuery = `select country, county, city, location, zone, type, sensorId, username, value from sensors where (` + whereQuery + `) and (time > now()-5s and time < now()) group by sensorId,username order by time desc limit 600`
    // console.log(influxQuery)

    let resultInfluxDb = influxReader(influxQuery).then((result) => {

        var alertList = []
        var alertListMin = []
        var alertListMax = []
        var data = []
        var graph = []
        var sensorIndex = 0

        if (result.length) {

            var sensorCounter = 0
            result.forEach(sensor => {
                var sensorAlertFlag = false
                var max = 0
                var min = 0

                // console.log(sensor)
                // graph.push(sensor.value)

                // graph = []

                sensorToWatch.forEach(watch => {

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
                                alert: "min",
                                // graph
                                // time: sensor.time,
                            })
                            // watch.min = sensor.value
                            alertListMin.push(sensor.sensorId)
                            // alertList.push(sensor.sensorId)
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
                                alert: "max",
                                // graph
                                // time: sensor.time,
                            })
                            // watch.max = sensor.value
                            alertListMax.push(sensor.sensorId)
                            // alertList.push(sensor.sensorId)
                        }


                    }
                })

            })

            // insert values for email graphic
            // if we have 3 sensors in alert, each sensor will contain for all 3 sensor the last values
            result.forEach(sensor => {
                sensorToWatch.forEach(watch => {
                    if (sensor.sensorId == watch.sensorId) {
                        graph.push([sensor.sensorId, sensor.time, sensor.value])
                        data.forEach(json => {
                            if (json.sensorQueried == watch.sensorId) {
                                json.graph = graph
                            }
                        })
                    }
                })

            })

            // delete duplicates created above
            data.forEach(sensor => {
                graph = []
                sensor.graph.forEach(item => {
                    if (item[0] == sensor.sensorQueried) {
                        graph.push({
                            time: item[1],
                            value: item[2]
                        })
                    }
                })
                sensor.graph = graph
            })


        } else {
            data.push({
                error: true,
                message: "No data found",
                responseTime: new Date() - time + "ms"
            })
        }

        return data


    }).then((result) => {
        res.status(200).send(result)
    }).catch((e) => {
        res.status(404).send("Scraping sensor data from influx failed")
    })
})

//=========================================
// END - API Get Data From Different Zones


// Sensor Settings
//=========================================

// Device makes a get request to /api/sensor-config?get=1 to get a new configuration
// When device received the configuration it makes a new get request to /api/sensor-config?ack=sensorid with ack param = with sensorId previously received
// When ack param received, store that sensorId in database
// And next time when api is called it will return a new sensorId

// [ ] TODO: store sensors in database
let sensorIncrement = 1
app.get('/api/sensor-config', (req, res) => {

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function getId() {
        let id = sensorIncrement
        return pad(id, 3, 0)
    }

    if (req.query.get) {
        // A device wants to be alive

        let sensorId = "DAS" + getId() + "TCORA"

        let config = {
            "network":
            {
                "ssid": "onef",
                "pass": "cersenin"
            },

            "server":
            {
                "host": "anysensor.ro",
                "port": 883
            },

            "sensor":
            {
                "calibration": 1,
                "interval": 1000,
                "client_id": sensorId,
                "user_id": sensorId,
                "user_key": "dasstecb2b"
            }
        }

        res.status(200).send(config);

    } else if (req.query.ack) {

        sensorIncrement++

        // Device succesfully received the configuration. Store it in database.
        let config = {
            message: "Sensor " + req.query.ack + " stored in database"
        }
        res.status(200).send(config);
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


})

// Manage Sensor API
app.get('/api/manage-sensors', authDashboard, (req, res) => {

    sess = req.session;

    var data = {}

    if (sess.sensorAccess == 0) {
        data.flag = 0
        data.result = "You don't have any sensor attached to your account"
        res.status(200).send(data)
    } else if (sess.sensorAccess == -1) {
        data.flag = -1
        data.result = "Superadmin - work in progress"
        res.status(200).send(data)
    } else {
        var sql = "SELECT * FROM sensors WHERE sensorId IN (" + sess.sensorAccess.join(",") + ")"
        // console.log(sql)
        database.query(sql)
            .then(rows => {
                data.flag = rows.length
                data.user = sess.username
                data.result = rows
                res.status(200).send(data)
            });
    }

})

// Sensor Settings Update
app.post('/api/manage-sensors/update', authDashboard, async (req, res) => {
    sess = req.session;
    form = req.body

    if (sess.sensorAccess.includes(parseInt(form.id))) {
        var sql = 'UPDATE sensors SET county="' + form.county + '", city="' + form.city + '", street="' + form.street + '", sensorName="' + form.name + '" WHERE sensorId = "' + form.id + '"'
        database.query(sql).then((res) => {
            if (res)
                console.log("User", sess.username, "updated sensor", form.id)
            else
                console.log("Failed update: user", sess.username, "tried to update sensor", form.id)
        })
        req.session.message = "Update has been performed"
        res.redirect('/manage-sensors')
    } else {
        res.send('No update was made to database because sensor ID was changed')
    }
})

// Manage Sensors Dashboard
app.get('/manage-sensors', authDashboard, (req, res) => {
    sess = req.session
    if (req.session.message) {
        var data = {
            message: req.session.message,
            username: sess.username,
            user_role: sess.user_role,
            sensorId: sess.sensorId,
            user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
        }
    } else {
        var data = {
            username: sess.username,
            user_role: sess.user_role,
            sensorId: sess.sensorId,
            user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
        }
    }
    req.session.message = '' // clear the message 
    res.render('manage-sensors', data)
})

// Set a new device
app.get('/set-new-device', authDashboard, (req, res) => {
    sess = req.session
    req.session.message = 'Hi, ' + sess.username + '!'
    var data = {
        message: req.session.message,
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorId,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    }
    req.session.message = ''
    // console.log(data)
    res.render('set-new-device', data)
})

// Sensor Location
app.get('/api/read-location', (req, res) => {

    sess = req.session

    if (req.query.sensorId)
        var query = "SELECT * FROM sensorLocation WHERE sensorId='" + req.query.sensorId + "'"
    else
        var query = "SELECT * FROM sensorLocation"

    var time = new Date()

    let sensorLocation = mysqlReader(query).then(async (rows) => {
        return await rows
    })

    Promise.all([sensorLocation]).then(result => {
        res.send({
            result: result[0],
            responseTime: new Date() - time + "ms"
        })
    })

})

// Sensor Alert
app.get('/api/read-alerts', (req, res) => {
    sess = req.session

    if (req.query.sensorId)
        var query = "SELECT * FROM alerts WHERE sensorId='" + req.query.sensorId + "'"
    else
        var query = "SELECT * FROM alerts"

    var time = new Date()

    let mysqlAlerts = mysqlReader(query).then(async (rows) => {
        return await rows
    })

    Promise.all([mysqlAlerts]).then(result => {
        res.send({
            result: result[0],
            responseTime: new Date() - time + "ms"
        })
    })
})

app.get('/api/set-alerts', (req, res) => {

    sess = req.session

    // console.log(req.query)

    var mysqlReturn = []

    if (req.query.min || req.query.max) {
        var query = "SELECT * FROM alerts WHERE sensorId=" + req.query.sensorId

        let mysqlResult = mysqlReader(query).then(async (rows) => {
            return await rows
        })

        Promise.all([mysqlResult]).then(result => {
            var sensorExists = result[0].length

            if (sensorExists) {
                var queryUpdate = "UPDATE alerts SET min=" + req.query.min + ", max=" + req.query.max + ", sensorType=" + req.query.sensorType + " WHERE sensorId=" + req.query.sensorId + ";"
                mysqlWriter(queryUpdate)
                    .then((result) => {
                        // io.sockets.emit('message', {
                        //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
                        //     send: "Alerts updated",
                        //     time: new Date()
                        // })
                        mysqlReturn.push({
                            "updateAlerts": true,
                            "query": query,
                            "message": result
                        })

                        if (!(req.query.lat || req.query.long)) {
                            res.json(mysqlReturn)
                        }

                        // res.send({
                        //     "update": true,
                        //     "query": query,
                        //     "message": result
                        // })
                    })
            } else {
                var query = "INSERT INTO alerts (sensorId, min, max, sensorType) VALUES (" + req.query.sensorId + ", " + req.query.min + ", " + req.query.max + ", " + req.query.sensorType + ");"
                mysqlWriter(query)
                    .then((result) => {
                        // io.sockets.emit('message', {
                        //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
                        //     send: "Alerts updated",
                        //     time: new Date()
                        // })

                        mysqlReturn.push({
                            "insertAlerts": true,
                            "query": query,
                            "message": result
                        })

                        if (!(req.query.lat || req.query.long)) {
                            res.json(mysqlReturn)
                        }

                        // res.send({
                        //     "insert": true,
                        //     "query": query,
                        //     "message": result
                        // })
                    })
            }



        }).catch(error => {

            mysqlReturn.push({
                error
            })

            if (!(req.query.lat || req.query.long)) {
                res.json(mysqlReturn)
            }

            // io.sockets.emit('message', {
            //     send: "Error when updating the alerts",
            //     time: new Date()
            // })
        })
    }

    if (req.query.lat || req.query.long) {
        var query = "SELECT * FROM sensorLocation WHERE sensorId=" + req.query.sensorId

        let mysqlResult = mysqlReader(query).then(async (rows) => {
            return await rows
        })

        Promise.all([mysqlResult]).then(result => {
            var sensorExists = result[0].length

            if (sensorExists) {
                var queryUpdate = "UPDATE sensorLocation SET coord='" + req.query.lat + "," + req.query.long + "' WHERE sensorId=" + req.query.sensorId + ";"
                mysqlWriter(queryUpdate)
                    .then((result) => {
                        // io.sockets.emit('message', {
                        //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
                        //     send: "Alerts updated",
                        //     time: new Date()
                        // })
                        mysqlReturn.push({
                            "updateCoord": true,
                            "query": query,
                            "message": result
                        })

                        res.json(mysqlReturn)

                        // res.send({
                        //     "update": true,
                        //     "query": query,
                        //     "message": result
                        // })
                    })
            } else {
                var query = "INSERT INTO sensorLocation (sensorId, coord) VALUES (" + req.query.sensorId + ", '" + req.query.lat + "," + req.query.long + "');"
                mysqlWriter(query)
                    .then((result) => {
                        // io.sockets.emit('message', {
                        //     // send: "Alerts updated for "+req.query.sensorId+" with min="+req.query.min+" and max="+req.query.max+"",
                        //     send: "Alerts updated",
                        //     time: new Date()
                        // })

                        mysqlReturn.push({
                            "insertCoord": true,
                            "query": query,
                            "message": result
                        })

                        res.json(mysqlReturn)

                        // res.send({
                        //     "insert": true,
                        //     "query": query,
                        //     "message": result
                        // })
                    })
            }

        }).catch(error => {
            // console.error(`Error in promises ${error}`)
            mysqlReturn.push({
                error
            })

            res.json(mysqlReturn)

            // io.sockets.emit('message', {
            //     send: "Error when updating the alerts",
            //     time: new Date()
            // })
        })
    }



})
// End Sensor Alert

//=========================================
// END - Sensor Settings

// Settings Page
//=========================================
// Get all users with the same company
app.get('/api/get-team', (req, res) => {
    sess = req.session
    if (sess.role == "superadmin") {
        mysqlReader("select name, username, email, company from users where company = (select company from users where username='" + sess.username + "');")
            .then(result => {
                res.status(200).send(result)
            })
    } else {
        res.status(401).send("You are not logged in!")
    }
})

app.post('/api/create-admin', (req, res) => {
    sess = req.session
    if (sess.role = "superadmin") {
        const {
            name,
            username,
            email,
            company,
            password
        } = req.body

        // console.log(name,
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

        const checkUsername = mysqlReader("SELECT username FROM users WHERE username='" + username + "'")
        // const checkCompany = mysqlReader("SELECT company FROM users WHERE company='" + company + "'")

        Promise.all([checkUsername]).then(async (result, err) => {
            if (err) {
                return res.status(412).send("Try again!")
            } else if (result[0].length) {
                return res.status(412).send("Username is already used!")
            } else {
                let hashedPassword = await bcrypt.hash(password, 10)
                //register the user into db
                const credentials = {
                    name: name,
                    username: username,
                    email: email,
                    company: company,
                    password: hashedPassword,
                    role: 'admin'
                }
                db.query("INSERT INTO users SET ?", credentials, (err, result) => {
                    if (err)
                        return res.status(412).send("Try again!")
                    else {
                        // console.log("New user registration")
                        return res.status(200).send("User registered!")
                    }
                })
            }

        })
    }
})

// Get distinct locations for sensors that belong to company of superadmin
app.get('/api/get-zones', (req, res) => {
    sess = req.session;
    // console.log(sess.userData)
    if (sess.role == "superadmin") {

        // It returns a list of locations and users associated with that location
        let getZonesAndUserList = mysqlReader(`select locations.*, GROUP_CONCAT(users.username) as usersList
            from sensors
            join locations on locations.zoneId = sensors.zoneId
            join userAccess on sensors.sensorId = userAccess.sensorId
            join users on users.company = '`+ sess.company + `' and users.username = userAccess.username
            group by sensors.zoneId;`)

        // It returns a list of locations created by a user
        let getZones = mysqlReader(`select * from locations where createdBy='` + sess.company + `'`)


        Promise.all([getZonesAndUserList, getZones]).then(result => {
            // console.log(result[0].length, result[0])
            res.status(200).send(result)
        })

    } 
    else if (sess.role == "admin") {

        // It returns a list of locations and users associated with that location
        // let getZonesAndUserList = mysqlReader(`select locations.*
        //     from sensors
        //     join locations on locations.zoneId = sensors.zoneId
        //     join users on users.company = '`+ sess.company + `' and users.username = `+sess.username+`
        //     group by sensors.zoneId;`)
        // let getZonesAndUserList = sess.userData

        // It returns a list of locations created by a user
        // let getZones = mysqlReader(`select * from locations where createdBy='` + sess.company + `'`)
        let getZones = sess.userData


        Promise.all([getZones]).then(result => {
            // console.log(result[0].length, result[0])
            res.status(200).send(result)
        })

        // res.status(200).send(undefined)

    } 
    else {
        res.status(401).send("You are not logged in!")
    }

})

// Route active for settings page - edit zone form
app.post('/api/edit-zone', authDashboard, async (req, res) => {

    sess = req.session

    const form = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {

        // console.log(fields)

        // Get username list raw
        const { zoneid, location1, location2, location3, map, ...userList } = fields;
        // console.log(fields.zoneid, userList)

        // Get all sensors in a zoneId
        let getSensorList = await mysqlReader("select group_concat(sensors.sensorId) as sensorId from sensors where sensors.zoneId = " + fields.zoneid)
        // [ ] TODO: each zone MUST be associated with a sensorId, otherwise there will be problem with assigantion of user @ that zone

        let finalSensorList = ''
        getSensorList[0].sensorId.split(',').forEach((item, index) => {
            finalSensorList += `'` + item + `'`
            if (index != getSensorList[0].sensorId.split(',').length - 1)
                finalSensorList += ','
        })

        // Drop all access for sensors in this zone
        let dropUserAccess
        if(sess.role=='superadmin')
            dropUserAccess = await mysqlReader("delete from userAccess where sensorId IN (" + finalSensorList + ")")
        else if(sess.role=='admin')
            dropUserAccess = true

        // Get user list
        let userListFinal = []
        for (const key in userList) {
            userListFinal.push(userList[key])
        }

        // Prepare values for sql query: ('DAS008TCORA','alex.barbu3'),('DAS008TCORA','alex.barbu2')
        let valuesToInsert = () => {
            let returnRaw = ``
            userListFinal.forEach((user, index) => {
                getSensorList[0].sensorId.split(',').forEach((itemSensor, indexSensor) => {
                    returnRaw += `('` + itemSensor + `','` + user + `')`
                    returnRaw += ','
                })
            })
            returnRaw = returnRaw.substring(0, returnRaw.length - 1);
            return returnRaw
        }

        // if there are user to give access for => grant access for them
        // if leave sensor access dropped from above
        let grantUserAccess
        if (valuesToInsert()) {
            // console.log("GRANT ADMIN FOR:", valuesToInsert())
            let grantUserAccess
            if(sess.role=='superadmin')
                grantUserAccess = await mysqlReader("insert into userAccess (sensorId, username) VALUES " + valuesToInsert())
            else if(sess.role=='admin')
                grantUserAccess = true
        } else {
            grantUserAccess = true
        }


        Promise.all([dropUserAccess, grantUserAccess]).then(result => {
            // console.log("PROMISE ALL", fields)

            if (fields.map == 'custom') {

                if (files.mapimage.size) {
                    // Get tmp path
                    const oldpath = files.mapimage.path;
                    // Build path of image
                    let filename = files.mapimage.name.toLowerCase().split('.')
                    const asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
                    let date = new Date()
                    filename = date.getTime() + '_' + asciiStr + '.' + filename[1]
                    const newpath = './public/images/custom-maps/' + filename;
                    // Save image
                    fs.rename(oldpath, newpath, function (err) {
                        if (err)
                            res.status(404).send({ error: err })
                        else {
                            mysqlReader("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.zoneid + "").then((result) => {
                                res.redirect("/settings")
                            }).catch((err) => {
                                res.status(200).send({ error: err });
                            })
                        }
                    });
                } else {
                    let hasImageSetted = false
                    if (hasImageSetted) {
                        // console.log("Map has the same image")
                    } else {
                        mysqlReader("UPDATE locations SET map='custom' where zoneId=" + fields.zoneid + "").then((result) => {
                            res.redirect("/settings")
                        }).catch((err) => {
                            res.status(200).send({ error: err });
                        })
                    }

                }


            } else if (fields.map == 'ol') {
                mysqlReader("UPDATE locations SET map='ol' where zoneId=" + fields.zoneid + "").then((result) => {
                    res.redirect("/settings")
                }).catch((err) => {
                    res.status(400).send({ error: err });
                })
            } else {
                // console.log("No map selected")
                res.redirect("/settings")
                // mysqlReader("UPDATE locations SET map='NULL' where zoneId=" + fields.zoneid + "").then((result) => {
                //     res.redirect("/settings")
                // }).catch((err) => {
                //     res.status(200).send({ error: err });
                // })
            }
        })

    })
})

app.post('/api/update-map', async (req, res) => {
    sess = req.session
    let body = req.body
    if (sess.role == 'superadmin') {
        // [*] check if user has access to map id
        let hasAccess = mysqlReader("select locations.zoneId from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');")
            .then(result => {
                return result.some(el => {
                    return el.zoneId == body.id
                })
            }).then(access => {
                return access
            })

        // [ ] perform the update

        // console.log(await hasAccess)
        if (await hasAccess) {
            mysqlReader("UPDATE locations SET map='" + body.map + "' where zoneId=" + body.id + "")
                .then(() => {
                    res.status(200).send({ message: "updated", error: false });
                })
        } else {
            res.status(403).send(({ message: "use has not access", error: true }));
        }
    } else if (sess.username) {
        // [ ] check if user has access to map id
        let hasUserAccess = await mysqlReader("select locations.zoneId from locations inner join sensors on sensors.zoneId = locations.zoneId inner join userAccess on (userAccess.sensorId = sensors.sensorId and userAccess.username = '" + sess.username + "');")
        // console.log(hasUserAccess)
    }
})

app.post('/api/upload-image', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // console.log(fields, files)

        const oldpath = files.map.path;

        // Build path of image
        let filename = files.map.name.toLowerCase().split('.')
        const asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
        let date = new Date()
        filename = date.getTime() + '_' + asciiStr + '.' + filename[1]
        const newpath = './public/images/custom-maps/' + filename;

        // console.log(fields.id, oldpath, newpath)

        // Save image
        fs.rename(oldpath, newpath, function (err) {
            if (err)
                res.status(404).send({ error: err })
            else {
                mysqlReader("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.id + "").then((result) => {
                    // res.status(200).send({ error: false });
                    res.redirect('/map?id=' + fields.id)
                }).catch((err) => {
                    res.status(200).send({ error: err });
                })
            }
        });
    })
    // console.log(req.body)
})

app.post('/api/v2/upload-image', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var reader = new FileReader(fields.userfile);
        console.log(reader)
        console.log(fields, files)
        const oldpath = files.map.path;
        // Build path of image
        let filename = files.map.name.toLowerCase().split('.')
        const asciiStr = filename[0].normalize('NFKD').replace(/[^\w]/g, '');
        let date = new Date()
        filename = date.getTime() + '_' + asciiStr + '.' + filename[1]
        const newpath = './public/images/custom-maps/' + filename;
        // Save image
        fs.rename(oldpath, newpath, function (err) {
            if (err)
                res.status(404).send({ "href": fields.href });
            else {
                console.log("UPDATE locations SET map='" + newpath + "' where zoneId=" + fields.id + "")
                res.status(200).send({ "href": fields.href });
                // mysqlReader().then((result) => {
                //     res.status(200).send({ error: false });
                // }).catch((err) => {
                //     res.status(200).send({ error: err });
                // })
            }
        });
    })
})

// Mysql interface
app.get('/api/mysql', async (req, res) => {
    mysqlReader(req.query.q).then((result) => {
        res.status(200).send(result)
    })
})
//=========================================
// END Settings Page

// Team Page
//=========================================
app.get('/api/v2/sensors-access', (req, res) => {
    var time = new Date()
    var data = []

    // console.log(req.query.username)

    if (req.query.username) {

        var query = "SELECT * FROM sensors WHERE username='" + req.query.username + "'"

        let mysqlResult = mysqlReader(query).then(async (rows) => {
            return await rows
        })

        Promise.all([mysqlResult]).then(result => {
            // console.log(new Date() - time)
            if (result[0].length) {
                var sensorQuery = 'or ';
                resultCounter = 0
                result[0].forEach(element => {
                    if (resultCounter < result[0].length - 1)
                        sensorQuery += "sensorId='" + element.sensorId + "' or "
                    else
                        sensorQuery += "sensorId='" + element.sensorId + "'"
                    resultCounter++
                })
                var whereQuery = "username='" + req.query.username + "' " + sensorQuery + " "
            } else {
                var whereQuery = "username='" + req.query.username + "'"
            }

            // var influxQuery = "select zone, username, sensorId from (select * from sensors where " + whereQuery + ") group by sensorId limit 1;"
            var influxQuery = "show series where " + whereQuery
            // console.log(influxQuery)

            let influxResult = influxReader(influxQuery).then(async (result) => {
                // console.log(await result)
                return await result
            })

            Promise.all([influxResult]).then(result => {

                result[0].forEach(element => {
                    data.push({
                        // result: element.key,
                        error: false,
                        query: req.query.username,
                        sensorId: element.key.split(",")[5].split("=")[1],
                        belongsTo: element.key.split(",")[7].split("=")[1],
                        zone: element.key.split(",")[8].split("=")[1].split("\\ ").join(' '),
                        county: element.key.split(",")[3].split("=")[1].split("\\ ").join(' ')
                    })
                })

                if (result[0].length == 0) {
                    data.push({
                        error: "No zone assigned",
                        query: req.query.username,

                    })
                }

                res.send({
                    influxQuery,
                    responseTime: new Date() - time + "ms",
                    data
                })
            }).catch(error => console.log(`Error in promises ${error}`))

        })

    } else {
        res.send("You forgot to write a username: example /api/sensor-access?username=demo")
    }

})

//no longer usd
app.get('/api/sensors-access', (req, res) => {
    var time = new Date()
    var data = []

    // console.log(req.query.username)

    if (req.query.username) {

        var query = "SELECT * FROM sensors WHERE username='" + req.query.username + "'"

        let mysqlResult = mysqlReader(query).then(async (rows) => {
            return await rows
        })

        Promise.all([mysqlResult]).then(result => {
            // console.log(new Date() - time)
            if (result[0].length) {
                var sensorQuery = 'or ';
                resultCounter = 0
                result[0].forEach(element => {
                    if (resultCounter < result[0].length - 1)
                        sensorQuery += "sensorId='" + element.sensorId + "' or "
                    else
                        sensorQuery += "sensorId='" + element.sensorId + "'"
                    resultCounter++
                })
                var whereQuery = "username='" + req.query.username + "' " + sensorQuery + " "
            } else {
                var whereQuery = "username='" + req.query.username + "'"
            }

            var influxQuery = "select zone, username, sensorId from (select * from sensors where " + whereQuery + ") group by sensorId limit 1;"
            // console.log(influxQuery)

            let influxResult = influxReader(influxQuery).then(async (result) => {
                // console.log(await result)
                return await result
            })

            Promise.all([influxResult]).then(result => {
                // console.log(new Date() - time)
                // console.log(result[0])
                result[0].forEach(element => {
                    data.push({
                        zone: element.zone,
                        query: req.query.username,
                        belongsTo: element.username,
                        sensorId: element.sensorId,
                    })
                })
                if (result[0].length == 0) {
                    data.push({
                        error: "No zone assigned",
                        query: req.query.username,

                    })
                }
                res.send({
                    influxQuery,
                    responseTime: new Date() - time + "ms",
                    data
                })
            }).catch(error => console.log(`Error in promises ${error}`))

        })

    } else {
        res.send("You forgot to write a username: example /api/sensor-access?username=demo")
    }

})

app.get('/api/get-users', (req, res) => {

    var time = new Date()
    var query = "SELECT Id, Name, Username, Email, User_role, company FROM users"
    let mysqlResult = mysqlReader(query).then(async (rows) => {
        return await rows
    })
    Promise.all([mysqlResult]).then(result => {
        res.send(result)
    }).catch(error => console.log(`Error in promises ${error}`))

})

app.get('/api/edit-user', getCounties, async (req, res) => {

    sess = req.session

    // console.log(req.url)

    if (req.query.password.length == 0) {

        // get the sensorIds of selected zone
        if (req.query.zones) {

            // console.log(req.query.zones)

            if (typeof req.query.zones == 'string') {
                var influxQuery = `show series where zone='` + req.query.zones + `' and username='` + sess.username + `'`
                // console.log(influxQuery)
                influxReader(influxQuery).then(result => {
                    return result[0].key.split("sensorId=")[1].split(",")[0]
                })
                    .then(async (sensorId) => {
                        // delete all sensor assigments of this user
                        var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
                        mysqlWriter(sqlQuery)
                        return sensorId
                    })
                    .then(async (sensorId) => {
                        // insert sensorId and username into sensors mysql table 
                        var sqlQuery = `INSERT INTO sensors (sensorId, username) VALUES ('` + sensorId + `', '` + req.query.username + `')`
                        mysqlWriter(sqlQuery)
                    })
            } else if (typeof req.query.zones == 'object') {
                var zoneQuery = ''
                var zoneCounter = 0
                req.query.zones.forEach(zone => {
                    zoneQuery += `zone='` + zone + `'`
                    if (zoneCounter < req.query.zones.length - 1)
                        zoneQuery += ' or '
                    zoneCounter++
                })
                var influxQuery = `show series where (` + zoneQuery + `) and username='` + sess.username + `'`
                // console.log(influxQuery)

                influxReader(influxQuery).then(result => {
                    var sensorsList = []
                    // console.log(result)
                    result.forEach(series => {
                        sensorsList.push(series.key.split("sensorId=")[1].split(",")[0])
                    })
                    return sensorsList
                })
                    .then(async (sensorsList) => {
                        // delete all assigments of this user
                        var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
                        mysqlWriter(sqlQuery)
                        return sensorsList
                    })
                    .then(async (sensorsList) => {
                        // insert sensorId and username into sensors mysql table 
                        sensorsList.forEach(sensorId => {
                            var sqlQuery = `INSERT INTO sensors (sensorId, username) VALUES ('` + sensorId + `', '` + req.query.username + `')`
                            mysqlWriter(sqlQuery)
                        })
                        // res.redirect('/team')
                    })
            }


        } else {
            // if no zone selected - delete all zones assigned to this user
            var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
            mysqlWriter(sqlQuery)
            // res.redirect('/team')
        }

        var query = "UPDATE users SET Name='" + req.query.name + "', Username='" + req.query.username + "', Email='" + req.query.email + "' WHERE Id='" + req.query.id + "';"
        mysqlWriter(query).then((response) => {
            res.redirect("/team")
            // res.send({
            //     sql: req.query,
            //     influxQuery,
            //     username: sess.username,
            //     url: req.url
            // })
        }).catch((err) => {
            res.send(err)
        })

    } else {

        // get the sensorIds of selected zone
        if (req.query.zones) {

            // console.log(typeof req.query.zones)

            if (typeof req.query.zones == 'string') {
                var influxQuery = `show series where username='` + sess.username + `' and zone='` + req.query.zones + `'`
                influxReader(influxQuery).then(result => {
                    return result[0].key.split("sensorId=")[1].split(",")[0]
                })
                    .then(async (sensorId) => {
                        // delete all assigments of this user
                        var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
                        mysqlWriter(sqlQuery)
                        return sensorId
                    })
                    .then(async (sensorId) => {
                        // console
                        // insert sensorId and username into sensors mysql table 
                        var sqlQuery = `INSERT INTO sensors (sensorId, username) VALUES ('` + sensorId + `', '` + req.query.username + `')`
                        mysqlWriter(sqlQuery)
                        // res.redirect('/team')
                    })
            } else if (typeof req.query.zones == 'object') {
                var zoneQuery = ''
                var zoneCounter = 0
                req.query.zones.forEach(zone => {
                    zoneQuery += `zone='` + zone + `'`
                    if (zoneCounter < req.query.zones.length - 1)
                        zoneQuery += ' or '
                    zoneCounter++
                })
                var influxQuery = `show series where username='` + sess.username + `' and (` + zoneQuery + `)`

                // console.log(influxQuery)

                influxReader(influxQuery).then(result => {
                    var sensorsList = []
                    // console.log(result)
                    result.forEach(series => {
                        sensorsList.push(series.key.split("sensorId=")[1].split(",")[0])
                    })
                    return sensorsList
                })
                    .then(async (sensorsList) => {
                        // delete all assigments of this user
                        var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
                        mysqlWriter(sqlQuery)
                        return sensorsList
                    })
                    .then(async (sensorsList) => {
                        // insert sensorId and username into sensors mysql table 
                        sensorsList.forEach(sensorId => {
                            var sqlQuery = `INSERT INTO sensors (sensorId, username) VALUES ('` + sensorId + `', '` + req.query.username + `')`
                            mysqlWriter(sqlQuery)
                        })
                        // res.redirect('/team')
                    })
            }


        } else {
            // if no zone selected - delete all zones assigned to this user
            var sqlQuery = `DELETE FROM sensors WHERE username='` + req.query.username + `'`
            mysqlWriter(sqlQuery)
            // res.redirect('/team')
        }

        // encrypt the password
        let hashedPassword = await bcrypt.hash(req.query.password, 10)

        // update the table
        var query = "UPDATE users SET Name='" + req.query.name + "', Username='" + req.query.username + "', Email='" + req.query.email + "', Password='" + hashedPassword + "' WHERE Id='" + req.query.id + "';"
        mysqlWriter(query)

        res.redirect("/team")
        // res.send([query, req.query.password, hashedPassword])

    }

})

app.get('/api/add-user', (req, res) => {
    sess = req.session
    if (sess.username) {
        // console.log(req.query)
        var sql = `SELECT Username from users where username='` + req.query.username + `'`
        mysqlReader(sql).then(async (response) => {
            if (response.length) {
                res.send({
                    error: "username already exists"
                })
            } else {
                let hashedPassword = await bcrypt.hash(req.query.password, 10)
                var sql = `INSERT INTO users (Name, Username, Password, Email, User_role, company) VALUES ('` + req.query.name + `','` + req.query.username + `','` + hashedPassword + `','` + req.query.email + `','basic','` + req.query.company + `');`
                mysqlReader(sql)
            }
        })
        res.redirect("/team")
    } else {
        res.render("login", {
            alert: "Username `" + username + "` is not registered!"
        })
    }
})

// Active route for settings page
app.post('/api/remove-user', async (req, res) => {

    const queryGetSensorId = `select sensorId from userAccess where username='` + req.body.username + `'`
    let getSensorId = await mysqlReader(queryGetSensorId).then(result => {
        if (result.length)
            result.forEach(sensor => {
                const queryRemoveUserAccess = `delete from userAccess where username='` + req.body.username + `'`
                mysqlReader(queryRemoveUserAccess).then(result => {
                    const queryRemoveSensor = `delete from sensors where sensorId='` + sensor.sensorId + `'`
                    mysqlReader(queryRemoveSensor)
                    const queryRemoveUser = `delete from users where username='` + req.body.username + `'`
                    mysqlReader(queryRemoveUser)
                })
            })
        else {
            const queryRemoveUser = `delete from users where username='` + req.body.username + `'`
            mysqlReader(queryRemoveUser)
        }

    })

    Promise.all([getSensorId]).then(result => {
        // res.redirect('/settings')
        res.status(200).send(result)
    }).catch(err => {
        // console.log(err)
        res.status(500).send(err)
    })

    // const queryRemoveSensors = `delete from sensors where username='` + req.query.username + `'`
    // let removeSensors = await mysqlReader(queryRemoveSensors)
    // Promise.all([removeUser, removeSensors]).then((response) => {
    //     console.log(response)
    // })
    // res.redirect('/team')
})

app.get('/team', cookieChecker, authDashboard, getUserData, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
    res.render("team", {
        username: sess.username,
        role: sess.role,
        userData: sess.userData

    })
})
//=========================================
// End Team Page

// Scale, Conveyor, Scanner API
//=========================================
app.get("/api/conveyor", (req, res) => {

    if (req.query.setStatus) {
        var status = req.query.setStatus == 'off' ? 0 : 1
        mysqlReader("INSERT INTO conveyor_noriel (status) VALUES (" + status + ")").then(result => {
            res.send(result)
        })
    } else {
        let statusConveyor = mysqlReader("select * from conveyor_noriel order by timestamp desc limit 1").then(async (rows) => {
            // return await rows
            res.send(await rows)
        })
    }

})

app.get("/api/get-voltage", (req, res) => {
    // example: /api/get-voltage?source1&source2

    sess = req.session
    var time = new Date()
    var data = []

    if ("source1" in req.query && "source2" in req.query) {
        var influxQuery = `select last(value), county, country, city, location, zone, username, sensorId, type from sensors where username='` + sess.username + `' and (sensorId =~ /source1*/ or sensorId =~ /source2*/) group by sensorId order by time desc`
    } else if ("source1" in req.query) {
        var influxQuery = `select last(value), county, country, city, location, zone, username, sensorId, type from sensors where username='` + sess.username + `' and (sensorId =~ /source1*/) group by sensorId order by time desc`
    }

    let resultInfluxDb = influxReader(influxQuery).then(result => {
        if (result.length) {
            result.forEach(sensor => {
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
                })
            })
        } else {
            data.push({
                error: true,
                message: "No data found",
                influxQuery,
                lastValue: result,
                responseTime: new Date() - time + "ms"
            })
        }
        return data
    }).then(result => {
        res.status(200).send(result)
    }).catch((e) => {
        res.status(404).send("Scraping power source data from influx failed")
    })
})

// getting the scale recordings from mysql for logged user
app.get("/api/get-scale-recordings", (req, res) => {
    sess = req.session
    if (sess.username) {
        if (sess.isScaleAvailable.tableExist) {
            // var query = "select * from scale_" + sess.username + " where date(timestamp) = CURDATE()"
            var query = "SELECT * FROM scale_" + sess.username + " where date(timestamp) = CURDATE()"
            mysqlReader(query)
                .then(result => {
                    res.send(result)
                })
        }
    }
})

// insert scale recording without login
app.get("/api/v2/send-scale-recordings", (req, res) => {
    // var sqlQuery = "INSERT INTO scale_" + req.query.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", " + req.query.wms + "); "
    var sqlQuery = "INSERT INTO scale_" + req.query.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", 0); "
    mysqlReader(sqlQuery)
        .then(result => {
            res.send({
                url: req.originalUrl,
                result
            })
        })
})

// insert scale recording
app.get("/api/send-scale-recordings", (req, res) => {
    sess = req.session
    if (sess.username) {
        if (req.query.wms) {
            var sqlQuery = "INSERT INTO scale_" + sess.username + " (barcode, value, wms) VALUES (" + req.query.barcode + ", " + req.query.weight + ", " + req.query.wms + "); "
        } else {
            var sqlQuery = "INSERT INTO scale_" + sess.username + " (barcode, value) VALUES (" + req.query.barcode + ", " + req.query.weight + "); "
        }
        mysqlReader(sqlQuery)
            .then(result => {
                res.send({
                    url: req.originalUrl,
                    result
                })
            })
    }
})

// getting the scanner recordings from mysql for logged user
app.get("/api/get-scanner-recordings", (req, res) => {
    sess = req.session
    if (sess.username) {
        if (sess.isScannerAvailable.tableExist) {
            mysqlReader("DELETE FROM scanner_" + sess.username + " WHERE timestamp < current_date ")
            mysqlReader("SELECT * FROM scanner_" + sess.username + " order by timestamp asc")
                .then(result => {
                    res.send(result)
                })
        }
    }
})

// insert scanner recordings
app.get("/api/send-scanner-recordings", (req, res) => {
    sess = req.session
    if (sess.username) {
        mysqlReader("INSERT INTO scanner_" + sess.username + " (barcode, status) VALUES (" + req.query.barcode + ", " + req.query.status + "); ")
            .then(result => {
                res.send({
                    url: req.originalUrl,
                    result
                })
            })
    }
})

app.get("/api/request-scanner-config", (req, res) => {
    sess = req.session
    if (sess.username) {
        mysqlReader("SELECT * FROM request_" + sess.username)
            .then(result => {
                res.send(result)
            })
            .catch(err => {
                res.send(err)
            })
    }
})

app.get("/api/socketio-access", (req, res) => {
    sess = req.session
    var data = {}
    if (sess.username) {
        mysqlReader("SELECT * FROM socketioAccess")
            .then(result => {
                result.forEach(item => {
                    if (item.username == sess.username) {
                        res.send({
                            success: true
                        })
                    } else {
                        res.send({
                            success: false
                        })
                    }
                })
            })
            .catch(err => {
                res.send(err)
            })
    } else {
        res.send({
            success: false
        })
    }
})

//=========================================
// End Scale, Conveyor, Scanner API

// PROXY
//=========================================
app.post("/proxy", (req, res) => {

    axios.post(req.query.url, req.body).then(response => {
        console.log("url:", req.query.url)
        console.log("body:", req.body)
        console.log("response:", response.data)
        res.send(response.data)
    })

})
//=========================================
// END PROXY

// ROUTE FOR VUE
//=========================================
app.get("/api/vue/influx", async (req, res) => {
    // console.log(req.query)
    var query = req.query.query
    const result = await influxReader(query)
    res.send(result)
})
//=========================================
// END ROUTE FOR VUE

// Admin Page
//=========================================
app.get("/admin", authDashboard, async (req, res) => {
    res.send("Admin page")
})
//=========================================
// END Admin Page

// CSV
app.get("/api/csv", (req, res) => {
    var query = "select mean(value) as value from sensors where sensorId='sensor22' group by time(1d) limit 100"
    var query2 = "select time,value from sensors where sensorId='DAS001TDEMO' order by time desc limit 200"
    var query3 = "select mean(value) as value from sensors where sensorId='DAS001TDEMO' group by time(1h)"
    let result = influxReader(query3).then(resultQuery => {
        // res.send(resultQuery)
        var csvData = [
            ["ds", "y"]
        ]
        resultQuery.forEach(result => {
            var hour = result.time._nanoISO.split("T")[0] + " " + result.time._nanoISO.split("T")[1].split("Z")[0].split(".")[0]
            if (result.value)
                csvData.push([hour, result.value])
        })
        let csvContent = "";
        csvData.forEach(function (rowArray) {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });
        // console.log("csvContent:", csvContent.length)
        res.send(csvContent)
    })

})

app.post('/api/v3/multi-report/hourly', (req, res) => {
    sess = req.session
    // if (sess.username) {

    // console.log(req.body)

    function changeTimezone(date, ianatz) {

        // suppose the date is 12:00 UTC
        var invdate = new Date(date.toLocaleString('en-US', {
            timeZone: ianatz
        }));

        // then invdate will be 07:00 in Toronto
        // and the diff is 5 hours
        var diff = date.getTime() - invdate.getTime();

        // so 12:00 in Toronto is 17:00 UTC
        return new Date(date.getTime() - diff); // needs to substract

    }

    // Init vars
    let today, year, month, hOffset, start, end, customDate = req.body['date[]']

    // Preprocess timestamp
    // console.log(customDate)
    start = customDate[0] + ' 00:00:00'
    end = customDate[1] + ' 23:59:59'
    // console.log(start,end)

    // Prepare sensor list for Influx query
    let sensors = ``
    let listOfSensorsId = req.body['listOfSensorsId[]']
    let listOfSensorsType = req.body['listOfSensorsType[]']
    let queryDoor
    let queryTemperature

    // Build a query for each sensorId of a type
    let sensorDataBundle = []

    if (typeof listOfSensorsId == 'string') {
        listOfSensorsId = new Array(listOfSensorsId)
        listOfSensorsType = new Array(listOfSensorsType)
    }

    // Get distinct sensorTypes to build different querys
    let sensorTypes = {
        isTemperature: false,
        isDoor: false
    }
    let distinctSensorsType = _.sortedUniq(listOfSensorsType)
    distinctSensorsType.forEach(async (item, index) => {

        // Get sensorIds of current sensorType
        let sensorIds = listOfSensorsId.filter((id, idx) => {
            if (listOfSensorsType[idx] == item)
                return id
        })

        // Query for DOOR
        if (item == 'door') {

            console.log(item, sensorIds)
            sensorTypes.isDoor = true

            // Return how many times a door has been open or closed in an hour
            let query = "select value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId order by time desc"

            // Make the request
            queryDoor = influxReader(query)
        } else if (item == 'temperature') { // Query for TEMPERATURE

            console.log(item, sensorIds)
            sensorTypes.isTemperature = true

            // Return average of temperature for each hour
            let query = "select mean(value) as value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId,time(1h) order by time desc"

            // Make the request
            queryTemperature = influxReader(query)

        }

    })

    let listOfPromises = []
    if (sensorTypes.isDoor)
        listOfPromises.push(queryDoor)
    if (sensorTypes.isTemperature)
        listOfPromises.push(queryTemperature)

    Promise.all(listOfPromises).then((results) => {

        // console.log("promise all")

        // console.log(start, end)

        // console.log("Doors:", results[0].groupRows.length)

        // Door results
        if (sensorTypes.isDoor)
            results[0].groupRows.forEach((sensor, idx) => {

                // console.log("sensor:", sensor.tags.sensorId)
                // Process the result

                let oldHour, oldDay, oldMonth, oldYear
                let hourlyOpenDoor = []
                let hourlyOpenDoorTimer = 0
                let dailyOpenDoor = []
                let dailyOpenDoorBlank = []
                let dailyOpenDoorTimer = 0

                // Fill hourlyOpenDoor with all hours between start & end
                // let dayStart = start.split(" ")
                dayStart = new Date(start); // new Date() creates a date with 2 hours less than inserted
                dayStart.setTime(dayStart.getTime() - dayStart.getTimezoneOffset() * 60 * 1000); // adjust the date
                // let dayEnd = end.split(" ")
                dayEnd = new Date(end); // new Date() creates a date with 2 hours less than inserted
                dayEnd.setTime(dayEnd.getTime() - dayEnd.getTimezoneOffset() * 60 * 1000); // adjust the date

                console.log(dayStart, dayEnd)

                for (let d = dayStart; d <= dayEnd; d.setHours(d.getHours() + 1)) {
                    let time = d.toISOString()
                    // let time = d.toLocaleString()
                    hourlyOpenDoor.push({ time, value: null, sensorId: null });
                }

                // console.log(hourlyOpenDoor)

                // Remap the time and values (minutes when door is opened by hour)
                sensor.rows.forEach((data, index) => {

                    let time = data.time._nanoISO.split("T")[0]
                    let currentTime = new Date()
                    let newYear = time.split("-")[0]
                    let newMonth = time.split("-")[1]
                    let newDay = time.split("-")[2]
                    let newHour = data.time._nanoISO.split("T")[1].split(":")[0]
                    let newState = data.value

                    if (newHour != oldHour) {
                        if (oldHour != undefined) {
                            hourlyOpenDoor.push({ time: oldYear + '-' + oldMonth + '-' + oldDay + 'T' + oldHour + ':00:00.000Z', value: Math.round(hourlyOpenDoorTimer * 100) / 100, sensorId: data.sensorId })
                        }
                        hourlyOpenDoorTimer = 0
                        oldHour = newHour
                    }

                    if (oldDay != newDay) {
                        oldDay = newDay
                    }

                    if (newMonth != oldMonth) {
                        oldMonth = newMonth
                    }

                    if (newYear != oldYear) {
                        oldYear = newYear
                    }

                    if (newState == 0) {
                        let currentTimeInflux = data.time.getNanoTime()
                        let previousTime
                        // try {
                        previousTime = sensor.rows[index - 1].time.getNanoTime()
                        // } catch(e) {
                        //     previousTime = currentTime.getTime() * 1000000
                        // }
                        let duration = (previousTime - currentTimeInflux)
                        let millis = duration / 1000000
                        let seconds = millis / 1000
                        let mins = seconds / 60
                        hourlyOpenDoorTimer += mins

                        // console.log(new Date(previousTime / 1000000), new Date(currentTimeInflux / 1000000), dailyOpenDoorTimer)
                    }

                    if (index == sensor.rows.length - 1) {
                        hourlyOpenDoor.push({ time: oldYear + '-' + oldMonth + '-' + oldDay + 'T' + oldHour + ':00:00.000Z', value: Math.round(hourlyOpenDoorTimer * 100) / 100, sensorId: data.sensorId })
                    }

                });

                hourlyOpenDoor = _.orderBy(hourlyOpenDoor, "value", "asc"); //ordering so not-null values are firsts
                hourlyOpenDoor = _.uniqBy(hourlyOpenDoor, "time"); //removing duplicates
                hourlyOpenDoor = _.orderBy(hourlyOpenDoor, "time", "desc"); //ordering by timestamp
                console.log(hourlyOpenDoor)

                // Replace results into original location
                sensor.rows = hourlyOpenDoor

            });

        // Return the results
        // console.log("promises:",listOfPromises)
        if (listOfPromises.length == 2) // if there are 2 promises - then it is a door and a temperature
            sensorDataBundle = results[0].groupRows.concat(results[1].groupRows)
        else // if there is 1 promise - the it is either door or temperature
            sensorDataBundle = results[0].groupRows

        // sensorDataBundle.push(results[0].groupRows) // door - processed above
        // sensorDataBundle.push(results[1].groupRows) // temeprature - processend in query

        // If query has been made
        res.status(200).send(sensorDataBundle);

    })
})

app.post('/api/v3/multi-report', (req, res) => {
    sess = req.session
    // if (sess.username) {

    // console.log(req.body)

    function changeTimezone(date, ianatz) {

        // suppose the date is 12:00 UTC
        var invdate = new Date(date.toLocaleString('en-US', {
            timeZone: ianatz
        }));

        // then invdate will be 07:00 in Toronto
        // and the diff is 5 hours
        var diff = date.getTime() - invdate.getTime();

        // so 12:00 in Toronto is 17:00 UTC
        return new Date(date.getTime() - diff); // needs to substract

    }

    // Get date custom or predefined
    let today, year, month, hOffset, start, end, customDate = req.body['date[]']

    if (customDate) { // goes here for custom report
        start = customDate[0] + ' 00:00:00'
        end = customDate[1] + ' 23:59:59'
    } else { // goes here for quick report
        today = new Date();

        year = today.getFullYear();
        month = today.getMonth();

        hOffset = 0

        start = new Date(year, month - 1, 1, 0 + hOffset, 0, 0);
        end = new Date(year, month, 0, 23 + hOffset, 59, 59);

        start = changeTimezone(start, "Europe/Bucharest");
        end = changeTimezone(end, "Europe/Bucharest");

        start = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + (start.getDate() < 10 ? '0' + start.getDate() : start.getDate()) + ' ' + '00:00:00'
        end = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + (end.getDate() < 10 ? '0' + end.getDate() : end.getDate()) + ' ' + '23:59:59'

        // start = start.replaceAll('/','-').replaceAll(',','').replace('-1 ','-01 ')
        // end = end.replaceAll('/','-').replaceAll(',','')
    }

    // Prepare sensor list for Influx query
    let sensors = ``
    let listOfSensorsId = req.body['listOfSensorsId[]']
    let listOfSensorsType = req.body['listOfSensorsType[]']
    let queryDoor
    let queryTemperature

    // Build a query for each sensorId of a type
    let sensorDataBundle = []

    if (typeof listOfSensorsId == 'string') {
        listOfSensorsId = new Array(listOfSensorsId)
        listOfSensorsType = new Array(listOfSensorsType)
    }

    // Get distinct sensorTypes to build different querys
    let sensorTypes = {
        isTemperature: false,
        isDoor: false
    }
    let distinctSensorsType = _.sortedUniq(listOfSensorsType)
    distinctSensorsType.forEach(async (item, index) => {

        // Get sensorIds of current sensorType
        let sensorIds = listOfSensorsId.filter((id, idx) => {
            if (listOfSensorsType[idx] == item)
                return id
        })

        // Query for DOOR
        if (item == 'door') {

            console.log(item, sensorIds)
            sensorTypes.isDoor = true

            // Return how many times a door has been open or closed in an hour
            let query = "select value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId order by time desc"

            // Make the request
            queryDoor = influxReader(query)

        }
        else if (item == 'temperature') {

            console.log(item, sensorIds)
            sensorTypes.isTemperature = true

            // Return average of temperature for each hour
            let query = "select mean(value) as value from sensors where sensorId =~ /" + sensorIds.join('|') + "/ and time<='" + end + "' and time>='" + start + "' group by sensorId,time(1d) order by time desc"

            // Make the request
            queryTemperature = influxReader(query)

        }

    })

    let listOfPromises = []
    if (sensorTypes.isDoor)
        listOfPromises.push(queryDoor)
    if (sensorTypes.isTemperature)
        listOfPromises.push(queryTemperature)

    Promise.all(listOfPromises).then((results) => {

        // console.log("promise all", sensorTypes)

        // console.log(start, end)

        // console.log("Doors:", results[0].groupRows.length)

        // Door results
        if (sensorTypes.isDoor)
            results[0].groupRows.forEach((sensor, idx) => {

                // console.log("sensor:", sensor.tags.sensorId)
                // Process the result

                let oldHour, oldDay, oldMonth, oldYear
                let hourlyOpenDoor = []
                let hourlyOpenDoorTimer = 0
                let dailyOpenDoor = []
                let dailyOpenDoorBlank = []
                let dailyOpenDoorTimer = 0

                // Fill dailyOpenDoor with all dates between start to end
                let dayStart = start.split(" ")[0]
                dayStart = new Date(dayStart);
                let dayEnd = end.split(" ")[0]
                dayEnd = new Date(dayEnd);

                for (let d = dayStart; d <= dayEnd; d.setDate(d.getDate() + 1)) {
                    let time = d.toISOString()
                    dailyOpenDoor.push({ time, value: null, sensorId: null });
                }

                // Remap the time and values (minutes when door is opened by hour)
                sensor.rows.forEach((data, index) => {

                    let time = data.time._nanoISO.split("T")[0]
                    let currentTime = new Date()
                    let newYear = time.split("-")[0]
                    let newMonth = time.split("-")[1]
                    let newDay = time.split("-")[2]
                    let newHour = data.time._nanoISO.split("T")[1].split(":")[0]
                    let newState = data.value

                    if (newHour != oldHour) {
                        oldHour = newHour
                    }

                    if (oldDay != newDay) {
                        if (oldDay != undefined) {
                            dailyOpenDoor.push({ time: oldYear + '-' + oldMonth + '-' + oldDay + 'T00:00:00.000Z', value: Math.round(dailyOpenDoorTimer * 100) / 100, sensorId: data.sensorId })
                        }
                        dailyOpenDoorTimer = 0 // reset timer at each hour
                        oldDay = newDay
                    }

                    if (newMonth != oldMonth) {
                        oldMonth = newMonth
                    }

                    if (newYear != oldYear) {
                        oldYear = newYear
                    }

                    if (newState == 0) {
                        let currentTimeInflux = data.time.getNanoTime()
                        let previousTime
                        // try {
                        previousTime = sensor.rows[index - 1].time.getNanoTime()
                        // } catch(e) {
                        //     previousTime = currentTime.getTime() * 1000000
                        // }
                        let duration = (previousTime - currentTimeInflux)
                        let millis = duration / 1000000
                        let seconds = millis / 1000
                        let mins = seconds / 60
                        dailyOpenDoorTimer += mins

                        // console.log(new Date(previousTime / 1000000), new Date(currentTimeInflux / 1000000), dailyOpenDoorTimer)
                    }

                    if (index == sensor.rows.length - 1) {
                        dailyOpenDoor.push({ time: oldYear + '-' + oldMonth + '-' + oldDay + 'T00:00:00.000Z', value: Math.round(dailyOpenDoorTimer * 100) / 100, sensorId: data.sensorId })
                    }

                });

                dailyOpenDoor = _.orderBy(dailyOpenDoor, "value", "asc"); //ordering so not-null values are firsts
                dailyOpenDoor = _.uniqBy(dailyOpenDoor, "time"); //removing duplicates
                dailyOpenDoor = _.orderBy(dailyOpenDoor, "time", "desc"); //ordering by timestamp
                // console.log(dailyOpenDoor)

                // Replace results into original location
                sensor.rows = dailyOpenDoor

            });

        // Return the results
        // console.log("promises:",listOfPromises.length)
        if (listOfPromises.length == 2) // if there are 2 promises - then it is a door and a temperature
            sensorDataBundle = results[0].groupRows.concat(results[1].groupRows)
        else // if there is 1 promise - the it is either door or temperature
            sensorDataBundle = results[0].groupRows

        // sensorDataBundle.push(results[0].groupRows) // door - processed above
        // sensorDataBundle.push(results[1].groupRows) // temeprature - processend in query

        // If query has been made
        res.status(200).send(sensorDataBundle);
    })


})

app.get('/api/v3/query-influx', (req, res) => {
    sess = req.session
    influxReader(req.query.query).then(result => {
        res.status(200).send(result)
    }).catch(error => {
        res.status(200).send(error)
    })
})

const PORT = process.env.PORTDEV;

var server = app.listen(PORT, console.log(`NodeJS started on port ${PORT}`)).on('error', function (err) {
    console.log(err)

    if (err) {
        // checkPort()
        // process.exit();
        // console.log(`port:`,port)
        // let kill = killPort(port)
    }
});

// let checkPort = () => {
//     exec('netstat -ltnup | grep 5000', (error, stdout, stderr) => {
//         if (error) {
//             console.log(`error: ${error.message}`)
//             process.exit(1);
//             return
//         } else if (stderr) {
//             console.log(`stderr: ${stderr}`)
//             process.exit(1);
//             return
//         } else {
//             let pid = parseInt(String(stdout).split('LISTEN')[1].split('/node')[0])

//             killPort(pid)
//         }

//     })
// }

let killPort = (pid) => {

//     exec(`kill ` + pid, (error2, stdout2, stderr2) => {
//         if (error2) {
//             console.log(`error2: ${error2.message}`)
//             process.exit(1);
//             return
//         } else if (stderr2) {
//             console.log(`stderr2: ${stderr2}`)
//             process.exit(1);
//             return
//         } else if (stdout2) {
//             console.log(`stdout2: ${stdout2}`)
//             process.exit(1);
//         } else {
//             console.log("kill " + pid)
//             process.exit(1);
//         }
//     })
}