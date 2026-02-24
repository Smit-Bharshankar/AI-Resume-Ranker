import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import uploadRoute from "./uploadRoute.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
})

app.use("/api", uploadRoute)