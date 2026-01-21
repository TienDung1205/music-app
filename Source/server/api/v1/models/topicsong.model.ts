import mongoose from "mongoose";

const topicSongSchema = new mongoose.Schema(
    {
        topicId: String,
        songId: String,
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

// 1 bài hát chỉ xuất hiện 1 lần trong 1 chủ đề
topicSongSchema.index(
    { topicId: 1, songId: 1 },
    { unique: true }
);

const TopicSong = mongoose.model("topicsong",topicSongSchema,"topicsongs");

export default TopicSong;
