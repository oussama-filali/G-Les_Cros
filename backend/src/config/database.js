const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ MariaDB connectée');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion MariaDB:', err.message);
    process.exit(1);
  });

module.exports = pool;
