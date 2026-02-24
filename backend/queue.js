import { Queue } from "bullmq"
import IORedis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {} // required for Redis Cloud
})

export const pdfQueue = new Queue("pdf-processing", {
  connection
})