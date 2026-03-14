import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAnalyticsEvents } from "../../analytics/events";
import { createJob } from "../../api/jobsApi";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/Breadcrumb";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Job } from "../../types/job";

export function CreateJobPage() {
  const navigate = useNavigate();
  const { trackJobCreated } = useAnalyticsEvents();
  const [title, setTitle] = useState<string>("");
  const [rawDescription, setRawDescription] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const createMutation = useMutation<Job, Error, { title: string; rawDescription: string }>(
    {
      mutationFn: ({ title: inputTitle, rawDescription: inputRawDescription }) =>
        createJob({ title: inputTitle, rawDescription: inputRawDescription }),
      onSuccess: (createdJob) => {
        trackJobCreated(createdJob.id);
        navigate(`/jobs/${createdJob.id}`);
      },
      retry: 0,
    }
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = rawDescription.trim();

    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    if (!trimmedDescription) {
      setFormError("Raw description is required.");
      return;
    }

    await createMutation.mutateAsync({
      title: trimmedTitle,
      rawDescription: trimmedDescription,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/jobs">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Job</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create Job</h1>
          <p className="text-sm text-muted-foreground">
            Paste the role details and generate structured hiring requirements.
          </p>
        </div>
      </div>

      <Card className="rounded-xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
            <input
              className="w-full rounded-md border border-border/80 bg-accent px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Raw Description
            </label>
            <textarea
              rows={10}
              className="w-full rounded-md border border-border/80 bg-accent px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
              value={rawDescription}
              onChange={(event) => setRawDescription(event.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Job"}
          </Button>
        </form>
      </Card>

      {createMutation.isPending ? <Loader label="Creating job..." /> : null}
      {formError ? <ErrorState title="Validation error" message={formError} /> : null}
      {createMutation.isError ? (
        <ErrorState title="Failed to create job" message={createMutation.error.message} />
      ) : null}
    </div>
  );
}
