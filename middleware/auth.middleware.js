
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {

    // 1. Get token from request header
    const authHeader = req.headers.authorization;

    // 2. Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Token required"
        });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    let decoded;

    // 4. Verify token
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    // 5. Store user information
    req.user = decoded;

    // 6. Allow next controller/middleware
    next();
};

export { verifyToken };
