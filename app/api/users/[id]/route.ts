import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { User, Issue } from "@/models";
import { getAuthUser, requireAdmin } from "@/utils/auth";
import { badRequest, unauthorized, forbidden, notFound, serverError } from "@/utils/response";
import { logError } from "@/utils/logger";

type Params = { params: { id?: string } };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDb();
    const authUser = await getAuthUser(req);
    requireAdmin(authUser);

    const url = new URL(req.url);
    const paramId = params?.id;
    const pathId = url.pathname.split("/").filter(Boolean).pop();
    const userId = paramId || pathId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return badRequest("Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) return notFound("User not found");

    await Issue.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logError("DELETE /api/users/[id]", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    if ((err as any).code === 403) return forbidden(err.message);
    return serverError(err.message || "Failed to delete user");
  }
}
