// src/pages/BoardPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus, Bot, BarChart3, List, Filter,
  RefreshCw, ChevronRight, Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTasks, updateTaskInBoard, removeTaskFromBoard } from "../features/task/store/taskSlice";
import { taskService } from "../features/task/services/task.service";
import { projectService } from "../features/project/services/project.service";
import { Task, KanbanBoard } from "../features/task/types/task.types";
import KanbanColumn from "../features/board/components/KanbanColumn";
import TaskCard from "../features/task/components/TaskCard";
import CreateTaskModal from "../features/task/components/CreateTaskModal";
import TaskDetailModal from "../features/task/components/TaskDetailModal";
import Button from "../components/ui/Button/Button";
import Spinner from "../components/ui/Spinner/Spinner";
import { getSocket } from "../lib/socket";
import { SOCKET_EVENTS } from "../constants/socket.constants";

const STATUSES = ["todo", "in_progress", "in_review", "done", "blocked"];

const BoardPage = () => {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const dispatch = useAppDispatch();
  const { kanban, isLoading } = useAppSelector((state) => state.task);

  const [project, setProject] = useState<any>(null);
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState("todo");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    if (projectId) {
      loadProject();
      dispatch(fetchTasks(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (kanban) setBoard(kanban);
  }, [kanban]);

  // Socket.io real-time
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !projectId) return;

    socket.emit(SOCKET_EVENTS.JOIN_PROJECT, projectId);

    socket.on(SOCKET_EVENTS.TASK_CREATED, ({ task }: any) => {
      dispatch(fetchTasks(projectId!));
      toast(`New task: ${task.title}`, { icon: "✅" });
    });

    socket.on(SOCKET_EVENTS.TASK_UPDATED, ({ task }: any) => {
      dispatch(updateTaskInBoard(task));
    });

    socket.on(SOCKET_EVENTS.TASK_MOVED, () => {
      dispatch(fetchTasks(projectId!));
    });

    socket.on(SOCKET_EVENTS.TASK_DELETED, ({ taskId }: any) => {
      dispatch(removeTaskFromBoard(taskId));
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_PROJECT, projectId);
      socket.off(SOCKET_EVENTS.TASK_CREATED);
      socket.off(SOCKET_EVENTS.TASK_UPDATED);
      socket.off(SOCKET_EVENTS.TASK_MOVED);
      socket.off(SOCKET_EVENTS.TASK_DELETED);
    };
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data } = await projectService.getOne(projectId!);
      setProject(data.data.project);
    } catch {
      toast.error("Failed to load project");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStatus = findTaskStatus(activeId);
    const overStatus = STATUSES.includes(overId)
      ? overId
      : findTaskStatus(overId);

    if (!activeStatus || !overStatus || activeStatus === overStatus) return;

    setBoard((prev) => {
      if (!prev) return prev;
      const activeTask = prev[activeStatus as keyof KanbanBoard].find(
        (t) => t._id === activeId
      );
      if (!activeTask) return prev;

      return {
        ...prev,
        [activeStatus]: prev[activeStatus as keyof KanbanBoard].filter(
          (t) => t._id !== activeId
        ),
        [overStatus]: [
          ...prev[overStatus as keyof KanbanBoard],
          { ...activeTask, status: overStatus as any },
        ],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const newStatus = STATUSES.includes(overId)
      ? overId
      : findTaskStatus(overId);

    if (!newStatus) return;

    const tasksInColumn = board[newStatus as keyof KanbanBoard];
    const newIndex = tasksInColumn.findIndex((t) => t._id === activeId);

    try {
      await taskService.move(activeId, {
        status: newStatus,
        position: newIndex >= 0 ? newIndex : tasksInColumn.length,
      });

      const socket = getSocket();
      socket?.emit(SOCKET_EVENTS.TASK_MOVED, {
        projectId,
        taskId: activeId,
        newStatus,
        position: newIndex,
      });
    } catch {
      toast.error("Failed to move task");
      dispatch(fetchTasks(projectId!));
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleAddTask = (status: string) => {
    setCreateTaskStatus(status);
    setShowCreateTask(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      dispatch(removeTaskFromBoard(taskId));

      const socket = getSocket();
      socket?.emit(SOCKET_EVENTS.TASK_DELETED, { projectId, taskId });

      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const findTaskById = (id: string): Task | undefined => {
    if (!board) return undefined;
    for (const status of STATUSES) {
      const task = board[status as keyof KanbanBoard].find((t) => t._id === id);
      if (task) return task;
    }
  };

  const findTaskStatus = (taskId: string): string | undefined => {
    if (!board) return undefined;
    for (const status of STATUSES) {
      if (board[status as keyof KanbanBoard].some((t) => t._id === taskId)) {
        return status;
      }
    }
  };

  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  };

  const totalTasks = board
    ? STATUSES.reduce((acc, s) => acc + board[s as keyof KanbanBoard].length, 0)
    : 0;
  const doneTasks = board?.done?.length || 0;
  const completionPct =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (isLoading && !board) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Board Header */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link
            to={`/workspaces/${workspaceId}`}
            className="hover:text-indigo-600 transition-colors"
          >
            Workspace
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {project?.name || "Project"}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span>Board</span>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Project info */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{
                backgroundColor: (project?.color || "#6366f1") + "20",
                border: `2px solid ${project?.color || "#6366f1"}40`,
              }}
            >
              {project?.icon || "📋"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {project?.name || "Board"}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-slate-400">
                  {totalTasks} tasks · {completionPct}% complete
                </span>
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
            />

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => dispatch(fetchTasks(projectId!))}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Analytics */}
            <Link
              to={`/workspaces/${workspaceId}/projects/${projectId}/analytics`}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </Link>

            {/* AI Assistant */}
            <Link
              to={`/projects/${projectId}/ai`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Bot className="w-4 h-4" />
              AI
            </Link>

            {/* Add Task */}
            <Button
              size="sm"
              onClick={() => handleAddTask("todo")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={getFilteredTasks(
                  board?.[status as keyof KanbanBoard] || []
                )}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
                onTaskDelete={handleDeleteTask}
              />
            ))}

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask && (
                <div className="rotate-3 shadow-2xl">
                  <TaskCard
                    task={activeTask}
                    onClick={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={projectId!}
        defaultStatus={createTaskStatus}
        members={project?.members || []}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          projectId={projectId!}
          members={project?.members || []}
          onTaskUpdated={(updatedTask) => {
            dispatch(updateTaskInBoard(updatedTask));
            setSelectedTask(updatedTask);
          }}
        />
      )}
    </div>
  );
};

export default BoardPage;