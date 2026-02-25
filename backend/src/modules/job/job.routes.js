import { Router } from "express";
import jobController from "./job.controller.js";
import uploadRoutes from "../upload/upload.routes.js";

const jobRoutes = Router();

jobRoutes.post("/", jobController.createJob);
jobRoutes.get("/:id", jobController.getJobById);
jobRoutes.get("/:id/resumes", jobController.getResumesByJob);
jobRoutes.use("/:id/resumes", uploadRoutes);

export default jobRoutes;
