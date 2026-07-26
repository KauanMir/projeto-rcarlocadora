import { Suspense } from "react";
import { BookingPageClient } from "@/components/booking/BookingPageClient";
import { CatalogModeNotice } from "@/components/booking/CatalogModeNotice";
import { BOOKING_ENABLED } from "@/lib/feature-flags";
import { getAdminSession } from "@/lib/admin-auth";

import type { Metadata } from "next";

export const metadata: Metadata = BOOKING_ENABLED
  ? {
      title: "Reservar Veículo",
      description:
        "Reserve seu veículo online em poucos passos. Escolha datas, modelo, cobertura e adicionais. Finalize pelo WhatsApp em minutos.",
      robots: { index: false, follow: false },
    }
  : {
      title: "Cotação de Veículo",
      description: "Solicite uma cotação personalizada pelo WhatsApp.",
      robots: { index: false, follow: false },
    };

export default async function BookingPage() {
  // Catalog mode blocks the public customer flow, but a logged-in admin can
  // still use this same wizard to enter a manual/phone reservation — the
  // system has no separate admin-side reservation form.
  if (!BOOKING_ENABLED && !(await getAdminSession())) {
    return <CatalogModeNotice />;
  }

  return (
    <Suspense>
      <BookingPageClient />
    </Suspense>
  );
}
