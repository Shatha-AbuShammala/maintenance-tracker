import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { User, Issue } from "@/models";
import { getAuthUser, requireAdmin } from "@/utils/auth";
import { ok, unauthorized, forbidden, serverError } from "@/utils/response";
import { logError } from "@/utils/logger";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authUser = await getAuthUser(req);
    requireAdmin(authUser);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(url.searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    type LeanUser = { _id: string; name?: string; email: string; role?: string };
    const users = await User.find({}, "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanUser[]>();

    const userIds = users.map((u) => u._id);
    const issueCounts = await Issue.aggregate([
      { $match: { createdBy: { $in: userIds } } },
      { $group: { _id: "$createdBy", issuesCount: { $sum: 1 } } },
    ]);
    const countMap = issueCounts.reduce<Record<string, number>>((acc, curr) => {
      if (curr._id) acc[String(curr._id)] = curr.issuesCount || 0;
      return acc;
    }, {});

    const items = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: (u as any).role,
      issuesCount: countMap[u._id.toString()] ?? 0,
    }));

    return ok({ items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    logError("GET /api/users", err);
    if ((err as any).code === 401) return unauthorized(err.message);
    if ((err as any).code === 403) return forbidden(err.message);
    return serverError(err.message || "Failed to fetch users");
  }
}
