// src/modules/analytics/analytics.service.ts
import mongoose from "mongoose";
import { Task } from "../../models/Task.model";
import { Project } from "../../models/Project.model";
import { ActivityLog } from "../../models/ActivityLog.model";
import { TimeLog } from "../../models/TimeLog.model";
import { Workspace } from "../../models/Workspace.model";

export class AnalyticsService {
  // Workspace overview
  async getWorkspaceAnalytics(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw { statusCode: 404, message: "Workspace not found" };

    const projects = await Project.find({ workspace: workspaceId });
    const projectIds = projects.map((p) => p._id);

    const [taskStats, recentActivity, memberActivity] = await Promise.all([
      Task.aggregate([
        { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ActivityLog.find({ workspace: workspaceId })
        .populate("actor", "name avatar")
        .sort({ createdAt: -1 })
        .limit(20),
      Task.aggregate([
        { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
        { $unwind: "$assignees" },
        {
          $group: {
            _id: "$assignees",
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.name": 1,
            "user.avatar": 1,
            totalTasks: 1,
            completedTasks: 1,
          },
        },
        { $sort: { completedTasks: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const stats: any = { total: 0 };
    taskStats.forEach((s) => {
      stats[s._id] = s.count;
      stats.total += s.count;
    });

    return {
      overview: {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        totalMembers: workspace.members.length,
        taskStats: stats,
      },
      recentActivity,
      memberActivity,
      projects: projects.map((p) => ({
        _id: p._id,
        name: p.name,
        color: p.color,
        healthScore: p.healthScore,
        status: p.status,
      })),
    };
  }

  // Project detailed analytics
  async getProjectAnalytics(projectId: string, userId: string, days: number = 30) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      tasksByStatus,
      tasksByPriority,
      tasksByMember,
      completionTrend,
      timeStats,
    ] = await Promise.all([
      // Tasks by status
      Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Tasks by priority
      Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      // Tasks by member
      Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { $unwind: { path: "$assignees", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$assignees",
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),

      // Daily completion trend
      Task.aggregate([
        {
          $match: {
            project: new mongoose.Types.ObjectId(projectId),
            status: "done",
            completedAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Time tracking stats
      Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        {
          $group: {
            _id: null,
            totalEstimated: { $sum: "$estimatedHours" },
            totalTracked: {
              $sum: { $divide: ["$timeTracking.trackedSeconds", 3600] },
            },
          },
        },
      ]),
    ]);

    // Overdue tasks
    const overdueTasks = await Task.find({
      project: projectId,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    })
      .select("title dueDate priority assignees")
      .populate("assignees", "name avatar");

    return {
      tasksByStatus,
      tasksByPriority,
      tasksByMember,
      completionTrend,
      timeStats: timeStats[0] || { totalEstimated: 0, totalTracked: 0 },
      overdueTasks,
      healthScore: project.healthScore,
    };
  }

  // Personal analytics
  async getPersonalAnalytics(userId: string) {
    const [myTaskStats, completionTrend, productivityByDay] = await Promise.all([
      Task.aggregate([
        { $match: { assignees: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Task.aggregate([
        {
          $match: {
            assignees: new mongoose.Types.ObjectId(userId),
            status: "done",
            completedAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Task.aggregate([
        {
          $match: {
            assignees: new mongoose.Types.ObjectId(userId),
            status: "done",
            completedAt: { $exists: true },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$completedAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stats: any = { total: 0 };
    myTaskStats.forEach((s) => {
      stats[s._id] = s.count;
      stats.total += s.count;
    });

    return {
      taskStats: stats,
      completionTrend,
      productivityByDay,
    };
  }
}

export const analyticsService = new AnalyticsService();