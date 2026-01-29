import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/user.controller";
import * as authMiddleware from "../../middlewares/client/auth.middleware";
import * as authRejectMiddleware from "../../middlewares/client/authReject.middleware";

router.post("/register", authRejectMiddleware.rejectIfAuthenticated, controller.register);

router.post("/login", authRejectMiddleware.rejectIfAuthenticated, controller.login);

router.get("/infoUser", authMiddleware.requireAuth, controller.infoUser);

export const userRoutes: Router = router;