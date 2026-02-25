const write = (stream, level, message, metadata = {}) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  stream.write(`${JSON.stringify(payload)}\n`);
};

const logger = {
  info: (message, metadata) => write(process.stdout, "info", message, metadata),
  warn: (message, metadata) => write(process.stdout, "warn", message, metadata),
  error: (message, metadata) =>
    write(process.stderr, "error", message, metadata),
};

export default logger;
