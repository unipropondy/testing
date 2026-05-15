const fs = require("fs");
const path = require("path");

exports.saveConfig = async (req, res) => {
  try {
    const { dbUser, dbPass, dbServer, dbPort, dbName } = req.body;
    
    // Note: In a production environment like Railway, writing to .env is not recommended.
    // However, keeping this logic for now as requested.
    const envPath = path.join(__dirname, "..", ".env");
    const content = `DB_USER=${dbUser}
DB_PASS=${dbPass}
DB_SERVER=${dbServer}
DB_PORT=${dbPort}
DB_NAME=${dbName}
PORT=${process.env.PORT || 3000}`;

    fs.writeFileSync(envPath, content);
    console.log("📝 .env file updated with new defaults");
    
    res.json({ success: true, message: "Server defaults updated successfully" });
  } catch (err) {
    console.error("❌ Failed to save config:", err);
    res.status(500).json({ success: false, message: "Failed to update .env file" });
  }
};
