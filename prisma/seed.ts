import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // AVISO: este script apaga TODOS os dados antes de inserir.
  // Execute apenas uma vez, em banco vazio, antes de receber reservas reais.
  console.log("🌱 RCAR — populando frota real...\n");

  // ── Limpar em ordem de FK ────────────────────────────────────
  await prisma.rentalChecklist.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.seasonalPricing.deleteMany();

  // ── Addons ───────────────────────────────────────────────────
  await prisma.addon.createMany({
    data: [
      { slug: "gps",          name: "GPS Premium",       description: "Navegação com mapas offline atualizados", pricePerDay: 15, icon: "🗺️" },
      { slug: "baby-seat",    name: "Cadeirinha Infantil", description: "Certificada pelo Inmetro, até 25 kg",   pricePerDay: 20, icon: "👶" },
      { slug: "extra-driver", name: "Condutor Adicional", description: "Adicione mais um condutor habilitado",   pricePerDay: 30, icon: "🧑‍✈️" },
      { slug: "wifi",         name: "Wi-Fi Portátil",    description: "Internet 4G ilimitada durante o período", pricePerDay: 15, icon: "📶" },
    ],
  });

  // ── Frota real RCAR ──────────────────────────────────────────
  // Preços conforme tabela do site rcaralugueldecarros.com.br
  //
  // ECONOMY  Compacto  R$100  | Manual  | Flex
  // ECONOMY  Especial  R$130  | Manual  | Flex
  // SEDAN    Sedan     R$135  | Manual  | Flex
  // SEDAN    Auto      R$150  | Auto    | Flex
  // SUV      Especial  R$300  | Auto    | Flex
  // SUV      Elite     R$300  | Auto    | Flex
  // MINIVAN            R$300  | Auto    | Flex
  // PICKUP   Luxo      R$350  | Auto    | Diesel/Flex
  // PICKUP   Especial  R$480  | Auto    | Diesel

  await prisma.vehicle.createMany({
    data: [

      // ── ECONÔMICO COMPACTO — R$100/dia ────────────────────────
      {
        name: "Kwid 1.0",
        slug: "renault-kwid-2024",
        brand: "Renault",
        model: "Kwid",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 100.00,
        tags: ["Compacto", "Econômico"],
        available: true,
        featured: true,
      },
      {
        name: "Mobi 1.0",
        slug: "fiat-mobi-2024",
        brand: "Fiat",
        model: "Mobi",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 100.00,
        tags: ["Compacto", "Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "Uno Attractive 1.0",
        slug: "fiat-uno-attractive-2024",
        brand: "Fiat",
        model: "Uno",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 100.00,
        tags: ["Compacto", "Econômico"],
        available: true,
        featured: false,
      },

      // ── ECONÔMICO ESPECIAL — R$130/dia ────────────────────────
      {
        name: "Onix 1.0",
        slug: "chevrolet-onix-2024",
        brand: "Chevrolet",
        model: "Onix",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Popular", "Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "HB20 1.0",
        slug: "hyundai-hb20-2024",
        brand: "Hyundai",
        model: "HB20",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Mais Alugado", "Econômico"],
        available: true,
        featured: true,
      },
      {
        name: "Gol 1.0",
        slug: "volkswagen-gol-2024",
        brand: "Volkswagen",
        model: "Gol",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Popular", "Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "KA 1.0",
        slug: "ford-ka-2024",
        brand: "Ford",
        model: "KA",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "Polo 1.0",
        slug: "volkswagen-polo-2024",
        brand: "Volkswagen",
        model: "Polo",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Popular", "Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "Argo 1.0",
        slug: "fiat-argo-2024",
        brand: "Fiat",
        model: "Argo",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "Logan 1.0",
        slug: "renault-logan-2024",
        brand: "Renault",
        model: "Logan",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Econômico"],
        available: true,
        featured: false,
      },
      {
        name: "Siena 1.0",
        slug: "fiat-siena-2024",
        brand: "Fiat",
        model: "Siena",
        year: 2024,
        category: "ECONOMY",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 130.00,
        tags: ["Econômico"],
        available: true,
        featured: false,
      },

      // ── INTERMEDIÁRIO SEDAN — R$135/dia ───────────────────────
      {
        name: "Cronos 1.3",
        slug: "fiat-cronos-2024",
        brand: "Fiat",
        model: "Cronos",
        year: 2024,
        category: "SEDAN",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 135.00,
        tags: ["Sedan"],
        available: true,
        featured: false,
      },
      {
        name: "Virtus 1.0",
        slug: "volkswagen-virtus-2024",
        brand: "Volkswagen",
        model: "Virtus",
        year: 2024,
        category: "SEDAN",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 135.00,
        tags: ["Sedan", "Conforto"],
        available: true,
        featured: false,
      },
      {
        name: "Onix Plus 1.0",
        slug: "chevrolet-onix-plus-2024",
        brand: "Chevrolet",
        model: "Onix Plus",
        year: 2024,
        category: "SEDAN",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 135.00,
        tags: ["Sedan"],
        available: true,
        featured: false,
      },
      {
        name: "HB20S 1.0",
        slug: "hyundai-hb20s-2024",
        brand: "Hyundai",
        model: "HB20S",
        year: 2024,
        category: "SEDAN",
        transmission: "MANUAL",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 135.00,
        tags: ["Sedan"],
        available: true,
        featured: false,
      },

      // ── INTERMEDIÁRIO AUTOMÁTICO — R$150/dia ──────────────────
      {
        name: "208 1.6 AT",
        slug: "peugeot-208-at-2024",
        brand: "Peugeot",
        model: "208",
        year: 2024,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 150.00,
        tags: ["Automático", "Sedan"],
        available: true,
        featured: false,
      },
      {
        name: "Logan 1.6 AT",
        slug: "renault-logan-at-2024",
        brand: "Renault",
        model: "Logan",
        year: 2024,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 150.00,
        tags: ["Automático", "Sedan"],
        available: true,
        featured: false,
      },
      {
        name: "KA 1.5 AT",
        slug: "ford-ka-at-2024",
        brand: "Ford",
        model: "KA",
        year: 2024,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 150.00,
        tags: ["Automático"],
        available: true,
        featured: false,
      },
      {
        name: "Gol 1.6 AT",
        slug: "volkswagen-gol-at-2024",
        brand: "Volkswagen",
        model: "Gol",
        year: 2024,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 150.00,
        tags: ["Automático"],
        available: true,
        featured: false,
      },

      // ── SUV ESPECIAL — R$300/dia ──────────────────────────────
      {
        name: "Tracker Turbo",
        slug: "chevrolet-tracker-turbo-2024",
        brand: "Chevrolet",
        model: "Tracker",
        year: 2024,
        category: "SUV",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 300.00,
        tags: ["SUV", "Turbo"],
        available: true,
        featured: true,
      },

      // ── SUV ELITE — R$300/dia ─────────────────────────────────
      {
        name: "Pulse 1.3 Turbo",
        slug: "fiat-pulse-2024",
        brand: "Fiat",
        model: "Pulse",
        year: 2024,
        category: "SUV",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 300.00,
        tags: ["SUV", "Turbo"],
        available: true,
        featured: false,
      },
      {
        name: "Creta 1.0 Turbo",
        slug: "hyundai-creta-2024",
        brand: "Hyundai",
        model: "Creta",
        year: 2024,
        category: "SUV",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 300.00,
        tags: ["SUV", "Conforto"],
        available: true,
        featured: false,
      },

      // ── MINI VAN — R$300/dia ──────────────────────────────────
      {
        name: "Spin 7 lugares",
        slug: "chevrolet-spin-7l-2024",
        brand: "Chevrolet",
        model: "Spin",
        year: 2024,
        category: "MINIVAN",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 7,
        doors: 4,
        dailyRate: 300.00,
        tags: ["7 lugares", "Família"],
        available: true,
        featured: false,
      },

      // ── PICAPE LUXO — R$350/dia ───────────────────────────────
      {
        name: "Toro Ranch 4x4",
        slug: "fiat-toro-ranch-4x4-2024",
        brand: "Fiat",
        model: "Toro",
        year: 2024,
        category: "PICKUP",
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        seats: 5,
        doors: 4,
        dailyRate: 350.00,
        tags: ["Picape", "4x4"],
        available: true,
        featured: false,
      },
      {
        name: "Amarok 2.0 TDI",
        slug: "volkswagen-amarok-2024",
        brand: "Volkswagen",
        model: "Amarok",
        year: 2024,
        category: "PICKUP",
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        seats: 5,
        doors: 4,
        dailyRate: 350.00,
        tags: ["Picape", "Diesel"],
        available: true,
        featured: false,
      },
      {
        name: "Montana 1.2 Turbo",
        slug: "chevrolet-montana-2024",
        brand: "Chevrolet",
        model: "Montana",
        year: 2024,
        category: "PICKUP",
        transmission: "AUTOMATIC",
        fuel: "FLEX",
        seats: 5,
        doors: 4,
        dailyRate: 350.00,
        tags: ["Picape"],
        available: true,
        featured: false,
      },

      // ── PICAPE ESPECIAL — R$480/dia ───────────────────────────
      {
        name: "S10 LTZ 4x4",
        slug: "chevrolet-s10-4x4-2024",
        brand: "Chevrolet",
        model: "S10",
        year: 2024,
        category: "PICKUP",
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        seats: 5,
        doors: 4,
        dailyRate: 480.00,
        tags: ["Diesel", "4x4"],
        available: true,
        featured: false,
      },
      {
        name: "Hilux SRV 4x4",
        slug: "toyota-hilux-srv-4x4-2024",
        brand: "Toyota",
        model: "Hilux",
        year: 2024,
        category: "PICKUP",
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        seats: 5,
        doors: 4,
        dailyRate: 480.00,
        tags: ["Diesel", "4x4", "Topo de Linha"],
        available: true,
        featured: true,
      },

    ],
  });

  // ── Sazonalidades ─────────────────────────────────────────────
  const year = new Date().getFullYear();

  await prisma.seasonalPricing.createMany({
    data: [
      {
        name: "Carnaval",
        startDate: new Date(`${year}-02-28T00:00:00`),
        endDate:   new Date(`${year}-03-05T23:59:59`),
        multiplier: 1.40,
        active: true,
      },
      {
        name: "Férias de Julho",
        startDate: new Date(`${year}-07-01T00:00:00`),
        endDate:   new Date(`${year}-07-31T23:59:59`),
        multiplier: 1.30,
        active: true,
      },
      {
        name: "Réveillon",
        startDate: new Date(`${year}-12-26T00:00:00`),
        endDate:   new Date(`${year + 1}-01-02T23:59:59`),
        multiplier: 1.50,
        active: true,
      },
    ],
  });

  const vehicleCount = await prisma.vehicle.count();

  console.log("✅ Seed concluído.\n");
  console.log(`   → ${vehicleCount} veículos`);
  console.log(`   → 4 addons`);
  console.log(`   → 3 períodos de sazonalidade\n`);
  console.log("   Distribuição:");
  console.log("   ECONOMY   Compacto   R$100  ×3  (Kwid, Mobi, Uno)");
  console.log("   ECONOMY   Especial   R$130  ×8  (Onix, HB20, Gol, KA, Polo, Argo, Logan, Siena)");
  console.log("   SEDAN     Manual     R$135  ×4  (Cronos, Virtus, Onix Plus, HB20S)");
  console.log("   SEDAN     Auto       R$150  ×4  (208, Logan 1.6, KA 1.5, Gol 1.6)");
  console.log("   SUV       Especial   R$300  ×1  (Tracker Turbo)");
  console.log("   SUV       Elite      R$300  ×2  (Pulse, Creta)");
  console.log("   MINIVAN              R$300  ×1  (Spin 7L)");
  console.log("   PICKUP    Luxo       R$350  ×3  (Toro, Amarok, Montana)");
  console.log("   PICKUP    Especial   R$480  ×2  (S10, Hilux)");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
