// src/shared/services/whatsapp.service.ts
import { twilioClient } from "../../config/twilio.config";
import { env } from "../../config/env.config";
import { User } from "../../models/User.model";

export class WhatsAppService {
  // Send WhatsApp message
  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!twilioClient) {
      console.warn("⚠️ Twilio not configured, skipping WhatsApp");
      return false;
    }

    try {
      await twilioClient.messages.create({
        from: env.TWILIO_WHATSAPP_FROM!,
        to: `whatsapp:${to}`,
        body: message,
      });
      return true;
    } catch (error) {
      console.error("WhatsApp send error:", error);
      return false;
    }
  }

  // Send task assigned notification
  async notifyTaskAssigned(
    userId: string,
    taskTitle: string,
    projectName: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user?.preferences?.notifications?.whatsapp) return;
    if (!(user as any).phone) return;

    const message = `🎯 *New Task Assigned*\n\nTask: ${taskTitle}\nProject: ${projectName}\n\nLogin to AI Project Manager to view details.`;

    await this.sendMessage((user as any).phone, message);
  }

  // Send deadline reminder
  async notifyDeadlineReminder(
    userId: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user?.preferences?.notifications?.whatsapp) return;
    if (!(user as any).phone) return;

    const message = `⚠️ *Deadline Reminder*\n\nTask: ${taskTitle}\nDue: ${dueDate.toLocaleDateString()}\n\nDon't forget to complete this task!`;

    await this.sendMessage((user as any).phone, message);
  }

  // Send daily digest
  async sendDailyDigest(
    userId: string,
    stats: { total: number; done: number; overdue: number }
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user?.preferences?.notifications?.whatsapp) return;
    if (!(user as any).phone) return;

    const message = `📊 *Daily Digest*\n\nYour tasks today:\n✅ Completed: ${stats.done}\n📋 Total: ${stats.total}\n⚠️ Overdue: ${stats.overdue}\n\nKeep up the great work!`;

    await this.sendMessage((user as any).phone, message);
  }

  // Send project health alert
  async notifyProjectHealthAlert(
    userId: string,
    projectName: string,
    healthScore: number
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user?.preferences?.notifications?.whatsapp) return;
    if (!(user as any).phone) return;

    if (healthScore >= 50) return; // Only alert for critical health

    const message = `🚨 *Project Health Alert*\n\nProject: ${projectName}\nHealth Score: ${healthScore}/100\n\nYour project needs attention. Please review blockers and overdue tasks.`;

    await this.sendMessage((user as any).phone, message);
  }
}

export const whatsAppService = new WhatsAppService();