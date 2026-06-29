// src/features/workspace/store/workspaceSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/axios";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/workspaces");
      return data.data.workspaces;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaces: [] as any[],
    currentWorkspace: null as any,
    isLoading: false,
  },
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces = action.payload;
    });
    builder.addCase(fetchWorkspaces.rejected, (state) => { state.isLoading = false; });
  },
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;