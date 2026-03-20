import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import rateLimitMiddleware from "../../middleware/rate-limit.middleware.js";
import userController from "./user.controller.js";

const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.use(rateLimitMiddleware);

userRoutes.get("/me/usage", userController.getUsage);

export default userRoutes;
