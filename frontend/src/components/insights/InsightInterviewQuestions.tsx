import { memo } from "react";
import { Insights } from "../../types/insights";
import { InsightSection } from "./InsightSection";

type InsightInterviewQuestionsProps = {
  insights?: Insights;
  isGenerating?: boolean;
  className?: string;
};

function InsightInterviewQuestionsComponent({
  insights,
  isGenerating = false,
  className,
}: InsightInterviewQuestionsProps) {
  const interviewQuestions = (insights?.interview_questions ?? []).filter(
    (question) => question.trim().length > 0
  );

  return (
    <InsightSection
      title="Interview Questions"
      isGenerating={isGenerating}
      generatingLabel="Generating interview questions..."
      emptyLabel="No interview questions available yet."
      hasContent={interviewQuestions.length > 0}
      className={className}
    >
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        {interviewQuestions.map((question, index) => (
          <li key={`${question}-${index}`}>{question}</li>
        ))}
      </ol>
    </InsightSection>
  );
}

export const InsightInterviewQuestions = memo(InsightInterviewQuestionsComponent);
