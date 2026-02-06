import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import FavoriteSong from "../../models/favoritesong.model";

import * as songHelper from "../../../../helpers/song";
import * as topicHelper from "../../../../helpers/topic";

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

    const result = await topicHelper.getTopicWithSongs(topic);

    const newSongs = [];

    for(const song of result.songs){
        const newSong = await songHelper.getSongWithSingers(song);
        newSongs.push(newSong);
    }

    res.json(
        {
            code: 200,
            message: "Lấy danh sách bài hát thành công",
            topic: topic,
            songs: newSongs
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

        const newSong = await songHelper.getSongWithSingersAndTopics(song);

        const favoriteSong = await FavoriteSong.findOne({
            songId: String(song._id),
            userId: "default-user" // Thay thế bằng userId khi đăng nhập
        });

        const result = {
            ...newSong,
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