// src/app/App.tsx
import { useEffect } from "react";
import { AppRouter } from "./Router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getMe } from "../features/auth/store/authSlice";
import { useTheme } from "../hooks/useTheme";
import { useSocket } from "../hooks/useSocket";

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  useTheme();
  useSocket();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMe());
    }
  }, [isAuthenticated, dispatch]);

  return <AppRouter />;
};

export default AppContent;