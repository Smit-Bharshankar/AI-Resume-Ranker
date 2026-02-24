import express from "express"
import multer from "multer"
import { createClient } from "@supabase/supabase-js"
import { pdfQueue } from "./queue.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

// Multer temp storage (memory)
const upload = multer({ storage: multer.memoryStorage() })

// Supabase backend client (SERVICE ROLE)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileName = `${Date.now()}-${file.originalname}`

    // 1️⃣ Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("pdfs")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      })

    if (error) throw error

    const fileUrl = data.path

    // 2️⃣ Add job to queue
    const job = await pdfQueue.add("process-pdf", {
      fileUrl
    })

    return res.json({
      message: "File uploaded successfully",
      jobId: job.id,
      fileUrl
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Upload failed" })
  }
})

export default router