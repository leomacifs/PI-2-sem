const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_biblioteca'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
});

module.exports = db;