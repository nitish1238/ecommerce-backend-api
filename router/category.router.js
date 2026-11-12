
import express from "express";

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controller/category.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = express.Router();

// PUBLIC ROUTES

// Get all categories
router.get("/", getAllCategories);

// Get category by ID
router.get("/:id", getCategoryById);


// ADMIN ONLY ROUTES

// Create category
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    createCategory
);

// Update category
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    updateCategory
);

// Delete category
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    deleteCategory
);

export default router;
