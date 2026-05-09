const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    const exists = await User.findOne({ phone });

    if (exists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      phone,
      password: hashed,
      balance: 0
    });

    return res.json({
      message: "User created successfully",
      user
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;