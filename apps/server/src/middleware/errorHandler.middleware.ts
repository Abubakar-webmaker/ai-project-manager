// src/middleware/errorHandler.middleware.ts
import { Request, Response, NextFunction } from "express";
import { sendError } from "../shared/utils/response.util";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ Error: ${message}`, {
    statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  sendError(res, message, statusCode);
};

export const notFound = (req: Request, res: Response) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};