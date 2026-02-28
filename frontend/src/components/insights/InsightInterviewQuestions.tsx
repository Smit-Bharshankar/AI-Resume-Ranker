import { Insights } from "../../types/insights";
import { Card } from "../ui/Card";

type InsightInterviewQuestionsProps = {
  insights?: Insights;
};

export function InsightInterviewQuestions({
  insights,
}: InsightInterviewQuestionsProps) {
  const interviewQuestions = insights?.interview_questions ?? [];

  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Interview Questions</h3>
      {interviewQuestions.length === 0 ? (
        <p className="text-sm text-slate-600">No interview questions available yet.</p>
      ) : (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {interviewQuestions.map((question, index) => (
            <li key={`${question}-${index}`}>{question}</li>
          ))}
        </ol>
      )}
    </Card>
  );
}
