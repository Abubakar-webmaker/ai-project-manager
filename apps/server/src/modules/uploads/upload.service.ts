// src/modules/uploads/upload.service.ts
import { Task } from "../../models/Task.model";
import { User } from "../../models/User.model";
import {
  uploadToCloudinary,
  uploadAvatarToCloudinary,
  deleteFromCloudinary,
} from "../../shared/utils/upload.util";

export class UploadService {
  // Upload task attachment
  async uploadTaskAttachment(
    taskId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    const task = await Task.findById(taskId);
    if (!task) throw { statusCode: 404, message: "Task not found" };

    const result = await uploadToCloudinary(file.buffer, "attachments");

    task.attachments.push({
      filename: file.originalname,
      url: result.url,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId as any,
      uploadedAt: new Date(),
    });

    await task.save();

    return {
      attachment: task.attachments[task.attachments.length - 1],
      url: result.url,
    };
  }

  // Delete task attachment
  async deleteTaskAttachment(
    taskId: string,
    attachmentId: string,
    userId: string
  ) {
    const task = await Task.findById(taskId);
    if (!task) throw { statusCode: 404, message: "Task not found" };

    const attachment = (task.attachments as any).id(attachmentId);
    if (!attachment) throw { statusCode: 404, message: "Attachment not found" };

    // Extract publicId from Cloudinary URL
    const urlParts = attachment.url.split("/");
    const publicId = urlParts
      .slice(urlParts.indexOf("ai-project-manager"))
      .join("/")
      .replace(/\.[^/.]+$/, "");

    await deleteFromCloudinary(publicId);

    task.attachments = task.attachments.filter(
      (a: any) => a._id.toString() !== attachmentId
    );
    await task.save();
  }

  // Upload avatar
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await uploadAvatarToCloudinary(file.buffer, userId);

    await User.findByIdAndUpdate(userId, { avatar: result.url });

    return { avatar: result.url };
  }

  // Upload multiple files
  async uploadMultipleFiles(
    taskId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    const task = await Task.findById(taskId);
    if (!task) throw { statusCode: 404, message: "Task not found" };

    const uploadedFiles = [];

    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, "attachments");

      const attachment = {
        filename: file.originalname,
        url: result.url,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: userId as any,
        uploadedAt: new Date(),
      };

      task.attachments.push(attachment);
      uploadedFiles.push(attachment);
    }

    await task.save();
    return { attachments: uploadedFiles };
  }
}

export const uploadService = new UploadService();