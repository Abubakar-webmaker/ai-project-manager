// src/features/ai/services/ai.service.ts
import api from "../../../lib/axios";

export const aiService = {
  generateTasks: (data: any) => api.post("/ai/generate-tasks", data),
  planSprint: (data: any) => api.post("/ai/sprint-plan", data),
  suggestPriorities: (projectId: string, taskIds?: string[]) =>
    api.post(`/ai/projects/${projectId}/suggest-priorities`, { taskIds }),
  getProgressReport: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/progress-report`),
  getStandup: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/standup`),
  analyzeRisks: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/risks`),
  estimateTask: (taskId: string) =>
    api.post("/ai/estimate-task", { taskId }),
  reviewCode: (code: string, language: string) =>
    api.post("/ai/review-code", { code, language }),
  processMeetingMinutes: (data: any) =>
    api.post("/ai/meeting-minutes", data),
  analyzeMood: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/mood`),
  predictDeadline: (taskId: string) =>
    api.get(`/ai/tasks/${taskId}/predict-deadline`),
  detectConflicts: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/conflicts`),
  generateClientReport: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/client-report`),
  allocateResources: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/allocate-resources`),
  detectScopeCreep: (projectId: string) =>
    api.get(`/ai/projects/${projectId}/scope-creep`),
};