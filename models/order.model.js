
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: {
        type: [orderItemSchema],
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "DELIVERED"],
        default: "PENDING"
    },
    
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "RAZORPAY"],
        default: "RAZORPAY"
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    }

}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
