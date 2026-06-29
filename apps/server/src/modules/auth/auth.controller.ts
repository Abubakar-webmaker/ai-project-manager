// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import { env } from "../../config/env.config";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export class AuthController {
  // POST /api/v1/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.register(req.body);

      res.cookie("accessToken", tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, { user, tokens }, "Registration successful", 201);
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.login(req.body);

      res.cookie("accessToken", tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user, tokens }, "Login successful");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/refresh
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      const tokens = await authService.refreshToken(token);

      res.cookie("accessToken", tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, tokens, "Token refreshed");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/logout
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user._id.toString());

      res.clearCookie("accessToken", COOKIE_OPTIONS);
      res.clearCookie("refreshToken", COOKIE_OPTIONS);

      sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/verify-email?token=xxx
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      await authService.verifyEmail(token);
      sendSuccess(res, null, "Email verified successfully");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, null, "If this email exists, a reset link has been sent");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      sendSuccess(res, null, "Password reset successfully");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // POST /api/v1/auth/google
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.googleAuth(req.body);

      res.cookie("accessToken", tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user, tokens }, "Google authentication successful");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  // GET /api/v1/auth/me
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user._id.toString());
      sendSuccess(res, { user }, "User fetched successfully");
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}

export const authController = new AuthController();