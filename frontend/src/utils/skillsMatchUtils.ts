export type SkillMatchItem = {
  skill: string;
  normalizedSkill: string;
  matched: boolean;
};

export type SkillMatchResult = {
  required: SkillMatchItem[];
  matchedCount: number;
  missingCount: number;
};

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

export const normalizeSkill = (skill: string): string =>
  normalizeWhitespace(skill).toLowerCase();

const toUniqueNormalizedSet = (skills: string[]): Set<string> => {
  const normalized = skills
    .map((skill) => normalizeSkill(skill))
    .filter((skill) => skill.length > 0);
  return new Set(normalized);
};

export const computeRequiredSkillsMatch = (
  requiredSkills: string[],
  candidateSkills: string[]
): SkillMatchResult => {
  const candidateSet = toUniqueNormalizedSet(candidateSkills);
  const requiredByNormalized = new Map<string, SkillMatchItem>();

  requiredSkills.forEach((rawSkill) => {
    const displaySkill = normalizeWhitespace(rawSkill);
    const normalizedSkill = normalizeSkill(displaySkill);
    if (!normalizedSkill || requiredByNormalized.has(normalizedSkill)) {
      return;
    }

    requiredByNormalized.set(normalizedSkill, {
      skill: displaySkill,
      normalizedSkill,
      matched: candidateSet.has(normalizedSkill),
    });
  });

  const required = Array.from(requiredByNormalized.values());

  const matchedCount = required.filter((item) => item.matched).length;

  return {
    required,
    matchedCount,
    missingCount: required.length - matchedCount,
  };
};
