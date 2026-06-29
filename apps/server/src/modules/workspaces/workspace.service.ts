// src/modules/workspaces/workspace.service.ts
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { Workspace } from "../../models/Workspace.model";
import { User } from "../../models/User.model";
import { ActivityLog } from "../../models/ActivityLog.model";
import { Gamification } from "../../models/Gamification.model";
import { sendEmail } from "../../shared/utils/email.util";
import { env } from "../../config/env.config";
import {
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
  InviteMemberDTO,
} from "./workspace.types";

export class WorkspaceService {
  // Create workspace
  async createWorkspace(userId: string, data: CreateWorkspaceDTO) {
    // Generate unique slug
    let slug = slugify(data.name, { lower: true, strict: true });
    const existing = await Workspace.findOne({ slug });
    if (existing) {
      slug = `${slug}-${uuidv4().slice(0, 6)}`;
    }

    const workspace = await Workspace.create({
      name: data.name,
      description: data.description || "",
      color: data.color || "#6366f1",
      slug,
      owner: userId,
      members: [{ user: userId, role: "owner", joinedAt: new Date() }],
    });

    // Initialize gamification for owner
    await Gamification.create({
      user: userId,
      workspace: workspace._id,
    });

    // Log activity
    await ActivityLog.create({
      workspace: workspace._id,
      actor: userId,
      action: "project_created",
      metadata: { workspaceName: workspace.name },
    });

    return workspace;
  }

  // Get all workspaces for user
  async getMyWorkspaces(userId: string) {
    const workspaces = await Workspace.find({
      "members.user": userId,
    })
      .populate("owner", "name email avatar")
      .sort({ createdAt: -1 });

    return workspaces;
  }

  // Get single workspace
  async getWorkspace(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar isOnline lastSeen");

    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkMembership(workspace, userId);
    return workspace;
  }

  // Update workspace
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceDTO
  ) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkAdminAccess(workspace, userId);

    const updated = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate("members.user", "name email avatar");

    return updated;
  }

  // Delete workspace
  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    if (workspace.owner.toString() !== userId) {
      throw { statusCode: 403, message: "Only owner can delete workspace" };
    }

    await Workspace.findByIdAndDelete(workspaceId);
  }

  // Invite member
  async inviteMember(
    workspaceId: string,
    userId: string,
    data: InviteMemberDTO
  ) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkAdminAccess(workspace, userId);

    // Find user to invite
    const invitedUser = await User.findOne({ email: data.email });
    if (!invitedUser) {
      throw { statusCode: 404, message: "No user found with this email" };
    }

    // Check already member
    const alreadyMember = workspace.members.find(
      (m) => m.user.toString() === invitedUser._id.toString()
    );
    if (alreadyMember) {
      throw { statusCode: 409, message: "User is already a member" };
    }

    // Add member
    workspace.members.push({
      user: invitedUser._id as any,
      role: data.role,
      joinedAt: new Date(),
    });
    await workspace.save();

    // Initialize gamification for new member
    await Gamification.findOneAndUpdate(
      { user: invitedUser._id, workspace: workspaceId },
      { user: invitedUser._id, workspace: workspaceId },
      { upsert: true, new: true }
    );

    // Send invite email
    try {
      await sendEmail({
        to: invitedUser.email,
        subject: `You've been invited to ${workspace.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Workspace Invitation</h2>
            <p>Hi ${invitedUser.name},</p>
            <p>You've been invited to join <strong>${workspace.name}</strong> workspace on AI Project Manager.</p>
            <a href="${env.CLIENT_URL}/workspaces" 
               style="background: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Workspace
            </a>
          </div>
        `,
      });
    } catch (error) {
      console.error("Invite email failed:", error);
    }

    // Log activity
    await ActivityLog.create({
      workspace: workspaceId,
      actor: userId,
      action: "member_added",
      metadata: {
        memberName: invitedUser.name,
        memberEmail: invitedUser.email,
        role: data.role,
      },
    });

    return await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email avatar isOnline"
    );
  }

  // Remove member
  async removeMember(
    workspaceId: string,
    userId: string,
    memberId: string
  ) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkAdminAccess(workspace, userId);

    if (workspace.owner.toString() === memberId) {
      throw { statusCode: 403, message: "Cannot remove workspace owner" };
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== memberId
    );
    await workspace.save();

    // Log activity
    await ActivityLog.create({
      workspace: workspaceId,
      actor: userId,
      action: "member_removed",
      metadata: { memberId },
    });

    return workspace;
  }

  // Update member role
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    memberId: string,
    role: "admin" | "member"
  ) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkAdminAccess(workspace, userId);

    if (workspace.owner.toString() === memberId) {
      throw { statusCode: 403, message: "Cannot change owner role" };
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === memberId
    );
    if (!member) {
      throw { statusCode: 404, message: "Member not found" };
    }

    member.role = role;
    await workspace.save();

    return workspace;
  }

  // Leave workspace
  async leaveWorkspace(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    if (workspace.owner.toString() === userId) {
      throw {
        statusCode: 403,
        message: "Owner cannot leave workspace. Transfer ownership or delete it.",
      };
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userId
    );
    await workspace.save();
  }

  // Get workspace members
  async getMembers(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email avatar isOnline lastSeen"
    );

    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkMembership(workspace, userId);
    return workspace.members;
  }

  // Get workspace activity
  async getActivity(workspaceId: string, userId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: "Workspace not found" };
    }

    this.checkMembership(workspace, userId);

    const activity = await ActivityLog.find({ workspace: workspaceId })
      .populate("actor", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    return activity;
  }

  // Helper: check membership
  private checkMembership(workspace: any, userId: string) {
    const isMember = workspace.members.some(
      (m: any) => m.user._id?.toString() === userId || m.user.toString() === userId
    );
    if (!isMember) {
      throw { statusCode: 403, message: "You are not a member of this workspace" };
    }
  }

  // Helper: check admin access
  private checkAdminAccess(workspace: any, userId: string) {
    const member = workspace.members.find(
      (m: any) => m.user.toString() === userId
    );
    if (
      !member ||
      (member.role !== "owner" && member.role !== "admin")
    ) {
      throw { statusCode: 403, message: "Admin access required" };
    }
  }
}

export const workspaceService = new WorkspaceService();