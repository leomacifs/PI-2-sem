require('dotenv').config();
const mysql = require('mysql2');

// Configura a conexão usando variáveis de ambiente (.env)

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'biblioteca_db',
    port: process.env.DB_PORT || 3306
});

module.exports = db;