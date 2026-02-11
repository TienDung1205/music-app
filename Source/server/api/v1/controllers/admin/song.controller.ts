import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import SingerSong from "../../models/singersong.model";
import TopicSong from "../../models/topicsong.model";

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

// [POST] api/v1/admin/songs/create
export const createPost = async (req: Request, res: Response) => {
  const session = await Song.startSession();
  session.startTransaction();

  try {
    const { title, description, status, avatar, singerIds, topicIds } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!title || !singerIds || !topicIds) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    // 2. Tạo bài hát
    // Song.create trả về một mảng khi truyền vào session
    const [newSong] = await Song.create([{
      title,
      description,
      status,
      avatar
    }], { session });

    const songId = newSong._id;

    // 3. Xử lý SingerSong (Dùng filter để loại bỏ chuỗi rỗng)
    const singerDocs = singerIds
      .split(/,\s*/)
      .filter(Boolean)
      .map((id: string) => ({
        singerId: id.trim(),
        songId
      }));

    if (singerDocs.length > 0) {
      await SingerSong.insertMany(singerDocs, { session });
    }

    // 4. Xử lý TopicSong
    const topicDocs = topicIds
      .split(/,\s*/)
      .filter(Boolean)
      .map((id: string) => ({
        topicId: id.trim(),
        songId
      }));

    if (topicDocs.length > 0) {
      await TopicSong.insertMany(topicDocs, { session });
    }

    // 5. Xác nhận hoàn tất giao dịch
    await session.commitTransaction();

    res.json({
      code: 200,
      message: "Tạo bài hát thành công",
      song: newSong
    });

  } catch (error) {
    // Hoàn tác nếu có bất kỳ lỗi nào xảy ra trong quá trình lưu
    await session.abortTransaction();
    console.error("TRANSACTION ERROR:", error);
    res.status(500).json({ message: "Lỗi server khi lưu bài hát" });
  } finally {
    // Luôn luôn kết thúc session
    session.endSession();
  }
};
