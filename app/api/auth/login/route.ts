// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/utils/validation";
import { generateToken } from "@/utils/auth";
import { ok, badRequest, serverError } from "@/utils/response";
import { logInfo, logError } from "@/utils/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
if (!parsed.success) {
  const messages = parsed.error.issues.map(issue => issue.message);
  return badRequest(messages.join(", "));
}
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return badRequest("Invalid credentials");
    const match = await (user as any).comparePassword(password);
    if (!match) return badRequest("Invalid credentials");

    const token = generateToken(user);
    logInfo("user login", { email: user.email });
    return ok({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err: any) {
    logError("login error", err);
    return serverError(err.message || "Login failed");
  }
}
