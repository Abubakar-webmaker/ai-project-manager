// src/features/task/store/taskSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Task, KanbanBoard } from "../types/task.types";
import api from "../../../lib/axios";

export const fetchTasks = createAsyncThunk(
  "task/fetchAll",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [] as Task[],
    kanban: null as KanbanBoard | null,
    currentTask: null as Task | null,
    isLoading: false,
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    updateTaskInBoard: (state, action) => {
      const task = action.payload;
      if (state.kanban) {
        Object.keys(state.kanban).forEach((status) => {
          (state.kanban as any)[status] = (state.kanban as any)[status].map(
            (t: Task) => t._id === task._id ? task : t
          );
        });
      }
    },
    addTaskToBoard: (state, action) => {
      const task = action.payload;
      if (state.kanban) {
        (state.kanban as any)[task.status].push(task);
      }
    },
    removeTaskFromBoard: (state, action) => {
      const taskId = action.payload;
      if (state.kanban) {
        Object.keys(state.kanban).forEach((status) => {
          (state.kanban as any)[status] = (state.kanban as any)[status].filter(
            (t: Task) => t._id !== taskId
          );
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload.tasks;
      state.kanban = action.payload.kanban;
    });
    builder.addCase(fetchTasks.rejected, (state) => { state.isLoading = false; });
  },
});

export const { setCurrentTask, updateTaskInBoard, addTaskToBoard, removeTaskFromBoard } =
  taskSlice.actions;
export default taskSlice.reducer;