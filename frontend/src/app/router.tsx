import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { Loader } from "../components/common/Loader";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { CandidatesListPage } from "../pages/candidates/CandidatesListPage";
import { CreateJobPage } from "../pages/jobs/CreateJobPage";
import { JobDetailPage } from "../pages/jobs/JobDetailPage";
import { JobsListPage } from "../pages/jobs/JobsListPage";

const CandidateDetailPage = lazy(() =>
  import("../pages/candidates/CandidateDetailPage").then((module) => ({
    default: module.CandidateDetailPage,
  }))
);

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
        <Suspense fallback={<div className="mx-auto max-w-6xl p-6"><Loader label="Loading candidate page..." /></div>}>
          <CandidateDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
]);
