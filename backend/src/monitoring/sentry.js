import * as Sentry from "@sentry/node";
import env from "../config/env.js";

const sentryEnabled = Boolean(env.sentryDsnBackend);
const noopMiddleware = (_req, _res, next) => next();
const sentryHandlers = Sentry.Handlers ?? null;

if (sentryEnabled) {
  Sentry.init({
    dsn: env.sentryDsnBackend,
    tracesSampleRate: 1.0,
    environment: env.nodeEnv,
    integrations: [Sentry.expressIntegration()],
  });
}

const sentryRequestHandler = sentryHandlers?.requestHandler
  ? sentryHandlers.requestHandler()
  : noopMiddleware;
const sentryTracingHandler = sentryHandlers?.tracingHandler
  ? sentryHandlers.tracingHandler()
  : noopMiddleware;
const sentryErrorHandler = sentryHandlers?.errorHandler
  ? sentryHandlers.errorHandler()
  : Sentry.expressErrorHandler();

export {
  Sentry,
  sentryEnabled,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
};
