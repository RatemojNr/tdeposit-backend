const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    phone: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    role: {
        type: String,
        default: "user"
    },
    balance: {
        type: Number,
        default: 0
    },
    frozen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// 🔥 SAFE MODEL EXPORT (IMPORTANT FIX)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);