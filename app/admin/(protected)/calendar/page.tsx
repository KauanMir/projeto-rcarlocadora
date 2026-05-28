import { prisma } from "@/lib/prisma";
import { CalendarClient } from "@/components/admin/CalendarClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();

  const year  = parseInt(params.year  ?? String(now.getFullYear()));
  const month = parseInt(params.month ?? String(now.getMonth() + 1));

  const daysInMonth = new Date(year, month, 0).getDate();

  // Month boundaries (UTC noon to avoid DST issues)
  const firstDay = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  const lastDay  = new Date(Date.UTC(year, month - 1, daysInMonth, 12, 0, 0));

  // Fetch all non-cancelled reservations overlapping this month
  const [reservationRows, vehicleRows] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { not: "CANCELLED" },
        pickupDate: { lte: lastDay },
        returnDate: { gte: firstDay },
      },
      orderBy: { pickupDate: "asc" },
    }),
    prisma.vehicle.findMany({
      orderBy: { dailyRate: "asc" },
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
        category: true,
        available: true,
      },
    }),
  ]);

  // Build per-vehicle reservation lists
  const reservationsByVehicle = new Map<string, typeof reservationRows>(
    vehicleRows.map((v) => [v.id, []])
  );
  for (const r of reservationRows) {
    reservationsByVehicle.get(r.vehicleId)?.push(r);
  }

  const vehicles = vehicleRows.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    name: v.name,
    category: v.category as string,
    available: v.available,
    reservations: (reservationsByVehicle.get(v.id) ?? []).map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      pickupDate: r.pickupDate.toISOString().split("T")[0],
      returnDate: r.returnDate.toISOString().split("T")[0],
      rentalDays: r.rentalDays,
      insuranceType: r.insuranceType as string,
      addons: r.addons,
      subtotal: Number(r.subtotal),
      totalPrice: Number(r.totalPrice),
      status: r.status as string,
      notes: r.notes ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return <CalendarClient vehicles={vehicles} year={year} month={month} />;
}
