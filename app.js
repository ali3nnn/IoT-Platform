const express = require('express')
const path = require('path')
const app = express()
const mysql = require('mysql')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const hbs = require('express-handlebars');
const bcrypt = require('bcryptjs')

const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');

// Handlebar Custom Helper
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

const { authRegister, authLogin, authDashboard, authSuperAdmin, cookieChecker } = require('./controllers/auth')
const { showAllUsers } = require('./controllers/all_users')
dotenv.config({
    path: './.env'
})

// initialize session variable
var sess;

//config db info
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//connect to db
db.connect((err) => {
    if (err) console.log("Connecting to mysql failed")
    else console.log("MySQL connected")
})

//dir of static files css,img,js
const public_dir = path.join(__dirname, './public')

app.use(express.static(public_dir))

//use sessions for tracking logins
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


// Define routes
// app.use('/', require('./routes/pages'))
// app.use('/auth', require('./routes/auth'))

// const express = require('express');
// const router = express.Router();

// if the use that acces home page was logged in previously
// make the log in automatically
// based on cookie/session var
var sess

app.get('/', (req, res) => {
    sess = req.session;
    res.render("index", {
        username: sess.username,
        user_role: sess.user_role,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    })
});

// app.use(cookieParser('abcdef-12345'))

app.get("/map", cookieChecker, authDashboard, (req, res) => {
    sess = req.session;
    res.render("map", {
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorId,
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
    sess.dont_check_cookie = 0
    res.redirect('/map')
});

// get request to /logout page
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.log(err);
        else res.redirect('/');
    });
});

// SUPERADMIN reuqest
//=========================================
app.get('/users', authDashboard, authSuperAdmin, showAllUsers, function (req, res) {
    try {
        db.query("SELECT id, name, username, email, user_role, reg_date, sensorId FROM users", (err, result) => {

            for (var item in result) {
                result[item].reg_date = result[item].reg_date.toString().split('GMT')[0]
            }

            res.render("admin_allusers", {
                username: sess.username,
                user_role: sess.user_role,
                user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
                db_results: result,
                role_basic: req.body.role == 'basic' ? true : false,
                role_superadmin: req.body.role == 'superadmin' ? true : false,
            })

        })
    } catch (err) {
        console.log("db query users error:", err)
    }

});

app.get('/update', (req, res) => {
    res.redirect("/dashboard")
})

// Update user
app.post('/update', async (req, res) => {

    //UPDATE into db
    if (!req.body.password.length) {
        // console.log("Query:", req.body)
        db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "', sensorId='" + req.body.sensorId + "' WHERE Id='" + req.body.id + "'", (err, result) => {
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
        db.query("UPDATE users SET Name='" + req.body.name + "', Username='" + req.body.username + "', Email='" + req.body.email + "', User_role='" + req.body.role + "', sensorId='" + req.body.sensorId + "', Password='" + hashedPassword + "' WHERE Id='" + req.body.id + "'", (err, result) => {
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
//=========================================
// END - SUPERADMIN reuqest

// API Get Data From Different Zones
//=========================================
app.get('/api/get-zones', function (req, res) {
    // this is used in fetching the zone list
    sess = req.session;
    if (sess.username) {
        sensorIdList = sess.sensorId
        // console.log("Get zones for sensorId:", sensorIdList)
        try {
            db.query("SELECT sensorId, county FROM sensors WHERE sensorId in (?)", [sensorIdList], (err, result) => {

                if (!err) {
                    var data = {
                        result: result
                    };
                    res.status(200).send(data);
                } else {
                    var data = {
                        result: []
                    };
                    res.status(204).send(data);
                }

            })
        } catch (err) {
            console.warn("db query zones error:", err)
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

    // console.log(sess.username)

    // Get data for sensorsId assignated to req.params.county 
    var influxData = [
        { county: 'Iasi',      sensorId: 11, time: 1, value: 123},
        { county: 'Dambovita', sensorId: 10, time: 2, value: 43},
        { county: 'Dambovita', sensorId: 1,  time: 3, value: 24},
        { county: 'Constanta', sensorId: 5,  time: 4, value: 14},
        { county: 'Timis',     sensorId: 8,  time: 5, value: 15}
    ]

    // Who ask for the data
    console.log("User:",sess.username);
    console.log("Access to sensorId:",sess.sensorId);
    console.log("County requested:",req.params.county);

    console.log("-----data------")
    let data = []
    let sendFlag = false
    for(let i=0;i<influxData.length;i++)
        if(influxData[i].county==req.params.county && sess.sensorId.includes(String(influxData[i].sensorId))) {
            console.log(influxData[i])
            data.push(influxData[i])
            sendFlag = true;
        }
           

    if (sendFlag) 
        res.status(200).send(data)
    else
        res.status(404)
    

    // Send data for requested county
    // switch (req.params.county) {
        // case 'Dambovita':
        //     var data = {
        //         influxData: influxData_1,
        //         sensorId: sess.sensorId,
        //         county: req.params.county
        //     };
        //     res.status(200).send(data);
        //     break;
        // case 'Timis':
        //     var data = {
        //         influxData: influxData_8,
        //         sensorId: sess.sensorId,
        //         county: req.params.county
        //     };
        //     res.status(200).send(data);
        //     break;
        // case 'Constanta':
        //     var data = {
        //         influxData: influxData_5,
        //         sensorId: sess.sensorId,
        //         county: req.params.county
        //     };
        //     res.status(200).send(data);
        //     break;
        // default:
        //     // var data = {
        //     //     data: [{ 0: "No data for this county" }],
        //     //     sensorId: sess.sensorId,
        //     //     county: req.params.county
        //     // };
        //     res.render('nopage', {
        //         message: "This county does not exist"
        //     })
        //     break;
    // }


})

app.get('/map/:county', (req, res) => {
    sess = req.session
    // sess.county = req.params.county
    res.status(200).render('dashboard', {
        county: req.params.county,
        username: sess.username,
        user_role: sess.user_role,
        sensorId: sess.sensorId,
        user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0
    })
})
// END - API Get Data From Different Zones
//=========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
