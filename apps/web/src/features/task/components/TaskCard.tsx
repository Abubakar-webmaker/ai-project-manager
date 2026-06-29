// src/features/task/components/TaskCard.tsx
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import {
  Clock, MessageSquare, Paperclip, CheckSquare,
  AlertCircle, Calendar, MoreHorizontal, Trash2,
  GripVertical, Bot,
} from "lucide-react";
import { Task } from "../types/task.types";
import { PRIORITY_COLORS } from "../../../constants/status.constants";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onClick, onDelete }: TaskCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700",
        "hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md",
        "transition-all duration-200 group",
        isDragging && "shadow-2xl ring-2 ring-indigo-500 rotate-2"
      )}
    >
      <div className="p-3">
        {/* Top row */}
        <div className="flex items-start gap-2 mb-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-slate-400 shrink-0"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Priority Dot */}
          <div
            className={clsx(
              "w-2 h-2 rounded-full mt-1.5 shrink-0",
              task.priority === "critical" && "bg-red-500",
              task.priority === "high" && "bg-orange-500",
              task.priority === "medium" && "bg-yellow-500",
              task.priority === "low" && "bg-blue-500",
              task.priority === "none" && "bg-slate-300 dark:bg-slate-600",
            )}
          />

          {/* Title */}
          <p
            className="flex-1 text-sm font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
            onClick={() => onClick(task)}
          >
            {task.title}
          </p>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30">
                <button
                  onClick={() => { onClick(task); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Open Task
                </button>
                <button
                  onClick={() => { onDelete(task._id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 ml-5">
            {task.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="text-xs px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* AI Badge */}
        {task.aiGenerated && (
          <div className="flex items-center gap-1 mb-2 ml-5">
            <Bot className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-purple-500">AI Generated</span>
          </div>
        )}

        {/* Subtasks Progress */}
        {task.subtasks.length > 0 && (
          <div className="mb-2 ml-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">
                {completedSubtasks}/{task.subtasks.length} subtasks
              </span>
            </div>
            <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{
                  width: `${task.subtasks.length > 0
                    ? (completedSubtasks / task.subtasks.length) * 100
                    : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 ml-5">
          {/* Left: meta info */}
          <div className="flex items-center gap-2">
            {/* Due Date */}
            {task.dueDate && (
              <span className={clsx(
                "flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-red-500 font-medium"
                  : "text-slate-400"
              )}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}

            {/* Time tracked */}
            {task.timeTracking.trackedSeconds > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {formatTime(task.timeTracking.trackedSeconds)}
              </span>
            )}

            {/* Comments count */}
            {(task as any).commentsCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MessageSquare className="w-3 h-3" />
                {(task as any).commentsCount}
              </span>
            )}

            {/* Attachments */}
            {task.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Paperclip className="w-3 h-3" />
                {task.attachments.length}
              </span>
            )}
          </div>

          {/* Right: Assignees */}
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((assignee) => (
              <div
                key={assignee._id}
                title={assignee.name}
                className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-500 flex items-center justify-center overflow-hidden"
              >
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-white font-bold leading-none">
                    {assignee.name?.charAt(0)}
                  </span>
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-none">
                  +{task.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Active time tracking indicator */}
        {task.timeTracking.isTracking && (
          <div className="mt-2 ml-5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-500 font-medium">
              Tracking time...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;