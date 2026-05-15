const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/cds-today", orderController.getTodayOrders);

module.exports = router;
