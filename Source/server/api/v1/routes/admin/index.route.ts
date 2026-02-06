import { Express } from "express";
import { topicRoutes } from "./topic.route";

import { systemConfig } from "../../../../config/system";

const adminRoutesApiVer1 = (app : Express): void => {

    const version = '/api/v1' + systemConfig.prefixAdmin;

    app.use(version + "/topics", topicRoutes);
}

export default adminRoutesApiVer1;