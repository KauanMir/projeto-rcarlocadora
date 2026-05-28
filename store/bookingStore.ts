import { create } from "zustand";
import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon, BookingStep, PriceBreakdown } from "@/types/booking";
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

  setStep: (step: BookingStep) => void;
  openModal: (vehicle: Vehicle) => void;
  closeModal: () => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setPickupDate: (date: string | null) => void;
  setReturnDate: (date: string | null) => void;
  setInsurance: (insurance: InsuranceOption) => void;
  toggleAddon: (addon: Addon) => void;
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

  setStep: (step) => set({ step }),

  openModal: (vehicle) => set({ modalVehicle: vehicle }),
  closeModal: () => set({ modalVehicle: null }),

  setVehicle: (vehicle) => {
    const { pickupDate, returnDate, insurance, selectedAddons } = get();
    set({ vehicle, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
  },

  setPickupDate: (pickupDate) => {
    const { vehicle, returnDate, insurance, selectedAddons } = get();
    set({ pickupDate, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
  },

  setReturnDate: (returnDate) => {
    const { vehicle, pickupDate, insurance, selectedAddons } = get();
    set({ returnDate, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
  },

  setInsurance: (insurance) => {
    const { vehicle, pickupDate, returnDate, selectedAddons } = get();
    set({ insurance, ...recompute(vehicle, pickupDate, returnDate, insurance, selectedAddons) });
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
    }),
}));
