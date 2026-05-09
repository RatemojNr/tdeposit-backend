const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    phone: String,

    amount: Number,

    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING"
    },

    checkoutRequestID: String,

}, { timestamps: true });

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);