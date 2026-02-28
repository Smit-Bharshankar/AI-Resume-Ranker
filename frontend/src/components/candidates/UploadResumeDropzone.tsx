import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume } from "../../hooks/resumes/useUploadResume";
import { ErrorState } from "../common/ErrorState";
import { Loader } from "../common/Loader";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

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
    <Card className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-6 text-center ${isDragActive ? "border-slate-600 bg-slate-100" : "border-slate-300 bg-slate-50"}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-slate-700">
          Drag and drop PDF resumes here, or browse files.
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={open}
            disabled={uploadMutation.isPending}
          >
            Select PDF Files
          </Button>
        </div>
      </div>

      {acceptedFiles.length > 0 ? (
        <p className="text-sm text-slate-600">
          Selected {acceptedFiles.length} file(s)
        </p>
      ) : null}

      {uploadMutation.isPending ? (
        <div className="space-y-2">
          <Loader label="Uploading resumes..." />
          <p className="text-sm text-slate-600">Upload progress: {uploadProgress}%</p>
        </div>
      ) : null}

      {uploadMutation.isSuccess ? (
        <div className="space-y-2">
          <p className="text-sm text-emerald-700">
            Upload completed. Uploaded: {uploadMutation.data.uploaded}, Failed:{" "}
            {uploadMutation.data.failed}
          </p>
          <Button
            variant="secondary"
            onClick={resetProgress}
          >
            Reset
          </Button>
        </div>
      ) : null}

      {rejectionMessage ? (
        <ErrorState title="Invalid files" message={rejectionMessage} />
      ) : null}

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
    </Card>
  );
}
