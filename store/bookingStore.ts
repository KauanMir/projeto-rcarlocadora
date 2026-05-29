import { create } from "zustand";
import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon, BookingStep, PriceBreakdown } from "@/types/booking";
import type { PricingApiResponse } from "@/types/api";
import { calculateRentalDays, calculatePriceBreakdown } from "@/services/pricing";

const EMPTY_BREAKDOWN: PriceBreakdown = {
  vehicleSubtotal: 0,
  insuranceCost: 0,
  addonsCost: 0,
  total: 0,
  days: 0,
};

interface BookingStore {
  step: BookingStep;
  modalVehicle: Vehicle | null;
  vehicle: Vehicle | null;
  pickupDate: string | null;
  returnDate: string | null;
  rentalDays: number;
  insurance: InsuranceOption | null;
  selectedAddons: Addon[];
  priceBreakdown: PriceBreakdown;
  serverPricing: PricingApiResponse | null;
  serverPricingLoading: boolean;

  setStep: (step: BookingStep) => void;
  openModal: (vehicle: Vehicle) => void;
  closeModal: () => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setPickupDate: (date: string | null) => void;
  setReturnDate: (date: string | null) => void;
  setInsurance: (insurance: InsuranceOption) => void;
  toggleAddon: (addon: Addon) => void;
  fetchServerPricing: () => void;
  reset: () => void;
}

function recompute(
  vehicle: Vehicle | null,
  pickupDate: string | null,
  returnDate: string | null,
  insurance: InsuranceOption | null,
  addons: Addon[]
): { rentalDays: number; priceBreakdown: PriceBreakdown } {
  const days =
    pickupDate && returnDate ? calculateRentalDays(pickupDate, returnDate) : 0;
  return {
    rentalDays: days,
    priceBreakdown: calculatePriceBreakdown(vehicle, days, insurance, addons),
  };
}

// Module-level abort controller — cancelled when a newer fetch fires
let pricingAbortCtrl: AbortController | null = null;

export const useBookingStore = create<BookingStore>((set, get) => ({
  step: 1,
  modalVehicle: null,
  vehicle: null,
  pickupDate: null,
  returnDate: null,
  rentalDays: 0,
  insurance: null,
  selectedAddons: [],
  priceBreakdown: EMPTY_BREAKDOWN,
  serverPricing: null,
  serverPricingLoading: false,

  setStep: (step) => set({ step }),

  openModal: (vehicle) => set({ modalVehicle: vehicle }),
  closeModal: () => set({ modalVehicle: null }),

  setVehicle: (vehicle) => {
    const { pickupDate, returnDate, insurance, selectedAddons } = get();
    set({ vehicle, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
    get().fetchServerPricing();
  },

  setPickupDate: (pickupDate) => {
    const { vehicle, returnDate, insurance, selectedAddons } = get();
    set({ pickupDate, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
    get().fetchServerPricing();
  },

  setReturnDate: (returnDate) => {
    const { vehicle, pickupDate, insurance, selectedAddons } = get();
    set({ returnDate, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
    get().fetchServerPricing();
  },

  setInsurance: (insurance) => {
    const { vehicle, pickupDate, returnDate, selectedAddons } = get();
    set({ insurance, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
    get().fetchServerPricing();
  },

  toggleAddon: (addon) => {
    const { vehicle, pickupDate, returnDate, insurance, selectedAddons } = get();
    const exists = selectedAddons.some((a) => a.id === addon.id);
    const newAddons = exists
      ? selectedAddons.filter((a) => a.id !== addon.id)
      : [...selectedAddons, addon];
    set({
      selectedAddons: newAddons,
      ...recompute(vehicle, pickupDate, returnDate, insurance, newAddons),
    });
    get().fetchServerPricing();
  },

  fetchServerPricing: () => {
    const { vehicle, pickupDate, returnDate, insurance, selectedAddons } = get();

    pricingAbortCtrl?.abort();

    if (!vehicle || !pickupDate || !returnDate) {
      set({ serverPricing: null, serverPricingLoading: false });
      return;
    }

    pricingAbortCtrl = new AbortController();
    set({ serverPricingLoading: true });

    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        pickupDate,
        returnDate,
        insuranceType: insurance?.id ?? "basic",
        addons: selectedAddons.map((a) => a.id),
      }),
      signal: pricingAbortCtrl.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<PricingApiResponse>) : Promise.reject(new Error("api"))))
      .then((data) => {
        set({ serverPricing: data, serverPricingLoading: false });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        set({ serverPricingLoading: false });
      });
  },

  reset: () =>
    set({
      step: 1,
      modalVehicle: null,
      vehicle: null,
      pickupDate: null,
      returnDate: null,
      rentalDays: 0,
      insurance: null,
      selectedAddons: [],
      priceBreakdown: EMPTY_BREAKDOWN,
      serverPricing: null,
      serverPricingLoading: false,
    }),
}));
