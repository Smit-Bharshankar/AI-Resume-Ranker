const LOG_FORMAT = (process.env.LOG_FORMAT ?? "pretty").trim().toLowerCase();

const LEVEL_ICON = {
  info: "🔎",
  warn: "⚠️",
  error: "❌",
};

const toLevelLabel = (level) => level.toUpperCase().padEnd(5, " ");

const getMessageIcon = (level, message = "") => {
  const normalized = String(message).toLowerCase();

  if (
    normalized.includes("generated") ||
    normalized.includes("completed") ||
    normalized.includes("finished") ||
    normalized.includes("started")
  ) {
    return "✅";
  }

  if (normalized.includes("failed") || normalized.includes("error")) {
    return "❌";
  }

  if (normalized.includes("skipped")) {
    return "⏭️";
  }

  if (normalized.includes("retry")) {
    return "🔁";
  }

  return LEVEL_ICON[level] ?? "•";
};

const formatPrettyLog = ({ timestamp, level, message, metadata }) => {
  const levelLabel = toLevelLabel(level);
  const icon = getMessageIcon(level, message);
  const header = `[${timestamp}] ${icon} ${levelLabel} ${message}`;

  const lines = Object.entries(metadata).map(([key, value]) => {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    return `  ${key}: ${serialized}`;
  });

  if (lines.length === 0) {
    return `${header}\n`;
  }

  return `${header}\n${lines.join("\n")}\n`;
};

const write = (stream, level, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const payload = {
    level,
    message,
    timestamp,
    ...metadata,
  };

  if (LOG_FORMAT === "json") {
    stream.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  stream.write(formatPrettyLog({ timestamp, level, message, metadata }));
};

const createLogger = (baseMetadata = {}) => {
  return {
    info: (message, metadata = {}) =>
      write(process.stdout, "info", message, { ...baseMetadata, ...metadata }),
    warn: (message, metadata = {}) =>
      write(process.stdout, "warn", message, { ...baseMetadata, ...metadata }),
    error: (message, metadata = {}) =>
      write(process.stderr, "error", message, { ...baseMetadata, ...metadata }),
    child: (metadata = {}) => createLogger({ ...baseMetadata, ...metadata }),
  };
};

const logger = createLogger();

export default logger;
