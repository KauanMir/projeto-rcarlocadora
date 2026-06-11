import { prisma } from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/CouponsClient";
import type { AdminCoupon } from "@/components/admin/CouponsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cupons" };

export default async function CouponsPage() {
  const rows = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const coupons: AdminCoupon[] = rows.map((c) => ({
    id:             c.id,
    code:           c.code,
    type:           c.type as "PERCENTAGE" | "FIXED",
    value:          Number(c.value),
    active:         c.active,
    expiresAt:      c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
    minRentalDays:  c.minRentalDays,
    maxUses:        c.maxUses,
    currentUses:    c.currentUses,
    categoryFilter: c.categoryFilter,
    createdAt:      c.createdAt.toISOString(),
  }));

  return <CouponsClient coupons={coupons} />;
}
