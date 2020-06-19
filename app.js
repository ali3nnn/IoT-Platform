// Imports
// ==================================
const express = require('express')
const path = require('path')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const hbs = require('express-handlebars');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');

const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');

const Influx = require('influx');
const mysql = require('mysql');
// ==================================
// End Imports

// Influx Connection
// ==================================

// Connect to InfluxDB and set the SCHEMA
const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'platform',
    // schema: [
    //     {
    //         measurement: 'sensors',
    //         tags: ['sensorId'],
    //         fields: {
    //             value: Influx.FieldType.FLOAT,
    //         }
    //     }
    // ]
})

// // Influx Write - ASYNC
// function influxWriter(measurement, sensorId, value, database = 'anysensor_dummy', precision = 's') {
//     influx.writePoints([
//         {
//             measurement,
//             tags: {
//                 sensorId,
//             },
//             fields: { value }
//         }
//     ], {
//         database,
//         precision,
//     })
//         .catch(error => {
//             console.error(`Error saving data to InfluxDB! ${err.stack}`)
//         });
// }

// Influx Query - PROMISE
function influxReader(measurement, where = false) {
    return new Promise((resolve,myreject)=>{
        if (!where) query =  `select * from ` + measurement + ``
        else query = `select * from ` + measurement + ` WHERE ` + where
        // console.log(query)
        influx.query(query)
            .then(result => {return resolve(result)})
            .catch(error => {return reject({error})});
    })
}

// influxWriter('temperature', 'AX19K', 100)

// ==================================
// End Influx Connection

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
// ==================================
// End Handlebar Custom Helper

// Middleware
// ==================================
const { authRegister, authLogin, authDashboard, authSuperAdmin, cookieChecker } = require('./controllers/auth')
const { showAllUsers } = require('./controllers/all_users')
// ==================================
// End Middleware

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
const db = mysql.createConnection(config_db)

// Connect to DB - Async
db.connect((err) => {
    if (err) console.log("Connecting to mysql failed")
    else console.log("First connection to MySQL", '\r\n')
})

// Database Connection In Promise
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
        console.log("Second connection to MySQL in promise")
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
//parse url encoded (as sent by html forms)
app.use(express.urlencoded({ extended: false }))
//parse json bodies (as sent by api)
app.use(express.json())
//initialize cookie parser
app.use(cookieParser(process.env.COOKIE_KEY))
//dir of static files css,img,js
const public_dir = path.join(__dirname, './public')
// set the directory for css/js/img files
app.use(express.static(public_dir))
// Dotenv Path
dotenv.config({ path: './.env' })
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


// Define routes
// app.use('/', require('./routes/pages'))
// app.use('/auth', require('./routes/auth'))

// const express = require('express');
// const router = express.Router();

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
    
    // Homepage is disabled and it redirect to /map
    res.redirect('/map');

    // sess = req.session;
    // res.render("index", {
    //     username: sess.username,
    //     user_role: sess.user_role,
    //     user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    // })
});

// app.use(cookieParser('abcdef-12345'))

app.get("/map", cookieChecker, authDashboard, (req, res) => {
    sess = req.session;
    res.render("map", {
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorAccess,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    })
})

// get request to /dashboard page
app.get('/dashboard', cookieChecker, authDashboard, (req, res) => {
    sess = req.session;
    res.render("dashboard", {
        username: sess.username,
        user_role: sess.user_role,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    })
});

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
    res.render('login')
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

// SUPERADMIN reuqest
//=========================================
app.get('/users', authDashboard, authSuperAdmin, showAllUsers, function (req, res) {

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
                res.render("admin_allusers",
                    {
                        username: sess.username,
                        user_role: sess.user_role,
                        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                        success: "Database has been updated"
                    }
                )
                // setTimeout(res.redirect("/users"), 1000);
            }
        })
    }

    else {
        console.log("password changed")
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log(hashedPassword)
        db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "', Password='" + hashedPassword + "' WHERE Id='" + req.body.id + "'", (err, result) => {
            if (err) console.error(err)
            else {
                res.render("admin_allusers",
                    {
                        username: sess.username,
                        user_role: sess.user_role,
                        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                        success: "Database has been updated"
                    }
                )
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
        }
        else if (sensorIdList == -1) {
            console.log("This user has acces to ALL sensors")
            try {
                db.query("SELECT * FROM sensors", (err, result) => {

                    if (!err) {
                        var data = {
                            result: result
                        };
                        res.status(200).send(data);
                    } else {
                        var data = {
                            result: [{ error: 'database error' }]
                        };
                        res.status(204).send(data);
                    }

                })
            } catch (err) {
                console.warn("db query zones error:", err)
            }
        }
        else {
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
                            result: [{ error: 'database error' }]
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

});

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

// Get Data
app.get('/api/get-data/:county', (req, res) => {

    sess = req.session

    // get params
    // const queryObject = url.parse(req.url,true).query;
    // console.log(queryObject);
    // console.log(queryObject);

    // console.log(sess.username)

    let data = []

    // Who ask for the data
    if (sess.username) {
        console.log('/api/get-data/' + req.params.county)
        console.log("User:", sess.username);
        console.log("Access to sensorId:", sess.sensorAccess);
        console.log("County requested:", req.params.county);

        let sendFlag = false

        let resultInfluxDb = influxReader('sensors', `city='`+req.params.county+`' ORDER BY time DESC LIMIT 2`).then((result) => {
            // const time = result[0].time._nanoISO
            // const value = result[0].value
            // const sensorId = result[0].sensorId
            // console.log(time, value, sensorId,'\r\n')
        
            // console.log(result[0])

            if(result.length) {
                data.push({ error: false, message: "Requested county has been found" })
            } else {
                data.push({ error: true, message: "Requested county is not found" })
            }

            for(var i=0; i<result.length; i++) {
                data.push(result[i])
            }
                
            return data


        }).then((result)=>{
            res.status(200).send(data)
        }).catch((e) => {
            res.status(404).send("Scraping from influx failed")
        })



        // console.log("")
        // console.log(sendFlag)
        // if (sendFlag) {
        //     console.log(data)
        //     res.status(200).send(data)
        // }
            
        // else {
        //     data.push({ error: "user doesn't have this county registered" })
        //     res.status(404).send(data)
        // }

    } else {
        data.push({ error: "you are not logged in" })
        res.status(403).send(data)
    }


})

app.get('/map/:county', (req, res) => {
    sess = req.session

    sess.county = req.params.county


    console.log("/map/" + sess.county)
    console.log("User:", sess.username, '\r\n')

    if (sess.username)
        res.status(200).render('dashboard', {
            county: req.params.county,
            username: sess.username,
            user_role: sess.user_role,
            sensorId: sess.sensorId,
            user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
        })
    else {
        res.status(403).render('message', {
            alert: "You are not logged in"
        })
    }
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
//=========================================
// END - Sensor Settings


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
