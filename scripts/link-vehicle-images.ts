/**
 * Copia as fotos reais de veículos da pasta RcarSite para public/vehicles/
 * e atualiza imageUrl + galleryImages no banco via Prisma.
 *
 * Executar: npx tsx scripts/link-vehicle-images.ts
 *
 * Quando Cloudinary estiver configurado, as imagens podem ser substituídas
 * individualmente pelo painel /admin/vehicles.
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SRC_DIR = path.resolve(
  "C:/Users/kauan/Documents/GitHub/RcarSite/img/tab-image"
);
const DEST_DIR = path.resolve("./public/vehicles");

// slug → { cover: fileName, gallery?: [fileName, ...] }
const VEHICLE_MAP: Record<string, { cover: string; gallery?: string[] }> = {
  "renault-kwid-2024":            { cover: "kwid01.png",       gallery: ["kwid02.png"] },
  "fiat-mobi-2024":               { cover: "mobi01.png" },
  "chevrolet-onix-2024":          { cover: "onixpreto.png",    gallery: ["Onix_Lt_Hatch01.png"] },
  "renault-logan-2024":           { cover: "Logan.png" },
  "renault-logan-at-2024":        { cover: "Logan.png" },
  "fiat-argo-2024":               { cover: "Argo.png" },
  "chevrolet-onix-plus-2024":     { cover: "Onix_Lt_Sedan01.png" },
  "peugeot-208-at-2024":          {
    cover:   "desktop_208_STYLE_3X4_AV_MOT_BLANQUISE.png",
    gallery: ["Pegeout_208_Hatch01.png"],
  },
  "chevrolet-tracker-turbo-2024": { cover: "Tracker.png" },
  "chevrolet-spin-7l-2024":       { cover: "SPIN.png" },
  "fiat-toro-ranch-4x4-2024":     { cover: "Toro.png" },
  "toyota-hilux-srv-4x4-2024":    { cover: "HILUX DIESIEL 4X4.png" },
};

function normalizeFilename(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .toLowerCase();
}

async function main() {
  fs.mkdirSync(DEST_DIR, { recursive: true });

  console.log("📸 Vinculando fotos reais aos veículos...\n");

  let updated = 0;
  let skipped = 0;

  for (const [slug, { cover, gallery = [] }] of Object.entries(VEHICLE_MAP)) {
    const allFiles = [cover, ...gallery];
    const publicPaths: string[] = [];

    for (const filename of allFiles) {
      const src = path.join(SRC_DIR, filename);

      if (!fs.existsSync(src)) {
        console.warn(`  ⚠  Arquivo não encontrado: ${filename}`);
        continue;
      }

      const normalized = normalizeFilename(filename);
      const dest = path.join(DEST_DIR, normalized);

      // Avoid redundant copies (same file used by two vehicles e.g. Logan)
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }

      publicPaths.push(`/vehicles/${normalized}`);
    }

    if (publicPaths.length === 0) {
      console.log(`  ⚠  Nenhuma imagem para: ${slug}`);
      skipped++;
      continue;
    }

    const [imageUrl, ...galleryImages] = publicPaths;

    await prisma.vehicle.update({
      where: { slug },
      data: { imageUrl, galleryImages },
    });

    console.log(`  ✅ ${slug}`);
    console.log(`      cover  : ${imageUrl}`);
    if (galleryImages.length) {
      console.log(`      galeria: ${galleryImages.join(", ")}`);
    }
    updated++;
  }

  console.log(`\n✅ Concluído: ${updated} veículos atualizados · ${skipped} ignorados`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
