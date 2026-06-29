// src/modules/client-portal/clientPortal.service.ts
import crypto from "crypto";
import { ClientPortal } from "../../models/ClientPortal.model";
import { Project } from "../../models/Project.model";
import { Task } from "../../models/Task.model";
import { sendEmail } from "../../shared/utils/email.util";
import { env } from "../../config/env.config";

export class ClientPortalService {
  // Create client portal
  async createPortal(
    projectId: string,
    userId: string,
    data: {
      clientName: string;
      clientEmail: string;
      permissions?: any;
      expiresAt?: Date;
    }
  ) {
    const project = await Project.findById(projectId);
    if (!project) throw { statusCode: 404, message: "Project not found" };

    const accessToken = crypto.randomBytes(32).toString("hex");

    const portal = await ClientPortal.create({
      project: projectId,
      workspace: project.workspace,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      accessToken,
      permissions: data.permissions || {
        canViewTasks: true,
        canComment: false,
        canApprove: false,
        canViewAnalytics: false,
      },
      expiresAt: data.expiresAt || null,
    });

    // Send access email to client
    const portalUrl = `${env.CLIENT_URL}/client-portal/${accessToken}`;
    await sendEmail({
      to: data.clientEmail,
      subject: `Project Access: ${project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">You have been given project access</h2>
          <p>Hi ${data.clientName},</p>
          <p>You now have access to view the project: <strong>${project.name}</strong></p>
          <a href="${portalUrl}"
             style="background: #6366f1; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Project
          </a>
          <p style="color: #666; margin-top: 20px;">
            ${data.expiresAt ? `This link expires on ${new Date(data.expiresAt).toLocaleDateString()}` : "This link does not expire."}
          </p>
        </div>
      `,
    });

    return portal;
  }

  // Access portal by token (client side)
  async accessPortal(token: string) {
    const portal = await ClientPortal.findOne({
      accessToken: token,
      isActive: true,
    }).populate("project", "name description color icon status startDate endDate");

    if (!portal) throw { statusCode: 404, message: "Invalid or expired access link" };

    if (portal.expiresAt && portal.expiresAt < new Date()) {
      throw { statusCode: 403, message: "Access link has expired" };
    }

    // Update last accessed
    portal.lastAccessed = new Date();
    await portal.save();

    // Get project tasks
    const tasks = await Task.find({
      project: portal.project,
      ...(portal.permissions.canViewTasks ? {} : { _id: null }),
    })
      .select("title description status priority dueDate completedAt assignees labels")
      .populate("assignees", "name avatar");

    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
    };

    return {
      portal: {
        clientName: portal.clientName,
        permissions: portal.permissions,
        project: portal.project,
      },
      tasks: portal.permissions.canViewTasks ? tasks : [],
      taskStats,
    };
  }

  // Get project portals
  async getProjectPortals(projectId: string, userId: string) {
    const portals = await ClientPortal.find({ project: projectId });
    return portals;
  }

  // Toggle portal active status
  async togglePortal(portalId: string, userId: string) {
    const portal = await ClientPortal.findById(portalId);
    if (!portal) throw { statusCode: 404, message: "Portal not found" };

    portal.isActive = !portal.isActive;
    await portal.save();

    return portal;
  }

  // Delete portal
  async deletePortal(portalId: string, userId: string) {
    const portal = await ClientPortal.findByIdAndDelete(portalId);
    if (!portal) throw { statusCode: 404, message: "Portal not found" };
  }

  // Client approve task
  async approveTask(token: string, taskId: string, approved: boolean) {
    const portal = await ClientPortal.findOne({ accessToken: token, isActive: true });
    if (!portal) throw { statusCode: 404, message: "Invalid portal" };
    if (!portal.permissions.canApprove) throw { statusCode: 403, message: "No approval permission" };

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: approved ? "done" : "in_review" },
      { new: true }
    );

    return task;
  }
}

export const clientPortalService = new ClientPortalService();