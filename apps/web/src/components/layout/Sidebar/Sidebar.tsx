// src/components/layout/Sidebar/Sidebar.tsx
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard, FolderKanban, Users, Settings,
  ChevronDown, ChevronRight, Plus, Zap, BarChart3,
  Bot, Clock, Trophy, UserCircle, ChevronLeft,
  Building2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { toggleSidebar } from "../../../store/uiSlice";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Clock, label: "My Tasks", path: "/my-tasks" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { workspaces, currentWorkspace } = useAppSelector((state) => state.workspace);
  const { projects } = useAppSelector((state) => state.project);

  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(
    currentWorkspace?._id || null
  );

  const isActive = (path: string) => location.pathname === path;
  const isProjectActive = (id: string) => location.pathname.includes(id);

  return (
    <aside
      className={clsx(
        "flex flex-col h-screen bg-slate-900 text-slate-100 transition-all duration-300 shrink-0",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white truncate">
              AI Project Manager
            </span>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">

        {/* Main Nav */}
        <div className="px-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive(item.path)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Divider */}
        {!sidebarCollapsed && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workspaces
            </p>
          </div>
        )}

        {/* Workspaces */}
        <div className="px-2 space-y-0.5">
          {workspaces.map((workspace) => (
            <div key={workspace._id}>
              {/* Workspace Row */}
              <button
                onClick={() =>
                  setExpandedWorkspace(
                    expandedWorkspace === workspace._id ? null : workspace._id
                  )
                }
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div
                  className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate text-left">
                      {workspace.name}
                    </span>
                    {expandedWorkspace === workspace._id ? (
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    )}
                  </>
                )}
              </button>

              {/* Projects under workspace */}
              {!sidebarCollapsed && expandedWorkspace === workspace._id && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {projects
                    .filter((p) => p.workspace === workspace._id || p.workspace?._id === workspace._id)
                    .map((project) => (
                      <Link
                        key={project._id}
                        to={`/workspaces/${workspace._id}/projects/${project._id}/board`}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                          isProjectActive(project._id)
                            ? "bg-slate-700 text-white"
                            : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                        )}
                      >
                        <span className="text-base leading-none">
                          {project.icon || "📋"}
                        </span>
                        <span className="truncate">{project.name}</span>
                      </Link>
                    ))}

                  {/* New Project Button */}
                  <Link
                    to={`/workspaces/${workspace._id}?newProject=true`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Project</span>
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* New Workspace Button */}
          <Link
            to="/workspaces?new=true"
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>New Workspace</span>}
          </Link>
        </div>

        {/* AI Assistant */}
        {!sidebarCollapsed && (
          <div className="px-2 pt-2">
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400">
                  AI Assistant
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Generate tasks, plan sprints & analyze risks
              </p>
              <Link
                to="/ai-assistant"
                className="block text-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-1.5 transition-colors"
              >
                Open AI
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User Profile at bottom */}
      <div className="border-t border-slate-800 p-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;