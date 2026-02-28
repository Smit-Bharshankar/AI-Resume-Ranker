import { Router } from "express";
import resumeController from "./resume.controller.js";

const resumeRoutes = Router();

resumeRoutes.get("/:id", resumeController.getResumeById);

export default resumeRoutes;
