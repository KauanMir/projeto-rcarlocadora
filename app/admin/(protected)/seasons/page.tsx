import { prisma } from "@/lib/prisma";
import { SeasonsClient } from "@/components/admin/SeasonsClient";
import type { AdminSeason } from "@/components/admin/SeasonsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Temporadas" };

export default async function SeasonsPage() {
  const rows = await prisma.seasonalPricing.findMany({
    orderBy: { startDate: "asc" },
  });

  const seasons: AdminSeason[] = rows.map((s) => ({
    id:         s.id,
    name:       s.name,
    startDate:  s.startDate.toISOString().slice(0, 10),
    endDate:    s.endDate.toISOString().slice(0, 10),
    multiplier: Number(s.multiplier),
    active:     s.active,
    createdAt:  s.createdAt.toISOString(),
  }));

  return <SeasonsClient seasons={seasons} />;
}
