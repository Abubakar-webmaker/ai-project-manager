// src/components/layout/AppLayout/AppLayout.tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { fetchWorkspaces } from "../../../features/workspace/store/workspaceSlice";
import { fetchNotifications } from "../../../features/notifications/store/notificationSlice";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const AppLayout = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchWorkspaces());
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;