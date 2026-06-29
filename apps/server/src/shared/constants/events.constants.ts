// src/shared/constants/events.constants.ts
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Rooms
  JOIN_WORKSPACE: "join:workspace",
  LEAVE_WORKSPACE: "leave:workspace",
  JOIN_PROJECT: "join:project",
  LEAVE_PROJECT: "leave:project",
  JOIN_TASK: "join:task",
  LEAVE_TASK: "leave:task",

  // Tasks
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_MOVED: "task:moved",
  TASK_ASSIGNED: "task:assigned",

  // Comments
  COMMENT_ADDED: "comment:added",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",
  COMMENT_REACTION: "comment:reaction",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",

  // Presence
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stop_typing",

  // Chat
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stop_typing",

  // Project
  PROJECT_UPDATED: "project:updated",
  PROJECT_HEALTH_UPDATED: "project:health_updated",
  MEMBER_JOINED: "member:joined",
  MEMBER_LEFT: "member:left",

  // Time Tracker
  TIME_TRACKING_STARTED: "time:started",
  TIME_TRACKING_STOPPED: "time:stopped",

  // Errors
  ERROR: "error",
} as const;