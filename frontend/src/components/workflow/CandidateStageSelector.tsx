import { ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { CandidateStage } from "../../types/resume";
import {
  CANDIDATE_STAGES,
  getCandidateStageLabel,
  isCandidateStage,
} from "../../utils/candidateStageUtils";

type CandidateStageSelectorProps = {
  value: CandidateStage;
  onChange: (nextStage: CandidateStage) => void;
  disabled?: boolean;
  isUpdating?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

export function CandidateStageSelector({
  value,
  onChange,
  disabled = false,
  isUpdating = false,
  className = "",
  id,
  ariaLabel = "Candidate stage",
}: CandidateStageSelectorProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStage = event.target.value;
    if (!isCandidateStage(nextStage)) {
      return;
    }

    onChange(nextStage as CandidateStage);
  };

  return (
    <select
      id={id}
      value={value}
      onChange={handleChange}
      disabled={disabled || isUpdating}
      aria-label={ariaLabel}
      className={cn(
        "h-9 min-w-40 rounded-md border border-border bg-accent px-3 text-sm text-foreground outline-none transition",
        "focus:border-ring focus:ring-2 focus:ring-ring/20",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
        className
      )}
    >
      {CANDIDATE_STAGES.map((stage) => (
        <option key={stage} value={stage}>
          {getCandidateStageLabel(stage)}
        </option>
      ))}
    </select>
  );
}
