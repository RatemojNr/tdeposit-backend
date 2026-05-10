const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");

// ======================
// 💰 GET USER WALLET
// ======================
router.post("/balance", async (req, res) => {

    try {

        const { username } = req.body;

        // FIND USER
        const user = await User.findOne({ username });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // GET HISTORY
        const history = await Ledger.find({
            userId: user._id
        }).sort({
            createdAt: -1
        });

        // RESPONSE
        return res.json({

            success: true,

            wallet: user.balance,

            history

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
// 🔥 SIMPLE DERIV TOKEN SAVE
// ======================
router.post("/connect-deriv", async (req, res) => {

    try {

        const {
            username,
            derivToken
        } = req.body;

        if (!derivToken) {

            return res.status(400).json({
                success: false,
                message: "Missing Deriv token"
            });

        }

        // FIND USER
        const user = await User.findOne({ username });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // SAVE TOKEN
        user.derivToken = derivToken;

        await user.save();

        return res.json({

            success: true,

            message: "Deriv connected successfully"

        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

module.exports = router;