import prisma from "../../config/prisma.js";

const getUsageByUserId = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      jobsCreatedCount: true,
      resumesCompletedCount: true,
      resumeInFlightCount: true,
    },
  });
};

const reserveResumeInFlightSlots = async ({ userId, slots, maxResumesPerUser }) => {
  if (!Number.isFinite(slots) || slots <= 0) {
    return true;
  }

  const updated = await prisma.$executeRaw`
    UPDATE "User"
    SET "resumeInFlightCount" = "resumeInFlightCount" + ${slots}
    WHERE "id" = CAST(${userId} AS UUID)
      AND ("resumesCompletedCount" + "resumeInFlightCount" + ${slots}) <= ${maxResumesPerUser}
  `;

  return Number(updated) > 0;
};

const releaseResumeInFlightSlots = async ({ userId, slots }) => {
  if (!Number.isFinite(slots) || slots <= 0) {
    return;
  }

  await prisma.$executeRaw`
    UPDATE "User"
    SET "resumeInFlightCount" = GREATEST("resumeInFlightCount" - ${slots}, 0)
    WHERE "id" = CAST(${userId} AS UUID)
  `;
};

const userRepository = {
  getUsageByUserId,
  reserveResumeInFlightSlots,
  releaseResumeInFlightSlots,
};

export default userRepository;
