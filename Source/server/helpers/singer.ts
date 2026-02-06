import Song from "../api/v1/models/song.model";
import SingerSong from "../api/v1/models/singersong.model";

export const getSingerWithSongs = async (singer: any) => {
    // 1. Tìm các bản ghi trong bảng trung gian theo singerId
    const singerSongs = await SingerSong.find({
        singerId: String(singer._id)
    })
    .lean();

    // 2. Lấy ra danh sách các songId (không trùng lặp)
    const songIds = [
        ...new Set(singerSongs.map(ss => String(ss.songId)))
    ];

    // 3. Truy vấn chi tiết các bài hát từ danh sách ID thu được
    const songs = await Song.find({
        _id: { $in: songIds },
        status: "active",
        deleted: false
    })
    .lean();

    // 4. (Tùy chọn) Sắp xếp lại mảng songs đúng theo thứ tự của mảng songIds
    const orderedSongs = songIds.map(id => 
        songs.find(s => String(s._id) === id)
    ).filter(s => s !== undefined);

    // 5. Trả về object ca sĩ kèm danh sách bài hát
    return {
        ...singer,
        songs: orderedSongs
    };
};