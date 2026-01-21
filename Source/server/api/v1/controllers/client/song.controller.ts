import { Request, Response } from "express";
import mongoose from "mongoose";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import TopicSong from "../../models/topicsong.model";
import SingerSong from "../../models/singersong.model";

// [GET] /songs/:slugTopic
export const list = async (req: Request, res: Response) => {
    try {
    console.log("=== STEP 1: FIND TOPIC ===");

    const topic = await Topic.findOne({
        slug: req.params.slugTopic,
        status: "active",
        deleted: false
    }).lean();

    console.log("topic:", topic);

    if (!topic) {
        return res.status(404).json({ message: "Topic không tồn tại" });
    }

    // ==============================
    console.log("=== STEP 2: FIND TOPIC_SONGS ===");

    const topicSongs = await TopicSong.find({
        topicId: String(topic._id)
    })
    .sort({ order: 1 })
    .lean();


    console.log("topicSongs:", topicSongs);

    const songIds = topicSongs.map(ts => String(ts.songId));
    console.log("songIds:", songIds);

    // ==============================
    console.log("=== STEP 3: FIND SONGS ===");

    const songs = await Song.find({
        _id: { $in: songIds },
        status: "active",
        deleted: false
    })
    .select("avatar title slug like")
    .lean();

    console.log("songs:", songs);

    const songMap = new Map(
        songs.map(song => [String(song._id), song])
    );

    // ==============================
    console.log("=== STEP 4: FIND SINGER_SONGS ===");

    const singerSongs = await SingerSong.find({
        songId: { $in: songIds.map(String) }
    })
    .sort({ order: 1 })
    .lean();


    console.log("singerSongs:", singerSongs);

    const singerIds = [
        ...new Set(singerSongs.map(ss => String(ss.singerId)))
    ];

    console.log("singerIds:", singerIds);

    // ==============================
    console.log("=== STEP 5: FIND SINGERS ===");

    const singers = await Singer.find({
        _id: { $in: singerIds },
        status: "active",
        deleted: false
    })
    .select("fullName")
    .lean();

    console.log("singers:", singers);

    const singerMap = new Map(
        singers.map(s => [String(s._id), s])
    );

    // ==============================
    console.log("=== STEP 6: GROUP SINGERS BY SONG ===");

    const singerBySong = new Map<string, any[]>();

    for (const ss of singerSongs) {
        const songId = String(ss.songId);
        const singer = singerMap.get(String(ss.singerId));
        if (!singer) continue;

        const list = singerBySong.get(songId) || [];
        list.push(singer);
        singerBySong.set(songId, list);
    }

    console.log(
        "singerBySong:",
        Object.fromEntries(singerBySong)
    );

    // ==============================
    console.log("=== STEP 7: FINAL RESULT ===");

    const result = topicSongs
        .map(ts => {
            const song = songMap.get(String(ts.songId));
            if (!song) return null;

            return {
                ...song,
                singers: singerBySong.get(String(ts.songId)) || []
            };
        })
        .filter(Boolean);

    console.log("result:", result);

    res.json(result);

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};