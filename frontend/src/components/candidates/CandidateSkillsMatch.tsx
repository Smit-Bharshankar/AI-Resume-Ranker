import { memo, useMemo } from "react";
import { computeRequiredSkillsMatch } from "../../utils/skillsMatchUtils";
import { Loader } from "../common/Loader";
import { Card } from "../ui/Card";

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
    <Card className={`rounded-xl border-border/70 ${className ?? ""}`.trim()}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Required Skills Match</h3>

        {isGenerating ? <Loader label="Calculating skill match..." /> : null}

        {!isGenerating && match.required.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Required skills are not available for this job yet.
          </p>
        ) : null}

        {!isGenerating && match.required.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Matched {match.matchedCount} of {match.required.length} required skills.
            </p>
            <ul className="space-y-2">
              {match.required.map((item) => (
                <li
                  key={item.normalizedSkill}
                  className="flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{item.skill}</span>
                  <span
                    className={
                      item.matched
                        ? "font-medium text-emerald-700 dark:text-emerald-300"
                        : "font-medium text-destructive"
                    }
                  >
                    {item.matched ? "Matched" : "Missing"}
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
