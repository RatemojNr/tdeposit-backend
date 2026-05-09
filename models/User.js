const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        default: "user"
    }

}, { timestamps: true });

// Prevent overwrite error in dev mode
module.exports = mongoose.models.User || mongoose.model("User", userSchema);