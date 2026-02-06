import { Request, Response } from "express";
import Topic from "../../models/topic.model";

// [GET] api/v1/topics/
export const topics = async (req: Request, res: Response) => {
    try{
        const topics = await Topic.find({
            deleted: false,
            status: "active"
        });

        // console.log(topics);

        res.json({
            code: 200,
            message: "Lấy danh sách chủ đề thành công",
            topics: topics
        });
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};