// src/modules/projects/project.service.ts
import { Project } from "../../models/Project.model";
import { Workspace } from "../../models/Workspace.model";
import { Task } from "../../models/Task.model";
import { ActivityLog } from "../../models/ActivityLog.model";
import { User } from "../../models/User.model";
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  AddProjectMemberDTO,
} from "./project.types";

export class ProjectService {
  // Create project
  async createProject(
    workspaceId: string,
    userId: string,
    data: CreateProjectDTO
  ) {
    // Check workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === userId
    );
    if (!isMember) {
      throw { statusCode: 403, message: "Not a workspace member" };
    }

    const project = await Project.create({
      ...data,
      workspace: workspaceId,
      owner: userId,
      members: [{ user: userId, role: "manager", joinedAt: new Date() }],
    });

    // Log activity
    await ActivityLog.create({
      workspace: workspaceId,
      project: project._id,
      actor: userId,
      action: "project_created",
      metadata: { projectName: project.name },
    });

    return project;
  }

  // Get all projects in workspace
  async getProjects(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === userId
    );
    if (!isMember) {
      throw { statusCode: 403, message: "Not a workspace member" };
    }

    const projects = await Project.find({
      workspace: workspaceId,
      $or: [
        { visibility: "public" },
        { "members.user": userId },
        { owner: userId },
      ],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 });

    // Attach task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const stats = {
          total: 0,
          todo: 0,
          in_progress: 0,
          in_review: 0,
          done: 0,
          blocked: 0,
        };

        taskCounts.forEach((t) => {
          stats[t._id as keyof typeof stats] = t.count;
          stats.total += t.count;
        });

        return { ...project.toObject(), taskStats: stats };
      })
    );

    return projectsWithStats;
  }

  // Get single project
  async getProject(projectId: string, userId: string) {
    const project = await Project.findById(projectId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar isOnline lastSeen")
      .populate("workspace", "name slug");

    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectAccess(project, userId);

    // Task stats
    const taskStats = await this.getTaskStats(projectId);

    return { ...project.toObject(), taskStats };
  }

  // Update project
  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectDTO
  ) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectManagerAccess(project, userId);

    const updated = await Project.findByIdAndUpdate(
      projectId,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    await ActivityLog.create({
      workspace: project.workspace,
      project: projectId,
      actor: userId,
      action: "project_updated",
      metadata: { updatedFields: Object.keys(data) },
    });

    return updated;
  }

  // Delete project
  async deleteProject(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    if (project.owner.toString() !== userId) {
      throw { statusCode: 403, message: "Only project owner can delete it" };
    }

    // Delete all tasks
    await Task.deleteMany({ project: projectId });

    await Project.findByIdAndDelete(projectId);
  }

  // Add member
  async addMember(
    projectId: string,
    userId: string,
    data: AddProjectMemberDTO
  ) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectManagerAccess(project, userId);

    // Check user exists
    const userToAdd = await User.findById(data.userId);
    if (!userToAdd) {
      throw { statusCode: 404, message: "User not found" };
    }

    // Check already member
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === data.userId
    );
    if (alreadyMember) {
      throw { statusCode: 409, message: "User already a project member" };
    }

    project.members.push({
      user: userToAdd._id as any,
      role: data.role,
      joinedAt: new Date(),
    });
    await project.save();

    await ActivityLog.create({
      workspace: project.workspace,
      project: projectId,
      actor: userId,
      action: "member_added",
      metadata: { memberName: userToAdd.name, role: data.role },
    });

    return await Project.findById(projectId).populate(
      "members.user",
      "name email avatar"
    );
  }

  // Remove member
  async removeMember(
    projectId: string,
    userId: string,
    memberId: string
  ) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectManagerAccess(project, userId);

    if (project.owner.toString() === memberId) {
      throw { statusCode: 403, message: "Cannot remove project owner" };
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId
    );
    await project.save();

    await ActivityLog.create({
      workspace: project.workspace,
      project: projectId,
      actor: userId,
      action: "member_removed",
      metadata: { memberId },
    });
  }

  // Get project analytics
  async getAnalytics(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    this.checkProjectAccess(project, userId);

    const [taskStats, memberStats, recentActivity] = await Promise.all([
      this.getTaskStats(projectId),
      this.getMemberStats(projectId),
      ActivityLog.find({ project: projectId })
        .populate("actor", "name avatar")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    // Burndown data (last 14 days)
    const burndownData = await this.getBurndownData(projectId);

    return {
      taskStats,
      memberStats,
      recentActivity,
      burndownData,
      healthScore: project.healthScore,
    };
  }

  // Update health score
  async updateHealthScore(projectId: string) {
    const taskStats = await this.getTaskStats(projectId);
    const project = await Project.findById(projectId);
    if (!project) return;

    let score = 100;

    // Deduct for blocked tasks
    score -= taskStats.blocked * 10;

    // Deduct for overdue tasks
    const overdueTasks = await Task.countDocuments({
      project: projectId,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    });
    score -= overdueTasks * 5;

    // Boost for completion rate
    if (taskStats.total > 0) {
      const completionRate = taskStats.done / taskStats.total;
      score += completionRate * 20;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    await Project.findByIdAndUpdate(projectId, { healthScore: score });
    return score;
  }

  // Private helpers
  private async getTaskStats(projectId: string) {
    const counts = await Task.aggregate([
      { $match: { project: require("mongoose").Types.ObjectId.createFromHexString(projectId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats: any = { total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, blocked: 0 };
    counts.forEach((c) => {
      stats[c._id] = c.count;
      stats.total += c.count;
    });

    return stats;
  }

  private async getMemberStats(projectId: string) {
    return await Task.aggregate([
      {
        $match: {
          project: require("mongoose").Types.ObjectId.createFromHexString(projectId),
        },
      },
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
          "user.email": 1,
          totalTasks: 1,
          completedTasks: 1,
        },
      },
    ]);
  }

  private async getBurndownData(projectId: string) {
    const days = 14;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);

      const remaining = await Task.countDocuments({
        project: projectId,
        status: { $ne: "done" },
        createdAt: { $lte: date },
      });

      data.push({
        date: date.toISOString().split("T")[0],
        remaining,
      });
    }

    return data;
  }

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

  private checkProjectManagerAccess(project: any, userId: string) {
    const member = project.members.find(
      (m: any) => m.user.toString() === userId
    );
    if (
      !member ||
      (member.role !== "manager" &&
        project.owner.toString() !== userId)
    ) {
      throw { statusCode: 403, message: "Manager access required" };
    }
  }
}

export const projectService = new ProjectService();