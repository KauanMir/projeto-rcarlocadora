import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon } from "@/types/booking";
import { formatPrice, formatDateShort } from "@/utils/format";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556199959334";

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

const GENERAL_QUOTE_MESSAGE =
  "Olá! Acessei o site da RCAR Locadora e gostaria de consultar a disponibilidade dos veículos e solicitar uma cotação.";

/** Generic "request a quote" link used by public CTAs when direct booking is disabled. */
export function buildGeneralWhatsAppUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(GENERAL_QUOTE_MESSAGE)}`;
}

/** Per-vehicle "request a quote" link — used by catalog cards when direct booking is disabled. */
export function buildVehicleQuoteWhatsAppUrl(vehicleName: string): string {
  const message = `Olá! Vi o ${vehicleName} no site da RCAR Locadora e gostaria de consultar a disponibilidade e receber uma cotação.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
