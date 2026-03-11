import env from "../config/env.js";

// Sends Gemini requests sequentially (no app-side bucket throttling).
// Stops at first 429 by default.
// Prints per-request status and final summary:
// success count
// failure count
// first 429 request number
// observed RPM estimate
// Run
// Default (stop on first 429):
// npm run ai:limit-probe
// Optional args:
// --max=<n> (default 120)
// --timeoutMs=<ms> (default from AI_REQUEST_TIMEOUT_MS)
// --continue-after-429 (keep going past first 429)
// Verified result from run
// First 429 occurred at request 29
// 28 successes before first 429
// Observed rate during burst: ~41.66 RPM

const parseArg = (name, fallback) => {
  const raw = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw.split("=")[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const maxRequests = parseArg("max", 120);
const timeoutMs = parseArg("timeoutMs", env.aiRequestTimeoutMs || 20000);
const stopOn429 = !process.argv.includes("--continue-after-429");

if (env.aiProvider !== "gemini") {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: "unsupported_provider",
        provider: env.aiProvider,
        message: "ai:limit-probe currently supports only AI_PROVIDER=gemini",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

if (!env.aiApiKey || !env.aiModel) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: "missing_config",
        message: "AI_API_KEY and AI_MODEL are required",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const endpoint =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `${env.aiModel}:generateContent?key=${env.aiApiKey}`;

const buildBody = () => ({
  systemInstruction: {
    parts: [{ text: "Return strict JSON only. No markdown." }],
  },
  contents: [
    {
      role: "user",
      parts: [
        {
          text:
            'Return {"ok":true,"probe":"rpm","ts":"<ISO8601>"} with ts as current UTC.',
        },
      ],
    },
  ],
  generationConfig: {
    temperature: 0,
    maxOutputTokens: 80,
    responseMimeType: "application/json",
  },
});

const nowIso = () => new Date().toISOString();

const main = async () => {
  const startedAt = Date.now();
  const statuses = {};
  const failures = [];
  let successCount = 0;
  let first429At = null;

  console.log(
    `${nowIso()} 🚀 ai-limit-probe:start ${JSON.stringify({
      provider: env.aiProvider,
      model: env.aiModel,
      maxRequests,
      timeoutMs,
      stopOn429,
    })}`,
  );

  for (let i = 1; i <= maxRequests; i += 1) {
    const reqStartedAt = Date.now();
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildBody()),
        signal: controller.signal,
      });

      const status = response.status;
      statuses[status] = (statuses[status] ?? 0) + 1;

      if (response.ok) {
        successCount += 1;
        console.log(
          `${nowIso()} ✅ ai-limit-probe:req ${JSON.stringify({
            n: i,
            status,
            ms: Date.now() - reqStartedAt,
          })}`,
        );
        continue;
      }

      const retryAfter = response.headers.get("retry-after");
      const body = await response.text();
      failures.push({
        n: i,
        status,
        retryAfter: retryAfter ?? null,
        body: body.slice(0, 300),
      });

      console.log(
        `${nowIso()} ❌ ai-limit-probe:req ${JSON.stringify({
          n: i,
          status,
          retryAfter: retryAfter ?? null,
          ms: Date.now() - reqStartedAt,
        })}`,
      );

      if (status === 429 && first429At === null) {
        first429At = {
          requestNumber: i,
          successBefore429: successCount,
          elapsedMs: Date.now() - startedAt,
          retryAfter: retryAfter ?? null,
        };
      }

      if (status === 429 && stopOn429) {
        break;
      }
    } catch (error) {
      const code = error?.name === "AbortError" ? "TIMEOUT" : error?.code ?? "ERROR";
      statuses[code] = (statuses[code] ?? 0) + 1;
      failures.push({
        n: i,
        status: code,
        retryAfter: null,
        body: String(error?.message ?? error),
      });
      console.log(
        `${nowIso()} ⚠️ ai-limit-probe:req ${JSON.stringify({
          n: i,
          status: code,
          ms: Date.now() - reqStartedAt,
        })}`,
      );
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  const elapsedMs = Date.now() - startedAt;
  const elapsedMinutes = elapsedMs / 60000;
  const observedRpm = elapsedMinutes > 0 ? successCount / elapsedMinutes : 0;

  console.log(
    `${nowIso()} 📊 ai-limit-probe:summary ${JSON.stringify(
      {
        provider: env.aiProvider,
        model: env.aiModel,
        elapsedMs,
        successCount,
        failureCount: failures.length,
        statuses,
        first429At,
        observedRpm: Number(observedRpm.toFixed(2)),
      },
      null,
      2,
    )}`,
  );
};

main().catch((error) => {
  console.error(
    `${nowIso()} 💥 ai-limit-probe:fatal ${JSON.stringify({
      message: error?.message ?? String(error),
      code: error?.code ?? null,
    })}`,
  );
  process.exit(1);
});
