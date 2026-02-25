const write = (stream, level, message, metadata = {}) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  stream.write(`${JSON.stringify(payload)}\n`);
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
