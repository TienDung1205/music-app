import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        phone: String,
        address: String,
        avatar: String,
        status: {
            type: String,
            default: "active"
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("user", userSchema, "users");

export default User;