// src/modules/tasks/task.service.ts
import mongoose from "mongoose";
import { Task } from "../../models/Task.model";
import { Project } from "../../models/Project.model";
import { ActivityLog } from "../../models/ActivityLog.model";
import { Notification } from "../../models/Notification.model";
import { Gamification } from "../../models/Gamification.model";
import { socketService } from "../../shared/services/socket.service";
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  MoveTaskDTO,
} from "./task.types";

export class TaskService {

  // Create task
  async createTask(projectId: string, userId: string, data: CreateTaskDTO) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectAccess(project, userId);

    const maxPositionTask = await Task.findOne({
      project: projectId,
      status: data.status || "todo",
    }).sort({ position: -1 });

    const position = data.position ?? (maxPositionTask ? maxPositionTask.position + 1 : 0);

    const task = await Task.create({
      ...data,
      project: projectId,
      workspace: project.workspace,
      createdBy: userId,
      position,
    });

    if (data.assignees?.length) {
      await this.notifyAssignees(task, userId, project);
    }

    await ActivityLog.create({
      workspace: project.workspace,
      project: projectId,
      task: task._id,
      actor: userId,
      action: "task_created",
      metadata: { taskTitle: task.title },
    });

    await this.updateProjectHealth(projectId);

    const populated = await Task.findById(task._id)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email avatar");

    // Socket emit
    socketService.taskCreated(projectId, populated);

    return populated;
  }

  // Update task
  async updateTask(taskId: string, userId: string, data: UpdateTaskDTO) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const project = await Project.findById(task.project);
    if (project) this.checkProjectAccess(project, userId);

    const previousStatus = task.status;

    if (data.status === "done" && previousStatus !== "done") {
      (data as any).completedAt = new Date();
      (data as any).actualHours = task.timeTracking.trackedSeconds / 3600;
      await this.awardXP(userId, task.project.toString(), 50);
    }

    const updated = await Task.findByIdAndUpdate(
      taskId,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email avatar");

    if (data.status && data.status !== previousStatus) {
      await ActivityLog.create({
        workspace: task.workspace,
        project: task.project,
        task: taskId,
        actor: userId,
        action: "status_changed",
        metadata: { from: previousStatus, to: data.status, taskTitle: task.title },
      });
    }

    if (data.priority && data.priority !== task.priority) {
      await ActivityLog.create({
        workspace: task.workspace,
        project: task.project,
        task: taskId,
        actor: userId,
        action: "priority_changed",
        metadata: { from: task.priority, to: data.priority },
      });
    }

    // Socket emit
    socketService.taskUpdated(task.project.toString(), taskId, updated);

    await this.updateProjectHealth(task.project.toString());

    return updated;
  }

  // Move task
  async moveTask(taskId: string, userId: string, data: MoveTaskDTO) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const previousStatus = task.status;

    await Task.updateMany(
      {
        project: task.project,
        status: data.status,
        position: { $gte: data.position },
        _id: { $ne: taskId },
      },
      { $inc: { position: 1 } }
    );

    const updated = await Task.findByIdAndUpdate(
      taskId,
      { status: data.status, position: data.position },
      { new: true }
    ).populate("assignees", "name email avatar");

    if (data.status !== previousStatus) {
      await ActivityLog.create({
        workspace: task.workspace,
        project: task.project,
        task: taskId,
        actor: userId,
        action: "status_changed",
        metadata: { from: previousStatus, to: data.status, taskTitle: task.title },
      });

      if (data.status === "done") {
        await this.awardXP(userId, task.project.toString(), 50);
      }
    }

    // Socket emit
    socketService.taskMoved(task.project.toString(), taskId, data.status, data.position);

    await this.updateProjectHealth(task.project.toString());

    return updated;
  }

  // Delete task
  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const project = await Project.findById(task.project);
    if (project) this.checkProjectAccess(project, userId);

    await Task.deleteMany({ parentTask: taskId });
    await Task.findByIdAndDelete(taskId);

    await ActivityLog.create({
      workspace: task.workspace,
      project: task.project,
      actor: userId,
      action: "task_deleted",
      metadata: { taskTitle: task.title },
    });

    // Socket emit
    socketService.taskDeleted(task.project.toString(), taskId);

    await this.updateProjectHealth(task.project.toString());
  }

  // Add subtask
  async addSubtask(taskId: string, userId: string, title: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    task.subtasks.push({ title, isCompleted: false });
    await task.save();

    return task;
  }

  // Toggle subtask
  async toggleSubtask(taskId: string, subtaskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const subtask = (task.subtasks as any).id(subtaskId);
    if (!subtask) {
      throw { statusCode: 404, message: "Subtask not found" };
    }

    subtask.isCompleted = !subtask.isCompleted;
    subtask.completedAt = subtask.isCompleted ? new Date() : undefined;
    await task.save();

    return task;
  }

  // Add checklist
  async addChecklist(taskId: string, userId: string, title: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    task.checklists.push({ title, items: [] });
    await task.save();

    return task;
  }

  // Add checklist item
  async addChecklistItem(
    taskId: string,
    checklistId: string,
    userId: string,
    text: string
  ) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const checklist = (task.checklists as any).id(checklistId);
    if (!checklist) {
      throw { statusCode: 404, message: "Checklist not found" };
    }

    checklist.items.push({ text, isChecked: false });
    await task.save();

    return task;
  }

  // Toggle checklist item
  async toggleChecklistItem(
    taskId: string,
    checklistId: string,
    itemId: string,
    userId: string
  ) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const checklist = (task.checklists as any).id(checklistId);
    if (!checklist) {
      throw { statusCode: 404, message: "Checklist not found" };
    }

    const item = checklist.items.id(itemId);
    if (!item) {
      throw { statusCode: 404, message: "Item not found" };
    }

    item.isChecked = !item.isChecked;
    await task.save();

    return task;
  }

  // Get my tasks
  async getMyTasks(userId: string) {
    const tasks = await Task.find({
      assignees: userId,
      status: { $ne: "done" },
    })
      .populate("project", "name color icon")
      .populate("assignees", "name email avatar")
      .sort({ dueDate: 1, priority: -1 })
      .limit(50);

    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date()
    );
    const dueToday = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const today = new Date();
      return t.dueDate.toDateString() === today.toDateString();
    });

    return { tasks, overdue, dueToday };
  }

  // Get project tasks
  async getProjectTasks(projectId: string, userId: string, filters?: any) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectAccess(project, userId);

    const query: any = { project: projectId, parentTask: null };

    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.assignee) query.assignees = filters.assignee;
    if (filters?.label) query.labels = filters.label;
    if (filters?.search) {
      query.title = { $regex: filters.search, $options: "i" };
    }
    if (filters?.overdue === "true") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "done" };
    }

    const tasks = await Task.find(query)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ position: 1, createdAt: -1 });

    const kanban = {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      in_review: tasks.filter((t) => t.status === "in_review"),
      done: tasks.filter((t) => t.status === "done"),
      blocked: tasks.filter((t) => t.status === "blocked"),
    };

    return { tasks, kanban };
  }

  // Get single task
  async getTask(taskId: string, userId: string) {
    const task = await Task.findById(taskId)
      .populate("assignees", "name email avatar isOnline")
      .populate("createdBy", "name email avatar")
      .populate("parentTask", "title status")
      .populate("project", "name color icon");

    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const project = await Project.findById(task.project);
    if (project) this.checkProjectAccess(project, userId);

    const subtaskStats = {
      total: task.subtasks.length,
      completed: task.subtasks.filter((s) => s.isCompleted).length,
    };

    return { ...task.toObject(), subtaskStats };
  }

  // Start time tracking
  async startTimeTracking(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    if (task.timeTracking.isTracking) {
      throw { statusCode: 400, message: "Time tracking already active" };
    }

    await Task.updateMany(
      { assignees: userId, "timeTracking.isTracking": true },
      { $set: { "timeTracking.isTracking": false } }
    );

    task.timeTracking.isTracking = true;
    task.timeTracking.lastStarted = new Date();
    await task.save();

    return task;
  }

  // Stop time tracking
  async stopTimeTracking(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    if (!task.timeTracking.isTracking || !task.timeTracking.lastStarted) {
      throw { statusCode: 400, message: "Time tracking not active" };
    }

    const elapsed = Math.floor(
      (Date.now() - task.timeTracking.lastStarted.getTime()) / 1000
    );

    task.timeTracking.isTracking = false;
    task.timeTracking.trackedSeconds += elapsed;
    task.timeTracking.lastStarted = undefined;
    await task.save();

    return task;
  }

  // Private helpers
  private checkProjectAccess(project: any, userId: string) {
    if (project.visibility === "public") return;
    const isMember = project.members.some(
      (m: any) =>
        m.user._id?.toString() === userId || m.user.toString() === userId
    );
    if (!isMember) {
      throw { statusCode: 403, message: "Access denied" };
    }
  }

  private async notifyAssignees(task: any, assignedBy: string, project: any) {
    const notifications = task.assignees
      .filter((id: any) => id.toString() !== assignedBy)
      .map((userId: any) => ({
        recipient: userId,
        sender: assignedBy,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned to "${task.title}"`,
        relatedTask: task._id,
        relatedProject: project._id,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  private async awardXP(userId: string, projectId: string, xp: number) {
    const project = await Project.findById(projectId);
    if (!project) return;

    await Gamification.findOneAndUpdate(
      { user: userId, workspace: project.workspace },
      {
        $inc: {
          xp,
          "stats.tasksCompleted": 1,
        },
      }
    );
  }

  private async updateProjectHealth(projectId: string) {
    const { projectService } = await import("../projects/project.service");
    await projectService.updateHealthScore(projectId);
  }
}

export const taskService = new TaskService();