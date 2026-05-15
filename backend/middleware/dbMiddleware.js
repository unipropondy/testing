const { getPool } = require("../config/db");

// Helper to extract DB config from headers or .env
const getDbConfig = (req) => {
  return {
    user: req.headers["x-db-user"] || process.env.DB_USER,
    password: req.headers["x-db-pass"] || process.env.DB_PASS,
    server: req.headers["x-db-server"] || process.env.DB_SERVER,
    port: req.headers["x-db-port"] || process.env.DB_PORT,
    database: req.headers["x-db-name"] || process.env.DB_NAME,
  };
};

// Dynamic DB Middleware
const dbMiddleware = async (req, res, next) => {
  // Skip DB check for config saving
  if (req.path === "/api/save-config") {
    return next();
  }

  try {
    const config = getDbConfig(req);
    if (!config.database) {
      return res.status(400).json({ success: false, message: "Database name required" });
    }
    req.pool = await getPool(config);
    next();
  } catch (err) {
    console.error("❌ DB Middleware Error:", err);
    res.status(500).json({ success: false, message: "Database connection failed", error: err.message });
  }
};

module.exports = dbMiddleware;
