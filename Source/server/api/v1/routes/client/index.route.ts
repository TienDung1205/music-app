import { Express } from "express";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { userRoutes } from "./user.route";

const clientRoutesApiVer1 = (app : Express): void => {

    const version = '/api/v1';

    app.use(version +"/topics", topicRoutes);

    app.use(version + "/songs", songRoutes);

    app.use(version + "/users", userRoutes);
}

export default clientRoutesApiVer1;