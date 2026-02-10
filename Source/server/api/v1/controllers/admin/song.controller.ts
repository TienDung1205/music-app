import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";

import * as songHelper from "../../../../helpers/song";
import * as escapeRegExpHelper from "../../../../helpers/escapeRegExp";
import { convertToSlug } from "../../../../helpers/convertToSlug";

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

// [GET] api/v1/admin/songs/search/:type/suggest
export const suggest = async (req: Request, res: Response) => {
    try{
        const type = req.params.type;
        const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : "";

        if (!keyword) {
            return res.json({ code: 200, message: "Thành công", data: [] });
        }

        const safeKeyword = escapeRegExpHelper.escapeRegExp(keyword);
        const keywordRegex = new RegExp(safeKeyword, 'i');

        // Tạo slug từ keyword để tìm kiếm
        const keywordSlug = convertToSlug(keyword);
        const keywordSlugRegex = new RegExp(escapeRegExpHelper.escapeRegExp(keywordSlug), 'i');

        if(type == "singers"){
            
            const singers = await Singer.find({
                $or: [
                    { fullName: keywordRegex },
                    { slug: keywordSlugRegex }
                ],
                status: "active",
                deleted: false
            }).select("fullName avatar").limit(10);

            res.json({
                code: 200,
                message: "Tìm kiếm ca sĩ thành công",
                singers: singers
            });

        }else if(type == "topics"){

            const topics = await Topic.find({
                $or: [
                    { title: keywordRegex },
                    { slug: keywordSlugRegex }
                ],
                status: "active",
                deleted: false
            }).select("title").limit(10);

            res.json({
                code: 200,
                message: "Tìm kiếm chủ đề thành công",
                topics: topics
            });
        }else{
            res.json({
                code: 400,
                message: "Loại tìm kiếm không hợp lệ"
            });
            return;
        }

    }catch(error){
        console.error("ERROR:", error);
        res.json({
            code: 500,
            message: "Lỗi server"
        })
    }
};