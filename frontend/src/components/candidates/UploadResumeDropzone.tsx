import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { useAnalyticsEvents } from "../../analytics/events";
import { useUploadResume } from "../../hooks/resumes/useUploadResume";
import { ErrorState } from "../common/ErrorState";
import { Loader } from "../common/Loader";
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

type UploadResumeDropzoneProps = {
  jobId: string;
  onUploaded?: () => void;
};

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
};

export function UploadResumeDropzone({
  jobId,
  onUploaded,
}: UploadResumeDropzoneProps) {
  const { trackResumeUploaded } = useAnalyticsEvents();
  const { uploadMutation, uploadProgress, resetProgress } = useUploadResume();

  const onDropAccepted = async (acceptedFiles: readonly File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        jobId,
        files: [...acceptedFiles],
      });
      trackResumeUploaded("pdf", acceptedFiles.length);
      onUploaded?.();
    } catch {
      // Error state is already exposed through uploadMutation.error.
    }
  };

  const {
    getRootProps,
    getInputProps,
    open,
    acceptedFiles,
    fileRejections,
    isDragActive,
  } = useDropzone({
    onDropAccepted,
    accept: ACCEPTED_TYPES,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  const rejectionMessage = useMemo(() => {
    if (fileRejections.length === 0) {
      return "";
    }
    return "Only PDF files are allowed.";
  }, [fileRejections]);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Upload Resumes</CardTitle>
        <CardDescription>Drag PDF files or select multiple resumes at once.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-primary/60 bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/40"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop PDF resumes here, or browse files.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={open} disabled={uploadMutation.isPending}>
              Select PDF Files
            </Button>
          </div>
        </div>

        {acceptedFiles.length > 0 ? (
          <p className="text-sm text-muted-foreground">Selected {acceptedFiles.length} file(s)</p>
        ) : null}

        {uploadMutation.isPending ? (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <Loader label="Uploading resumes..." />
            <p className="text-sm text-muted-foreground">Upload progress: {uploadProgress}%</p>
          </div>
        ) : null}

        {uploadMutation.isSuccess ? (
          <div className="space-y-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Upload completed. Uploaded: {uploadMutation.data.uploaded}, Failed: {uploadMutation.data.failed}
            </p>
            <Button variant="secondary" onClick={resetProgress}>
              Reset
            </Button>
          </div>
        ) : null}

        {rejectionMessage ? <ErrorState title="Invalid files" message={rejectionMessage} /> : null}

        {uploadMutation.error ? (
          <ErrorState
            title="Upload failed"
            message={uploadMutation.error.message}
            onRetry={() => {
              if (acceptedFiles.length === 0) {
                return;
              }
              void onDropAccepted(acceptedFiles);
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
