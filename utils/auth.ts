// utils/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { logError } from "@/utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export function generateToken(user: { _id: any; role: string }) {
  return jwt.sign({ id: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader) {
    const e = new Error("No token");
    (e as any).code = 401; throw e;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    const e = new Error("No token");
    (e as any).code = 401; throw e;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      const e = new Error("User not found");
      (e as any).code = 401; throw e;
    }
    return user;
  } catch (err) {
    logError("getAuthUser failed", err);
    const e = new Error("Invalid token");
    (e as any).code = 401; throw e;
  }
}

export function requireAdmin(user: any) {
  if (!user || user.role !== "admin") {
    const e = new Error("Admin access required");
    (e as any).code = 403; throw e;
  }
}
