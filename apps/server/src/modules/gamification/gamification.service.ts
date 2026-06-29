// src/modules/gamification/gamification.service.ts
import { Gamification } from "../../models/Gamification.model";
import { Task } from "../../models/Task.model";
import { Notification } from "../../models/Notification.model";

const BADGES = [
  { name: "First Task", description: "Complete your first task", icon: "🎯", requirement: { stat: "tasksCompleted", value: 1 } },
  { name: "Task Master", description: "Complete 10 tasks", icon: "⭐", requirement: { stat: "tasksCompleted", value: 10 } },
  { name: "Productivity King", description: "Complete 50 tasks", icon: "👑", requirement: { stat: "tasksCompleted", value: 50 } },
  { name: "Speed Runner", description: "Complete 5 tasks on time", icon: "⚡", requirement: { stat: "tasksCompletedOnTime", value: 5 } },
  { name: "Communicator", description: "Add 20 comments", icon: "💬", requirement: { stat: "commentsAdded", value: 20 } },
  { name: "On Fire", description: "7 day streak", icon: "🔥", requirement: { stat: "streakDays", value: 7 } },
  { name: "Unstoppable", description: "30 day streak", icon: "🚀", requirement: { stat: "streakDays", value: 30 } },
  { name: "Bug Crusher", description: "Complete 10 high priority tasks", icon: "🐛", requirement: { stat: "tasksCompleted", value: 10 } },
];

const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 100, title: "Contributor" },
  { level: 3, xpRequired: 300, title: "Developer" },
  { level: 4, xpRequired: 600, title: "Senior Developer" },
  { level: 5, xpRequired: 1000, title: "Tech Lead" },
  { level: 6, xpRequired: 1500, title: "Architect" },
  { level: 7, xpRequired: 2500, title: "Expert" },
  { level: 8, xpRequired: 4000, title: "Master" },
  { level: 9, xpRequired: 6000, title: "Legend" },
  { level: 10, xpRequired: 10000, title: "God Mode" },
];

export class GamificationService {
  // Get user gamification data
  async getUserGamification(userId: string, workspaceId: string) {
    let gamification = await Gamification.findOne({
      user: userId,
      workspace: workspaceId,
    }).populate("user", "name email avatar");

    if (!gamification) {
      gamification = await Gamification.create({
        user: userId,
        workspace: workspaceId,
      });
    }

    const currentLevel = this.calculateLevel(gamification.xp);
    const nextLevel = XP_LEVELS.find((l) => l.level === currentLevel.level + 1);

    return {
      gamification,
      currentLevel,
      nextLevel,
      xpToNextLevel: nextLevel ? nextLevel.xpRequired - gamification.xp : 0,
      progressToNextLevel: nextLevel
        ? Math.round(
            ((gamification.xp - currentLevel.xpRequired) /
              (nextLevel.xpRequired - currentLevel.xpRequired)) *
              100
          )
        : 100,
    };
  }

  // Get workspace leaderboard
  async getLeaderboard(workspaceId: string) {
    const leaderboard = await Gamification.find({ workspace: workspaceId })
      .populate("user", "name email avatar")
      .sort({ xp: -1 })
      .limit(20);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      xp: entry.xp,
      level: this.calculateLevel(entry.xp),
      badges: entry.badges.length,
      tasksCompleted: entry.stats.tasksCompleted,
      streak: entry.stats.streakDays,
    }));
  }

  // Award XP and check badges
  async awardXP(
    userId: string,
    workspaceId: string,
    xp: number,
    reason: string
  ) {
    const gamification = await Gamification.findOneAndUpdate(
      { user: userId, workspace: workspaceId },
      { $inc: { xp } },
      { new: true, upsert: true }
    );

    if (!gamification) return;

    // Check level up
    const oldLevel = this.calculateLevel(gamification.xp - xp);
    const newLevel = this.calculateLevel(gamification.xp);

    if (newLevel.level > oldLevel.level) {
      gamification.level = newLevel.level;
      await gamification.save();

      // Notify level up
      await Notification.create({
        recipient: userId,
        type: "gamification_achievement",
        title: "Level Up! 🎉",
        message: `You reached Level ${newLevel.level} - ${newLevel.title}!`,
      });
    }

    // Check badges
    await this.checkAndAwardBadges(userId, workspaceId, gamification);

    return gamification;
  }

  // Update streak
  async updateStreak(userId: string, workspaceId: string) {
    const gamification = await Gamification.findOne({
      user: userId,
      workspace: workspaceId,
    });

    if (!gamification) return;

    const today = new Date();
    const lastActive = gamification.stats.lastActiveDate;
    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day
      gamification.stats.streakDays += 1;
      if (gamification.stats.streakDays > gamification.stats.longestStreak) {
        gamification.stats.longestStreak = gamification.stats.streakDays;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      gamification.stats.streakDays = 1;
    }

    gamification.stats.lastActiveDate = today;
    await gamification.save();
  }

  // Check and award badges
  private async checkAndAwardBadges(
    userId: string,
    workspaceId: string,
    gamification: any
  ) {
    for (const badge of BADGES) {
      const alreadyEarned = gamification.badges.some(
        (b: any) => b.name === badge.name
      );
      if (alreadyEarned) continue;

      const statValue =
        gamification.stats[badge.requirement.stat as keyof typeof gamification.stats];

      if (
        typeof statValue === "number" &&
        statValue >= badge.requirement.value
      ) {
        gamification.badges.push({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: new Date(),
        });

        await Notification.create({
          recipient: userId,
          type: "gamification_achievement",
          title: `Badge Earned: ${badge.icon} ${badge.name}`,
          message: badge.description,
        });
      }
    }

    await gamification.save();
  }

  // Calculate level from XP
  private calculateLevel(xp: number) {
    let currentLevel = XP_LEVELS[0];
    for (const level of XP_LEVELS) {
      if (xp >= level.xpRequired) {
        currentLevel = level;
      }
    }
    return currentLevel;
  }

  // Get all available badges
  async getAvailableBadges() {
    return BADGES;
  }
}

export const gamificationService = new GamificationService();