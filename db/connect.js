const mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting ');
        return;
    }

    console.log('connected ');
});

module.exports = connection;