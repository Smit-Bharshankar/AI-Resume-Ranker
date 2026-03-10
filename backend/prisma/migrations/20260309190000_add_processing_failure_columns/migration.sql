ALTER TABLE "Job"
ADD COLUMN "lastProcessingFailure" JSONB;

ALTER TABLE "Resume"
ADD COLUMN "lastProcessingFailure" JSONB;
