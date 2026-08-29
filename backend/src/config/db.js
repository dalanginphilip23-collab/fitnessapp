const mysql = require('mysql2');
require('dotenv').config();

const useSSL = (process.env.DB_HOST || '').includes('aivencloud.com') || process.env.DB_SSL === 'true';
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(useSSL ? { ssl: { rejectUnauthorized: true } } : {}),
});

db.on('connection', (connection) => {
    connection.query("SET time_zone = '+08:00'");
});

module.exports = db.promise();