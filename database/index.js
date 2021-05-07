const mysql = require("mysql2")
// const dbConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Egide1@rca',
//     database: 'rfid_system'
// });

const dbConnection = mysql.createConnection({
    host: "127.0.0.1",
    user: "egide",
    password: "",
    database: "rfid_system"
})

dbConnection ? 
    console.log(`[${new Date()}]  Connected to MYSQL database successfully`):
    console.log(`[${new Date()}]  Failed to connect to MYSQL database`);


module.exports = {
    dbConnection
}