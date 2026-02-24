import { errorResponse } from "./api-response.js";
import { Prisma } from "../../generated/prisma/index.js";

export const handleControllerError = (res, error, fallbackMessage) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json(errorResponse("Resource already exists"));
    }

    if (error.code === "P2003") {
      return res.status(400).json(errorResponse("Invalid reference provided"));
    }

    if (error.code === "P2025") {
      return res.status(404).json(errorResponse("Resource not found"));
    }

    return res.status(400).json(errorResponse("Invalid database request"));
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json(errorResponse("Invalid request payload"));
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json(errorResponse("Database unavailable"));
  }

  return res
    .status(500)
    .json(errorResponse(fallbackMessage ?? "Internal server error"));
};
