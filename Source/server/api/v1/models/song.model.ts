import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

mongoose.plugin(slug);

const songSchema = new mongoose.Schema(
    {
        title: String,
        avatar: String,
        description: String,
        like: Number,
        listen: {
            type: Number,
            default: 0
        },
        lyrics: String,
        audio: String,
        status: String,
        slug: {
            type: String,
            slug: "title",
            unique: true
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

const Song = mongoose.model("song", songSchema, "songs");

export default Song;