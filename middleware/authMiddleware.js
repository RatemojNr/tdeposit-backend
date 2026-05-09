const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "tdeposit_secret_key";

// ======================
// AUTHENTICATION MIDDLEWARE
// ======================
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        req.user = decoded; // attach user to request
        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

// ======================
// ADMIN ONLY MIDDLEWARE
// ======================
function adminOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
}

module.exports = {
    authMiddleware,
    adminOnly
};