// src/pages/TaskDetailPage.tsx
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const TaskDetailPage = () => {
  const { taskId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400">Loading task...</p>
        <p className="text-xs text-slate-400 mt-2">Task ID: {taskId}</p>
      </div>
    </div>
  );
};

export default TaskDetailPage;
