import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDb();
  return NextResponse.json({ success: true, message: "GET single issue skeleton" });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDb();
  return NextResponse.json({ success: true, message: "PUT single issue skeleton" });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDb();
  return NextResponse.json({ success: true, message: "DELETE single issue skeleton" });
}
