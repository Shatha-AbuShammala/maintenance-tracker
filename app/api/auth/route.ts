import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
  await connectDb();
  // placeholder for register/login logic
  return NextResponse.json({ success: true, message: "Auth skeleton ready" });
}
