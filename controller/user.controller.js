import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv  from 'dotenv'
import sendEmail from "../services/email.service.js";
import { User } from "../models/user.model.js";
dotenv.config()

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Name validation
        if (!name || !/^[A-Za-z]{3,30}$/.test(name)) {
            return res.status(400).json({
                success: false,
                message: "Enter valid name"
            });
        }

        // Email validation
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter valid email"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{8,20}$/;

        if (!password || !passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain uppercase, lowercase, number and minimum 8 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Hash token for database storage
        const hashedToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 30 * 60 * 1000
        });

        // Create verification link
        const verificationURL =
            `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Send verification email
        try {
            await sendEmail({
                to: user.email,
                subject: "Verify Your Email",
                html: `
                    <h2>Welcome ${user.name}!</h2>
                    <p>Please verify your email address.</p>
                    <a href="${verificationURL}">
                        Verify Email
                    </a>
                    <p>This link expires in 15 minutes.</p>
                `
            });
        } catch (emailError) {
            // Remove account if verification email cannot be sent
            await User.findByIdAndDelete(user._id);

            throw emailError;
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email."
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 3. Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Check email verification
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        // 5. Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 6. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const getProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user.userId).select('-password')
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'User fetch successfully',
            user
        })

    }catch(error){
        console.log('internal Server errror',error.message)
        res.status(500).json({
            success:false,
            message:'internal  server error'

        })

    }

}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ADMIN: Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        // Use the same response whether account exists or not
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the account exists, a reset email will be sent"
            });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store hashed token in database
        user.passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 15 minutes
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetURL =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Reset Your Password</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetURL}">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, ignore this email.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "If the account exists, a reset email will be sent"
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request"
        });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Validate new password
        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        // Hash the received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid, unexpired token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Hash received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        // Verify email
        user.isEmailVerified = true;

        // Clear verification token
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Email verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { registerUser,loginUser ,getProfile,deleteUser,getAllUsers,forgotPassword,resetPassword,verifyEmail};
