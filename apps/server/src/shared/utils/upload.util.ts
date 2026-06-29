// src/shared/utils/upload.util.ts
import { cloudinary } from "../../config/cloudinary.config";
import { Readable } from "stream";

export interface UploadResult {
  url: string;
  publicId: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ai-project-manager/${folder}`,
        resource_type: resourceType,
        transformation:
          resourceType === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: result.original_filename || result.public_id,
          fileType: result.resource_type,
          fileSize: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const uploadAvatarToCloudinary = (
  buffer: Buffer,
  userId: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ai-project-manager/avatars`,
        public_id: `avatar_${userId}`,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: `avatar_${userId}`,
          fileType: "image",
          fileSize: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};