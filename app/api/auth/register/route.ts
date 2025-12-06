// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/utils/validation";
import { generateToken } from "@/utils/auth";
import { created, badRequest, serverError } from "@/utils/response";
import { logInfo, logError } from "@/utils/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
if (!parsed.success) {
  const messages = parsed.error.issues.map(issue => issue.message);
  return badRequest(messages.join(", "));
}
    const { name, email, password, role } = parsed.data;
    const exists = await User.findOne({ email });
    if (exists) return badRequest("Email already registered");

    const user = await User.create({ name, email, password, role: role || "citizen" });
    const token = generateToken(user);
    logInfo("user registered", { email: user.email, role: user.role });
    return created({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err: any) {
    logError("register error", err);
    return serverError(err.message || "Registration failed");
  }
}
