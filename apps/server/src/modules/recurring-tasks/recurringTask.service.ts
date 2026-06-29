// src/modules/recurring-tasks/recurringTask.service.ts
import { RecurringTask } from "../../models/RecurringTask.model";
import { Task } from "../../models/Task.model";
import { Project } from "../../models/Project.model";

export class RecurringTaskService {
  // Create recurring task
  async create(projectId: string, userId: string, data: any) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const cronMap: Record<string, string> = {
      daily: "0 9 * * *",
      weekly: "0 9 * * 1",
      biweekly: "0 9 1,15 * *",
      monthly: "0 9 1 * *",
    };

    const nextRunAt = this.getNextRunDate(data.frequency);

    const recurringTask = await RecurringTask.create({
      ...data,
      project: projectId,
      workspace: project.workspace,
      createdBy: userId,
      cronExpression: data.cronExpression || cronMap[data.frequency],
      nextRunAt,
    });

    return recurringTask;
  }

  // Get project recurring tasks
  async getProjectRecurringTasks(projectId: string) {
    return await RecurringTask.find({ project: projectId })
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email");
  }

  // Toggle recurring task
  async toggle(recurringTaskId: string, userId: string) {
    const task = await RecurringTask.findById(recurringTaskId);
    if (!task) throw { statusCode: 404, message: "Recurring task not found" };

    task.isActive = !task.isActive;
    await task.save();
    return task;
  }

  // Delete recurring task
  async delete(recurringTaskId: string, userId: string) {
    await RecurringTask.findByIdAndDelete(recurringTaskId);
  }

  // Execute due recurring tasks (called by cron job)
  async executeDueTasks() {
    const dueTasks = await RecurringTask.find({
      isActive: true,
      nextRunAt: { $lte: new Date() },
    });

    console.log(`🔁 Running ${dueTasks.length} recurring tasks`);

    for (const recurringTask of dueTasks) {
      try {
        // Get last task position
        const lastTask = await Task.findOne({
          project: recurringTask.project,
          status: "todo",
        }).sort({ position: -1 });

        const position = lastTask ? lastTask.position + 1 : 0;

        // Create new task
        await Task.create({
          title: recurringTask.title,
          description: recurringTask.description,
          project: recurringTask.project,
          workspace: recurringTask.workspace,
          createdBy: recurringTask.createdBy,
          assignees: recurringTask.assignees,
          priority: recurringTask.priority,
          status: "todo",
          position,
          isRecurring: true,
          recurringTaskId: recurringTask._id,
        });

        // Update next run date
        recurringTask.lastRunAt = new Date();
        recurringTask.nextRunAt = this.getNextRunDate(recurringTask.frequency);
        await recurringTask.save();

        console.log(`✅ Created recurring task: ${recurringTask.title}`);
      } catch (error) {
        console.error(`❌ Failed recurring task ${recurringTask._id}:`, error);
      }
    }
  }

  private getNextRunDate(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case "daily":
        now.setDate(now.getDate() + 1);
        break;
      case "weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "biweekly":
        now.setDate(now.getDate() + 14);
        break;
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        break;
    }
    now.setHours(9, 0, 0, 0);
    return now;
  }
}

export const recurringTaskService = new RecurringTaskService();