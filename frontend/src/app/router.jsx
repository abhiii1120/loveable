import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import WorkspacePage from "@/features/projects/pages/WorkspacePage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { bootstrapSession } from "@/features/auth/state/authThunk";

function ProtectedRoute() {
  const { isloading, user } = useAuth();

  if (isloading) return <LoadingScreen label="Restoring your workspace" />;
  return user ? <Outlet /> : <Navigate to={"/login"} replace />;
}

function GuestRoute() {
  const { isloading, user } = useAuth();

  if (isloading) return <LoadingScreen label="Checking your session" />;
  return user ? <Navigate to={"/projects"} replace /> : <Outlet />;
}

let AppRoutes = () => {
  let dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapSession());
  },[dispatch]);
  let router = createBrowserRouter([
    {
      path: "/",
      element: <GuestRoute />,
      children: [
        {
          index: true,
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
      ],
    },
    {
      path: "/projects",
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: <ProjectsPage />,
        },
        {
          path: ":projectId",
          element: <WorkspacePage />,
        },
      ],
    },
    {
      path:'*',
      element: <Navigate to={'/projects'} replace/>
    }
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoutes;
