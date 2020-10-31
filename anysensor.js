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
// global.fetch = require("node-fetch");

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
    getCounties,
    getSensorLocation,
    isScaleAvailable,
    isConveyorAvailable,
    isScannerAvailable,
    mqttOverSocketIoBridge,
    test,
    // trackurl
} = require('./controllers/getInfo')
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
    console.log('Influx Write')
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
database = new Database(config_db)

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

app.get("/map", cookieChecker, authDashboard, getCounties, getSensorLocation, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session;
    // console.log(sess.username, sess.counties)
    if(sess.username == 'emag') {
        res.redirect('/map/bucuresti')
    } else {
        res.render("map", {
            username: sess.username,
            user_role: sess.user_role,
            sensorId: sess.sensorAccess, //this needs to be replaced or removed
            sensors: sess.sensors, //this contain a list of sensorsId the user has access to - generated by getSensorLocation
            // data: sess.data, //for testing purposes
            counties: sess.counties,
            isScaleAvailable: sess.isScaleAvailable,
            isConveyorAvailable: sess.isConveyorAvailable,
            isScannerAvailable: sess.isScannerAvailable,
            user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
            user_role_is_admin: sess.user_role == 'admin' ? 1 : 0,
        })
    }
    
})

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

// get and post request to /register page
app.get('/register', (req, res) => {
    res.render('register')
});

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
    res.redirect('/map')
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
        console.log("password changed")
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log(hashedPassword)
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

// API Get Data From Different Zones
//=========================================

// get unique elements of list
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// No longer used
app.get('/api/get-zones', function (req, res) {
    // this is used in fetching the zone list
    sess = req.session;
    if (sess.username) {

        sensorIdList = sess.sensorAccess

        if (sensorIdList == 0) {
            console.log("This user has acces to NO sensor")
            var data = {
                result: []
            };
            res.status(204).send(data);
        } else if (sensorIdList == -1) {
            console.log("This user has acces to ALL sensors")
            try {

                // influxReader("select * from sensors where username=''")

                // work in progress - to get zones from influx

                db.query("SELECT * FROM sensors", (err, result) => {

                    if (!err) {
                        var data = {
                            result: result
                        };
                        res.status(200).send(data);
                    } else {
                        var data = {
                            result: [{
                                error: 'database error'
                            }]
                        };
                        res.status(204).send(data);
                    }

                })

            } catch (err) {
                console.warn("db query zones error:", err)
            }
        } else {
            console.log("This user has acces to sensorId:", sensorIdList)
            try {
                var sql_query = "SELECT * FROM sensors WHERE sensorId IN (?)"
                db.query(sql_query, [sensorIdList], (err, result) => {

                    if (!err) {
                        var data = {
                            result
                        };
                        // console.log(data)
                        res.status(200).send(data);
                    } else {
                        var data = {
                            result: [{
                                error: 'database error'
                            }]
                        };
                        res.status(204).send(data);
                    }

                })
            } catch (err) {
                console.warn("db query zones error:", err)
            }
        }

    } else {
        res.status(401).send("You are not logged in!")
    }

})

class Sensor {
    constructor(sensorId, sensorType, county, city, street, values) {
        this.sensorId = sensorId,
            this.sensorType = sensorType,
            this.county = county,
            this.city = city,
            this.street = street,
            this.values = values
    }
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
    console.log(req.originalUrl)

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

            console.log(influxQuery)

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
        console.log(req.originalUrl)
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

        console.log(req.originalUrl)
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

        console.log(">> TODAY start:", today)

        // Mean of last week - experiment
        // ==========================================
        var lastweekTodayStart = new Date();
        lastweekTodayStart.setDate(lastweekTodayStart.getDate() - 8)
        var dd = String(lastweekTodayStart.getDate()).padStart(2, '0');
        var mm = String(lastweekTodayStart.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = lastweekTodayStart.getFullYear();
        lastweekTodayStart = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        console.log(">> lastweekTodayStart start:", lastweekTodayStart)

        var lastweekTodayStop = new Date();
        lastweekTodayStop.setDate(lastweekTodayStop.getDate() - 7)
        var dd = String(lastweekTodayStop.getDate()).padStart(2, '0');
        var mm = String(lastweekTodayStop.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = lastweekTodayStop.getFullYear();
        lastweekTodayStop = yyyy + '-' + mm + '-' + dd + 'T23:00:00Z';

        console.log(">> lastweekTodayStop start:", lastweekTodayStop)
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

        console.log(req.originalUrl)
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

        // Hardcoded for EMAG
        var isCounter = (req.params.sensorQuery.includes('uvlamp') ? true : false)

        console.log(req.originalUrl)
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
                var influxQuery = `select mean(value) as value from sensors ` + whereQuery + ` GROUP BY time(1m) ORDER BY time DESC`
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
        console.log(req.originalUrl)
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

            console.log(influxQuery)

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
            console.log(err);
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

    console.log(req.url)

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
    console.log(influxQuery)

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
    console.log(data)
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

    console.log(req.query)

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
            console.log(new Date() - time)
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
                console.log(await result)
                return await result
            })

            Promise.all([influxResult]).then(result => {
                console.log(new Date() - time)
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

    console.log(req.url)

    if (req.query.password.length == 0) {

        // get the sensorIds of selected zone
        if (req.query.zones) {

            console.log(req.query.zones)

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

app.get('/api/add-user',  (req, res) => {
    sess = req.session
    if (sess.username) {
        console.log(req.query)
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

app.get('/api/remove-user', async (req, res) => {
    // res.send(req.query)
    const queryRemoveUser = `delete from users where username='` + req.query.username + `'`
    let removeUser = await mysqlReader(queryRemoveUser)
    const queryRemoveSensors = `delete from sensors where username='` + req.query.username + `'`
    let removeSensors = await mysqlReader(queryRemoveSensors)
    Promise.all([removeUser, removeSensors]).then((response)=>{
        console.log(response)
    })
    res.redirect('/team')
})

app.get('/team', cookieChecker, authDashboard, getCounties, isScaleAvailable, isConveyorAvailable, isScannerAvailable, mqttOverSocketIoBridge, (req, res) => {
    sess = req.session
    res.render("team", {
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
        console.log("csvContent:", csvContent.length)
        res.send(csvContent)
    })

})


const PORT = process.env.PORT;

var server = app.listen(PORT, console.log(`NodeJS started on port ${PORT}`)).on('error', function (err) {
    console.log(err)
});