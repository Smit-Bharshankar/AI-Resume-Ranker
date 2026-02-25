import { Router } from "express";
import multer from "multer";
import uploadController from "./upload.controller.js";
import { errorResponse } from "../../utils/api-response.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 30;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    return cb(null, true);
  },
});

const uploadRoutes = Router({ mergeParams: true });

const uploadMiddleware = (req, res, next) => {
  upload.array("files", MAX_FILES)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json(errorResponse("Each file must be 5MB or smaller"));
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json(errorResponse("Maximum 30 files are allowed per upload"));
      }

      return res.status(400).json(errorResponse("Only PDF files are allowed"));
    }

    return res.status(400).json(errorResponse("Invalid upload payload"));
  });
};

uploadRoutes.post("/", uploadMiddleware, uploadController.uploadResumes);

export default uploadRoutes;
