import supabaseAuthClient from "../config/supabaseClient.js";
import prisma from "../config/prisma.js";
import env from "../config/env.js";
import { errorResponse } from "../utils/api-response.js";
import logger from "../utils/logger.js";

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }
  return token;
};

const unauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json(errorResponse(message));
};

const syncAuthenticatedUser = async ({ id, email }) => {
  await prisma.user.upsert({
    where: { id },
    update: { email },
    create: { id, email },
  });
};

const authMiddleware = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return unauthorized(res, "Missing or invalid Authorization header");
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !data?.user?.id) {
    if (error) {
      logger.warn("Supabase auth token validation failed", {
        path: req.path,
        method: req.method,
        code: error.code,
      });
    }
    return unauthorized(res, "Invalid or expired access token");
  }

  const authenticatedUser = {
    id: data.user.id,
    email: data.user.email ?? "",
  };

  const isEmailConfirmed = Boolean(data.user.email_confirmed_at);
  if (env.authRequireEmailConfirmation && !isEmailConfirmed) {
    return unauthorized(res, "Email confirmation is required before signing in");
  }

  try {
    await syncAuthenticatedUser(authenticatedUser);
  } catch (error) {
    logger.error("Failed to sync authenticated user", {
      path: req.path,
      method: req.method,
      userId: authenticatedUser.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json(errorResponse("Failed to authenticate user"));
  }

  req.user = authenticatedUser;

  return next();
};

export default authMiddleware;
