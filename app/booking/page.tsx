import { Suspense } from "react";
import { BookingPageClient } from "@/components/booking/BookingPageClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Veículo",
  description:
    "Reserve seu veículo online em poucos passos. Escolha datas, modelo, cobertura e adicionais. Finalize pelo WhatsApp em minutos.",
  robots: { index: false, follow: false },
};

export default function BookingPage() {
  return (
    <Suspense>
      <BookingPageClient />
    </Suspense>
  );
}
