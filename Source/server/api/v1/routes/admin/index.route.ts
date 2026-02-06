import { Express } from "express";
import { topicRoutes } from "./topic.route";

import { systemConfig } from "../../../../config/system";
import { songRoutes } from "./song.route";

const adminRoutesApiVer1 = (app : Express): void => {

    const version = '/api/v1' + systemConfig.prefixAdmin;

    app.use(version + "/topics", topicRoutes);

    app.use(version + "/songs", songRoutes);
}

export default adminRoutesApiVer1;