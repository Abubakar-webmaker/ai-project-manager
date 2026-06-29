// src/modules/ai/ai.service.ts
import { groqClient } from "../../config/groq.config";
import { Task } from "../../models/Task.model";
import { Project } from "../../models/Project.model";
import { Comment } from "../../models/Comment.model";
import { TimeLog } from "../../models/TimeLog.model";
import { AI_PROMPTS } from "../../shared/constants/ai.prompts";
import {
  AITaskGeneratorDTO,
  AISprintPlannerDTO,
  AIPrioritySuggesterDTO,
  AICodeReviewDTO,
  AIMeetingMinutesDTO,
  AITaskEstimatorDTO,
} from "./ai.types";

export class AIService {
  // Core Groq caller
  private async callGroq(prompt: string): Promise<any> {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "";

    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch {
      throw { statusCode: 500, message: "AI response parsing failed" };
    }
  }

  // 1. AI Task Generator
  async generateTasks(userId: string, data: AITaskGeneratorDTO) {
    const project = await Project.findById(data.projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const prompt = AI_PROMPTS.TASK_GENERATOR(data.projectName, data.description);
    const tasks = await this.callGroq(prompt);

    if (data.autoCreate && Array.isArray(tasks)) {
      const createdTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = await Task.create({
          title: tasks[i].title,
          description: tasks[i].description,
          priority: tasks[i].priority,
          estimatedHours: tasks[i].estimatedHours,
          labels: tasks[i].labels || [],
          project: data.projectId,
          workspace: project.workspace,
          createdBy: userId,
          position: i,
          status: "todo",
          aiGenerated: true,
          aiMetadata: {
            generatedBy: "llama-3.3-70b-versatile",
            prompt: data.description,
            confidence: 0.85,
          },
        });

        // Add subtasks
        if (tasks[i].subtasks?.length) {
          tasks[i].subtasks.forEach((st: string) => {
            task.subtasks.push({ title: st, isCompleted: false });
          });
          await task.save();
        }

        createdTasks.push(task);
      }
      return { tasks, createdTasks, autoCreated: true };
    }

    return { tasks, autoCreated: false };
  }

  // 2. AI Sprint Planner
  async planSprint(userId: string, data: AISprintPlannerDTO) {
    const project = await Project.findById(data.projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({
      project: data.projectId,
      status: { $in: ["todo", "in_progress"] },
      ...(data.taskIds ? { _id: { $in: data.taskIds } } : {}),
    }).select("title description priority estimatedHours assignees status");

    const prompt = AI_PROMPTS.SPRINT_PLANNER(
      tasks,
      data.teamSize,
      data.sprintDays
    );

    const sprintPlan = await this.callGroq(prompt);
    return { sprintPlan, analyzedTasks: tasks.length };
  }

  // 3. AI Priority Suggester
  async suggestPriorities(userId: string, projectId: string, taskIds?: string[]) {
    const query: any = {
      project: projectId,
      status: { $ne: "done" },
    };
    if (taskIds?.length) query._id = { $in: taskIds };

    const tasks = await Task.find(query)
      .select("_id title description dueDate priority estimatedHours assignees")
      .populate("assignees", "name");

    const prompt = AI_PROMPTS.PRIORITY_SUGGESTER(tasks);
    const suggestions = await this.callGroq(prompt);

    return { suggestions, analyzedTasks: tasks.length };
  }

  // 4. AI Progress Report
  async generateProgressReport(userId: string, projectId: string) {
    const project = await Project.findById(projectId)
      .populate("members.user", "name")
      .populate("owner", "name");

    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({ project: projectId })
      .select("title status priority dueDate completedAt estimatedHours actualHours assignees")
      .populate("assignees", "name");

    const projectData = {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      healthScore: project.healthScore,
      members: project.members.length,
      tasks: {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        in_review: tasks.filter((t) => t.status === "in_review").length,
        done: tasks.filter((t) => t.status === "done").length,
        blocked: tasks.filter((t) => t.status === "blocked").length,
      },
      overdueTasks: tasks.filter(
        (t) => t.dueDate && t.dueDate < new Date() && t.status !== "done"
      ).length,
      recentlyCompleted: tasks
        .filter((t) => t.status === "done")
        .slice(-5)
        .map((t) => t.title),
    };

    const prompt = AI_PROMPTS.PROGRESS_REPORT(projectData);
    const report = await this.callGroq(prompt);

    return { report, projectData };
  }

  // 5. AI Standup Generator
  async generateStandup(userId: string, projectId: string) {
    const user = await import("../../models/User.model").then(
      (m) => m.User.findById(userId)
    );

    const tasks = await Task.find({
      project: projectId,
      assignees: userId,
    })
      .select("title status priority dueDate updatedAt completedAt")
      .sort({ updatedAt: -1 })
      .limit(20);

    const prompt = AI_PROMPTS.STANDUP_GENERATOR(tasks, user?.name || "Team Member");
    const standup = await this.callGroq(prompt);

    return { standup };
  }

  // 6. AI Risk Analyzer
  async analyzeRisks(userId: string, projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({ project: projectId })
      .select("title status priority dueDate estimatedHours actualHours assignees labels")
      .populate("assignees", "name");

    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date() && t.status !== "done"
    );

    const projectData = {
      name: project.name,
      endDate: project.endDate,
      healthScore: project.healthScore,
      teamSize: project.members.length,
      totalTasks: tasks.length,
      blockedTasks: tasks.filter((t) => t.status === "blocked").length,
      overdueTasks: overdueTasks.length,
      overdueTaskTitles: overdueTasks.map((t) => t.title),
      completionRate:
        tasks.length > 0
          ? (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
          : 0,
    };

    const prompt = AI_PROMPTS.RISK_ANALYZER(projectData);
    const risks = await this.callGroq(prompt);

    return { risks, projectData };
  }

  // 7. AI Task Estimator
  async estimateTask(userId: string, data: AITaskEstimatorDTO) {
    const task = await Task.findById(data.taskId)
      .populate("assignees", "name")
      .populate("project", "name");

    if (!task) throw { statusCode: 404, message: "Task not found" };

    // Get historical data
    const historicalTasks = await Task.find({
      project: task.project,
      status: "done",
      actualHours: { $gt: 0 },
    })
      .select("title estimatedHours actualHours labels")
      .limit(10);

    const historicalData = {
      avgAccuracy:
        historicalTasks.length > 0
          ? historicalTasks.reduce((acc, t) => {
              if (t.estimatedHours && t.actualHours) {
                return acc + t.actualHours / t.estimatedHours;
              }
              return acc;
            }, 0) / historicalTasks.length
          : 1,
      completedTasks: historicalTasks.length,
    };

    const prompt = AI_PROMPTS.TASK_ESTIMATOR(task, historicalData);
    const estimation = await this.callGroq(prompt);

    return { estimation, taskId: data.taskId };
  }

  // 8. AI Code Reviewer
  async reviewCode(userId: string, data: AICodeReviewDTO) {
    if (!data.code?.trim()) {
      throw { statusCode: 400, message: "Code is required" };
    }

    const prompt = AI_PROMPTS.CODE_REVIEWER(data.code, data.language || "javascript");
    const review = await this.callGroq(prompt);

    return { review, language: data.language };
  }

  // 9. AI Meeting Minutes
  async processMeetingMinutes(userId: string, data: AIMeetingMinutesDTO) {
    const project = await Project.findById(data.projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const prompt = AI_PROMPTS.MEETING_MINUTES(data.notes);
    const result = await this.callGroq(prompt);

    if (data.autoCreate && result.actionItems?.length) {
      const createdTasks = [];
      for (let i = 0; i < result.actionItems.length; i++) {
        const item = result.actionItems[i];
        const task = await Task.create({
          title: item.title,
          description: item.description,
          priority: item.priority || "medium",
          project: data.projectId,
          workspace: project.workspace,
          createdBy: userId,
          position: i,
          status: "todo",
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          aiGenerated: true,
          aiMetadata: {
            generatedBy: "llama-3.3-70b-versatile",
            prompt: "meeting_minutes",
            confidence: 0.8,
          },
        });
        createdTasks.push(task);
      }
      return { result, createdTasks, autoCreated: true };
    }

    return { result, autoCreated: false };
  }

  // 10. AI Team Mood Analyzer
  async analyzeMood(userId: string, projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    // Get recent comments
    const recentTasks = await Task.find({ project: projectId }).select("_id");
    const taskIds = recentTasks.map((t) => t._id);

    const comments = await Comment.find({
      task: { $in: taskIds },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select("content")
      .limit(50);

    if (comments.length < 3) {
      return {
        mood: null,
        message: "Not enough comments to analyze team mood (minimum 3 required)",
      };
    }

    const commentTexts = comments.map((c) => c.content);
    const prompt = AI_PROMPTS.MOOD_ANALYZER(commentTexts);
    const mood = await this.callGroq(prompt);

    return { mood, analyzedComments: comments.length };
  }

  // 11. AI Deadline Predictor
  async predictDeadline(userId: string, taskId: string) {
    const task = await Task.findById(taskId)
      .populate("assignees", "name")
      .populate("project", "name");

    if (!task) throw { statusCode: 404, message: "Task not found" };

    const historicalTasks = await Task.find({
      project: task.project,
      status: "done",
      completedAt: { $exists: true },
    })
      .select("estimatedHours actualHours completedAt createdAt")
      .limit(15);

    const avgVelocity =
      historicalTasks.length > 0
        ? historicalTasks.reduce((acc, t) => {
            if (t.estimatedHours && t.actualHours) {
              return acc + t.actualHours / t.estimatedHours;
            }
            return acc;
          }, 0) / historicalTasks.length
        : 1;

    const prompt = AI_PROMPTS.DEADLINE_PREDICTOR(task, { avgVelocity, historicalTasks: historicalTasks.length });
    const prediction = await this.callGroq(prompt);

    return { prediction, taskId };
  }

  // 12. AI Conflict Detector
  async detectConflicts(userId: string, projectId: string) {
    const project = await Project.findById(projectId).populate(
      "members.user",
      "name email"
    );
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({
      project: projectId,
      status: { $ne: "done" },
    })
      .select("title assignees dueDate estimatedHours status priority")
      .populate("assignees", "name");

    const prompt = AI_PROMPTS.CONFLICT_DETECTOR(tasks, project.members);
    const conflicts = await this.callGroq(prompt);

    return { conflicts, analyzedTasks: tasks.length };
  }

  // 13. AI Client Report
  async generateClientReport(userId: string, projectId: string) {
    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name");

    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({ project: projectId }).select(
      "title status priority dueDate completedAt estimatedHours"
    );

    const projectData = {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      healthScore: project.healthScore,
      teamSize: project.members.length,
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "done").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        todo: tasks.filter((t) => t.status === "todo").length,
        blocked: tasks.filter((t) => t.status === "blocked").length,
      },
      completionPercentage:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
            )
          : 0,
    };

    const prompt = AI_PROMPTS.CLIENT_REPORT(projectData);
    const report = await this.callGroq(prompt);

    return { report, projectData };
  }

  // 14. AI Resource Allocator
  async allocateResources(userId: string, projectId: string) {
    const project = await Project.findById(projectId).populate(
      "members.user",
      "name email"
    );
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const unassignedTasks = await Task.find({
      project: projectId,
      status: "todo",
      assignees: { $size: 0 },
    }).select("_id title description priority estimatedHours labels");

    if (unassignedTasks.length === 0) {
      return { message: "No unassigned tasks found", allocations: [] };
    }

    // Get member workloads
    const memberWorkloads = await Promise.all(
      project.members.map(async (m: any) => {
        const activeTasks = await Task.countDocuments({
          project: projectId,
          assignees: m.user._id,
          status: { $in: ["todo", "in_progress"] },
        });
        return {
          userId: m.user._id,
          name: m.user.name,
          role: m.role,
          currentTaskCount: activeTasks,
        };
      })
    );

    const prompt = AI_PROMPTS.RESOURCE_ALLOCATOR(unassignedTasks, memberWorkloads);
    const allocations = await this.callGroq(prompt);

    return { allocations, unassignedTaskCount: unassignedTasks.length };
  }

  // 15. AI Scope Creep Detector
  async detectScopeCreep(userId: string, projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const tasks = await Task.find({ project: projectId }).select(
      "title description labels createdAt aiGenerated"
    );

    const originalScope = project.description || "No original scope defined";
    const prompt = AI_PROMPTS.SCOPE_CREEP_DETECTOR(originalScope, tasks);
    const result = await this.callGroq(prompt);

    return { result, projectName: project.name };
  }
}

export const aiService = new AIService();