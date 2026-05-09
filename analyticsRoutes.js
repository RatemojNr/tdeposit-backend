const express = require("express");
const router = express.Router();

const {
    authMiddleware,
    adminOnly
} = require("./middleware/authMiddleware");

const {
    getPlatformStats
} = require("./controllers/analyticsController");

// ADMIN ONLY STATS
router.get("/stats", authMiddleware, adminOnly, getPlatformStats);

module.exports = router;