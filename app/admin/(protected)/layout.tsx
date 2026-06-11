import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — RCAR", template: "%s | Admin RCAR" },
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen text-white" style={{ background: "var(--ink)" }}>
      <AdminSidebar />
      {/* 232px matches design export sidebar width */}
      <div className="lg:pl-[232px] min-h-screen pb-24 lg:pb-0">
        <AdminTopbar />
        <main style={{ padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
