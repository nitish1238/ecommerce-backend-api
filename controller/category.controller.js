
import mongoose from "mongoose";
import { Category } from "../models/category.model.js";

// CREATE CATEGORY (Admin)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const categoryName = name.trim();

        const existingCategory = await Category.findOne({
            name: categoryName
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name: categoryName
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET ALL CATEGORIES (Public)
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET CATEGORY BY ID (Public)
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// UPDATE CATEGORY (Admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid category name is required"
            });
        }

        const categoryName = name.trim();

        const existingCategory = await Category.findOne({
            name: categoryName,
            _id: { $ne: id }
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { $set: { name: categoryName } },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// DELETE CATEGORY (Admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        // Prevent deleting a category used by products
        const { Product } = await import("../models/product.model.js");

        const productsExist = await Product.exists({
            category: id
        });

        if (productsExist) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete category because products are using it"
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export{getAllCategories,getCategoryById,createCategory,updateCategory,deleteCategory}
