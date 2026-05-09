const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    commission: {
    type: Number,
    default: 0
},
amountKES: Number,
amountUSD: Number,

    type: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAW"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "SUCCESS"
    },

    reference: {
        type: String,
        unique: true
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);