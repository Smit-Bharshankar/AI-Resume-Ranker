import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { insightQueue } from "./insightQueue.js";
import { jobExtractionQueue } from "./jobExtractionQueue.js";
import { resumeQueue } from "./resumeQueue.js";

const bullBoardBasePath = "/admin/queues";
const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath(bullBoardBasePath);

createBullBoard({
  queues: [
    new BullMQAdapter(resumeQueue),
    new BullMQAdapter(jobExtractionQueue),
    new BullMQAdapter(insightQueue),
  ],
  serverAdapter,
});

const bullBoardRouter = serverAdapter.getRouter();

export { bullBoardBasePath, bullBoardRouter };
