const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
    try {
        // 1) Bearer token
        const authHeader =
            req.headers.authorization || req.headers.Authorization;
        let token = null;

        if (
            authHeader &&
            typeof authHeader === "string" &&
            authHeader.startsWith("Bearer ")
        ) {
            token = authHeader.slice(7).trim();
        }

        // 2) fallback cookie (tuỳ app bạn)
        if (!token && req.cookies) {
            token = req.cookies.accessToken || req.cookies.token;
        }

        // 3) fallback custom header
        if (!token) {
            token = req.headers["x-access-token"] || req.headers["token"];
        }

        if (!token) return res.status(401).json({ message: "Missing token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // vd { userId, role, ... }
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
