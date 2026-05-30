import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { VehiclesSection } from "@/components/sections/VehiclesSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { HowSection } from "@/components/sections/HowSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { VehicleModal } from "@/components/booking/VehicleModal";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <VehiclesSection />
        <BenefitsSection />
        <HowSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <VehicleModal />
    </>
  );
}
