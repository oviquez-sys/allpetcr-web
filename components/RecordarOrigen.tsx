"use client";

import { useEffect } from "react";
import { recordarOrigen } from "@/lib/origenCampana";

/** Guarda la campaña del enlace de entrada (lib/origenCampana.ts). No pinta nada. */
export default function RecordarOrigen() {
  useEffect(() => {
    recordarOrigen(window.location.search);
  }, []);
  return null;
}
