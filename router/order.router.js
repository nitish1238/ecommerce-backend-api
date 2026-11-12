
import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../controller/order.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = express.Router();

// USER ROUTES
router.post("/", verifyToken, createOrder);

router.get("/my-orders", verifyToken, getMyOrders);

router.get("/:id", verifyToken, getOrderById);

// ADMIN ROUTES
router.get(
    "/",
    verifyToken,
    verifyRole("admin"),
    getAllOrders
);

router.patch(
    "/:id/status",
    verifyToken,
    verifyRole("admin"),
    updateOrderStatus
);

export default router;
