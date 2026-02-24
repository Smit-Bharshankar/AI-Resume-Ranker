import cors from "cors";
import express from "express";
import env from "./config/env.js";
import jobRoutes from "./modules/job/job.routes.js";
import { errorResponse } from "./utils/api-response.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/jobs", jobRoutes);

app.use((req, res) => {
  return res.status(404).json(errorResponse("Route not found"));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json(errorResponse("Internal server error"));
});

app.listen(env.port);
