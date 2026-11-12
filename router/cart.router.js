import express from "express";

import {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart
} from "../controller/cart.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/update/:productId", verifyToken, updateCart);
router.delete("/remove/:productId", verifyToken, removeFromCart);
router.delete("/clear", verifyToken, clearCart);

export default router;