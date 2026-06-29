// src/pages/DashboardPage.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, Clock, AlertTriangle, TrendingUp,
  FolderKanban, Users, Zap, ArrowRight, Plus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchWorkspaces } from "../features/workspace/store/workspaceSlice";
import api from "../lib/axios";
import { useState } from "react";
import { clsx } from "clsx";

interface PersonalStats {
  taskStats: { total: number; done: number; in_progress: number; todo: number };
  completionTrend: { _id: string; count: number }[];
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={clsx("w-4 h-4", color)} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { workspaces } = useAppSelector((state) => state.workspace);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [myTasks, setMyTasks] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchWorkspaces());
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, tasksRes] = await Promise.all([
        api.get("/analytics/me"),
        api.get("/tasks/my"),
      ]);
      setStats(analyticsRes.data.data);
      setMyTasks(tasksRes.data.data);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Link
          to="/workspaces?new=true"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Tasks Completed"
          value={stats?.taskStats?.done || 0}
          color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats?.taskStats?.in_progress || 0}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={myTasks?.overdue?.length || 0}
          color="text-red-600"
          bg="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={workspaces.reduce((acc, w) => acc + (w.projectCount || 0), 0)}
          color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
              My Tasks
            </h2>
            <Link
              to="/my-tasks"
              className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myTasks?.tasks?.slice(0, 6).map((task: any) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full shrink-0",
                    task.priority === "critical" && "bg-red-500",
                    task.priority === "high" && "bg-orange-500",
                    task.priority === "medium" && "bg-yellow-500",
                    task.priority === "low" && "bg-blue-500",
                    task.priority === "none" && "bg-slate-300",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className={clsx(
                      "text-xs mt-0.5",
                      new Date(task.dueDate) < new Date()
                        ? "text-red-500"
                        : "text-slate-400"
                    )}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={clsx(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  task.status === "in_progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  task.status === "todo" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  task.status === "in_review" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  task.status === "blocked" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}>
                  {task.status.replace("_", " ")}
                </span>
              </Link>
            ))}
            {(!myTasks?.tasks || myTasks.tasks.length === 0) && (
              <div className="py-12 text-center">
                <CheckCircle className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Workspaces */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
                Workspaces
              </h2>
              <Link
                to="/workspaces"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {workspaces.slice(0, 4).map((ws) => (
                <Link
                  key={ws._id}
                  to={`/workspaces/${ws._id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: ws.color }}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {ws.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ws.members?.length} members
                    </p>
                  </div>
                </Link>
              ))}
              {workspaces.length === 0 && (
                <div className="py-8 text-center">
                  <Link
                    to="/workspaces?new=true"
                    className="flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-xs">Create workspace</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* AI Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <h3 className="font-semibold text-sm">AI Superpowers</h3>
            </div>
            <p className="text-xs text-indigo-200 mb-4">
              Use AI to boost your productivity
            </p>
            <div className="space-y-2">
              {[
                "Generate tasks from description",
                "Plan your next sprint",
                "Analyze project risks",
              ].map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-2 text-xs text-indigo-100"
                >
                  <div className="w-1 h-1 rounded-full bg-indigo-300" />
                  {action}
                </div>
              ))}
            </div>
            <Link
              to="/ai-assistant"
              className="mt-4 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors w-full"
            >
              Open AI Assistant
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;