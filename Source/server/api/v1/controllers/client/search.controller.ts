import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import TopicSong from "../../models/topicsong.model";
import SingerSong from "../../models/singersong.model";
import { convertToSlug } from "../../../../helpers/convertToSlug";

// [GET] api/v1/search/result
export const result = async (req: Request, res: Response) => {
    try{
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

                // // Tìm các Topic liên quan đến bài hát này
                // const topicSongs = await TopicSong.find({
                //     songId: String(song._id)
                // })
                // .lean();


                // const topicIds = [
                //     ...new Set(topicSongs.map(ts => String(ts.topicId)))
                // ];

                // const topics = await Topic.find({
                //     _id: { $in: topicIds },
                //     status: "active",
                //     deleted: false
                // })
                // .select("title avatar slug")
                // .lean();

                const result = {
                    ...song,
                    singers
                    // topics
                };

                newSongs.push(result);
                // console.log("SONG:", result);
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

        res.json({
            code: 200,
            message: "Tìm kiếm thành công",
            songs: newSongs,
            singers: newSingers
        });
    }catch(error){
        console.error("ERROR:", error);
        res.json({
            code: 500,
            message: "Lỗi server"
        })
    }
};