
import express from "express";

import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    deleteProductImage
} from "../controller/product.controller.js";
import upload from "../middleware/upload.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = express.Router();

// PUBLIC ROUTES

// Get all products
router.get("/", getAllProducts);

// Get single product
router.get("/:id", getProductById);


// ADMIN ONLY ROUTES

// Create product
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    createProduct
);

// Update product
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    updateProduct
);

// Delete product
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    deleteProduct
);
// Upload product images (ADMIN ONLY)
router.post(
    "/:id/images",
    verifyToken,
    verifyRole("admin"),
    upload.array("images", 5),
    uploadProductImages
);
router.delete(
    "/:id/images/:imageId",
    verifyToken,
    verifyRole("admin"),
    deleteProductImage
);

export default router;
