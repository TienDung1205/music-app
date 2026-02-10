import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/song.controller";

router.get("/", controller.index);

router.get("/search/:type/suggest", controller.suggest);

export const songRoutes: Router = router;