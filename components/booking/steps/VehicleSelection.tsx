"use client";

import { motion } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { useAvailableVehicles } from "@/hooks/useAvailableVehicles";
import { FUEL_LABELS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Vehicle } from "@/types/vehicle";

function VehicleCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border border-white/[0.06] rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-10 flex-1 rounded-sm" />
        <Skeleton className="h-10 flex-1 rounded-sm" />
      </div>
    </div>
  );
}

export function VehicleSelection() {
  const { vehicle: selectedVehicle, setVehicle, pickupDate, returnDate } = useBookingStore();
  const { vehicles, status, usingFallback } = useAvailableVehicles(pickupDate, returnDate);

  const isLoading = status === "loading";
  const isEmpty = status === "empty";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-2">
          Qual veículo você prefere?
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-white/40">
            {isLoading ? "Verificando disponibilidade..." : "Selecione o veículo para continuar."}
          </p>
          {usingFallback && !isLoading && (
            <span
              aria-label="Exibindo dados de demonstração"
              className="text-[10px] font-semibold tracking-widest uppercase text-white/25 border border-white/10 rounded-sm px-2 py-0.5"
            >
              Demo
            </span>
          )}
        </div>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">🚫</span>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Sem disponibilidade</p>
            <p className="text-white/35 text-sm mt-1.5 max-w-xs">
              Nenhum veículo disponível para o período selecionado. Tente outras datas.
            </p>
          </div>
          <button
            onClick={() => useBookingStore.getState().setStep(1)}
            className="mt-2 px-6 h-10 border border-white/15 text-white/60 hover:text-white hover:border-white/30 active:scale-[0.97] rounded-sm text-sm font-medium transition-all"
          >
            Alterar Datas
          </button>
        </motion.div>
      ) : (
        <div
          role="listbox"
          aria-label="Selecione um veículo"
          aria-required="true"
          className="grid sm:grid-cols-2 gap-4"
        >
          {isLoading
            ? [1, 2, 3, 4].map((i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={setVehicle}
                />
              ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({
  vehicle,
  index,
  isSelected,
  onSelect,
}: {
  vehicle: Vehicle;
  index: number;
  isSelected: boolean;
  onSelect: (v: Vehicle) => void;
}) {
  return (
    <motion.button
      role="option"
      aria-selected={isSelected}
      aria-label={`${vehicle.brand} ${vehicle.model} — ${formatPrice(vehicle.pricePerDay)} por dia`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      onClick={() => onSelect(vehicle)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(vehicle);
        }
      }}
      className={`text-left border rounded-xl overflow-hidden transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none ${
        isSelected
          ? "bg-white/10 border-white/40"
          : "bg-white/[0.02] border-white/[0.07] hover:border-white/25 hover:bg-white/[0.04]"
      }`}
    >
      {/* Vehicle image */}
      {vehicle.image && (
        <div className="h-36 bg-[#0c0c0c] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-contain p-3"
          />
        </div>
      )}

      <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-white font-bold text-lg leading-none">{vehicle.model}</div>
          <div className="text-white/35 text-sm mt-1">{vehicle.name}</div>
        </div>
        <div className="text-right">
          <div className="text-white font-black text-xl leading-none">
            {formatPrice(vehicle.pricePerDay)}
          </div>
          <div className="text-white/25 text-xs mt-1">por dia</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          FUEL_LABELS[vehicle.specs.fuel],
          vehicle.specs.transmission === "automatic" ? "Automático" : "Manual",
          `${vehicle.specs.seats} lugares`,
        ].map((spec) => (
          <span
            key={spec}
            className="text-[10px] font-medium text-white/35 bg-white/[0.04] border border-white/[0.07] rounded-sm px-2 py-1"
          >
            {spec}
          </span>
        ))}
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 text-[10px] font-bold tracking-widest uppercase text-white bg-white/10 rounded-sm px-2 py-1 w-fit"
        >
          ✓ Selecionado
        </motion.div>
      )}
      </div>
    </motion.button>
  );
}
