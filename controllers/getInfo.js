const mysql = require('mysql')
const Influx = require('influx');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var mqttHandler = require('./mqtt_handler.js');

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

// Middlewares
// ==================================
const getCounties = async (req, res, next) => {

    sess = req.session;

    sess.counties = []
    // console.log(sess.username, "getCounties", sess.counties, sess.counties == undefined || sess.counties.length == 0)

    var time = new Date()
    var data = []
    if (sess.username) {
        if (sess.counties == undefined || sess.counties.length == 0) {
            const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"
            mysqlReader(query).then(async (rows) => {
                let rows_ = await rows
                // console.log(await rows)
                if (rows_.length) {

                    var whereQuery = `where (username='` + sess.username + `') or (`

                    for (var i = 0; i < rows_.length; i++) {

                        whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                        if (i < rows_.length - 1) whereQuery += ` or `
                        else whereQuery += `)`
                    }

                    // var queryCounties = `select distinct(county) as county from ( select county, value from sensors ` + whereQuery + ` )`
                    var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") ` + whereQuery

                } else {

                    // get counties
                    // var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + sess.username + "')"
                    var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") WHERE username='` + sess.username + `'`

                }

                let counties = influxReader(queryCounties).then(async (result) => {

                    var counties = []
                    for (var i = 0; i < result.length; i++) {
                        // counties.push(result[i].county)
                        counties.push(result[i].value)
                    }

                    return await counties

                })

                Promise.all([counties]).then((result) => {

                    // build the output
                    if (result[0].length) {

                        data.push({
                            error: false,
                            message: "Data found",
                            user: sess.username,
                            countiesCounter: result[0].length,
                            counties: result[0].length ? result[0] : "No county found",
                            query: queryCounties,
                            responseTime: new Date() - time + "ms",
                        })

                        sess.counties = data[0].counties

                    } else {
                        data.push({
                            error: true,
                            message: "No data found for this user",
                            user: sess.username
                        })

                        sess.counties = []
                    }

                    // console.log(sess.username, "getCounties 2", sess.counties)

                    next()

                }).catch(error => console.log(`Error in promise for GETCOUNTY ${error}`))

            })
        } else {
            // console.log(sess.username, "getCounties 3", sess.counties)
            next()
        }
    } else res.render("login", {
        alert: "You are not logged in"
    })
}

const getSensorLocation = async (req, res, next) => {

    sess = req.session;

    // sess.counties = []
    // console.log(sess.username, "getCounties", sess.counties, sess.counties == undefined || sess.counties.length == 0)

    var time = new Date()
    var data = []
    if (sess.username) {
        if (sess.sensors == undefined || sess.sensors.length == 0) {
            const query = "SELECT * FROM sensors WHERE username='" + sess.username + "'"
            mysqlReader(query).then(async (rows) => {
                let rows_ = await rows
                // console.log(await rows)
                if (rows_.length) {

                    var whereQuery = `where (username='` + sess.username + `') or (`

                    for (var i = 0; i < rows_.length; i++) {

                        whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                        if (i < rows_.length - 1) whereQuery += ` or `
                        else whereQuery += `)`
                    }

                    // var querySensorId = `select distinct(sensorId) as sensorId from ( select sensorId, value from sensors ` + whereQuery + ` )`
                    var querySensorId = `SHOW TAG VALUES WITH KEY IN ("sensorId") ` + whereQuery

                } else {

                    // get counties
                    // var querySensorId = `select distinct(sensorId) as sensorId from (select sensorId, value from sensors where username='` + sess.username + `')`
                    var querySensorId = `SHOW TAG VALUES WITH KEY IN ("sensorId") WHERE username='` + sess.username + `'`

                }

                // console.log(querySensorId)

                let sensors = influxReader(querySensorId).then(async (result) => {

                    var sensors = []
                    for (var i = 0; i < result.length; i++) {
                        // sensors.push(result[i].sensorId)
                        sensors.push(result[i].value)
                    }

                    return await sensors

                })

                Promise.all([sensors]).then((result) => {

                    // build the output
                    if (result[0].length) {

                        data.push({
                            error: false,
                            message: "Data found",
                            user: sess.username,
                            sensorCounter: result[0].length,
                            sensors: result[0].length ? result[0] : "No sensor found",
                            query: querySensorId,
                            responseTime: new Date() - time + "ms",
                        })

                        sess.sensors = data[0].sensors
                        // sess.data = data

                    } else {
                        data.push({
                            error: true,
                            message: "No data found for this user",
                            user: sess.username
                        })

                        sess.sensors = []
                        // sess.data = []
                    }

                    // console.log(sess.username, "getCounties 2", sess.counties)

                    // console.log(sess.sensors)

                    next()

                }).catch(error => console.log(`Error in promise for GETSENSORLOCATION ${error}`))

            })
        } else {
            next()
        }
    } else {
        // console.log("test")
        res.render("login", {
            alert: "You are not logged in"
        })
    }

    // next()
}

const isScaleAvailable = async (req, res, next) => {
    // next()
    sess = req.session;
    var time = new Date()
    var data = {}
    if (sess.username) {
        if (sess.isScaleAvailable == undefined || sess.isScaleAvailable.length == 0) {
            const query = "SHOW TABLES LIKE 'scale_" + sess.username + "'";
            mysqlReader(query)
                .then(rows => {
                    data['tableExist'] = rows.length ? true : false
                    if (rows.length) {
                        mysqlReader("SELECT count(*) as count FROM scale_" + sess.username + "")
                            .then(count => {
                                data['count'] = count[0].count
                                data["responseTime"] = new Date() - time
                            }).then(() => {
                                sess.isScaleAvailable = data
                                next()
                            })
                    } else {
                        data['count'] = 0
                        data["responseTime"] = new Date() - time
                        sess.isScaleAvailable = data
                        next()
                    }
                })
        } else {
            next()
        }
    } else {
        // console.log("test")
        res.render("login", {
            alert: "You are not logged in"
        })
    }
}

const isConveyorAvailable = async (req, res, next) => {
    // next()
    sess = req.session;
    var time = new Date()
    var data = {}
    if (sess.username) {
        if (sess.isConveyorAvailable == undefined || sess.isConveyorAvailable.length == 0) {
            const query = "SHOW TABLES LIKE 'conveyor_" + sess.username + "'";
            mysqlReader(query)
                .then(rows => {
                    data['tableExist'] = rows.length ? true : false
                    if (rows.length) {
                        mysqlReader("SELECT count(*) as count FROM conveyor_" + sess.username + "")
                            .then(count => {
                                data['count'] = count[0].count
                                data["responseTime"] = new Date() - time
                            }).then(() => {
                                sess.isConveyorAvailable = data
                                next()
                            })
                    } else {
                        data['count'] = 0
                        data["responseTime"] = new Date() - time
                        sess.isConveyorAvailable = data
                        next()
                    }
                })
        } else {
            next()
        }
    } else {
        // console.log("test")
        res.render("login", {
            alert: "You are not logged in"
        })
    }
}

// var mqttClient

const mqttOverSocketIoBridge = (req, res, next) => {
    sess = req.session
    if (sess.username) {
        if (sess.mqtt == undefined) {
            // Socket.IO -- MQTT 
            // =========================================
            function randomIntFromInterval(min, max) { // min and max included 
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            const https = require('https');
            const fs = require('fs');
            var wildcard = require('socketio-wildcard')();
            var socketClient = require("socket.io")
                .listen(
                    https.createServer({
                        key: fs.readFileSync("/etc/letsencrypt/live/anysensor.dasstec.ro/privkey.pem"),
                        cert: fs.readFileSync("/etc/letsencrypt/live/anysensor.dasstec.ro/fullchain.pem"),
                        requestCert: false,
                        rejectUnauthorized: false,
                    })
                    .listen(1920, console.log("Socket.IO started on port 1920")));

            socketClient.use(wildcard)

            const mqtt = require('mqtt');
            var mqttClient = mqtt.connect('wss://anysensor.dasstec.ro:9002/mqtt', {
                clientId: 'ab',
                username: 'ab',
                password: 'ab',
                keepalive: 60,
                reconnectPeriod: 1000,
                protocolId: 'MQIsdp',
                protocolVersion: 3,
                clean: true,
                encoding: 'utf8',
                rejectUnauthorized: false
            });

            // Mqtt error event
            mqttClient.on('error', (err) => {
                console.log(err);
                mqttClient.end();
            });

            // Mqtt close event
            mqttClient.on('close', () => {
                console.log(`mqtt client disconnected`);
            });

            // Mqtt connect event
            mqttClient.on('connect', () => {
                console.log(`Connected to MQTT Broker as`, sess.username);
            });

            // Mqtt subscribe #
            mqttClient.subscribe('#', {
                qos: 1
            });

            // Mqtt message event
            mqttClient.on('message', function (topic, message) {
                if (!topic.includes("romania")) {
                    console.log("MQTT Broker:", topic, message.toString());
                    console.log("TO CLIENT:","socketChannel", { topic, message: message.toString() })
                }
                    

                // whatever Node Server receive from mqtt broker
                // it is sent via socket.io to client
                

                socketClient.emit("socketChannel", {
                    topic,
                    message: message.toString()
                })

                // Send Dummy Live Weight
                var sendLiveWeightDummy = true
                if (sendLiveWeightDummy) {
                    socketClient.emit("socketChannel", {
                        topic: sess.username + "/scale",
                        message: {
                            weight: randomIntFromInterval(200, 500).toFixed(2),
                            barcode: Date.now()
                        }
                    })
                    sendLiveWeightDummy = false
                } else {
                    sendLiveWeightDummy = true
                }


            })

            // Socket.io connection event
            socketClient.on('connection', function (socket) {
                console.log("New Socket.IO connection id:", socket.id)

                var topicToListen = "socketChannel"
                socket.on(topicToListen, function (msg) {
                    // if backend recieves front frontend a message on topicToListen 'start/stop'
                    console.log("FROM CLIENT:", topicToListen, msg)

                    // mqtt publish
                    if (msg.topic != 'ack') {
                        // mqttClient.publish(msg.topic, msg.message.toString());
                        console.log("PUBLISH:", msg.topic, msg.message.toString())
                    }
                });
            })


            // =========================================
            // END Socket.IO -- MQTT
            sess.mqtt = true
            next()
        } else {
            // res.status(200).send("MQTT Connection already exists!")
            next()
        }
    } else {
        // res.status(403).render('message', {
        //     alert: "You are not logged in"
        // })
        next()
    }
}

// const test = () => {
//     var mqttClientOutput = new mqttHandler("username");
//     mqttClientOutput.connect();
// }

// ==================================
// End Middlewares

module.exports = {
    getCounties,
    getSensorLocation,
    isScaleAvailable,
    isConveyorAvailable,
    mqttOverSocketIoBridge,
    // test
}