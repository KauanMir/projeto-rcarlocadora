"use client";

import { useState, useEffect, useRef } from "react";
import type { Vehicle } from "@/types/vehicle";
import type { VehicleApiResponse } from "@/types/api";
import { mapApiVehicleToFrontend } from "@/utils/mappers";
import { MOCKED_VEHICLES } from "@/utils/constants";

type Status = "idle" | "loading" | "success" | "fallback" | "empty";

interface UseAvailableVehiclesReturn {
  vehicles: Vehicle[];
  status: Status;
  usingFallback: boolean;
  refetch: () => void;
}

export function useAvailableVehicles(
  pickupDate: string | null,
  returnDate: string | null
): UseAvailableVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCKED_VEHICLES);
  const [status, setStatus] = useState<Status>("idle");
  const abortRef = useRef<AbortController | null>(null);

  function fetchVehicles(pickup: string, returnD: string) {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setStatus("loading");

    fetch(`/api/vehicles?pickup=${pickup}&return=${returnD}`, {
      signal: abortRef.current.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json() as Promise<VehicleApiResponse[]>;
      })
      .then((data) => {
        if (data.length === 0) {
          setVehicles([]);
          setStatus("empty");
        } else {
          setVehicles(data.map(mapApiVehicleToFrontend));
          setStatus("success");
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        // Graceful degradation: show mocked vehicles if API is unreachable
        setVehicles(MOCKED_VEHICLES);
        setStatus("fallback");
      });
  }

  useEffect(() => {
    if (!pickupDate || !returnDate) {
      setVehicles(MOCKED_VEHICLES);
      setStatus("idle");
      return;
    }
    fetchVehicles(pickupDate, returnDate);

    return () => abortRef.current?.abort();
  }, [pickupDate, returnDate]);

  return {
    vehicles,
    status,
    usingFallback: status === "fallback" || status === "idle",
    refetch: () => {
      if (pickupDate && returnDate) fetchVehicles(pickupDate, returnDate);
    },
  };
}
