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
const getUserData = async (req, res, next) => {
    sess = req.session;
    let userData = {}
    // select company from users where username='"+sess.username+"'
    if (sess.role == 'superadmin') {
        // const query = "select sensors.*, locations.*, users.company from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');"
        const query = "select DISTINCTROW sensors.*, locations.*, users.company from sensors join locations on sensors.zoneId=locations.zoneId join userAccess on sensors.sensorId=userAccess.sensorId join users on userAccess.username = users.username where users.company=(select company from users where username='" + sess.username + "');"
        mysqlReader(query).then(async (rows) => {
            if (rows.length) {
                userData = rows
                userData["error"] = false
            } else {
                userData["error"] = "No data found"
            }

            // Set session varriable
            sess.userData = userData // set list of sensors that are assignet to this user
            sess.company = userData[0].company // set company

            next()
        })
    } else {
        const query = "select userAccess.username, sensors.*, locations.* from userAccess inner join sensors on sensors.sensorId=userAccess.sensorId and userAccess.username='" + sess.username + "' inner join locations on locations.zoneId=sensors.zoneId;"
        mysqlReader(query).then(async (rows) => {
            if (rows.length) {
                userData = rows
                userData["error"] = false
            } else {
                userData["error"] = "No data found"
            }

            // Set session variables
            sess.userData = userData
            // [ ] TODO: get company of user sess.company

            next()
        })
    }
}

const getCounties = async (req, res, next) => {

    sess = req.session;
    sess.counties = []
    console.log("getcounties:", sess.username)

    var time = new Date()
    var data = []
    if (sess.username) {
        const query = "select userAccess.username, sensors.*, locations.* from userAccess inner join sensors on sensors.sensorId=userAccess.sensorId and userAccess.username='" + sess.username + "' inner join locations on locations.zoneId=sensors.zoneId;"
        mysqlReader(query).then(async (rows) => {

            if (rows.length) {
                // TODO - continue from here
                sess.userData = rows[0]
                console.log(rows[0])

                // var whereQuery = `where (username='` + sess.username + `') or (`

                // for (var i = 0; i < rows_.length; i++) {

                //     whereQuery += `sensorId='` + rows_[i].sensorId + `'`
                //     if (i < rows_.length - 1) whereQuery += ` or `
                //     else whereQuery += `)`
                // }

                // // var queryCounties = `select distinct(county) as county from ( select county, value from sensors ` + whereQuery + ` )`
                // var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") ` + whereQuery

            } else {

                console.log("not found", rows)
                // get counties
                // var queryCounties = "select distinct(county) as county from (select county, value from sensors where username='" + sess.username + "')"
                // var queryCounties = `SHOW TAG VALUES WITH KEY IN ("county") WHERE username='` + sess.username + `'`

            }

            // console.log("queryCounties:", queryCounties)

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

        })

        // console.log(sess.username, "getCounties 3", sess.counties)
        next()

    } else res.render("login", {
        alert: "You are not logged in"
    })
}

const getSensorLocation = async (req, res, next) => {

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

    next()
}

const isScaleAvailable = async (req, res, next) => {
    next()
    // sess = req.session;
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
}

const isConveyorAvailable = async (req, res, next) => {
    next()
    // sess = req.session;
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
}

const isScannerAvailable = async (req, res, next) => {
    next()
    // sess = req.session;
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
}

const mqttOverSocketIoBridge = (req, res, next) => {
    next()
}

// This is a test middleware that is used at every route
const test = (req, res, next) => {
    // console.log("--->>>", req.originalUrl)

    // Allow request from url like /api/url_path?admin=target_username
    if (req.query.admin) {
        req.session.username = req.query.admin
    }
    // End

    res.append('Access-Control-Allow-Origin', ['*']);

    next()
}

// Utils
const getDistinctValuesFromObject = (val, obj) => {
    let flags = [],
        output = [],
        l = obj.length,
        i;
    for (i = 0; i < l; i++) {
        if (flags[obj[i][val]]) continue;
        flags[obj[i][val]] = true;
        output.push(obj[i][val]);
    }
    return output
}

const replaceAll = (str1, str2, ignore) => {
    // String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
    // }
}

const replaceDiacritics = (str, ignore) => {
    const diacritics = 'áàâäãéèëêíìïîóòöôõúùüûñçăşţ'
    let result
    diacritics.split('').forEach(letter => {
        result = str.replace(new RegExp(letter.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str.replace(/\$/g, "$$$$") : str);
    })
    return result
}

// Keep track url
// const trackurl = (req,res,next) => {
//     if(req.originalUrl!='undefined')
//         req.session.trackurl += ","+req.originalUrl
//     console.log(">>",req.originalUrl, req.session.trackurl)
//     next()
// }

// ==================================
// End Middlewares

module.exports = {
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
    replaceDiacritics
    // trackurl
}