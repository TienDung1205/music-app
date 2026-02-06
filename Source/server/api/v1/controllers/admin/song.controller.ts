import { Request, Response } from "express";
import Song from "../../models/song.model";

import * as songHelper from "../../../../helpers/song";

// [GET] api/v1/admin/songs
export const index = async (req: Request, res: Response) => {
    try{
        const newSongs = [];

        const songs = await Song.find({
            status: "active",
            deleted: false
        }).lean();

        for(const song of songs){
            const songDetail = await songHelper.getSongWithSingersAndTopics(song);
            newSongs.push(songDetail);
        }

        res.json({
            code: 200,
            message: "Trang chủ bài hát",
            songs: newSongs
        });
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};