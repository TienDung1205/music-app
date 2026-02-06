import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/song.controller";

router.get("/:slugTopic", controller.list);

router.get("/detail/:slugSong", controller.detail);

router.patch("/like/:typeLike/:slugSong", controller.like);

router.patch("/favorite/:typeFavorite/:slugSong", controller.favorite);

router.patch("/listen/:slugSong", controller.listen);

export const songRoutes: Router = router;
