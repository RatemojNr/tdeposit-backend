const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    amount: Number,

    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },

    reference: String,
    provider: String, // mpesa, stripe, etc

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Deposit", depositSchema);