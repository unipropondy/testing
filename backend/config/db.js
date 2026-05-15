const sql = require("mssql");
require("dotenv").config();

const pools = new Map();

/**
 * Get or create a connection pool based on dynamic config
 * @param {Object} config - { user, password, server, port, database }
 */
const getPool = async (config) => {
  const { user, password, server, port, database } = config;
  
  // Unique key for this specific connection configuration
  const key = `${user}@${server}:${port}/${database}`;
  
  if (pools.has(key)) {
    const existingPool = pools.get(key);
    if (existingPool.connected) return existingPool;
    pools.delete(key); // Remove if disconnected
  }

  try {
    console.log(`🔌 Connecting to SQL: ${server}\\${database}...`);
    const pool = await new sql.ConnectionPool({
      user: user || process.env.DB_USER,
      password: password || process.env.DB_PASS,
      server: server || process.env.DB_SERVER,
      port: Number(port) || Number(process.env.DB_PORT),
      database: database || process.env.DB_NAME,
      requestTimeout: 120000,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }).connect();

    console.log(`✅ SQL Connected successfully!`);
    pools.set(key, pool);
    return pool;

  } catch (err) {
    console.error(`❌ DB Connection Failed:`, err.message);
    throw err;
  }
};

module.exports = {
  sql,
  getPool
};
