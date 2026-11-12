
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

// CREATE PRODUCT (Admin)
const createProduct = async (req, res) => {
    try {
        const { name, description, stock, price, category } = req.body;

        // Check required fields
        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: "Name and category are required"
            });
        }

        // Validate name
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name must be valid"
            });
        }

        // Validate category ID
        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        // Check category exists
        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Validate stock and price
        if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            });
        }

        if (price !== undefined && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        // Create product
        const product = await Product.create({
            name: name.trim(),
            description,
            stock,
            price,
            category
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET ALL PRODUCTS (Public)
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET SINGLE PRODUCT (Public)
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id)
            .populate("category", "name");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// UPDATE PRODUCT (Admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Only allow these fields to be updated
        const allowedFields = [
            "name",
            "description",
            "stock",
            "price",
            "category"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        // Validate name
        if (updates.name !== undefined) {
            if (typeof updates.name !== "string" || !updates.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name must be valid"
                });
            }

            updates.name = updates.name.trim();
        }

        // Validate stock
        if (updates.stock !== undefined) {
            if (!Number.isInteger(updates.stock) || updates.stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative integer"
                });
            }
        }

        // Validate price
        if (updates.price !== undefined) {
            if (typeof updates.price !== "number" || !Number.isFinite(updates.price) || updates.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a valid non-negative number"
                });
            }
        }

        // Check category if being updated
        if (updates.category !== undefined) {
            if (!mongoose.isValidObjectId(updates.category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const categoryExists = await Category.findById(updates.category);

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).populate("category", "name");

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// DELETE PRODUCT (Admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate product ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find product first
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete all images from Cloudinary
        const results = await Promise.all(
            product.images.map(image =>
                cloudinary.uploader.destroy(image.public_id)
            )
        );

        // Check image deletion results
        const failed = results.some(
            result =>
                result.result !== "ok" &&
                result.result !== "not found"
        );

        if (failed) {
            return res.status(500).json({
                success: false,
                message: "Some images could not be deleted. Product was not deleted."
            });
        }

        // Delete product from MongoDB
        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Product and its images deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "products",
                resource_type: "image"
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        stream.end(fileBuffer);
    });
};
const uploadProductImages = async (req, res) => {

    try {

        const { id } = req.params;

        // Validate product ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Check product exists
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image"
            });
        }

        // Upload images to Cloudinary
        const uploadedImages = await Promise.all(
            req.files.map(file =>
                uploadToCloudinary(file.buffer)
            )
        );

        // Save image details in MongoDB
        product.images.push(...uploadedImages);

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product images uploaded successfully",
            images: product.images
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteProductImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Validate product ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find image using Cloudinary public_id
        const image = product.images.find(
            img => img.public_id === imageId
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        // Delete image from Cloudinary
        const result = await cloudinary.uploader.destroy(image.public_id);

        if (result.result !== "ok" && result.result !== "not found") {
            return res.status(500).json({
                success: false,
                message: "Cloudinary image deletion failed"
            });
        }

        // Remove image from MongoDB
        product.images = product.images.filter(
            img => img.public_id !== imageId
        );

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export {deleteProduct,getAllProducts,getProductById,
    createProduct,updateProduct,uploadProductImages,uploadToCloudinary,deleteProductImage}