import mongoose from "mongoose";

const singerSchema = new mongoose.Schema(
    {
        fullName: String,
        avatar: String,
        status: String,
        slug: String,
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

const Singer = mongoose.model("singer", singerSchema, "singers");

export default Singer;