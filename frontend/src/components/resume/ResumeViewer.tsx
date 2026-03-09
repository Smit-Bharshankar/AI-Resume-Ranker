import { memo, useEffect, useMemo, useState } from "react";
import { useResumeFileUrl } from "../../hooks/resumes/useResumeFileUrl";
import { ErrorState } from "../common/ErrorState";
import { Loader } from "../common/Loader";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ResumeViewerProps = {
  resumeId: string;
  title?: string;
  className?: string;
  lazy?: boolean;
};

function ResumeViewerComponent({
  resumeId,
  title = "Resume Preview",
  className,
  lazy = true,
}: ResumeViewerProps) {
  const [shouldLoad, setShouldLoad] = useState<boolean>(!lazy);
  const [isFrameReady, setIsFrameReady] = useState<boolean>(false);
  const [hasFrameError, setHasFrameError] = useState<boolean>(false);

  const fileQuery = useResumeFileUrl(resumeId, shouldLoad);

  const frameSrc = useMemo(() => {
    if (!fileQuery.data?.url) {
      return "";
    }
    return `${fileQuery.data.url}#view=FitH`;
  }, [fileQuery.data?.url]);

  useEffect(() => {
    if (!frameSrc) {
      return;
    }

    setIsFrameReady(false);
    setHasFrameError(false);
  }, [frameSrc]);

  const handleLoadPreview = () => {
    setShouldLoad(true);
    setIsFrameReady(false);
    setHasFrameError(false);
  };

  const handleRetry = () => {
    setIsFrameReady(false);
    setHasFrameError(false);
    void fileQuery.refetch();
  };

  const handleFrameLoad = () => {
    setIsFrameReady(true);
    setHasFrameError(false);
  };

  const handleFrameError = () => {
    setIsFrameReady(false);
    setHasFrameError(true);
  };

  if (!resumeId) {
    return (
      <Card className={className}>
        <ErrorState
          title="Resume unavailable"
          message="Resume ID is missing. Cannot load preview."
        />
      </Card>
    );
  }

  if (!shouldLoad) {
    return (
      <Card className={className}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">
            The PDF preview is lazy-loaded to improve page performance.
          </p>
          <Button onClick={handleLoadPreview}>Load Resume Preview</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {fileQuery.isFetching ? <Loader label="Refreshing secure link..." /> : null}
        </div>

        {fileQuery.isLoading ? <Loader label="Loading secure resume link..." /> : null}

        {fileQuery.isError ? (
          <ErrorState
            title="Unable to load resume file"
            message={fileQuery.error.message}
            onRetry={handleRetry}
          />
        ) : null}

        {!fileQuery.isLoading && !fileQuery.isError && hasFrameError ? (
          <ErrorState
            title="PDF preview failed"
            message="The resume file could not be rendered in the browser preview."
            onRetry={handleRetry}
          />
        ) : null}

        {!fileQuery.isLoading && !fileQuery.isError && fileQuery.data?.url ? (
          <div className="relative min-h-[720px] overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {!isFrameReady && !hasFrameError ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <Loader label="Rendering PDF preview..." />
              </div>
            ) : null}
            <iframe
              key={frameSrc}
              title={`Resume PDF ${resumeId}`}
              src={frameSrc}
              className="h-[890px] w-full"
              loading="lazy"
              onLoad={handleFrameLoad}
              onError={handleFrameError}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export const ResumeViewer = memo(ResumeViewerComponent);
