// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { initializeSocket, disconnectSocket } from "../lib/socket";
import { useAppSelector } from "../store/hooks";

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketRef.current = initializeSocket(accessToken);
    }

    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
};