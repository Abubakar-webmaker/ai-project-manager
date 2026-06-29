// src/features/task/components/TaskDetailModal.tsx
import { useState, useEffect } from "react";
import {
  X, Clock, Calendar, Flag, User, Tag,
  CheckSquare, Plus, Paperclip, Play, Square,
  Trash2, Edit2, Save,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { Task } from "../types/task.types";
import { taskService } from "../services/task.service";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "../../../constants/status.constants";
import Button from "../../../components/ui/Button/Button";
import CommentSection from "../../comments/components/CommentSection";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  members?: any[];
  onTaskUpdated: (task: Task) => void;
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const PRIORITY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const TaskDetailModal = ({
  isOpen, onClose, task, projectId, members = [], onTaskUpdated,
}: Props) => {
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [newSubtask, setNewSubtask] = useState("");
  const [isTracking, setIsTracking] = useState(task.timeTracking.isTracking);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");

  useEffect(() => {
    setCurrentTask(task);
    setEditTitle(task.title);
    setIsTracking(task.timeTracking.isTracking);
  }, [task]);

  if (!isOpen) return null;

  const updateTask = async (updates: any) => {
    try {
      setIsSaving(true);
      const { data } = await taskService.update(currentTask._id, updates);
      const updated = data.data.task;
      setCurrentTask(updated);
      onTaskUpdated(updated);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const saveTitle = async () => {
    if (editTitle.trim() && editTitle !== currentTask.title) {
      await updateTask({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      const { data } = await taskService.addSubtask(currentTask._id, newSubtask.trim());
      setCurrentTask(data.data.task);
      onTaskUpdated(data.data.task);
      setNewSubtask("");
      toast.success("Subtask added");
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    try {
      const { data } = await taskService.toggleSubtask(currentTask._id, subtaskId);
      setCurrentTask(data.data.task);
      onTaskUpdated(data.data.task);
    } catch {
      toast.error("Failed to toggle subtask");
    }
  };

  const toggleTimeTracking = async () => {
    try {
      if (isTracking) {
        const { data } = await taskService.stopTracking(currentTask._id);
        setCurrentTask(data.data.task);
        setIsTracking(false);
        toast.success("Time tracking stopped");
      } else {
        const { data } = await taskService.startTracking(currentTask._id);
        setCurrentTask(data.data.task);
        setIsTracking(true);
        toast.success("Time tracking started");
      }
    } catch {
      toast.error("Failed to toggle time tracking");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const completedSubtasks = currentTask.subtasks.filter((s) => s.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    className="flex-1 text-lg font-bold bg-transparent border-b-2 border-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                  <button onClick={saveTitle} className="text-green-500">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {currentTask.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all mt-0.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* AI Badge */}
              {currentTask.aiGenerated && (
                <span className="text-xs text-purple-500 mt-1 block">
                  ✨ AI Generated
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-3">
            {(["details", "comments", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "text-sm font-medium pb-1 border-b-2 transition-colors capitalize",
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={currentTask.status}
                    onChange={(e) => updateTask({ status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                    Priority
                  </label>
                  <select
                    value={currentTask.priority}
                    onChange={(e) => updateTask({ priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date & Estimated Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={currentTask.dueDate ? currentTask.dueDate.split("T")[0] : ""}
                    onChange={(e) => updateTask({ dueDate: e.target.value || null })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={currentTask.estimatedHours || ""}
                    onChange={(e) => updateTask({ estimatedHours: Number(e.target.value) || null })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                  Description
                </label>
                <textarea
                  defaultValue={currentTask.description || ""}
                  onBlur={(e) => {
                    if (e.target.value !== currentTask.description) {
                      updateTask({ description: e.target.value });
                    }
                  }}
                  rows={4}
                  placeholder="Add a description..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Assignees */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  <User className="w-3 h-3 inline mr-1" />
                  Assignees
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member: any) => {
                    const user = member.user || member;
                    const isAssigned = currentTask.assignees.some(
                      (a) => a._id === user._id
                    );
                    return (
                      <button
                        key={user._id}
                        onClick={() => {
                          const newAssignees = isAssigned
                            ? currentTask.assignees.filter((a) => a._id !== user._id).map((a) => a._id)
                            : [...currentTask.assignees.map((a) => a._id), user._id];
                          updateTask({ assignees: newAssignees });
                        }}
                        className={clsx(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-all",
                          isAssigned
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        {user.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Tracking */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Time Tracking
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tracked: {formatTime(currentTask.timeTracking.trackedSeconds)}
                      {currentTask.estimatedHours && (
                        <span> / {currentTask.estimatedHours}h estimated</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={toggleTimeTracking}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      isTracking
                        ? "bg-red-100 text-red-600 dark:bg-red-900/20 hover:bg-red-200"
                        : "bg-green-100 text-green-600 dark:bg-green-900/20 hover:bg-green-200"
                    )}
                  >
                    {isTracking ? (
                      <><Square className="w-3.5 h-3.5" /> Stop</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Start</>
                    )}
                  </button>
                </div>
                {currentTask.estimatedHours && (
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (currentTask.timeTracking.trackedSeconds / 3600 /
                            currentTask.estimatedHours) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <CheckSquare className="w-3 h-3 inline mr-1" />
                    Subtasks ({completedSubtasks}/{currentTask.subtasks.length})
                  </label>
                </div>

                <div className="space-y-2 mb-3">
                  {currentTask.subtasks.map((subtask) => (
                    <div
                      key={subtask._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <button
                        onClick={() => toggleSubtask(subtask._id)}
                        className={clsx(
                          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                          subtask.isCompleted
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        )}
                      >
                        {subtask.isCompleted && (
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5l-1 1L5 10.5l6-6-1-1.5z" />
                          </svg>
                        )}
                      </button>
                      <span className={clsx(
                        "text-sm flex-1",
                        subtask.isCompleted
                          ? "line-through text-slate-400"
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Subtask */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button size="sm" onClick={addSubtask} variant="outline">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Attachments */}
              {currentTask.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                    <Paperclip className="w-3 h-3 inline mr-1" />
                    Attachments ({currentTask.attachments.length})
                  </label>
                  <div className="space-y-2">
                    {currentTask.attachments.map((att) => (
                      <a
                        key={att._id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white truncate">
                            {att.filename}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(att.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "comments" && (
            <CommentSection taskId={currentTask._id} />
          )}

          {activeTab === "activity" && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Activity feed coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;