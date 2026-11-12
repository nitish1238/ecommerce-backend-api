
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    price: {
        type: Number,
        default: 0,
        min: 0
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    images: [
        {
            url: {
                type: String,
                required: true
            },

            public_id: {
                type: String,
                required: true
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
