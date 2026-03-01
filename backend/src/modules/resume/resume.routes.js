import { Router } from "express";
import resumeController from "./resume.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const resumeRoutes = Router();

resumeRoutes.use(authMiddleware);

resumeRoutes.get("/:id", resumeController.getResumeById);

export default resumeRoutes;
