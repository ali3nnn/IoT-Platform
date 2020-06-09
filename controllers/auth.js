const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
// const cookieParser = require('cookie-parser')

const dotenv = require("dotenv")

// enable debugging
const { parsed, error } = dotenv.config({ debug: true })

// was there an error?
// console.error(error)

// what was parsed?
// console.log(parsed)

// compare to process.env
// console.dir(process.env)

//config db info
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

function allTrue(obj)  {
    for (var o in obj)
        if(!obj[o]) return false;
    return true;
}

// console.log("ENV:", process.env.DATABASE_PASSWORD)

//auth controller register
const authRegister = (req,res,next) => {
    
    const {name, username, email, password, passwordConfirm} = req.body

    const allField = allTrue({name, username, email, password, passwordConfirm})

    if (!allField) return res.render('register', {
        alert: 'All fields are required!'
    }) 

    // check duplicate username
    db.query("SELECT username FROM users WHERE Username = ?", [username], (err, result)=>{
        // console.log("result:",result)
        if(err) console.log("There is a problem ",err)
        else if(result.length) return res.render('register', {
            alert: 'That username is in use'
        })
    })

    //check duplicate email
    db.query("SELECT email FROM users WHERE Email = ?", [email], async (err, result)=>{
        
        if(err) console.log("There is a problem")

        else if (result.length) return res.render('register', {
            alert: 'That email is in use!'
        })

        else if (password != passwordConfirm) return res.render('register', {
            alert: "Passwords do not match!"
        })

        // Register

        // encrypt the pasword
        let hashedPassword = await bcrypt.hash(password, 10)

        //register the user into db
        db.query("INSERT INTO users SET ?",{name: name, username: username, email: email, password: hashedPassword, user_role: 'basic', sensorId: 'no sensor'}, (err) => {
            if (err) console.log("Problem with insert ", err)
            else next()
        })

    })
    
    // res.send("form submitted")
}

//auth controller login
const authLogin = async (req,res,next) => {
    // console.log("REQ.BODY:",req.body)
    try {
        const {username, password, remember} = req.body

        //start the session for future login
        sess = req.session

        // check if username
        if(!username || !password) return res.status(400).render('login', {
            message: 'You forgot to type an username or password'
        })
        else {
            // check user and pass for login
            db.query("SELECT id, username, password, user_role, sensorId FROM users WHERE Username = ?", [username], async (err, result)=>{

                if(err) console.log("There is a problem")
                if(result.length) {
                    let passwordComparator = await bcrypt.compare(password, result[0].password)
                    if (result[0].username != username || !passwordComparator) return res.render('login', {
                        alert: 'You mistyped the password! (check caps lock)'
                    })
                    else {

                        // Set Cookie
                        if (remember == '1') {

                            console.log("Signed cookie write:",result[0].username)

                            const cookieOptions = {
                                expires: new Date(
                                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24*60*60*1000
                                ),
                                httpOnly: true,
                                signed: true
                            }

                            res.cookie('username', result[0].username, cookieOptions)

                        }
                        
                        sess.id_user = result[0].id
                        sess.username = result[0].username
                        sess.user_role = result[0].user_role

                        console.log(result[0].sensorId, result[0].sensorId == 'no sensor')

                        if (result[0].sensorId != 'no sensor') 
                            if (result[0].sensorId.includes(',')) 
                                sess.sensorId = result[0].sensorId.split(',')
                            else sess.sensorId = ''
                        else sess.sensorId = ''

                        console.log("This user has access to sensorId:",sess.sensorId)

                        console.log("Login:",sess.username,sess.user_role)

                        if(result[0].user_role === 'superadmin') {
                            // console.log("check super admin:",result[0].user_role)
                            sess.super_admin = 1
                        }
                        else {
                            // console.log("check super admin:",result[0].user_role)
                            sess.super_admin = 0
                        }
                        // console.log("superadmin:",sess.super_admin)
                            

                        // res.status(200).redirect('/dashboard')

                        next()
                        
                    }
                } else {
                    res.render("login",{
                        alert: "Username `"+username+"` is not registered!"
                    })
                }
            })
        }
    } catch (err) {
        console.log("Error:",err)
    }
}

const authDashboard = (req,res,next) => {
    // check if user is logged
    sess = req.session;

    if(sess.username) {
        next()
    } 
    else res.render("login", {
        alert: "You are not logged in"
    })
}

const authSuperAdmin = (req,res,next) => {
    // get session variable
    sess = req.session;

    if (sess.super_admin == 1) {
        // console.log("this user is superadmin")
        next()
    }
    else {
        // console.log("this user is NOT superadmin")
        res.render('login', {
            alert: "Login with you superadmin account!"
        })
    }
}

const cookieChecker = async (req,res,next) => {
    // get session variable
    sess = req.session;

    // check cookie
    // console.log("Signed cookie read:",req.signedCookies.username)
    // console.log("URL:",req.originalUrl)

    if (req.signedCookies.username && !sess.dont_check_cookie) 
        db.query("SELECT id, username, user_role, sensorId FROM users WHERE username = ?", [req.signedCookies.username], (err, result)=>{
            if(result) {
                if(result[0].username) {
                    sess.id_user = result[0].id
                    sess.username = result[0].username
                    sess.user_role = result[0].user_role
                    sess.sensorId = result[0].sensorId.split(',')
                    // console.log("User",sess.username,"has logged with access to sensorId:",sess.sensorId)
                    if(result[0].user_role === 'superadmin') sess.super_admin = 1
                    else sess.super_admin = 0
                }
                // console.log("sess:",sess)
                next() //go forward with username retrieved from cookie
            } else {
                next() //go forward without username even is there is a cookie
            }
        })
    else {
        // console.log("no cookie found | sess:",sess)
        next() //go forward without cookie retrieved
    }
        
    
    
}


module.exports = {
    authRegister,
    authLogin,
    authDashboard,
    authSuperAdmin,
    cookieChecker
}