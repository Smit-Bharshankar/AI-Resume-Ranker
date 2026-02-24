import { Router } from "express";
import jobController from "./job.controller.js";

const jobRoutes = Router();

jobRoutes.post("/", jobController.createJob);
jobRoutes.get("/:id", jobController.getJobById);
jobRoutes.get("/:id/resumes", jobController.getResumesByJob);

export default jobRoutes;
