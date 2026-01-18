import { Request, Response } from "express";
import Topic from "../../models/topic.model";

// [GET] /topics/
export const topics = async (req: Request, res: Response) => {
    const topics = await Topic.find({
        deleted: false
    });

    // console.log(topics);

    res.json(topics);
};