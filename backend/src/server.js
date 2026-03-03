import cors from "cors";
import express from "express";
import env from "./config/env.js";
import jobRoutes from "./modules/job/job.routes.js";
import resumeRoutes from "./modules/resume/resume.routes.js";
import { errorResponse } from "./utils/api-response.js";
import logger from "./utils/logger.js";
import { validateAiConfiguration } from "./modules/ai/providers/provider.factory.js";

const app = express();
const aiConfigHealth = validateAiConfiguration();
const isProduction = process.env.NODE_ENV === "production";
const workerInstances = [];

for (const warning of aiConfigHealth.warnings) {
  logger.warn("AI config warning", { warning });
}
for (const error of aiConfigHealth.errors) {
  logger.error("AI config error", { error });
}


const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://ai-recruiter-assistant.smitxcode.in' // Your actual frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

app.use("/jobs", jobRoutes);
app.use("/resumes", resumeRoutes);

app.use((req, res) => {
  return res.status(404).json(errorResponse("Route not found"));
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json(errorResponse("Invalid JSON payload"));
  }

  logger.error("Unhandled application error", {
    path: req.path,
    method: req.method,
    error: error.message,
  });

  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json(errorResponse("Internal server error"));
});

const port = Number(process.env.PORT) || 10000;

if (isProduction) {
  const [
    { startResumeWorker },
    { startInsightWorker },
    { startJobExtractionWorker },
  ] = await Promise.all([
    import("./queue/resumeWorker.js"),
    import("./queue/insightWorker.js"),
    import("./queue/jobExtractionWorker.js"),
  ]);

  workerInstances.push(startResumeWorker({ concurrency: 1 }));
  workerInstances.push(startInsightWorker({ concurrency: 1 }));
  workerInstances.push(startJobExtractionWorker({ concurrency: 1 }));

  logger.info("Inline BullMQ workers started", {
    nodeEnv: env.nodeEnv,
    workers: ["resume", "insight", "job-extraction"],
    concurrency: 1,
  });
}

const server = app.listen(port, () => {
  logger.info("HTTP server started", { port, nodeEnv: env.nodeEnv });
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", {
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message });
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  await Promise.allSettled(workerInstances.map((worker) => worker.close()));
  server.close(() => process.exit(0));
});
