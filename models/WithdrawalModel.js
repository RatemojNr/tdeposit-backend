const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        method: {
            type: String,
            default: "mpesa"
        },

        status: {
            type: String,
            enum: ["pending", "approved", "paid", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Withdrawal ||
    mongoose.model("Withdrawal", withdrawalSchema);