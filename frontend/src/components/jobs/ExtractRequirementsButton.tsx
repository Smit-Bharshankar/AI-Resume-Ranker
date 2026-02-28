import { useExtractRequirements } from "../../hooks/jobs/useExtractRequirements";
import { ErrorState } from "../common/ErrorState";
import { Button } from "../ui/Button";

type ExtractRequirementsButtonProps = {
  jobId: string;
  onTriggered?: () => void;
  disabled?: boolean;
};

export function ExtractRequirementsButton({
  jobId,
  onTriggered,
  disabled = false,
}: ExtractRequirementsButtonProps) {
  const mutation = useExtractRequirements(jobId);

  const handleClick = async () => {
    await mutation.mutateAsync();
    onTriggered?.();
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={disabled || mutation.isPending}>
        {mutation.isPending ? "Extracting..." : "Extract Requirements"}
      </Button>
      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}
    </div>
  );
}
