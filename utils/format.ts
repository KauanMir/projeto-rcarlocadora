export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDateShort(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("pt-BR");
}

export function formatDateLong(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
