import { Queue } from "bullmq";
import {
  clearLifecycleData,
  closeLifecycleTrackerConnection,
  getActiveLifecycleStates,
  getGlobalLifecycleEvents,
  getLifecycleSnapshot,
} from "../monitoring/lifecycleTracker.js";
import env from "../config/env.js";
import { connection } from "../queue/resumeQueue.js";

const POLL_MS = 1000;

const trackedQueues = [
  { name: "resume", queue: new Queue(env.resumeQueueName, { connection }) },
  { name: "insight", queue: new Queue(env.resumeInsightQueueName, { connection }) },
  { name: "job_extract", queue: new Queue(env.jobExtractionQueueName, { connection }) },
];

const parseArgs = () => {
  const resumeArg = process.argv.find((arg) => arg.startsWith("--resume="));
  const resumeIdArg = process.argv.find((arg) => arg.startsWith("--resume-id="));
  const jobArg = process.argv.find((arg) => arg.startsWith("--job="));
  const jobIdArg = process.argv.find((arg) => arg.startsWith("--job-id="));
  const noReset = process.argv.includes("--no-reset");

  const resumeId = (resumeArg ?? resumeIdArg)?.split("=")[1] ?? "";
  const jobId = (jobArg ?? jobIdArg)?.split("=")[1] ?? "";

  if (!resumeId && !jobId) {
    return { mode: "auto", noReset };
  }

  if (resumeId && jobId) {
    throw new Error("Pass only one target: either resume or job");
  }

  return resumeId
    ? { mode: "single", entityType: "resume", entityId: resumeId, noReset }
    : { mode: "single", entityType: "job", entityId: jobId, noReset };
};

const pad = (value, width) => {
  const text = String(value ?? "");
  if (text.length >= width) {
    return text.slice(0, width - 1) + "…";
  }
  return text.padEnd(width, " ");
};

const renderCurrent = (current) => {
  const rows = [
    ["entity_id", current.entity_id],
    ["status", current.status],
    ["stage", current.stage],
    ["attempt", `${current.attempt || "-"} / ${current.max_attempts || "-"}`],
    ["retries", current.retries || "-"],
    ["progress", current.progress_pct ? `${current.progress_pct}%` : "-"],
    ["queue_job_id", current.queue_job_id || "-"],
    ["worker", current.worker || "-"],
    ["updated_at", current.updated_at || "-"],
    ["error", current.error || "-"],
  ];

  return rows.map(([key, value]) => `${pad(key, 12)} ${value}`).join("\n");
};

const renderEvents = (events) => {
  const header =
    `${pad("time", 24)} ${pad("status", 24)} ${pad("stage", 24)} ${pad("event", 22)} ${pad("attempt", 10)} message`;
  const separator = "-".repeat(120);
  const lines = events.map((event) => {
    const attemptText = `${event.attempt || "-"}:${event.max_attempts || "-"}`;
    return [
      pad(event.updated_at || "", 24),
      pad(event.status || "", 24),
      pad(event.stage || "", 24),
      pad(event.event || "", 22),
      pad(attemptText, 10),
      event.message || "",
    ].join(" ");
  });

  return [header, separator, ...lines].join("\n");
};

const renderActiveStates = (states) => {
  const header =
    `${pad("type", 8)} ${pad("entity_id", 38)} ${pad("status", 24)} ${pad("stage", 24)} ${pad("attempt", 10)} ${pad("progress", 10)} ${pad("updated_at", 24)} ${pad("worker", 16)} error`;
  const separator = "-".repeat(180);
  const lines = states.map(({ entityType, entityId, current }) => {
    const attemptText = `${current.attempt || "-"}:${current.max_attempts || "-"}`;
    const progressText = current.progress_pct ? `${current.progress_pct}%` : "-";
    return [
      pad(entityType, 8),
      pad(entityId, 38),
      pad(current.status || "", 24),
      pad(current.stage || "", 24),
      pad(attemptText, 10),
      pad(progressText, 10),
      pad(current.updated_at || "", 24),
      pad(current.worker || "", 16),
      current.error || "",
    ].join(" ");
  });

  return [header, separator, ...lines].join("\n");
};

const renderQueueHealth = (queueHealth) => {
  const header =
    `${pad("queue", 12)} ${pad("waiting", 8)} ${pad("active", 8)} ${pad("delayed", 8)} ${pad("failed", 8)} completed`;
  const separator = "-".repeat(72);
  const lines = queueHealth.map((item) =>
    [
      pad(item.name, 12),
      pad(item.waiting, 8),
      pad(item.active, 8),
      pad(item.delayed, 8),
      pad(item.failed, 8),
      item.completed,
    ].join(" "),
  );

  return [header, separator, ...lines].join("\n");
};

const getQueueHealth = async () => {
  const health = await Promise.all(
    trackedQueues.map(async ({ name, queue }) => {
      const counts = await queue.getJobCounts(
        "waiting",
        "active",
        "delayed",
        "failed",
        "completed",
      );
      return {
        name,
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        delayed: counts.delayed ?? 0,
        failed: counts.failed ?? 0,
        completed: counts.completed ?? 0,
      };
    }),
  );

  return health;
};

const closeQueues = async () => {
  await Promise.all(trackedQueues.map(async ({ queue }) => queue.close()));
};

const closeConnections = async () => {
  await closeQueues();
  await closeLifecycleTrackerConnection();
  await connection.quit();
};

const run = async () => {
  const args = parseArgs();
  if (!args.noReset) {
    await clearLifecycleData();
  }
  if (args.mode === "single") {
    const { entityType, entityId } = args;
    console.log(`Watching ${entityType} lifecycle: ${entityId}`);
    console.log("Press Ctrl+C to stop.\n");

    const interval = setInterval(async () => {
      try {
        const { current, events } = await getLifecycleSnapshot({
          entityType,
          entityId,
          eventsCount: 25,
        });

        console.clear();
        console.log(`Watching ${entityType} lifecycle: ${entityId}`);
        console.log(`Refreshed: ${new Date().toISOString()}\n`);

        if (!current || Object.keys(current).length === 0) {
          console.log("No lifecycle state found yet.\n");
        } else {
          console.log("Current");
          console.log("-------");
          console.log(renderCurrent(current));
          console.log("");
        }

        console.log("Recent Events");
        console.log("-------------");
        if (!events.length) {
          console.log("No events yet.");
        } else {
          console.log(renderEvents(events));
        }
      } catch (error) {
        console.clear();
        console.error("Lifecycle watch failed:", error instanceof Error ? error.message : String(error));
      }
    }, POLL_MS);

    const shutdown = async () => {
      clearInterval(interval);
      await closeConnections();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    return;
  }

  console.log("Watching all active lifecycle entities");
  console.log("Press Ctrl+C to stop.\n");

  const interval = setInterval(async () => {
    try {
      const [states, events, queueHealth] = await Promise.all([
        getActiveLifecycleStates(),
        getGlobalLifecycleEvents({ eventsCount: 35 }),
        getQueueHealth(),
      ]);

      console.clear();
      console.log("Watching all active lifecycle entities");
      console.log(`Refreshed: ${new Date().toISOString()}\n`);

      console.log("Active States");
      console.log("-------------");
      if (!states.length) {
        console.log("No active lifecycle entities.\n");
      } else {
        console.log(renderActiveStates(states));
        console.log("");
      }

      console.log("Queue Health");
      console.log("------------");
      console.log(renderQueueHealth(queueHealth));
      console.log("");

      console.log("Recent Global Events");
      console.log("--------------------");
      if (!events.length) {
        console.log("No events yet.");
      } else {
        console.log(renderEvents(events));
      }
    } catch (error) {
      console.clear();
      console.error("Lifecycle watch failed:", error instanceof Error ? error.message : String(error));
    }
  }, POLL_MS);

  const shutdown = async () => {
    clearInterval(interval);
    await closeConnections();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

run().catch(async (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  await closeConnections();
  process.exit(1);
});
