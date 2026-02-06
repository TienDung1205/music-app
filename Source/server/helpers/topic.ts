import Song from "../api/v1/models/song.model";
import TopicSong from "../api/v1/models/topicsong.model";

export const getTopicWithSongs = async (topic: any) => {
    // 1. Tìm các bản ghi trong bảng trung gian theo topicId
    const topicSongs = await TopicSong.find({
        topicId: String(topic._id)
    })
    .lean();

    // 2. Lấy ra danh sách các songId (loại bỏ trùng lặp nếu có)
    const songIds = [
        ...new Set(topicSongs.map(ts => String(ts.songId)))
    ];

    // 3. Truy vấn thông tin chi tiết các bài hát từ mảng songIds
    const songs = await Song.find({
        _id: { $in: songIds },
        status: "active",
        deleted: false
    })
    .lean();

    // 4. Trả về object topic kèm theo mảng bài hát
    return {
        ...topic,
        songs
    };
};