// src/features/project/store/projectSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/axios";

export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
      return data.data.projects;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [] as any[],
    currentProject: null as any,
    isLoading: false,
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.isLoading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state) => { state.isLoading = false; });
  },
});

export const { setCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;