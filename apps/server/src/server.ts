// src/server.ts — update karo
import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDatabase } from "./config/database.config";
import { env } from "./config/env.config";
import { initializeSocket } from "./config/socket.config";
import { initializeSocketManager } from "./socket/socket.manager";
import { initializeCronJobs } from "./shared/utils/cron.util";

// Database connect hone ke baad add karo
initializeCronJobs();

const PORT = parseInt(env.PORT) || 5000;

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);

  // Initialize Socket.io
  const io = initializeSocket(server);
  initializeSocketManager(io);
  console.log("✅ Socket.io initialized");

  server.listen(PORT, () => {
    console.log(`
🚀 Server running in ${env.NODE_ENV} mode
📡 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
⚡ Socket.io: enabled
❤️  Health: http://localhost:${PORT}/health
    `);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      process.exit(0);
    });
  });
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});