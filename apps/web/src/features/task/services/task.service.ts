// src/features/task/services/task.service.ts
import api from "../../../lib/axios";

export const taskService = {
  getAll: (projectId: string, filters?: any) =>
    api.get(`/projects/${projectId}/tasks`, { params: filters }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  getMyTasks: () => api.get("/tasks/my"),
  create: (projectId: string, data: any) =>
    api.post(`/projects/${projectId}/tasks`, data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  move: (id: string, data: any) => api.patch(`/tasks/${id}/move`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addSubtask: (id: string, title: string) =>
    api.post(`/tasks/${id}/subtasks`, { title }),
  toggleSubtask: (id: string, subtaskId: string) =>
    api.patch(`/tasks/${id}/subtasks/${subtaskId}/toggle`),
  addChecklist: (id: string, title: string) =>
    api.post(`/tasks/${id}/checklists`, { title }),
  addChecklistItem: (id: string, checklistId: string, text: string) =>
    api.post(`/tasks/${id}/checklists/${checklistId}/items`, { text }),
  toggleChecklistItem: (id: string, checklistId: string, itemId: string) =>
    api.patch(`/tasks/${id}/checklists/${checklistId}/items/${itemId}/toggle`),
  startTracking: (id: string) => api.post(`/tasks/${id}/time/start`),
  stopTracking: (id: string) => api.post(`/tasks/${id}/time/stop`),
  uploadAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/uploads/tasks/${id}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};