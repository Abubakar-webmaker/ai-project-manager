// src/middleware/authenticate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../shared/utils/token.util";
import { sendError } from "../shared/utils/response.util";
import { User } from "../models/User.model";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return sendError(res, "Access token required", 401);
    }

    const decoded = verifyAccessToken(token) as { userId: string };
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return sendError(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};