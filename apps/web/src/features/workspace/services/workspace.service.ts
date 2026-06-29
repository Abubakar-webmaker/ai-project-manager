// src/features/workspace/services/workspace.service.ts
import api from "../../../lib/axios";

export const workspaceService = {
  getAll: () => api.get("/workspaces"),
  getOne: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: any) => api.post("/workspaces", data),
  update: (id: string, data: any) => api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  inviteMember: (id: string, data: any) => api.post(`/workspaces/${id}/members`, data),
  removeMember: (id: string, memberId: string) => api.delete(`/workspaces/${id}/members/${memberId}`),
  getMembers: (id: string) => api.get(`/workspaces/${id}/members`),
  getActivity: (id: string) => api.get(`/workspaces/${id}/activity`),
  leave: (id: string) => api.delete(`/workspaces/${id}/leave`),
};