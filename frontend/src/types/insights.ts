export type InsightRecommendation =
  | "STRONG_FIT"
  | "GOOD_FIT"
  | "MODERATE_FIT"
  | "WEAK_FIT";

export type Insights = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  interview_questions: string[];
  recommendation: InsightRecommendation;
};
