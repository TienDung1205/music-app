import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
// import Song from "../../models/song.model";

// [GET] /songs/:slugTopic
export const list = async (req: Request, res: Response) => {
    try{
        const topic = await Topic.findOne({
            slug: req.params.slugTopic,
            status: "active",
            deleted: false
        })

        // console.log(topic);

        const songs = await Song.find({
            topicId: topic.id,
            status: "active",
            deleted: false
        }).select("avatar title slug singerId like").lean();

        // for(const song of songs){
        //     const infoSinger = await Singer.findOne({
        //         _id: song.singerId,
        //         status: "active",
        //         deleted: false
        //     }).select("fullName").lean();

        //     song["infoSinger"] = infoSinger;
        // }

        const singerIds = [
            ...new Set(
                songs.map((song) => song.singerId.toString()).filter(Boolean)
            )
        ]

        const singers = await Singer.find({
            _id: { $in: singerIds },
            status: "active",
            deleted: false
        })
        .select("fullName")
        .lean();

        const singerMap = new Map(
            singers.map(s => [String(s._id), s])
        );

        for (const song of songs) {
            song["infoSinger"] = singerMap.get(String(song.singerId)) || null;
        }

        res.json(songs);
    }catch(error){
        res.status(500).json({ message: "Không có topic hợp lệ" });
    }
};