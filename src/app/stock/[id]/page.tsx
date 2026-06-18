"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEUR, formatKm } from "@/lib/format";
import { fetchVehicleByIdFromFirestore } from "@/lib/vehicle-data";
import { getVehicleImages, type Vehicle } from "@/lib/vehicles";

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const labels = useMemo(() => {
    return lang === "en"
      ? {
          back: "BACK TO HOME",
          stock: "BACK TO STOCK",
          notFound: "Vehicle not found.",
          brand: "Brand",
          model: "Model",
          fuel: "Fuel",
          transmission: "Transmission",
          year: "Year",
          month: "Month",
          km: "Kilometres",
          vat: "VAT",
          price: "Price",
          details: "Vehicle details",
          moreInfo: "REQUEST MORE INFO",
          gallery: "Gallery",
        }
      : {
          back: "VOLVER A INICIO",
          stock: "VOLVER A STOCK",
          notFound: "Vehiculo no encontrado.",
          brand: "Marca",
          model: "Modelo",
          fuel: "Combustible",
          transmission: "Cambio",
          year: "Año",
          month: "Mes",
          km: "Kilometros",
          vat: "IVA",
          price: "Precio",
          details: "Detalles del vehículo",
          moreInfo: "PEDIR MAS INFORMACION",
          gallery: "Galeria",
        };
  }, [lang]);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      try {
        const found = await fetchVehicleByIdFromFirestore(params.id);
        if (!cancelled) {
          setVehicle(found);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      void loadVehicle();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const fuel =
    lang === "en"
      ? vehicle?.fuel === "Gasolina"
        ? "Petrol"
        : vehicle?.fuel === "Diesel"
          ? "Diesel"
          : vehicle?.fuel === "Hibrido"
            ? "Hybrid"
            : vehicle?.fuel === "Híbrido"
              ? "Hybrid"
              : vehicle?.fuel === "Electrico"
                ? "Electric"
                : vehicle?.fuel === "Eléctrico"
                  ? "Electric"
                  : (vehicle?.fuel ?? "")
      : (vehicle?.fuel ?? "");

  const transmission =
    lang === "en"
      ? vehicle?.transmission === "Automático" ||
        vehicle?.transmission === "Automatico"
        ? "Automatic"
        : (vehicle?.transmission ?? "")
      : (vehicle?.transmission ?? "");

  const iva =
    lang === "en"
      ? vehicle?.iva === "IVA Deducible"
        ? "VAT Deductible"
        : "VAT Not Deductible"
      : (vehicle?.iva ?? "");

  if (loading) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-8">
          <div className="text-2xl font-bold">{labels.notFound}</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a]"
            >
              {labels.back}
            </Link>
            <Link
              href="/stock"
              className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
            >
              {labels.stock}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a]"
          >
            {labels.back}
          </Link>
          <Link
            href="/stock"
            className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
          >
            {labels.stock}
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          <div className="p-4 sm:p-6">
            <div className="text-xs tracking-[0.3em] text-white/40">
              {labels.gallery.toUpperCase()}
            </div>
            <div className="mt-4">
              <ImageCarousel
                alt={vehicle.title}
                images={getVehicleImages(vehicle)}
                priority
                autoplayOnHover={false}
                showControls
                showIndicators
                showThumbnails
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>
          </div>

          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div>
              <div className="text-xs tracking-[0.35em] text-white/40">
                {labels.details.toUpperCase()}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {vehicle.title}
              </h1>
              <div className="mt-6 text-4xl font-extrabold text-white/85 sm:text-5xl">
                {formatEUR(vehicle.priceEUR)}
              </div>
              <div className="mt-2 text-xs font-semibold tracking-[0.3em] text-white/60">
                {labels.price.toUpperCase()}
              </div>
              <button
                type="button"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a]"
              >
                {labels.moreInfo}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs tracking-[0.3em] text-white/40">
                  {labels.brand.toUpperCase()}
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {vehicle.brand}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs tracking-[0.3em] text-white/40">
                  {labels.model.toUpperCase()}
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {vehicle.model}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [labels.fuel, fuel],
            [labels.transmission, transmission],
            [labels.year, String(vehicle.year)],
            [labels.month, vehicle.month],
            [labels.km, formatKm(vehicle.km)],
            [labels.vat, iva],
            [labels.price, formatEUR(vehicle.priceEUR)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-zinc-950 p-5"
            >
              <div className="text-xs tracking-[0.3em] text-white/40">
                {label.toUpperCase()}
              </div>
              <div className="mt-3 text-lg font-semibold text-white/90">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
