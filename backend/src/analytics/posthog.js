import { PostHog } from "posthog-node";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const posthogEnabled = Boolean(env.posthogKey);

const posthog = posthogEnabled
  ? new PostHog(env.posthogKey, {
      host: env.posthogHost,
      flushAt: 20,
      flushInterval: 10000,
    })
  : null;

const capturePosthogEvent = ({
  distinctId,
  event,
  properties = {},
}) => {
  if (!posthog || !distinctId || !event) {
    return;
  }

  void posthog.capture({
    distinctId,
    event,
    properties,
  }).catch((error) => {
    logger.warn("PostHog capture failed", {
      event,
      error: error.message,
    });
  });
};

const shutdownPosthog = async () => {
  if (!posthog) {
    return;
  }

  try {
    await posthog.shutdown();
  } catch (error) {
    logger.warn("PostHog shutdown failed", {
      error: error.message,
    });
  }
};

export { posthog, posthogEnabled, capturePosthogEvent, shutdownPosthog };
