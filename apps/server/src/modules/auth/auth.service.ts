// src/modules/auth/auth.service.ts
import crypto from "crypto";
import { User } from "../../models/User.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/token.util";
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "../../shared/utils/email.util";
import { RegisterInput, LoginInput, AuthTokens } from "./auth.types";

export class AuthService {
  // Register
  async register(data: RegisterInput): Promise<{
    user: any;
    tokens: AuthTokens;
  }> {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw { statusCode: 409, message: "Email already registered" };
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      emailVerificationToken,
    });

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - AI Project Manager",
        html: getVerificationEmailTemplate(user.name, emailVerificationToken),
      });
    } catch (error) {
      console.error("Email send failed:", error);
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString());

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.emailVerificationToken;

    return { user: userObj, tokens };
  }

  // Login
  async login(data: LoginInput): Promise<{
    user: any;
    tokens: AuthTokens;
  }> {
    // Find user with password
    const user = await User.findOne({ email: data.email }).select("+password +refreshToken");
    if (!user) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString());

    // Save refresh token & update online status
    user.refreshToken = tokens.refreshToken;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, tokens };
  }

  // Refresh Token
  async refreshToken(token: string): Promise<AuthTokens> {
    if (!token) {
      throw { statusCode: 401, message: "Refresh token required" };
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw { statusCode: 401, message: "Invalid or expired refresh token" };
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      throw { statusCode: 401, message: "Invalid refresh token" };
    }

    const tokens = this.generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return tokens;
  }

  // Logout
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  // Verify Email
  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
    }).select("+emailVerificationToken");

    if (!user) {
      throw { statusCode: 400, message: "Invalid or expired verification token" };
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset - AI Project Manager",
        html: getPasswordResetEmailTemplate(user.name, resetToken),
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw { statusCode: 500, message: "Email could not be sent" };
    }
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw { statusCode: 400, message: "Invalid or expired reset token" };
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }

  // Google OAuth
  async googleAuth(googleData: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<{ user: any; tokens: AuthTokens }> {
    let user = await User.findOne({
      $or: [{ googleId: googleData.googleId }, { email: googleData.email }],
    });

    if (user) {
      // Update google info if needed
      if (!user.googleId) {
        user.googleId = googleData.googleId;
        user.isEmailVerified = true;
      }
      user.isOnline = true;
      user.lastSeen = new Date();
    } else {
      // Create new user
      user = await User.create({
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.googleId,
        avatar: googleData.avatar,
        isEmailVerified: true,
      });
    }

    const tokens = this.generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, tokens };
  }

  // Get current user
  async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }
    return user;
  }

  // Helper: generate tokens
  private generateTokens(userId: string): AuthTokens {
    return {
      accessToken: generateAccessToken(userId),
      refreshToken: generateRefreshToken(userId),
    };
  }
}

export const authService = new AuthService();