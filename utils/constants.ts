import type { Vehicle, ShowroomCategory } from "@/types/vehicle";
import type { InsuranceOption, Addon } from "@/types/booking";
import { buildGeneralWhatsAppUrl } from "@/utils/whatsapp";

export const SITE_NAME = "RCAR";
export const SITE_TAGLINE = "Aluguel de Veículos em Gama-DF.";

export const WHATSAPP_HREF = buildGeneralWhatsAppUrl();
export const WHATSAPP_DISPLAY_NUMBER = "(61) 9995-9334";
export const INSTAGRAM_HREF = "https://www.instagram.com/rcar.alugueldecarros/";
export const INSTAGRAM_HANDLE = "@rcar.alugueldecarros";

export const NAV_LINKS = [
  { label: "Frota", href: "#frota" },
  { label: "Vantagens", href: "#vantagens" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Contato", href: "#contato" },
];

export const FLEET_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "economy", label: "Econômico" },
  { id: "sedan", label: "Sedan" },
  { id: "suv", label: "SUV" },
  { id: "minivan", label: "Minivan" },
  { id: "pickup", label: "Picape" },
];

export const BENEFITS = [
  { icon: "ShieldCheck", title: "Sem análise de crédito", desc: "Processo simplificado. Sem necessidade de score alto para alugar." },
  { icon: "Wrench", title: "Frota 100% revisada", desc: "Toda a frota passa por revisão completa antes de cada locação." },
  { icon: "Zap", title: "Processo rápido", desc: "Da reserva à retirada em poucas horas. Sem filas, sem espera." },
  { icon: "Tag", title: "Preços acessíveis", desc: "As melhores tarifas do Gama-DF que cabem no seu bolso." },
  { icon: "MapPin", title: "Localização estratégica", desc: "No coração do Gama-DF, fácil acesso e retirada." },
  { icon: "MessageCircle", title: "Atendimento WhatsApp", desc: "Tire dúvidas e feche sua reserva direto pelo WhatsApp." },
] as const;

export const HOW_STEPS = [
  {
    n: "01",
    title: "Escolha seu carro",
    tag: "Passo 01",
    detail: "Navegue pela frota e escolha a categoria ideal para o seu trajeto.",
    icon: "Car",
  },
  {
    n: "02",
    title: "Personalize a reserva",
    tag: "Passo 02",
    detail: "Datas, cobertura e adicionais com preço em tempo real, sem surpresas.",
    icon: "Sliders",
  },
  {
    n: "03",
    title: "Finalize no WhatsApp",
    tag: "Passo 03",
    detail: "Confirme com nosso time, retire na loja do Gama-DF e boa viagem.",
    icon: "MessageCircle",
  },
] as const;

export const TESTIMONIALS = [
  { name: "Roberto S.", initial: "R", text: "Aluguei um Onix para viagem em família. Processo super rápido, carro impecável e atendimento nota 10!", rating: 5, date: "há 2 semanas" },
  { name: "Amanda L.", initial: "A", text: "Melhor locadora do Gama! Preço justo, sem burocracia e o carro sempre limpo e revisado. Recomendo demais.", rating: 5, date: "há 1 mês" },
  { name: "Carlos M.", initial: "C", text: "Precisei de um Hilux de última hora e a RCAR resolveu em minutos pelo WhatsApp. Excepcional!", rating: 5, date: "há 3 dias" },
  { name: "Juliana P.", initial: "J", text: "Atendimento humano e ágil. Fechei tudo pelo celular e retirei no mesmo dia. Voltarei com certeza.", rating: 5, date: "há 2 meses" },
];

export const HERO_STATS = [
  { value: "500+", label: "Clientes atendidos", star: false },
  { value: "50+", label: "Veículos na frota", star: false },
  { value: "4.9", label: "Avaliação Google", star: true },
  { value: "5min", label: "Para reservar", star: false },
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
    seats: 5,
    fuel: "Flex",
    transmission: "Manual",
  },
  {
    id: "economico-especial",
    name: "Econômico Especial",
    pricePerDay: 130,
    models: ["Onix", "HB20", "Gol", "KA", "Polo", "Argo"],
    image: "/vehicles/argo.png",
    tag: "Mais Alugado",
    dbCategory: "economy",
    seats: 5,
    fuel: "Flex",
    transmission: "Manual",
  },
  {
    id: "intermediario-sedan",
    name: "Intermediário Sedan",
    pricePerDay: 135,
    models: ["Cronos", "Virtus", "Onix Sedan", "HB20S"],
    image: "/vehicles/onix_lt_sedan01.png",
    dbCategory: "sedan",
    seats: 5,
    fuel: "Flex",
    transmission: "Manual",
  },
  {
    id: "intermediario-automatico",
    name: "Intermediário Automático",
    pricePerDay: 150,
    models: ["Peugeot 208", "Logan 1.6", "Ford KA"],
    image: "/vehicles/pegeout_208_hatch01.png",
    dbCategory: "sedan",
    seats: 5,
    fuel: "Flex",
    transmission: "Automático",
  },
  {
    id: "suv-especial",
    name: "SUV Especial",
    pricePerDay: 300,
    models: ["Tracker Turbo"],
    image: "/vehicles/tracker.png",
    tag: "Destaque",
    dbCategory: "suv",
    seats: 5,
    fuel: "Flex",
    transmission: "Automático",
  },
  {
    id: "suv-elite",
    name: "SUV Elite",
    pricePerDay: 300,
    models: ["Pulse", "Creta"],
    image: "/vehicles/pulse.png",
    dbCategory: "suv",
    seats: 5,
    fuel: "Flex",
    transmission: "Automático",
    imageScale: 1.15,
  },
  {
    id: "minivan-automatica",
    name: "Mini Van Automática",
    pricePerDay: 300,
    models: ["Spin Automática"],
    image: "/vehicles/spin.png",
    dbCategory: "minivan",
    seats: 7,
    fuel: "Flex",
    transmission: "Automático",
  },
  {
    id: "picape-luxo",
    name: "Picape Luxo",
    pricePerDay: 350,
    models: ["Toro 4x4", "Amarok", "Montana"],
    image: "/vehicles/toro.png",
    dbCategory: "pickup",
    seats: 5,
    fuel: "Diesel",
    transmission: "Automático",
  },
  {
    id: "picape-especial",
    name: "Picape Especial",
    pricePerDay: 480,
    models: ["S10", "Hilux Diesel 4x4"],
    image: "/vehicles/hilux-diesiel-4x4.png",
    tag: "Premium",
    dbCategory: "pickup",
    seats: 5,
    fuel: "Diesel",
    transmission: "Automático",
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
    icon: "MapPinned",
  },
  {
    id: "baby-seat",
    name: "Cadeirinha Infantil",
    description: "Certificada pelo Inmetro, até 25kg",
    pricePerDay: 20,
    icon: "Baby",
  },
  {
    id: "extra-driver",
    name: "Condutor Adicional",
    description: "Adicione mais um condutor habilitado",
    pricePerDay: 30,
    icon: "UserRoundPlus",
  },
  {
    id: "wifi",
    name: "Wi-Fi Portátil",
    description: "Internet 4G ilimitada durante o período",
    pricePerDay: 15,
    icon: "Wifi",
  },
];
