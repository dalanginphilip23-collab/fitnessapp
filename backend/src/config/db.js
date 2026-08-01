const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Without this, MySQL evaluates NOW()/CURDATE() in its own server default
// timezone (UTC on Railway), so "today" resets at UTC midnight = 8 AM
// Philippine time instead of local midnight. Setting the SESSION time_zone
// on every pooled connection makes NOW()/CURDATE() match the user's actual
// day. (The mysql2 `timezone` config option does NOT do this — it only
// controls driver-side JS Date <-> MySQL string conversion, not what SQL
// functions compute server-side.)
db.on('connection', (connection) => {
    connection.query("SET time_zone = '+08:00'");
});

module.exports = db.promise();