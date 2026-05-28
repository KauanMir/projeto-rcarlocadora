import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — RCAR", template: "%s | Admin RCAR" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <AdminSidebar />

      {/* Content — offset by sidebar on desktop, padded bottom for mobile nav */}
      <main className="lg:pl-56 min-h-screen pb-24 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
