import type { Vehicle, ShowroomCategory } from "@/types/vehicle";
import type { InsuranceOption, Addon } from "@/types/booking";

export const SITE_NAME = "RCAR";
export const SITE_TAGLINE = "Aluguel de Veículos em Gama-DF.";

export const NAV_LINKS = [
  { label: "Frota", href: "#frota" },
  { label: "Vantagens", href: "#vantagens" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Contato", href: "#contato" },
];

// Veículos em destaque para a landing page (frota real RCAR)
// Representam os 4 principais segmentos de preço: R$100 | R$130 | R$300 | R$480
export const MOCKED_VEHICLES: Vehicle[] = [
  {
    id: "1",
    name: "Kwid 1.0",
    brand: "Renault",
    model: "Kwid",
    year: 2024,
    category: "economy",
    pricePerDay: 100,
    image: "/vehicles/kwid01.png",
    specs: { seats: 5, doors: 4, fuel: "flex", transmission: "manual", airConditioning: true },
    tags: ["Compacto", "Econômico"],
    available: true,
  },
  {
    id: "2",
    name: "HB20 1.0",
    brand: "Hyundai",
    model: "HB20",
    year: 2024,
    category: "economy",
    pricePerDay: 130,
    image: null,
    specs: { seats: 5, doors: 4, fuel: "flex", transmission: "manual", airConditioning: true },
    tags: ["Mais Alugado", "Econômico"],
    available: true,
  },
  {
    id: "3",
    name: "Tracker Turbo",
    brand: "Chevrolet",
    model: "Tracker",
    year: 2024,
    category: "suv",
    pricePerDay: 300,
    image: "/vehicles/tracker.png",
    specs: { seats: 5, doors: 4, fuel: "flex", transmission: "automatic", airConditioning: true },
    tags: ["SUV", "Turbo"],
    available: true,
  },
  {
    id: "4",
    name: "Hilux SRV 4x4",
    brand: "Toyota",
    model: "Hilux",
    year: 2024,
    category: "pickup",
    pricePerDay: 480,
    image: "/vehicles/hilux-diesiel-4x4.png",
    specs: { seats: 5, doors: 4, fuel: "diesel", transmission: "automatic", airConditioning: true },
    tags: ["Diesel", "4x4"],
    available: true,
  },
];

export const SHOWROOM_CATEGORIES: ShowroomCategory[] = [
  {
    id: "economico-compacto",
    name: "Econômico Compacto",
    pricePerDay: 100,
    models: ["Kwid", "Mobi", "Uno Attractive"],
    image: "/vehicles/kwid01.png",
    dbCategory: "economy",
  },
  {
    id: "economico-especial",
    name: "Econômico Especial",
    pricePerDay: 130,
    models: ["Onix", "HB20", "Gol", "KA", "Polo", "Argo"],
    image: "/vehicles/argo.png",
    tag: "Mais Alugado",
    dbCategory: "economy",
  },
  {
    id: "intermediario-sedan",
    name: "Intermediário Sedan",
    pricePerDay: 135,
    models: ["Cronos", "Virtus", "Onix Sedan", "HB20S"],
    image: "/vehicles/onix_lt_sedan01.png",
    dbCategory: "sedan",
  },
  {
    id: "intermediario-automatico",
    name: "Intermediário Automático",
    pricePerDay: 150,
    models: ["Peugeot 208", "Logan 1.6", "Ford KA"],
    image: "/vehicles/pegeout_208_hatch01.png",
    dbCategory: "sedan",
  },
  {
    id: "suv-especial",
    name: "SUV Especial",
    pricePerDay: 300,
    models: ["Tracker Turbo"],
    image: "/vehicles/tracker.png",
    dbCategory: "suv",
  },
  {
    id: "suv-elite",
    name: "SUV Elite",
    pricePerDay: 300,
    models: ["Pulse", "Creta"],
    image: null,
    dbCategory: "suv",
  },
  {
    id: "minivan-automatica",
    name: "Mini Van Automática",
    pricePerDay: 300,
    models: ["Spin Automática"],
    image: "/vehicles/spin.png",
    dbCategory: "minivan",
  },
  {
    id: "picape-luxo",
    name: "Picape Luxo",
    pricePerDay: 350,
    models: ["Toro 4x4", "Amarok", "Montana"],
    image: "/vehicles/toro.png",
    dbCategory: "pickup",
  },
  {
    id: "picape-especial",
    name: "Picape Especial",
    pricePerDay: 480,
    models: ["S10", "Hilux Diesel 4x4"],
    image: "/vehicles/hilux-diesiel-4x4.png",
    dbCategory: "pickup",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  economy: "Econômico",
  sedan: "Sedan",
  suv: "SUV",
  premium: "Premium",
  minivan: "Minivan",
  pickup: "Picape",
};

export const FUEL_LABELS: Record<string, string> = {
  flex: "Flex",
  gasoline: "Gasolina",
  electric: "Elétrico",
  hybrid: "Híbrido",
  diesel: "Diesel",
};

export const INSURANCE_OPTIONS: InsuranceOption[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Cobertura mínima obrigatória",
    pricePerDay: 0,
    features: ["Seguro DPVAT", "Responsabilidade civil básica"],
  },
  {
    id: "intermediate",
    name: "Intermediário",
    description: "Proteção parcial contra danos",
    pricePerDay: 25,
    features: ["Tudo do Básico", "Cobertura contra roubo", "Danos parciais ao veículo"],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Cobertura total sem franquia",
    pricePerDay: 50,
    features: ["Tudo do Intermediário", "Cobertura total", "Sem franquia", "Assistência 24h", "Carro reserva"],
  },
];

export const ADDONS: Addon[] = [
  {
    id: "gps",
    name: "GPS Premium",
    description: "Navegação com mapas offline atualizados",
    pricePerDay: 15,
    icon: "🗺️",
  },
  {
    id: "baby-seat",
    name: "Cadeirinha Infantil",
    description: "Certificada pelo Inmetro, até 25kg",
    pricePerDay: 20,
    icon: "👶",
  },
  {
    id: "extra-driver",
    name: "Condutor Adicional",
    description: "Adicione mais um condutor habilitado",
    pricePerDay: 30,
    icon: "🧑‍✈️",
  },
  {
    id: "wifi",
    name: "Wi-Fi Portátil",
    description: "Internet 4G ilimitada durante o período",
    pricePerDay: 15,
    icon: "📶",
  },
];
