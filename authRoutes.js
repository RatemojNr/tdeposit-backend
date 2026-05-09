const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

// DERIV LOGIN
router.post("/deriv-login", async (req, res) => {
    try {
        const { derivToken } = req.body;

        // Verify token with Deriv API
        const response = await axios.post("https://api.deriv.com/api/account", {
            token: derivToken
        });

        if (!response.data) {
            return res.status(400).json({ message: "Invalid token" });
        }

        // Create your system session token
        const appToken = jwt.sign(
            {
                derivToken
            },
            SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token: appToken,
            user: response.data
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;