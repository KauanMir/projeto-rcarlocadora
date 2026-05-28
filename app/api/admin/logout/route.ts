import { NextResponse } from "next/server";
import { deleteAdminCookie } from "@/lib/admin-auth";

export async function POST() {
  await deleteAdminCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}
