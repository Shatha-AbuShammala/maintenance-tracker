import { NextRequest } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { connectDb } from "@/lib/db";
import { getAuthUser } from "@/utils/auth";
import { badRequest, ok, serverError, unauthorized } from "@/utils/response";
import { logError, logInfo } from "@/utils/logger";

export const runtime = "nodejs";

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL is not configured");
}

cloudinary.config({ cloud_url: process.env.CLOUDINARY_URL });

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    await getAuthUser(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return badRequest("No file provided");
    }

    if (!file.type?.startsWith("image/")) {
      return badRequest("Only image uploads are allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "issues" },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      );

      stream.end(buffer);
    });

    logInfo("Image uploaded", { publicId: uploadResult.public_id });

    return ok({ url: uploadResult.secure_url, publicId: uploadResult.public_id });
  } catch (err: any) {
    logError("POST /api/uploads", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed to upload image");
  }
}
