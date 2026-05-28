import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { signAdminToken, setAdminCookie } from "@/lib/admin-auth";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
    if (!adminPassword) {
      console.error("[admin/login] ADMIN_PASSWORD is not configured");
      return NextResponse.json({ error: "Servidor não configurado." }, { status: 500 });
    }

    const inputPassword = parsed.data.password.trim();

    // Constant-time comparison to prevent timing attacks
    const inputBuf = Buffer.from(inputPassword);
    const validBuf = Buffer.from(adminPassword);
    const match =
      inputBuf.length === validBuf.length &&
      crypto.timingSafeEqual(inputBuf, validBuf);

    if (!match) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    const token = await signAdminToken();
    await setAdminCookie(token);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/admin/login]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
