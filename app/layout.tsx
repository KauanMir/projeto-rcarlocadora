import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// ── Viewport (separate export required by Next.js 14+) ────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080808",
};

// ── Metadata ──────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://rcar.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "RCAR — Locadora de Veículos em Gama, DF",
    template: "%s | RCAR",
  },

  description:
    "Aluguel de veículos em Gama e Brasília. Frota moderna, HB20, Onix, Corolla e Compass. Preços transparentes, reserva online em minutos e retirada rápida.",

  keywords: [
    "locadora de veículos Gama DF",
    "aluguel de carro Gama",
    "aluguel carro Brasília",
    "locadora Gama Brasília",
    "aluguel carro barato Gama DF",
    "RCAR locadora",
    "aluguel HB20 Gama",
    "aluguel SUV Brasília",
  ],

  authors: [{ name: "RCAR" }],
  creator: "RCAR",
  publisher: "RCAR",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "RCAR",
    title: "RCAR — Locadora de Veículos em Gama, DF",
    description:
      "Aluguel de veículos em Gama e Brasília. Frota moderna, preços transparentes e reserva online em minutos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RCAR — Locadora de Veículos em Gama, DF",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RCAR — Locadora de Veículos em Gama, DF",
    description:
      "Aluguel de veículos em Gama e Brasília. Frota moderna, preços transparentes.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: BASE_URL,
  },
};

// ── JSON-LD local business structured data ─────────────────────

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": BASE_URL,
  name: "RCAR — Locadora de Veículos",
  description:
    "Locadora de veículos em Gama, Brasília e região. Frota moderna com preços transparentes.",
  url: BASE_URL,
  telephone: "+55 61 9 9999-9999",
  priceRange: "R$ 89 - R$ 249/dia",
  currenciesAccepted: "BRL",
  paymentAccepted: "Cartão de crédito, Cartão de débito, PIX",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gama",
    addressRegion: "DF",
    postalCode: "72400-000",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -16.0018,
    longitude: -48.0611,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "13:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Frota RCAR",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Hyundai HB20" }, price: "89", priceCurrency: "BRL" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chevrolet Onix" }, price: "99", priceCurrency: "BRL" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Toyota Corolla" }, price: "189", priceCurrency: "BRL" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Jeep Compass" }, price: "249", priceCurrency: "BRL" },
    ],
  },
};

// ── Root layout ───────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm focus:font-semibold"
        >
          Ir para o conteúdo
        </a>
        <div id="main-content">{children}</div>
        <ToastProvider />
      </body>
    </html>
  );
}
