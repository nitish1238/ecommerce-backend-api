import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        // 1. Validate input
        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // 2. Find product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        // 4. Find user's cart or create one
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        // 5. Check whether product already exists
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock"
                });
            }

            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity
            });
        }

        // 6. Save cart
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product", "name price images stock");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        return res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;

        // 1. Validate product ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // 3. Find cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // 4. Find product inside cart
        const cartItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // 5. Check product stock
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        // 6. Update quantity
        cartItem.quantity = quantity;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart
        });

    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        // 1. Validate product ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // 3. Check product exists in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // 4. Remove product
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });

    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Remove all cart items
        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { addToCart ,getCart,updateCart,removeFromCart,clearCart};