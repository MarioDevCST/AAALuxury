"use client";

import Link from "next/link";
import { formatEUR, formatKm } from "@/lib/format";
import { getVehicleImages, type Vehicle } from "@/lib/vehicles";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useLanguage } from "@/components/LanguageProvider";

export function VehicleCard({
  vehicle,
  href,
}: {
  vehicle: Vehicle;
  href?: string;
}) {
  const { lang } = useLanguage();

  const fuel =
    lang === "en"
      ? vehicle.fuel === "Gasolina"
        ? "Petrol"
        : vehicle.fuel === "Diesel"
          ? "Diesel"
          : vehicle.fuel === "Híbrido" || vehicle.fuel === "Hibrido"
            ? "Hybrid"
            : vehicle.fuel === "Eléctrico" || vehicle.fuel === "Electrico"
              ? "Electric"
              : vehicle.fuel
      : vehicle.fuel;

  const transmission =
    lang === "en"
      ? vehicle.transmission === "Automático" ||
        vehicle.transmission === "Automatico"
        ? "Automatic"
        : vehicle.transmission === "Manual"
          ? "Manual"
          : vehicle.transmission
      : vehicle.transmission;

  const iva =
    lang === "en"
      ? vehicle.iva === "IVA Deducible"
        ? "VAT DEDUCTIBLE"
        : "VAT NOT DEDUCTIBLE"
      : vehicle.iva.toUpperCase();

  const content = (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-black transition-transform duration-200 hover:-translate-y-1">
      <ImageCarousel
        alt={vehicle.title}
        images={getVehicleImages(vehicle)}
        autoplayOnHover
        resetOnMouseLeave
        showIndicators={false}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      />
      <div className="bg-[#5a5a5a] p-5 text-white sm:p-6">
        <div className="text-2xl font-extrabold leading-none tracking-wide sm:text-3xl">
          {vehicle.title}
        </div>
        <div className="mt-4 text-4xl font-extrabold leading-none text-white/35 sm:text-5xl">
          {formatEUR(vehicle.priceEUR)}
        </div>
        <div className="mt-5 text-sm tracking-widest text-white/90">
          {fuel.toUpperCase()}
          {" // "}
          {vehicle.month}
          {"-"}
          {vehicle.year}
        </div>
        <div className="mt-1 text-sm tracking-widest text-white/90">
          {formatKm(vehicle.km).toUpperCase()}
        </div>
        <div className="mt-1 text-sm tracking-widest text-white/90">
          {transmission.toUpperCase()}
        </div>
        <div className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/80">
          {iva}
        </div>
        <div className="mt-5 text-xs font-semibold tracking-[0.3em] text-white/70">
          {lang === "en" ? "VIEW DETAILS" : "VER DETALLE"}
        </div>
      </div>
    </article>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="block outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
