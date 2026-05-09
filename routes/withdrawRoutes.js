const express = require("express");
const router = express.Router();

const { withdraw } = require("../controllers/withdrawController");

// REQUEST WITHDRAWAL
router.post("/request", withdraw);

module.exports = router;