
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

// CREATE ORDER
const createOrder = async (req, res) => {
    try {
        const { orderItems, address } = req.body;

        // Validate required fields
        if (!Array.isArray(orderItems) || orderItems.length === 0 || !address?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Order items and address are required"
            });
        }

        let totalPrice = 0;
        const finalOrderItems = [];

        // Check products and calculate total price
        for (const item of orderItems) {
            const { productId, quantity } = item;

            if (!mongoose.isValidObjectId(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be a positive integer"
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${productId}`
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = product.price * quantity;
            totalPrice += itemTotal;

            finalOrderItems.push({
                productId: product._id,
                quantity,
                price: product.price
            });
        }

        // Create order
        const order = await Order.create({
            customer: req.user.userId,
            orderItems: finalOrderItems,
            orderPrice: totalPrice,
            address: address.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET MY ORDERS
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user.userId
        })
        .populate("orderItems.productId", "name price")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET SINGLE ORDER
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id)
            .populate("customer", "name email")
            .populate("orderItems.productId", "name price");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only owner or admin can view the order
        const isOwner = order.customer._id.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ADMIN: GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customer", "name email")
            .populate("orderItems.productId", "name price")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ADMIN: UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const allowedStatuses = ["PENDING", "CANCELLED", "DELIVERED"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
export{getAllOrders,getMyOrders,getOrderById,createOrder,updateOrderStatus}
