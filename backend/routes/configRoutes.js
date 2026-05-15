const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

router.post("/save-config", configController.saveConfig);

module.exports = router;
