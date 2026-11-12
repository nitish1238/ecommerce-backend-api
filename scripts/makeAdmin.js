import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOneAndUpdate(
            { email: "nitishkumaryadav2205@gmail.com" },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            console.log("User not found. Register this account first.");
            return;
        }

        console.log("Admin created successfully:", user.email);
        console.log("Role:", user.role);

    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
};

makeAdmin();