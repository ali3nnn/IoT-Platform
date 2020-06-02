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
    sess.dont_check_cookie = 1
    res.redirect('/dashboard')
});

// get request to /logout page
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.log(err);
        else res.redirect('/');
    });
});

// Start SUPERADMIN reuqest
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
    if (!req.body.password.length)
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


app.get('/api/get-zones', function (req, res) {
    sess = req.session;
    try {
        db.query("SELECT id, zone FROM zones WHERE id = ?", [sess.id_user], (err, result) => {

            // console.log(sess.id_user)
            // console.log(req.originalUrl, result);

            var data = {
                result: result
            };

            res.status(200).send(data);

            // res.render("admin_allusers", {
            //     username: sess.username,
            //     user_role: sess.user_role,
            //     user_role_is_superadmin: sess.user_role == 'superadmin' ? 1 : 0,
            //     db_results: result,
            //     role_basic: req.body.role == 'basic' ? true : false,
            //     role_superadmin: req.body.role == 'superadmin' ? true : false,
            // })

        })
    } catch (err) {
        console.log("db query zones error:", err)
    }

    
});

//=========================================
// End SUPERADMIN reuqest

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
