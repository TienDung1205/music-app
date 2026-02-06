import { Request, Response } from "express";
import mongoose from "mongoose";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import TopicSong from "../../models/topicsong.model";
import SingerSong from "../../models/singersong.model";
import FavoriteSong from "../../models/favoritesong.model";

// [GET] api/v1/songs/:slugTopic
export const list = async (req: Request, res: Response) => {
    try {
    // console.log("=== STEP 1: FIND TOPIC ===");

    const topic = await Topic.findOne({
        slug: req.params.slugTopic,
        status: "active",
        deleted: false
    }).lean();

    if (!topic) {
        return res.status(404).json({ message: "Topic không tồn tại" });
    }

    // console.log("=== STEP 2: FIND TOPIC_SONGS ===");

    const topicSongs = await TopicSong.find({
        topicId: String(topic._id)
    })
    .sort({ order: 1 })
    .lean();

    const songIds = topicSongs.map(ts => String(ts.songId));

    // console.log("=== STEP 3: FIND SONGS ===");

    const songs = await Song.find({
        _id: { $in: songIds },
        status: "active",
        deleted: false
    })
    .select("avatar title slug like")
    .lean();

    const songMap = new Map(
        songs.map(song => [String(song._id), song])
    );

    // console.log("=== STEP 4: FIND SINGER_SONGS ===");

    const singerSongs = await SingerSong.find({
        songId: { $in: songIds.map(String) }
    })
    .sort({ order: 1 })
    .lean();

    const singerIds = [
        ...new Set(singerSongs.map(ss => String(ss.singerId)))
    ];

    // console.log("=== STEP 5: FIND SINGERS ===");

    const singers = await Singer.find({
        _id: { $in: singerIds },
        status: "active",
        deleted: false
    })
    .select("fullName avatar slug")
    .lean();

    const singerMap = new Map(
        singers.map(s => [String(s._id), s])
    );

    // console.log("=== STEP 6: GROUP SINGERS BY SONG ===");

    const singerBySong = new Map<string, any[]>();

    for (const ss of singerSongs) {
        const songId = String(ss.songId);
        const singer = singerMap.get(String(ss.singerId));
        if (!singer) continue;

        const list = singerBySong.get(songId) || [];
        list.push(singer);
        singerBySong.set(songId, list);
    }

    // console.log("=== STEP 7: FINAL RESULT ===");

    const results = topicSongs
        .map(ts => {
            const song = songMap.get(String(ts.songId));
            if (!song) return null;

            return {
                ...song,
                singers: singerBySong.get(String(ts.songId)) || []
            };
        })
        .filter(Boolean);

    res.json(
        {
            code: 200,
            message: "Lấy danh sách bài hát thành công",
            topic: topic,
            songs: results
        }
    );

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// [GET] api/v1/songs/detail/:slugSong
export const detail = async (req: Request, res: Response) => {
    try{
        const song = await Song.findOne({
            slug: req.params.slugSong,
            status: "active",
            deleted: false
        }).lean();

        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        // Tìm các Singer liên quan đến bài hát này
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

        // Tìm các Topic liên quan đến bài hát này
        const topicSongs = await TopicSong.find({
            songId: String(song._id)
        })
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

        const favoriteSong = await FavoriteSong.findOne({
            songId: String(song._id),
            userId: "default-user" // Thay thế bằng userId khi đăng nhập
        });

        const result = {
            ...song,
            singers,
            topics,
            isFavorite: favoriteSong ? true : false
        };

        res.json(
            {
                code: 200,
                message: "Lấy chi tiết bài hát thành công",
                song: result
            }
        );


    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// [PATCH] api/v1/songs/like/:typeLike/:slugSong
type LikeParams = {
    typeLike: "like" | "unlike";
    slugSong: string;
};

export const like = async (req: Request<LikeParams>, res: Response) => {
    try{
        const typeLike: string = req.params.typeLike;
        const song = await Song.findOne({
            slug: req.params.slugSong,
            status: "active",
            deleted: false
        });

        let newLike: number = song.like;

        if(typeLike == "like"){
            newLike = song.like + 1;
        }
        else if(typeLike == "unlike"){
            newLike = song.like - 1;
        }
        else{
            return res.status(400).json({ message: "Yêu cầu không hợp lệ" });
        }

        await Song.updateOne(
            { slug: req.params.slugSong },
            {
                like: newLike
            }
        );
        res.json({
            code: 200,
            message: `Cập nhật ${typeLike} thành công`,
            like: newLike
        });
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
}

// [PATCH] api/v1/songs/favorite/:typeFavorite/:slugSong
type FavoriteParams = {
    typeFavorite: "favorite" | "unfavorite";
    slugSong: string;
};

export const favorite = async (req: Request<FavoriteParams>, res: Response) => {
    try{
        const typeFavorite: string = req.params.typeFavorite;
        const slugSong: string = req.params.slugSong;

        const song = await Song.findOne({
            slug: slugSong,
            status: "active",
            deleted: false
        });

         const existFavoriteSong = await FavoriteSong.findOne({
            songId: song.id,
            userId: "default-user" // Thay thế bằng userId khi đăng nhập
        });

        if(typeFavorite == "favorite" && !existFavoriteSong){
            // Thêm vào danh sách yêu thích

            const record = new FavoriteSong({
                songId: song.id,
                userId: "default-user" // Thay thế bằng userId khi đăng nhập
            });
            await record.save();

        }
        else if(typeFavorite == "unfavorite" && existFavoriteSong){
            // Xóa khỏi danh sách yêu thích

            await FavoriteSong.deleteOne({
                songId: song.id,
                userId: "default-user" // Thay thế bằng userId khi đăng nhập
            });

        }else{
            return res.status(400).json({ message: "Yêu cầu không hợp lệ" });
        }

        res.json({
            code: 200,
            message: `Đã xử lý yêu cầu ${typeFavorite} thành công`,
         });
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// [PATCH] api/v1/songs/listen/:slugSong
export const listen = async (req: Request, res: Response) => {
    try{
        const slugSong = req.params.slugSong as string;

        const song = await Song.findOne({
            slug: slugSong,
            status: "active",
            deleted: false
        });

        const newListen: number = song.listen + 1;

        await Song.updateOne(
            {
                slug: slugSong
            },
            {
                listen: newListen
            }
        );

        const result = await Song.findOne({
            slug: slugSong,
            status: "active",
            deleted: false
        });

        res.json({
            code: 200,
            message: `Cập nhật lượt nghe thành công`,
            listen: result.listen
        });

    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};