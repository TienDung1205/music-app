import { Request, Response } from "express";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import { convertToSlug } from "../../../../helpers/convertToSlug";

import * as songHelper from "../../../../helpers/song";

// [GET] api/v1/search/:type
export const result = async (req: Request, res: Response) => {
    try{
        const type = req.params.type;

        if(type != "result" && type != "suggest"){
            res.json({
                code: 400,
                message: "Loại tìm kiếm không hợp lệ"
            });

            return;
        }

        const keyword: string = `${req.query.keyword}`;

        let newSongs =[];
        let newSingers =[];

        if(keyword){
            const keywordRegex = new RegExp(keyword, 'i');

            // Tạo slug từ keyword để tìm kiếm
            const keywordSlug = convertToSlug(keyword);
            const keywordSlugRegex = new RegExp(keywordSlug, 'i');

            const songs = await Song.find({
                $or: [
                    { title: keywordRegex },
                    { slug: keywordSlugRegex }
                ],
                status: "active",
                deleted: false
            }).lean();

            for(const song of songs){
                // Tìm các Singer liên quan đến bài hát này
                const newSong = await songHelper.getSongWithSingers(song);

                newSongs.push(newSong);
            }

            const singers = await Singer.find({
                $or: [
                    { fullName: keywordRegex },
                    { slug: keywordSlugRegex }
                ],
                status: "active",
                deleted: false
            }).lean();

            newSingers = singers;

        }

        if(type == "result"){
            res.json({
                code: 200,
                message: "Tìm kiếm thành công",
                songs: newSongs,
                singers: newSingers
            });
        }else{
            res.json({
                code: 200,
                message: "Gợi ý tìm kiếm thành công",
                songs: newSongs.slice(0, 5),
                singers: newSingers.slice(0, 5)
            });
        }
    }catch(error){
        console.error("ERROR:", error);
        res.json({
            code: 500,
            message: "Lỗi server"
        })
    }
};