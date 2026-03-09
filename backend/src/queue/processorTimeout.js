class ProcessTimeoutError extends Error {
  constructor({ processName, timeoutMs }) {
    super(
      `${processName} exceeded timeout of ${timeoutMs}ms and was marked as failed`,
    );
    this.name = "ProcessTimeoutError";
    this.code = "PROCESS_TIMEOUT";
    this.retryable = true;
    this.timeoutMs = timeoutMs;
  }
}

const withProcessTimeout = async ({ operation, timeoutMs, processName }) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return operation();
  }

  let timeoutHandle;
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new ProcessTimeoutError({ processName, timeoutMs }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export { ProcessTimeoutError, withProcessTimeout };
