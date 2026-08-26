const mysql = require('mysql2/promise')
const {database}  = require('./env.js')

const pool = mysql.createPool({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
  port: database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,        // connection alive rakhega
  keepAliveInitialDelay: 10000  // 10 sec
});

module.exports = pool;