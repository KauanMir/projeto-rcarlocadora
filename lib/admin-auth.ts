import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 8;

function secret(): Uint8Array {
  const value = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!value) console.error("[admin-auth] ADMIN_SESSION_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function signAdminToken(): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000);
  return new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.isAdmin === true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function deleteAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Use in Server Components / layouts to gate access. */
export async function requireAdmin(): Promise<void> {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");
}
