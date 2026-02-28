import { createBrowserRouter, Navigate } from "react-router-dom";
import { CandidateDetailPage } from "../pages/candidates/CandidateDetailPage";
import { CandidatesListPage } from "../pages/candidates/CandidatesListPage";
import { CreateJobPage } from "../pages/jobs/CreateJobPage";
import { JobDetailPage } from "../pages/jobs/JobDetailPage";
import { JobsListPage } from "../pages/jobs/JobsListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/jobs" replace />,
  },
  {
    path: "/jobs",
    element: <JobsListPage />,
  },
  {
    path: "/jobs/create",
    element: <CreateJobPage />,
  },
  {
    path: "/jobs/:jobId",
    element: <JobDetailPage />,
  },
  {
    path: "/jobs/:jobId/candidates",
    element: <CandidatesListPage />,
  },
  {
    path: "/candidates/:resumeId",
    element: <CandidateDetailPage />,
  },
]);
