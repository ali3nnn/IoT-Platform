const mysql = require('mysql')
const Influx = require('influx');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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
// ==================================
// End Middlewares

module.exports = {
    getCounties,
    getSensorLocation
}