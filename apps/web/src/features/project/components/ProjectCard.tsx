// src/features/project/components/ProjectCard.tsx
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import {
  MoreHorizontal, Users, CheckCircle,
  Clock, AlertTriangle, Trash2, Settings,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../store/hooks";
import { fetchProjects } from "../store/projectSlice";
import { projectService } from "../services/project.service";

interface ProjectCardProps {
  project: any;
  workspaceId: string;
}

const ProjectCard = ({ project, workspaceId }: ProjectCardProps) => {
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const stats = project.taskStats || { total: 0, done: 0, in_progress: 0, blocked: 0 };
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await projectService.delete(project._id);
      await dispatch(fetchProjects(workspaceId));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthBg = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Color bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: project.color || "#6366f1" }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link
            to={`/workspaces/${workspaceId}/projects/${project._id}/board`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{
                backgroundColor: (project.color || "#6366f1") + "20",
                border: `2px solid ${project.color || "#6366f1"}40`,
              }}
            >
              {project.icon || "📋"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </Link>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20">
                <Link
                  to={`/workspaces/${workspaceId}/projects/${project._id}/settings`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Progress
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {completionPct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPct}%`,
                backgroundColor: project.color || "#6366f1",
              }}
            />
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {stats.done}
            </p>
            <p className="text-xs text-slate-400">Done</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm font-semibold text-red-500">
              {stats.blocked}
            </p>
            <p className="text-xs text-slate-400">Blocked</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Members */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 4).map((member: any, i: number) => (
                <div
                  key={member.user?._id || i}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center overflow-hidden"
                  title={member.user?.name}
                >
                  {member.user?.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white font-bold">
                      {member.user?.name?.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
              {project.members?.length > 4 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                    +{project.members.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${getHealthBg(project.healthScore || 100)}`} />
            <span className={`text-xs font-medium ${getHealthColor(project.healthScore || 100)}`}>
              {project.healthScore || 100}% health
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {project.status !== "active" && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              project.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
              project.status === "on_hold" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
              project.status === "archived" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
            )}>
              {project.status.replace("_", " ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;