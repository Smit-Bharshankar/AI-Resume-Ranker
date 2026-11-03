# AI Provider Architecture

## Role of AI in Sortres

AI is used for three bounded transformations:

1. Resume text → structured resume JSON.
2. Job description → structured requirements JSON.
3. Structured candidate/job/score context → recruiter narrative insights.

AI does not calculate numeric candidate scores or determine the final
recommendation band.

## Provider abstraction

`backend/src/modules/ai/providers/provider.factory.js` creates one provider
instance per process based on `AI_PROVIDER`. Supported values are `gemini` and
`openai`; both expose the common JSON-generation behavior used by services.

The factory passes the configured API key, model, request timeout, and output
token limit to the provider. Startup validates provider/model/key configuration
and logs warnings/errors; deployment must treat configuration errors as release
blockers.

## Call sites

| Operation | Service | Queue worker |
| --- | --- | --- |
| Resume structuring | `modules/ai/extraction.service.js` | Resume worker |
| Job extraction | `modules/jobExtraction/jobExtraction.service.js` | Job extraction worker |
| Candidate insights | `modules/insights/insight.service.js` | Insight worker |

Controllers and the scoring engine do not call providers directly.

## Operational controls

Provider calls are bounded by request/process timeouts, JSON parsing and schema
validation, service-level retries, queue-level retries, rate buckets, and a
global cooldown after provider throttling. See [AI extraction operations](ai-extraction-operations.md)
and [queues and workers](../06-operations/queues-and-workers.md).
