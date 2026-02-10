import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

mongoose.plugin(slug);

const topicSchema = new mongoose.Schema(
    {
        title: String,
        avatar: String,
        description: String,
        status: String,
        slug: {
            type: String,
            slug: "title",
            unique: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const Topic = mongoose.model("topic", topicSchema, "topics");

export default Topic;