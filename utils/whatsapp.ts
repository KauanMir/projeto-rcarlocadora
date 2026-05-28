import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon } from "@/types/booking";
import { formatPrice, formatDateShort } from "@/utils/format";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999";

interface WhatsAppMessageParams {
  vehicle: Vehicle;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  insurance: InsuranceOption | null;
  addons: Addon[];
  totalPrice: number;
  reservationId?: string;
}

export function buildWhatsAppUrl(params: WhatsAppMessageParams): string {
  const { vehicle, pickupDate, returnDate, rentalDays, insurance, addons, totalPrice, reservationId } = params;

  const addonLines =
    addons.length > 0 ? addons.map((a) => `  • ${a.name}`).join("\n") : "  Nenhum";

  const refLine = reservationId
    ? `*Referência:* #RCAR-${reservationId.slice(-6).toUpperCase()}`
    : null;

  const message = [
    "🚗 *Reserva RCAR*",
    ...(refLine ? [refLine] : []),
    "",
    `*Veículo:* ${vehicle.brand} ${vehicle.name}`,
    `*Retirada:* ${formatDateShort(pickupDate)}`,
    `*Devolução:* ${formatDateShort(returnDate)}`,
    `*Dias:* ${rentalDays} dia${rentalDays > 1 ? "s" : ""}`,
    "",
    `*Cobertura:* ${insurance?.name ?? "Não selecionada"}`,
    "*Adicionais:*",
    addonLines,
    "",
    `*Total:* ${formatPrice(totalPrice)}`,
    "",
    "Aguardo confirmação. Obrigado!",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
