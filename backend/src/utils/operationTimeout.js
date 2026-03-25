class OperationTimeoutError extends Error {
  constructor({ operationName, timeoutMs }) {
    super(`${operationName} timed out after ${timeoutMs}ms`);
    this.name = "OperationTimeoutError";
    this.code = "PROCESS_TIMEOUT";
    this.retryable = true;
    this.timeoutMs = timeoutMs;
  }
}

const withOperationTimeout = async ({
  operation,
  timeoutMs,
  operationName = "Operation",
}) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return operation();
  }

  let timeoutHandle;
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new OperationTimeoutError({ operationName, timeoutMs }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export { OperationTimeoutError, withOperationTimeout };
