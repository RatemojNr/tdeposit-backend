const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

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
        default: ""
    },

    derivToken: {
        type: String,
        default: ""
    },

    balance: {
        type: Number,
        default: 0
    },

    frozen: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// ✅ PREVENT OVERWRITE ERROR
module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);