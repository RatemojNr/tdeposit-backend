const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/UserModel");

// ======================
// 🔐 REGISTER
// ======================
router.post("/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;

        // VALIDATION
        if (!username || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        // CHECK EXISTING USER
        const exists = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (exists) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });

        }

        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // CREATE USER
        const user = await User.create({

            username,

            email,

            password: hashedPassword,

            balance: 0

        });

        return res.json({

            success: true,

            message: "Account created successfully"

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

// ======================
// 🔑 LOGIN
// ======================
router.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        // FIND USER
        const user = await User.findOne({ username });

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });

        }

        // CHECK PASSWORD
        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });

        }

        // CREATE JWT
        const token = jwt.sign(

            {
                id: user._id,
                username: user.username
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        return res.json({

            success: true,

            token,

            user: {

                id: user._id,

                username: user.username,

                email: user.email,

                balance: user.balance

            }

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

module.exports = router;