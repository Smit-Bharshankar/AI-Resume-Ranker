import { Worker } from "bullmq"
import IORedis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {}
})

const worker = new Worker(
  "pdf-processing",
  async job => {
    console.log("Processing:", job.data)

    // Step 1: Extract text
    // Step 2: Call AI API
    // Step 3: Store results in DB
  },
  { connection }
)

worker.on("completed", job => {
  console.log(`Job ${job.id} completed`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})