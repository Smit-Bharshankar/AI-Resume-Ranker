import { ChangeEvent } from "react";
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
      className={`h-9 min-w-40 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`.trim()}
    >
      {CANDIDATE_STAGES.map((stage) => (
        <option key={stage} value={stage}>
          {getCandidateStageLabel(stage)}
        </option>
      ))}
    </select>
  );
}
