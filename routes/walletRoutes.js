const express = require("express");
const router = express.Router();

const { withdraw } = require("../controllers/withdrawController");

// WITHDRAW
router.post("/withdraw", withdraw);

module.exports = router;