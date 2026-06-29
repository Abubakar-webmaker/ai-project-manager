// src/store/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  activeModal: string | null;
  isGlobalLoading: boolean;
}

const initialState: UIState = {
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  sidebarCollapsed: false,
  activeModal: null,
  isGlobalLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      document.documentElement.classList.toggle("dark", action.payload === "dark");
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setActiveModal, setGlobalLoading } =
  uiSlice.actions;
export default uiSlice.reducer;