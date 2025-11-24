// utils/response.ts
import { NextResponse } from "next/server";

export function ok(data: any, status = 200) { return NextResponse.json({ success: true, data }, { status }); }
export function created(data: any) { return NextResponse.json({ success: true, data }, { status: 201 }); }
export function badRequest(msg = "Bad request") { return NextResponse.json({ success: false, error: msg }, { status: 400 }); }
export function unauthorized(msg = "Unauthorized") { return NextResponse.json({ success: false, error: msg }, { status: 401 }); }
export function forbidden(msg = "Forbidden") { return NextResponse.json({ success: false, error: msg }, { status: 403 }); }
export function notFound(msg = "Not found") { return NextResponse.json({ success: false, error: msg }, { status: 404 }); }
export function serverError(msg = "Server error") { return NextResponse.json({ success: false, error: msg }, { status: 500 }); }
