// src/features/project/services/project.service.ts
import api from "../../../lib/axios";

export const projectService = {
  getAll: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/projects`),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (workspaceId: string, data: any) => api.post(`/workspaces/${workspaceId}/projects`, data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, data: any) => api.post(`/projects/${id}/members`, data),
  removeMember: (id: string, memberId: string) => api.delete(`/projects/${id}/members/${memberId}`),
  getAnalytics: (id: string) => api.get(`/projects/${id}/analytics`),
};