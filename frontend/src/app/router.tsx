import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <JobsListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs/create",
    element: (
      <ProtectedRoute>
        <CreateJobPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs/:jobId",
    element: (
      <ProtectedRoute>
        <JobDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs/:jobId/candidates",
    element: (
      <ProtectedRoute>
        <CandidatesListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidates/:resumeId",
    element: (
      <ProtectedRoute>
        <CandidateDetailPage />
      </ProtectedRoute>
    ),
  },
]);
