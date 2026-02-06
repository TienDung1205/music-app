import Singer from "../api/v1/models/singer.model";
import SingerSong from "../api/v1/models/singersong.model";
import Topic from "../api/v1/models/topic.model";
import TopicSong from "../api/v1/models/topicsong.model";

export const getSongWithSingers = async (song: any) => {
    // Lấy SingerSong theo songId
    const singerSongs = await SingerSong.find({
        songId: String(song._id)
    })
    .sort({ order: 1 })
    .lean();

    const singerIds = [
        ...new Set(singerSongs.map(ss => String(ss.singerId)))
    ];

    const singers = await Singer.find({
        _id: { $in: singerIds },
        status: "active",
        deleted: false
    })
    .select("fullName avatar slug")
    .lean();

    return {
        ...song,
        singers
    };
};

export const getSongWithTopics = async (song: any) => {
    // Lấy TopicSong theo songId
    const topicSongs = await TopicSong.find({
        songId: String(song._id)
    })
    .sort({ order: 1 })
    .lean();

    const topicIds = [
        ...new Set(topicSongs.map(ts => String(ts.topicId)))
    ];

    const topics = await Topic.find({
        _id: { $in: topicIds },
        status: "active",
        deleted: false
    })
    .select("title avatar slug")
    .lean();

    return {
        ...song,
        topics
    };
};

export const getSongWithSingersAndTopics = async (song: any) => {
    // Chạy song song cả 2 tác vụ lấy Ca sĩ và lấy Chủ đề
    const [songWithSingers, songWithTopics] = await Promise.all([
        getSongWithSingers(song),
        getSongWithTopics(song)
    ]);

    // Gộp kết quả lại thành một Object duy nhất
    return {
        ...song,
        singers: songWithSingers.singers,
        topics: songWithTopics.topics
    };
};
