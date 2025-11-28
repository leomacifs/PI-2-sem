const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407',
    database: 'biblioteca_db'
});

module.exports = db;