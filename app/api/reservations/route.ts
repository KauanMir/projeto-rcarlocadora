import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReservation, VehicleUnavailableError, VehicleNotFoundError } from "@/services/reservation";
import { calcRentalDays, MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "@/utils/dates";

const schema = z.object({
  vehicleId: z.string().min(1),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  insuranceType: z.enum(["basic", "intermediate", "premium"]),
  addons: z.array(z.string()),
  subtotal: z.number().positive(),
  totalPrice: z.number().positive(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(8).max(20),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", code: "VALIDATION_ERROR", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Always calculate server-side — never trust client-provided rentalDays
    const rentalDays = calcRentalDays(parsed.data.pickupDate, parsed.data.returnDate);

    if (rentalDays < MIN_RENTAL_DAYS || rentalDays > MAX_RENTAL_DAYS) {
      return NextResponse.json(
        { error: `Período inválido. Mínimo ${MIN_RENTAL_DAYS} dia, máximo ${MAX_RENTAL_DAYS} dias.`, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const reservation = await createReservation({ ...parsed.data, rentalDays });

    return NextResponse.json(
      {
        id: reservation.id,
        vehicleId: reservation.vehicleId,
        status: reservation.status,
        totalPrice: Number(reservation.totalPrice),
        createdAt: reservation.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof VehicleUnavailableError) {
      return NextResponse.json(
        { error: error.message, code: "VEHICLE_UNAVAILABLE" },
        { status: 409 }
      );
    }
    if (error instanceof VehicleNotFoundError) {
      return NextResponse.json(
        { error: error.message, code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[POST /api/reservations]", error);
    return NextResponse.json(
      { error: "Erro ao criar reserva.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
