import {User} from "../models/user.model.js";

export const verifyRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Permission not allowed"
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};