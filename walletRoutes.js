const express = require("express");
const router = express.Router();

// CONTROLLER (adjust path if needed)
const { deposit } = require("./controllers/depositController");

/**
 * DEPOSIT ROUTE
 */
router.post("/deposit", deposit);

module.exports = router;