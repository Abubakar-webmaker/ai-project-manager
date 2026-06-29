// src/pages/ProjectPage.tsx
import { useParams, Link } from "react-router-dom";
import { Kanban, BarChart3, Bot, Settings } from "lucide-react";

const ProjectPage = () => {
  const { workspaceId, projectId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Project Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Quick actions for your project
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={`/workspaces/${workspaceId}/projects/${projectId}/board`}
            className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors"
          >
            <Kanban className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Board</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage tasks</p>
          </Link>

          <Link
            to={`/projects/${projectId}/ai`}
            className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 transition-colors"
          >
            <Bot className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Assistant</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI features</p>
          </Link>

          <Link
            to={`/workspaces/${workspaceId}/projects/${projectId}/analytics`}
            className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Analytics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">View insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
