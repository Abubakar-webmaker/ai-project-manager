// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";
import workspaceReducer from "../features/workspace/store/workspaceSlice";
import projectReducer from "../features/project/store/projectSlice";
import taskReducer from "../features/task/store/taskSlice";
import notificationReducer from "../features/notifications/store/notificationSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
    notification: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;