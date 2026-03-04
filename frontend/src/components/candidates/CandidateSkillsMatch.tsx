import { memo, useMemo } from "react";
import { Loader } from "../common/Loader";
import { Card } from "../ui/Card";
import { computeRequiredSkillsMatch } from "../../utils/skillsMatchUtils";

type CandidateSkillsMatchProps = {
  requiredSkills?: string[];
  candidateSkills?: string[];
  isGenerating?: boolean;
  className?: string;
};

function CandidateSkillsMatchComponent({
  requiredSkills = [],
  candidateSkills = [],
  isGenerating = false,
  className,
}: CandidateSkillsMatchProps) {
  const match = useMemo(
    () => computeRequiredSkillsMatch(requiredSkills, candidateSkills),
    [requiredSkills, candidateSkills]
  );

  return (
    <Card className={className}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Required Skills Match</h3>

        {isGenerating ? <Loader label="Calculating skill match..." /> : null}

        {!isGenerating && match.required.length === 0 ? (
          <p className="text-sm text-slate-600">
            Required skills are not available for this job yet.
          </p>
        ) : null}

        {!isGenerating && match.required.length > 0 ? (
          <>
            <p className="text-sm text-slate-600">
              Matched {match.matchedCount} of {match.required.length} required skills.
            </p>
            <ul className="space-y-2">
              {match.required.map((item) => (
                <li
                  key={item.normalizedSkill}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-800">{item.skill}</span>
                  <span
                    className={
                      item.matched
                        ? "font-medium text-emerald-700"
                        : "font-medium text-red-700"
                    }
                  >
                    {item.matched ? "✓ Matched" : "✗ Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </Card>
  );
}

export const CandidateSkillsMatch = memo(CandidateSkillsMatchComponent);
