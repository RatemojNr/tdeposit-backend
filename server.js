require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const app = express();

// ======================
// TRUST PROXY (RAILWAY FIX)
// ======================
app.set("trust proxy", 1);

// ======================
// SECURITY
// ======================
app.use(helmet());

app.use(cors({
    origin: "*"
}));

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true
}));

// ======================
// RATE LIMITER
// ======================
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

app.use(limiter);

// ======================
// ROUTES
// ======================

// AUTH
app.use("/api/auth", require("./routes/authRoutes"));

// WALLET
app.use("/api/wallet", require("./routes/walletRoutes"));

// DEPOSIT
app.use("/api/deposit", require("./routes/depositRoutes"));

// WITHDRAW
app.use("/api/withdraw", require("./routes/withdrawRoutes"));

// ADMIN
app.use("/api/admin", require("./routes/adminRoutes"));

// MPESA ROUTES (MAIN)
app.use("/api/mpesa", require("./routes/mpesaRoutes"));

// MPESA CALLBACK (SEPARATE - IMPORTANT FIX)
app.use("/api/mpesa/callback", require("./routes/mpesaCallback"));

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
    res.status(200).json({
        app: "TDeposit",
        status: "running 🚀",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        console.log("✅ MongoDB connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MongoDB Error:", err.message);
    });