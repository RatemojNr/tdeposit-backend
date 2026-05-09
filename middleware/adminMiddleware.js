console.log("🔥 ADMIN MIDDLEWARE LOADED");

module.exports = (req, res, next) => {

    // SIMPLE ADMIN CHECK (temporary)
    const isAdmin = true;

    if (!isAdmin) {
        return res.status(403).json({
            message: "Access denied. Admins only."
        });
    }

    next();
};