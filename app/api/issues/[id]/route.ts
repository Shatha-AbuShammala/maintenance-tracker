// app/api/issues/[id]/route.ts
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import Issue from "@/models/Issue";
import { getAuthUser } from "@/utils/auth";
import mongoose from "mongoose";
import { ok, badRequest, notFound, unauthorized, serverError } from "@/utils/response";
import { updateIssueSchema } from "@/utils/validation";
import { logInfo, logError } from "@/utils/logger";


async function resolveParams(maybeParams: any) {
  if (maybeParams && typeof maybeParams.then === "function") {
    return await maybeParams;
  }
  return maybeParams;
}
function getCreatorId(issue: any): string | null {
  if (!issue) return null;
  const cb = issue.createdBy;
  if (!cb) return null;
  if (typeof cb === "object" && (cb as any)._id) return String((cb as any)._id);
  return String(cb);
}

export async function GET(req: NextRequest, context: any) {
  try {
    await connectDb();
    const user = await getAuthUser(req);

    const params = await resolveParams(context?.params);
    const rawId = params?.id;
    const id = typeof rawId === "string" ? rawId.trim() : String(rawId || "").trim();

    // basic hex 24-char ObjectId check
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return badRequest("Invalid ID");

    const issue = await Issue.findById(id).populate("createdBy", "name email");
    if (!issue) return notFound("Issue not found");

    const creatorId = getCreatorId(issue);
    const userId = String((user as any)._id);

    if ((user as any).role !== "admin" && creatorId !== userId)
      return unauthorized("You don't have access to this issue");

    return ok(issue);
  } catch (err: any) {
    logError("GET /api/issues/:id", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed");
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    await connectDb();
    const user = await getAuthUser(req);

    const params = await resolveParams(context?.params);
    const rawId = params?.id;
    const id = typeof rawId === "string" ? rawId.trim() : String(rawId || "").trim();

    if (!/^[0-9a-fA-F]{24}$/.test(id)) return badRequest("Invalid ID");

    const issue = await Issue.findById(id);
    if (!issue) return notFound("Issue not found");

    const body = await req.json();
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) {
      // use issues (stable) to extract messages
      const messages = parsed.error.issues.map((i: any) => i.message);
      return badRequest(messages.join(", "));
    }

    // if trying to change status -> only admin
    if (parsed.data.status && (user as any).role !== "admin")
      return unauthorized("Admin required to change status");

    // if not admin and not owner -> can't modify
    const creatorId = getCreatorId(issue);
    const userId = String((user as any)._id);
    if ((user as any).role !== "admin" && creatorId !== userId)
      return unauthorized("You can't modify this issue");

    Object.assign(issue, parsed.data);
    await issue.save();

    logInfo("Issue updated", { id: issue._id, by: (user as any)._id });
    return ok(issue);
  } catch (err: any) {
    logError("PUT /api/issues/:id", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed to update");
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    await connectDb();
    const user = await getAuthUser(req);

    const params = await resolveParams(context?.params);
    const rawId = params?.id;
    const id = typeof rawId === "string" ? rawId.trim() : String(rawId || "").trim();

    if (!/^[0-9a-fA-F]{24}$/.test(id)) return badRequest("Invalid ID");

    const issue = await Issue.findById(id);
    if (!issue) return notFound("Issue not found");

    if ((user as any).role !== "admin") return unauthorized("Admin required to delete");

    await issue.deleteOne();
    logInfo("Issue deleted", { id, by: (user as any)._id });
    return ok({ message: "Deleted" });
  } catch (err: any) {
    logError("DELETE /api/issues/:id", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed to delete");
  }
}
