import { Router } from "express";
import jobController from "./job.controller.js";
import uploadRoutes from "../upload/upload.routes.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import rateLimitMiddleware from "../../middleware/rate-limit.middleware.js";

const jobRoutes = Router();

jobRoutes.use(authMiddleware);
jobRoutes.use(rateLimitMiddleware);

jobRoutes.get("/", jobController.getJobs);
jobRoutes.post("/", jobController.createJob);
jobRoutes.post("/:id/extract", jobController.extractRequirements);
jobRoutes.patch("/:id/requirements", jobController.patchRequirements);
jobRoutes.patch("/:id/activate", jobController.activateJob);
jobRoutes.delete("/:jobId", jobController.deleteJobById);
jobRoutes.get("/:id", jobController.getJobById);
jobRoutes.get("/:id/resumes", jobController.getResumesByJob);
jobRoutes.use("/:id/resumes", uploadRoutes);

export default jobRoutes;
