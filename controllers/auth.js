const mysql = require('mysql')
const Influx = require('influx');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
// const cookieParser = require('cookie-parser')

const dotenv = require("dotenv")

// enable debugging
const {
    parsed,
    error
} = dotenv.config({
    debug: true
})

// was there an error?
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
}

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

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

function allTrue(obj) {
    for (var o in obj)
        if (!obj[o]) return false;
    return true;
}

// console.log("ENV:", process.env.DATABASE_PASSWORD)

//auth controller register
const authRegister = (req, res, next) => {

    const {
        name,
        username,
        email,
        company,
        password,
        passwordConfirm
    } = req.body

    console.log(name,
        username,
        email,
        company,
        password,
        passwordConfirm)

    // password do not match
    if (password != passwordConfirm) {
        return res.render('register', {
            alert: "Passwords do not match!"
        })
    }

    // all fields required
    const allField = allTrue({
        name,
        username,
        email,
        company,
        password,
        passwordConfirm
    })

    if (!allField) {
        return res.render('register', {
            alert: 'All fields are required!'
        })
    }


    // check duplicate username
    db.query("SELECT username FROM users WHERE username = ?", [username], async (err, result) => {

        // alert duplicate username
        if (err) console.log("There is a problem authRegister 1", err)
        else if (result.length) return res.render('register', {
            alert: 'That username is in use'
        })

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

        // insert username in db
        db.query("INSERT INTO users SET ?", credentials, (err, result) => {
            if (err) 
                console.log("Problem with insert 1", err)
            else {
                console.log("New user registration")
                
                // create a map view for this company
                db.query("INSERT INTO maps SET ?", {company}, (err, result) => {
                    if (err) 
                        console.log("Problem with insert 2", err)
                    else {
                        console.log("New map registration")
                        next()
                    }
                })

            }
        })

    })

}

function writeCookie(attr, text, res) {
    console.log("Write cookie:", attr, text)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        signed: true
    }
    res.cookie(attr, text, cookieOptions)
}

//auth controller login
const authLogin = async (req, res, next) => {
    // console.log("REQ.BODY:",req.body)
    try {
        // take the data from form body
        const {
            username,
            password,
            remember
        } = req.body

        //start the session for future login
        sess = req.session

        // check if username exist
        if (!username || !password) return res.status(400).render('login', {
            message: 'You forgot to type username or password'
        })
        else {

            // check user the is trying to login
            console.log("Login try:", username, '\r\n')

            var sql_query = "SELECT username, password, role, company FROM users WHERE username = '" + username + "'"
            db.query(sql_query, async (err, result) => {

                if (err)
                    console.log("There is a problem authLogin 1")

                if (result.length) {

                    // check password
                    let passwordComparator = await bcrypt.compare(password, result[0].password)
                    if (result[0].username != username || !passwordComparator) return res.render('login', {
                        alert: 'Username or password is wrong'
                    })

                    else {

                        // Set Cookie if checked
                        if (remember == '1') {
                            writeCookie("username", result[0].username, res)
                        }

                        // set other sess variables
                        sess.username = result[0].username
                        sess.role = result[0].role
                        sess.admin = ((result[0].user_role == 'admin') ? 1 : 0)
                        sess.check_cookies = 0 // 1 - check cookie; 0 - don't check cookie

                        console.log("Logged in: ", sess.username, " role:", sess.role)

                        next()

                    }
                } else {
                    res.render("login", {
                        alert: "Username `" + username + "` is not registered!"
                    })
                }
            })


        }
    } catch (err) {
        console.log("Error:", err)
    }
}

const authDashboard = (req, res, next) => {
    // check if user is logged
    sess = req.session;
    var time = new Date()
    var data = []

    // console.log("authDashboard")
    // console.log(sess.counties)

    // var url = req.originalUrl

    // if(url="/admin") {
    //     next()
    // }

    if (sess.username) {
        next()
    } else res.render("login", {
        alert: "You are not logged in",
        admin: true
    })
}

const authSuperAdmin = (req, res, next) => {
    // get session variable
    sess = req.session;

    if (sess.super_admin == 1) {
        // console.log("this user is superadmin")
        next()
    } else {
        // console.log("this user is NOT superadmin")
        res.render('login', {
            alert: "Login with your superadmin account!"
        })
    }
}

const cookieChecker = async (req, res, next) => {
    // get session variable
    sess = req.session;

    // check cookie
    let username_cookie = req.signedCookies.username

    // if user has already logged in don't check cookies anymore
    if (sess.username) {
        next()
    }
    else if (username_cookie) {
        let sql_query = "SELECT username, password, role FROM users WHERE username = '" + username_cookie + "'"
        db.query(sql_query, (err, result) => {
            if (result.length) {
                sess.username = result[0].username
                sess.role = result[0].role
                next()

            } else {
                next()
            }
        })
    } else {
        next()
    }



}

module.exports = {
    authRegister,
    authLogin,
    authDashboard,
    authSuperAdmin,
    cookieChecker,
    // getCounties,
    // getSensorLocation
}