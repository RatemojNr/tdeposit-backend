const User = require("../models/UserModel");

const adminMiddleware = async (req, res, next) => {
    try {
        // Assuming you have user info in req.user from auth middleware
        const user = await User.findById(req.user.id);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized" });
    }
};

module.exports = adminMiddleware;