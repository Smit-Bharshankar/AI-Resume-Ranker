import { connection } from "../queue/resumeQueue.js";
import logger from "../utils/logger.js";

const TTL_SECONDS = 60 * 60 * 24 * 7;
const EVENT_STREAM_MAXLEN = 1000;
const GLOBAL_EVENTS_KEY = "lifecycle:events:all";
const lifecycleConnection = connection.duplicate();

const makeKeys = (entityType, entityId) => ({
  current: `lifecycle:${entityType}:${entityId}:current`,
  events: `lifecycle:${entityType}:${entityId}:events`,
  active: `lifecycle:active:${entityType}s`,
});

const sanitize = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const trackLifecycle = async ({
  entityType,
  entityId,
  runId = "",
  event = "",
  status = "",
  stage = "",
  attempt = "",
  maxAttempts = "",
  retries = "",
  progressPct = "",
  queueJobId = "",
  worker = "",
  message = "",
  error = "",
  isTerminal = false,
  metadata = {},
}) => {
  if (!entityType || !entityId) {
    return;
  }

  const now = new Date().toISOString();
  const keys = makeKeys(entityType, entityId);
  const payload = {
    entity_type: sanitize(entityType),
    entity_id: sanitize(entityId),
    run_id: sanitize(runId),
    event: sanitize(event),
    status: sanitize(status),
    stage: sanitize(stage),
    attempt: sanitize(attempt),
    max_attempts: sanitize(maxAttempts),
    retries: sanitize(retries),
    progress_pct: sanitize(progressPct),
    queue_job_id: sanitize(queueJobId),
    worker: sanitize(worker),
    message: sanitize(message),
    error: sanitize(error),
    metadata: sanitize(metadata),
    updated_at: now,
  };

  try {
    const tx = lifecycleConnection.multi();
    tx.hset(keys.current, payload);
    tx.hsetnx(keys.current, "started_at", now);
    tx.expire(keys.current, TTL_SECONDS);

    tx.xadd(
      keys.events,
      "MAXLEN",
      "~",
      EVENT_STREAM_MAXLEN,
      "*",
      ...Object.entries(payload).flatMap(([key, value]) => [key, value]),
    );
    tx.expire(keys.events, TTL_SECONDS);
    tx.xadd(
      GLOBAL_EVENTS_KEY,
      "MAXLEN",
      "~",
      EVENT_STREAM_MAXLEN * 5,
      "*",
      ...Object.entries(payload).flatMap(([key, value]) => [key, value]),
    );
    tx.expire(GLOBAL_EVENTS_KEY, TTL_SECONDS);

    if (isTerminal) {
      tx.srem(keys.active, entityId);
    } else {
      tx.sadd(keys.active, entityId);
      tx.expire(keys.active, TTL_SECONDS);
    }

    await tx.exec();
  } catch (trackError) {
    logger.warn("Lifecycle track failed", {
      entityType,
      entityId,
      error: trackError instanceof Error ? trackError.message : String(trackError),
    });
  }
};

const getLifecycleSnapshot = async ({ entityType, entityId, eventsCount = 20 }) => {
  const keys = makeKeys(entityType, entityId);
  const [current, rawEvents] = await Promise.all([
    lifecycleConnection.hgetall(keys.current),
    lifecycleConnection.xrevrange(keys.events, "+", "-", "COUNT", eventsCount),
  ]);

  const events = rawEvents
    .map(([id, fields]) => {
      const event = { id };
      for (let index = 0; index < fields.length; index += 2) {
        event[fields[index]] = fields[index + 1];
      }
      return event;
    })
    .reverse();

  return { current, events };
};

const parseStreamEvents = (rawEvents) => {
  return rawEvents
    .map(([id, fields]) => {
      const event = { id };
      for (let index = 0; index < fields.length; index += 2) {
        event[fields[index]] = fields[index + 1];
      }
      return event;
    })
    .reverse();
};

const getGlobalLifecycleEvents = async ({ eventsCount = 50 } = {}) => {
  const rawEvents = await lifecycleConnection.xrevrange(
    GLOBAL_EVENTS_KEY,
    "+",
    "-",
    "COUNT",
    eventsCount,
  );
  return parseStreamEvents(rawEvents);
};

const getActiveLifecycleStates = async () => {
  const [resumeIds, jobIds] = await Promise.all([
    lifecycleConnection.smembers("lifecycle:active:resumes"),
    lifecycleConnection.smembers("lifecycle:active:jobs"),
  ]);

  const entries = [
    ...resumeIds.map((id) => ({ entityType: "resume", entityId: id })),
    ...jobIds.map((id) => ({ entityType: "job", entityId: id })),
  ];

  if (!entries.length) {
    return [];
  }

  const states = await Promise.all(
    entries.map(async (entry) => {
      const keys = makeKeys(entry.entityType, entry.entityId);
      const current = await lifecycleConnection.hgetall(keys.current);
      return { ...entry, current };
    }),
  );

  return states
    .filter((item) => item.current && Object.keys(item.current).length > 0)
    .sort((a, b) => (b.current.updated_at || "").localeCompare(a.current.updated_at || ""));
};

const clearLifecycleData = async () => {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await lifecycleConnection.scan(
      cursor,
      "MATCH",
      "lifecycle:*",
      "COUNT",
      200,
    );
    cursor = nextCursor;
    if (keys.length) {
      await lifecycleConnection.del(...keys);
    }
  } while (cursor !== "0");
};

const closeLifecycleTrackerConnection = async () => {
  await lifecycleConnection.quit();
};

export {
  trackLifecycle,
  getLifecycleSnapshot,
  getGlobalLifecycleEvents,
  getActiveLifecycleStates,
  clearLifecycleData,
  closeLifecycleTrackerConnection,
};
