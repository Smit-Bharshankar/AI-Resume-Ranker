import { useActivateJob } from "../../hooks/jobs/useActivateJob";
import { ErrorState } from "../common/ErrorState";
import { Button } from "../ui/Button";

type ActivateJobButtonProps = {
  jobId: string;
  disabled?: boolean;
};

export function ActivateJobButton({
  jobId,
  disabled = false,
}: ActivateJobButtonProps) {
  const mutation = useActivateJob(jobId);

  return (
    <div className="space-y-2">
      <Button onClick={() => mutation.mutate()} disabled={disabled || mutation.isPending}>
        {mutation.isPending ? "Activating..." : "Activate Job"}
      </Button>
      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}
    </div>
  );
}
