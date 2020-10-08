const mysql = require('mysql')
const dotenv = require("dotenv")
// const { parsed, error } = dotenv.config({ debug: true })

//config db info
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const showAllUsers = (req,res,next) => {
    next()
}

module.exports = {
    showAllUsers
}