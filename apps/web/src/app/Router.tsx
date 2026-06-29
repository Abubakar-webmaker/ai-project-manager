// src/app/Router.tsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

// Layouts
import AppLayout from "../components/layout/AppLayout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout/AuthLayout";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// App Pages
import DashboardPage from "../pages/DashboardPage";
import WorkspacePage from "../pages/WorkspacePage";
import BoardPage from "../pages/BoardPage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import ClientPortalPage from "../pages/ClientPortalPage";
import AIAssistantPage from "../pages/AIAssistantPage";

// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <PublicRoute><LoginPage /></PublicRoute>,
      },
      {
        path: "/register",
        element: <PublicRoute><RegisterPage /></PublicRoute>,
      },
    ],
  },

  // App routes
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/workspaces/:workspaceId", element: <WorkspacePage /> },
      { path: "/workspaces/:workspaceId/projects/:projectId/board", element: <BoardPage /> },
      { path: "/projects/:projectId/ai", element: <AIAssistantPage /> },
      { path: "/ai-assistant", element: <AIAssistantPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/settings", element: <SettingsPage /> },

      // Placeholder routes
      { path: "/analytics", element: <DashboardPage /> },
      { path: "/my-tasks", element: <DashboardPage /> },
      { path: "/achievements", element: <DashboardPage /> },
      { path: "/notifications", element: <DashboardPage /> },
    ],
  },

  // Client Portal (public)
  { path: "/client-portal/:token", element: <ClientPortalPage /> },

  // 404
  { path: "*", element: <NotFoundPage /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;