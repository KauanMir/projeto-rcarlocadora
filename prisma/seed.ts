import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

async function main() {
  console.log("🌱 Starting seed...");

  // ── Clear existing data ──────────────────────────────────────
  await prisma.reservation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.seasonalPricing.deleteMany();
  await prisma.addon.deleteMany();

  // ── Addons ───────────────────────────────────────────────────
  await prisma.addon.createMany({
    data: [
      { slug: "gps", name: "GPS Premium", description: "Navegação com mapas offline atualizados", pricePerDay: 15, icon: "🗺️" },
      { slug: "baby-seat", name: "Cadeirinha Infantil", description: "Certificada pelo Inmetro, até 25kg", pricePerDay: 20, icon: "👶" },
      { slug: "extra-driver", name: "Condutor Adicional", description: "Adicione mais um condutor habilitado", pricePerDay: 30, icon: "🧑‍✈️" },
      { slug: "wifi", name: "Wi-Fi Portátil", description: "Internet 4G ilimitada durante o período", pricePerDay: 15, icon: "📶" },
    ],
  });

  // ── Vehicles ─────────────────────────────────────────────────
  const hb20 = await prisma.vehicle.create({
    data: {
      name: "HB20 Sense",
      slug: "hyundai-hb20-sense-2024",
      brand: "Hyundai",
      model: "HB20",
      year: 2024,
      category: "ECONOMY",
      transmission: "MANUAL",
      fuel: "FLEX",
      seats: 5,
      doors: 4,
      dailyRate: 89.00,
      tags: ["Econômico", "Mais Alugado"],
      available: true,
      featured: true,
    },
  });

  const onix = await prisma.vehicle.create({
    data: {
      name: "Onix Plus",
      slug: "chevrolet-onix-plus-2024",
      brand: "Chevrolet",
      model: "Onix",
      year: 2024,
      category: "ECONOMY",
      transmission: "AUTOMATIC",
      fuel: "FLEX",
      seats: 5,
      doors: 4,
      dailyRate: 99.00,
      tags: ["Automático", "Popular"],
      available: true,
      featured: false,
    },
  });

  const corolla = await prisma.vehicle.create({
    data: {
      name: "Corolla XEi",
      slug: "toyota-corolla-xei-2024",
      brand: "Toyota",
      model: "Corolla",
      year: 2024,
      category: "SEDAN",
      transmission: "AUTOMATIC",
      fuel: "HYBRID",
      seats: 5,
      doors: 4,
      dailyRate: 189.00,
      tags: ["Híbrido", "Premium"],
      available: true,
      featured: true,
    },
  });

  const compass = await prisma.vehicle.create({
    data: {
      name: "Compass Limited",
      slug: "jeep-compass-limited-2024",
      brand: "Jeep",
      model: "Compass",
      year: 2024,
      category: "SUV",
      transmission: "AUTOMATIC",
      fuel: "FLEX",
      seats: 5,
      doors: 4,
      dailyRate: 249.00,
      tags: ["SUV", "Destaque"],
      available: true,
      featured: true,
    },
  });

  // ── Sample reservations (shows availability system working) ──
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  await prisma.reservation.createMany({
    data: [
      {
        vehicleId: hb20.id,
        pickupDate: addDays(now, 2),
        returnDate: addDays(now, 5),
        rentalDays: 3,
        insuranceType: "INTERMEDIATE",
        addons: ["gps"],
        subtotal: 267.00,
        totalPrice: 342.00,
        status: "CONFIRMED",
        customerName: "João Silva",
        customerPhone: "11999990001",
      },
      {
        vehicleId: compass.id,
        pickupDate: addDays(now, 1),
        returnDate: addDays(now, 4),
        rentalDays: 3,
        insuranceType: "PREMIUM",
        addons: ["gps", "extra-driver"],
        subtotal: 747.00,
        totalPrice: 972.00,
        status: "CONFIRMED",
        customerName: "Maria Santos",
        customerPhone: "11999990002",
      },
    ],
  });

  // ── Seasonal pricing ─────────────────────────────────────────
  const year = now.getFullYear();

  await prisma.seasonalPricing.createMany({
    data: [
      {
        name: "Carnaval",
        startDate: new Date(`${year}-02-28T00:00:00`),
        endDate: new Date(`${year}-03-05T23:59:59`),
        multiplier: 1.40,
        active: true,
      },
      {
        name: "Férias de Julho",
        startDate: new Date(`${year}-07-01T00:00:00`),
        endDate: new Date(`${year}-07-31T23:59:59`),
        multiplier: 1.30,
        active: true,
      },
      {
        name: "Réveillon",
        startDate: new Date(`${year}-12-26T00:00:00`),
        endDate: new Date(`${year + 1}-01-02T23:59:59`),
        multiplier: 1.50,
        active: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully.");
  console.log(`   → 4 vehicles`);
  console.log(`   → 4 addons`);
  console.log(`   → 2 sample reservations`);
  console.log(`   → 3 seasonal pricing rules`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
