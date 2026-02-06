import { Request, Response } from "express";
import Topic from "../../models/topic.model";

// [GET] api/v1/admin/topics
export const index = async (req: Request, res: Response) => {
    try{
        const topics = await Topic.find({
            status: "active",
            deleted: false
        })

        res.json({
            code: 200,
            message: "Trang chủ chủ đề",
            topics: topics
        });
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};