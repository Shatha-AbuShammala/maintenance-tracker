// app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { getAuthUser } from "@/utils/auth";
import { ok, unauthorized, serverError } from "@/utils/response";
import { logError } from "@/utils/logger";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const user = await getAuthUser(req);
    return ok({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    logError("me error", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed");
  }
}
