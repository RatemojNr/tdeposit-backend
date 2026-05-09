const express = require("express");
const router = express.Router();

const wallet = require("./wallet");

// Deposit endpoint
router.post("/deposit", (req, res) => {
    const { amount } = req.body;

    wallet.deposit(amount, "User Deposit");

    res.json({
        message: "Deposit successful",
        balance: wallet.getBalance()
    });
});

// Balance endpoint
router.get("/balance", (req, res) => {
    res.json({
        balance: wallet.getBalance()
    });
});

module.exports = router;