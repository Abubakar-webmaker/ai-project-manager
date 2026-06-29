// src/features/board/components/KanbanColumn.tsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { Plus } from "lucide-react";
import { Task } from "../../task/types/task.types";
import TaskCard from "../../task/components/TaskCard";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from "../../../constants/status.constants";

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const STATUS_ICONS: Record<string, string> = {
  todo: "📋",
  in_progress: "⚡",
  in_review: "👀",
  done: "✅",
  blocked: "🚫",
};

const STATUS_HEADER_COLORS: Record<string, string> = {
  todo: "border-t-slate-400",
  in_progress: "border-t-blue-500",
  in_review: "border-t-yellow-500",
  done: "border-t-green-500",
  blocked: "border-t-red-500",
};

const KanbanColumn = ({
  status,
  tasks,
  onAddTask,
  onTaskClick,
  onTaskDelete,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 rounded-xl border-t-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-colors",
        STATUS_HEADER_COLORS[status],
        isOver && "ring-2 ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">{STATUS_ICONS[status]}</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {TASK_STATUS_LABELS[status]}
          </span>
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 overflow-y-auto p-3 space-y-2 min-h-24",
          "scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              onDelete={onTaskDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(status)}
            className="h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group"
          >
            <p className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
              + Add task
            </p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-3 pt-0">
        <button
          onClick={() => onAddTask(status)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;