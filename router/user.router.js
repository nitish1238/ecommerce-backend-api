import express from 'express'
import {registerUser,loginUser,getProfile,
    deleteUser,getAllUsers,forgotPassword,
    resetPassword,verifyEmail} from '../controller/user.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { verifyRole } from '../middleware/role.middleware.js'
const router=express.Router()
router.post('/register',registerUser)
router.post("/login", loginUser)
// Forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// User and admin can view their own profile
router.get('/profile',verifyToken,getProfile)

// Only admin can view all users
router.get("/all", verifyToken, verifyRole("admin"), getAllUsers)
router.get("/verify-email/:token", verifyEmail);

// Only admin can delete users
router.delete("/:id", verifyToken, verifyRole("admin"), deleteUser)
export default router
