// src/shared/utils/cron.util.ts
import cron from "node-cron";
import { recurringTaskService } from "../../modules/recurring-tasks/recurringTask.service";
import { Task } from "../../models/Task.model";
import { Notification } from "../../models/Notification.model";

export const initializeCronJobs = () => {
  // Run recurring tasks every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Checking recurring tasks...");
    await recurringTaskService.executeDueTasks();
  });

  // Send deadline reminders every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Sending deadline reminders...");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueTasks = await Task.find({
      dueDate: { $gte: today, $lte: tomorrow },
      status: { $ne: "done" },
    }).populate("assignees", "_id");

    for (const task of dueTasks) {
      for (const assignee of task.assignees as any[]) {
        await Notification.create({
          recipient: assignee._id,
          type: "deadline_reminder",
          title: "Task Due Soon ⚠️",
          message: `"${task.title}" is due tomorrow`,
          relatedTask: task._id,
          relatedProject: task.project,
        });
      }
    }

    console.log(`✅ Sent reminders for ${dueTasks.length} tasks`);
  });

  console.log("✅ Cron jobs initialized");
};