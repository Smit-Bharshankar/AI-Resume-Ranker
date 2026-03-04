import { Router } from "express";
import resumeController from "./resume.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const resumeRoutes = Router();

resumeRoutes.use(authMiddleware);

resumeRoutes.get("/:id", resumeController.getResumeById);
resumeRoutes.get("/:id/file", resumeController.getResumeFileById);

export default resumeRoutes;
