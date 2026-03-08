import React from "react";
import ReactDOM from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import * as Sentry from "@sentry/react";
import App from "./app/App";
import "./monitoring/sentry";
import "./index.css";

const posthogOptions = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_KEY} options={posthogOptions}>
      <Sentry.ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <App />
        <Analytics />
        <SpeedInsights />
      </Sentry.ErrorBoundary>
    </PostHogProvider>
  </React.StrictMode>
);
