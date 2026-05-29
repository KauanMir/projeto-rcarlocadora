import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon } from "@/types/booking";

export const SITE_NAME = "RCAR";
export const SITE_TAGLINE = "Aluguel de Veículos em Gama-DF.";

export const NAV_LINKS = [
  { label: "Frota", href: "#frota" },
  { label: "Vantagens", href: "#vantagens" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Contato", href: "#contato" },
];

export const MOCKED_VEHICLES: Vehicle[] = [
  {
    id: "1",
    name: "HB20 Sense",
    brand: "Hyundai",
    model: "HB20",
    year: 2024,
    category: "economy",
    pricePerDay: 89,
    image: "/images/vehicles/hb20.png",
    specs: {
      seats: 5,
      doors: 4,
      fuel: "flex",
      transmission: "manual",
      airConditioning: true,
    },
    tags: ["Econômico", "Mais Alugado"],
    available: true,
  },
  {
    id: "2",
    name: "Onix Plus",
    brand: "Chevrolet",
    model: "Onix",
    year: 2024,
    category: "economy",
    pricePerDay: 99,
    image: "/images/vehicles/onix.png",
    specs: {
      seats: 5,
      doors: 4,
      fuel: "flex",
      transmission: "automatic",
      airConditioning: true,
    },
    tags: ["Automático", "Popular"],
    available: true,
  },
  {
    id: "3",
    name: "Corolla XEi",
    brand: "Toyota",
    model: "Corolla",
    year: 2024,
    category: "sedan",
    pricePerDay: 189,
    image: "/images/vehicles/corolla.png",
    specs: {
      seats: 5,
      doors: 4,
      fuel: "hybrid",
      transmission: "automatic",
      airConditioning: true,
    },
    tags: ["Híbrido", "Premium"],
    available: true,
  },
  {
    id: "4",
    name: "Compass Limited",
    brand: "Jeep",
    model: "Compass",
    year: 2024,
    category: "suv",
    pricePerDay: 249,
    image: "/images/vehicles/compass.png",
    specs: {
      seats: 5,
      doors: 4,
      fuel: "flex",
      transmission: "automatic",
      airConditioning: true,
    },
    tags: ["SUV", "Destaque"],
    available: true,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  economy: "Econômico",
  sedan: "Sedan",
  suv: "SUV",
  premium: "Premium",
};

export const FUEL_LABELS: Record<string, string> = {
  flex: "Flex",
  gasoline: "Gasolina",
  electric: "Elétrico",
  hybrid: "Híbrido",
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
