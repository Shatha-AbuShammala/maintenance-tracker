// app/api/issues/route.ts
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import Issue from "@/models/Issue";
import { getAuthUser } from "@/utils/auth";
import { createIssueSchema } from "@/utils/validation";
import { ok, created, badRequest, unauthorized, serverError } from "@/utils/response";
import { logInfo, logError } from "@/utils/logger";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const user = await getAuthUser(req);
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(url.searchParams.get("limit") || process.env.PAGE_LIMIT_DEFAULT || "10"));
    const status = url.searchParams.get("status") || undefined;
    const area = url.searchParams.get("area") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const filter: any = {};
    if (status) filter.status = status;
    if (area) filter.area = area;
    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];

    // ownership: citizen sees own only
    if ((user as any).role !== "admin") filter.createdBy = (user as any)._id;

    const total = await Issue.countDocuments(filter);
    const items = await Issue.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return ok({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, items });
  } catch (err: any) {
    logError("GET /api/issues", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed to fetch issues");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const user = await getAuthUser(req);
    const body = await req.json();
    const parsed = createIssueSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues.map(issue => issue.message).join(", "));

    const doc = await Issue.create({ ...parsed.data, createdBy: (user as any)._id, status: "Pending" });
    logInfo("Issue created", { id: doc._id, by: (user as any)._id });
    return created(doc);
  } catch (err: any) {
    logError("POST /api/issues", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    return serverError(err.message || "Failed to create issue");
  }
}
