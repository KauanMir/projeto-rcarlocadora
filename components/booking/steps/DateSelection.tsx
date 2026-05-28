"use client";

import { motion } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { todayLocal, MAX_RENTAL_DAYS } from "@/utils/dates";

export function DateSelection() {
  const { pickupDate, returnDate, rentalDays, setPickupDate, setReturnDate } = useBookingStore();

  const today = todayLocal();
  const exceedsMaxDays = rentalDays > MAX_RENTAL_DAYS;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-2">
          Quando você precisa do veículo?
        </h2>
        <p className="text-white/40">Selecione o período da sua locação.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs tracking-widest uppercase font-medium">
            Data de Retirada
          </label>
          <input
            type="date"
            min={today}
            value={pickupDate ?? ""}
            onChange={(e) => setPickupDate(e.target.value || null)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-sm text-white px-4 py-4 text-sm outline-none focus:border-white/30 hover:border-white/20 transition-colors [color-scheme:dark] cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs tracking-widest uppercase font-medium">
            Data de Devolução
          </label>
          <input
            type="date"
            min={pickupDate ?? today}
            value={returnDate ?? ""}
            onChange={(e) => setReturnDate(e.target.value || null)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-sm text-white px-4 py-4 text-sm outline-none focus:border-white/30 hover:border-white/20 transition-colors [color-scheme:dark] cursor-pointer"
          />
        </div>
      </div>

      {rentalDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center gap-4 border rounded-xl px-6 py-5 w-fit ${
            exceedsMaxDays
              ? "bg-red-500/10 border-red-500/30"
              : "bg-white/[0.04] border-white/10"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${
              exceedsMaxDays ? "bg-red-500" : "bg-white"
            }`}
          >
            <span className={`font-black text-xl ${exceedsMaxDays ? "text-white" : "text-black"}`}>
              {rentalDays}
            </span>
          </div>
          <div>
            {exceedsMaxDays ? (
              <>
                <div className="text-red-400 font-semibold">
                  {rentalDays} dias — período muito longo
                </div>
                <div className="text-red-400/60 text-sm">
                  Máximo permitido: {MAX_RENTAL_DAYS} dias
                </div>
              </>
            ) : (
              <>
                <div className="text-white font-semibold">
                  {rentalDays} dia{rentalDays > 1 ? "s" : ""} de locação
                </div>
                <div className="text-white/40 text-sm">Período confirmado</div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
