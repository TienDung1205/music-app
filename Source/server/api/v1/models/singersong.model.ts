import mongoose from "mongoose";

const singerSongSchema = new mongoose.Schema(
    {
        songId: String,
        singerId: String,
        order: {
            type: Number,
            default: 0
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

singerSongSchema.index(
    { songId: 1, singerId: 1 },
    { unique: true }
);

const SingerSong = mongoose.model("singersong",singerSongSchema,"singersongs");

export default SingerSong;