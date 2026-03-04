-- CreateEnum
CREATE TYPE "CandidateStage" AS ENUM ('NEW', 'SHORTLISTED', 'INTERVIEWING', 'REJECTED', 'HIRED');

-- AlterTable
ALTER TABLE "Resume"
ADD COLUMN "stage" "CandidateStage" NOT NULL DEFAULT 'NEW';
