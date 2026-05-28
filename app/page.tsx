import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { VehiclesSection } from "@/components/sections/VehiclesSection";
import { VehicleModal } from "@/components/booking/VehicleModal";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <VehiclesSection />
      </main>
      <Footer />
      <VehicleModal />
    </>
  );
}
