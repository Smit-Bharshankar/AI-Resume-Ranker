import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRequirements } from "../../api/jobsApi";
import { jobQueryKeys } from "../../hooks/jobs/useJobs";
import { Job, StructuredRequirements } from "../../types/job";
import { ErrorState } from "../common/ErrorState";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type RequirementsEditorProps = {
  jobId: string;
  initialRequirements?: StructuredRequirements | null;
  onSaved?: (job: Job) => void;
};

type ValidationErrors = {
  minimumExperienceYears?: string;
};

const joinList = (value?: string[]) => (value ?? []).join(", ");

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const validate = (minimumExperienceYearsRaw: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  const parsedYears = Number(minimumExperienceYearsRaw);
  if (!Number.isFinite(parsedYears) || parsedYears < 0) {
    errors.minimumExperienceYears =
      "Minimum experience must be a non-negative number.";
  }

  return errors;
};

export function RequirementsEditor({
  jobId,
  initialRequirements,
  onSaved,
}: RequirementsEditorProps) {
  const queryClient = useQueryClient();
  const [requiredSkills, setRequiredSkills] = useState<string>(
    joinList(initialRequirements?.required_skills)
  );
  const [preferredSkills, setPreferredSkills] = useState<string>(
    joinList(initialRequirements?.preferred_skills)
  );
  const [mandatoryKeywords, setMandatoryKeywords] = useState<string>(
    joinList(initialRequirements?.mandatory_keywords)
  );
  const [minimumExperienceYears, setMinimumExperienceYears] = useState<string>(
    String(initialRequirements?.minimum_experience_years ?? 0)
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setRequiredSkills(joinList(initialRequirements?.required_skills));
    setPreferredSkills(joinList(initialRequirements?.preferred_skills));
    setMandatoryKeywords(joinList(initialRequirements?.mandatory_keywords));
    setMinimumExperienceYears(
      String(initialRequirements?.minimum_experience_years ?? 0)
    );
  }, [initialRequirements]);

  const mutation = useMutation<Job, Error, StructuredRequirements>({
    mutationFn: (payload: StructuredRequirements) =>
      updateRequirements(jobId, payload),
    onSuccess: async (updatedJob) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) }),
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() }),
      ]);
      onSaved?.(updatedJob);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate(minimumExperienceYears);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await mutation.mutateAsync({
      required_skills: parseList(requiredSkills),
      preferred_skills: parseList(preferredSkills),
      mandatory_keywords: parseList(mandatoryKeywords),
      minimum_experience_years: Number(minimumExperienceYears),
    });
  };

  return (
    <Card className="space-y-4 rounded-xl border-border/70">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Structured Requirements</h2>
        <p className="text-sm text-muted-foreground">
          Review and refine extracted requirements before activating this job.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Required Skills (comma-separated)
          </label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground placeholder:font-mono outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
            placeholder="e.g. React, TypeScript, REST APIs"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Preferred Skills (comma-separated)
          </label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground placeholder:font-mono outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            value={preferredSkills}
            onChange={(event) => setPreferredSkills(event.target.value)}
            placeholder="e.g. AWS, CI/CD, GraphQL"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Mandatory Keywords (comma-separated)
          </label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground placeholder:font-mono outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            value={mandatoryKeywords}
            onChange={(event) => setMandatoryKeywords(event.target.value)}
            placeholder="e.g. frontend, optimization, testing"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Minimum Experience (years)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground placeholder:font-mono outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            value={minimumExperienceYears}
            onChange={(event) => setMinimumExperienceYears(event.target.value)}
            placeholder="e.g. 2 years (defaults to 0)"
          />
          {validationErrors.minimumExperienceYears ? (
            <p className="mt-1 text-xs text-destructive">
              {validationErrors.minimumExperienceYears}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Requirements"}
        </Button>
      </form>
      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}
    </Card>
  );
}
