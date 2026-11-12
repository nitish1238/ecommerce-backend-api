import express from 'express';
import dotenv from 'dotenv';
import "dotenv/config";
import connectDB from './config/db.js';
import userRoutes from './router/user.router.js';
import productRoutes from "./router/product.router.js";
import orderRoutes from "./router/order.router.js";
import categoryRoutes from "./router/category.router.js";
import { configureCloudinary } from "./config/cloudinary.js";
import cartRoutes from "./router/cart.router.js";


dotenv.config();
const app=express();
app.use(express.json());
app.use('/api/users',userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);



connectDB();
configureCloudinary();
app.listen(7000,()=>{
    console.log('Server is running on http://localhost:7000')
})