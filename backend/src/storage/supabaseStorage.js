import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import env from "../config/env.js";

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage operations",
  );
}

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

const getResumePath = (jobId) => `jobs/${jobId}/resumes/${randomUUID()}.pdf`;

const buildStorageError = (operation, error, metadata = {}) => {
  const details = [
    `operation=${operation}`,
    `bucket=${env.supabaseStorageBucket}`,
    ...Object.entries(metadata).map(([key, value]) => `${key}=${value}`),
  ].join(" ");

  const wrapped = new Error(
    `Storage ${operation} failed: ${error?.message ?? "unknown error"} (${details})`,
    { cause: error },
  );

  wrapped.storageOperation = operation;
  return wrapped;
};

const uploadResume = async ({ jobId, buffer, contentType }) => {
  const storagePath = getResumePath(jobId);

  try {
    const { error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return storagePath;
  } catch (error) {
    throw buildStorageError("upload", error, {
      jobId,
      storagePath,
      contentType,
    });
  }
};

const downloadResume = async (storagePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .download(storagePath);

    if (error) {
      throw error;
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw buildStorageError("download", error, { storagePath });
  }
};

const removeResume = async (storagePath) => {
  try {
    const { error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .remove([storagePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw buildStorageError("remove", error, { storagePath });
  }
};

const createSignedResumeUrl = async (storagePath, expiresInSeconds = 900) => {
  try {
    const { data, error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    throw buildStorageError("createSignedUrl", error, {
      storagePath,
      expiresInSeconds,
    });
  }
};

const supabaseStorage = {
  uploadResume,
  downloadResume,
  removeResume,
  createSignedResumeUrl,
};

export default supabaseStorage;
