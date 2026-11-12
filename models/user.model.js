import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    name:{type:String,required:true,trim:true,lowercase:true},
    email:{type:String,required:true,unique:true,lowercase:true,trim:true},
    password:{type:String,required:true,minlength:8,maxlength:200},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: {
        type: String
    },

    emailVerificationExpires: {
        type: Date
    },

    // Forgot password
    passwordResetToken: {
        type: String
    },

    passwordResetExpires: {
        type: Date
    }
},{timestamps:true})
export const User=mongoose.model('User',userSchema)