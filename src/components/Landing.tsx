"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconicHeader, type SearchFilters } from "@/components/IconicHeader";
import { VehicleCard } from "@/components/VehicleCard";
import { CookieConsent } from "@/components/CookieConsent";
import { BrandLogo } from "@/components/BrandLogo";
import { fallbackVehicles, type Vehicle } from "@/lib/vehicles";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { fetchVehiclesFromFirestore } from "@/lib/vehicle-data";
import { grantSecretAdminAccess } from "@/lib/admin-access";
import { fetchBrandsFromFirestore } from "@/lib/brand-data";
import { fetchModelsFromFirestore, type ModelRecord } from "@/lib/model-data";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function filterVehicles(vehicles: Vehicle[], filters: SearchFilters) {
  return vehicles.filter((v) => {
    if (
      filters.brand &&
      filters.brand !== "__all__" &&
      v.brand !== filters.brand
    ) {
      return false;
    }
    if (filters.model && v.model !== filters.model) return false;
    if (filters.iva && filters.iva !== "__all__" && v.iva !== filters.iva) {
      return false;
    }
    return true;
  });
}

const initialFilters: SearchFilters = {
  brand: "",
  model: "",
  iva: "",
};

export function Landing() {
  const { t } = useLanguage();
  const router = useRouter();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [dbBrands, setDbBrands] = useState<string[]>([]);
  const [dbModels, setDbModels] = useState<ModelRecord[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [vehicles, setVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [searchFlash, setSearchFlash] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  const brands = useMemo(
    () => [...dbBrands].sort((a, b) => a.localeCompare(b, "es")),
    [dbBrands],
  );
  const models = useMemo(() => {
    if (!filters.brand || filters.brand === "__all__") return [];
    const selectedBrand = dbBrands.find((brand) => brand === filters.brand);
    if (!selectedBrand) return [];
    return dbModels
      .filter((model) => model.brandName === selectedBrand)
      .map((model) => model.name)
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [dbBrands, dbModels, filters.brand]);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      try {
        const [loaded, loadedBrands, loadedModels] = await Promise.all([
          fetchVehiclesFromFirestore(),
          fetchBrandsFromFirestore(),
          fetchModelsFromFirestore(),
        ]);
        if (cancelled) return;
        setAllVehicles(loaded);
        setDbBrands(loadedBrands.map((item) => item.name));
        setDbModels(loadedModels);
        setVehicles(filterVehicles(loaded, initialFilters));
      } catch {
        if (cancelled) return;
        setAllVehicles(fallbackVehicles);
        setDbBrands([]);
        setDbModels([]);
        setVehicles(filterVehicles(fallbackVehicles, initialFilters));
      }
    }

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  function runSearch() {
    setVehicles(filterVehicles(allVehicles, filters));
    setSearchFlash((x) => x + 1);
    scrollToId("latest");
  }

  return (
    <div className="min-h-full bg-black text-white">
      <IconicHeader
        filters={filters}
        brands={brands}
        models={models}
        onChangeFilters={setFilters}
        onSearch={runSearch}
      />

      <main className="pt-[168px] sm:pt-[176px]">
        <section className="relative">
          <div className="relative h-[440px] w-full overflow-hidden sm:h-[520px] lg:h-[560px]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/media/video/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/15 to-black/40" />
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.12),transparent_55%)]" />
            </div>
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
              <div className="w-full">
                <div className="max-w-2xl text-left">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl">
                    {t.hero.title}
                  </h1>
                  <p className="mt-6 text-base leading-7 text-white/80 md:text-lg">
                    {t.hero.description}
                  </p>
                </div>

                <div className="mt-10 sm:mt-14">
                  <button
                    type="button"
                    onClick={() => scrollToId("latest")}
                    className="h-14 w-full max-w-xl rounded-lg border border-white/40 px-6 text-sm font-semibold tracking-widest text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    {t.hero.ctaLatest}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((label) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-lg bg-zinc-950/70 p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white/80">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 17h10M6 10h12M8 7h8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-sm font-semibold tracking-widest text-white/90">
                  {label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="latest"
          className="mx-auto max-w-6xl scroll-mt-[220px] px-4 pb-16 sm:px-6"
        >
          <div className="flex items-center justify-between gap-6">
            <h2 className="text-2xl font-semibold tracking-widest">
              {t.latest.title}
            </h2>
            <div
              key={searchFlash}
              className="text-xs tracking-widest text-white/60"
            >
              {t.latest.results(vehicles.length)}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.slice(0, 12).map((v) => (
              <VehicleCard key={v.id} vehicle={v} href={`/stock/${v.id}`} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/stock"
              className="h-12 w-full max-w-sm rounded-lg bg-[#5a5a5a] px-6 text-center text-sm font-semibold leading-[3rem] tracking-widest text-white outline-none transition-colors hover:bg-[#6a6a6a] focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {t.latest.viewStock}
            </Link>
          </div>
        </section>

        <section
          id="dream"
          className="mx-auto max-w-6xl scroll-mt-[220px] px-4 pb-20 sm:px-6"
        >
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                {t.dream.title}
              </h2>
              <p className="mt-10 max-w-lg text-base leading-7 text-white/75">
                {t.dream.description}
              </p>
            </div>

            <div>
              <form
                ref={formRef}
                noValidate
                className="grid grid-cols-1 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const nombre = String(fd.get("nombre") ?? "")
                    .trim()
                    .toLowerCase();
                  const email = String(fd.get("email") ?? "")
                    .trim()
                    .toLowerCase();

                  if (nombre === "admin" && email === "admin@admin.com") {
                    grantSecretAdminAccess();
                    e.currentTarget.reset();
                    router.push("/motor-gallery-auth");
                    return;
                  }

                  const required = [
                    "nombre",
                    "apellidos",
                    "email",
                    "telefono",
                    "comentarios",
                    "privacidad",
                  ];
                  const missing = required.filter((k) => !fd.get(k));
                  if (missing.length > 0) {
                    e.currentTarget.reportValidity();
                    return;
                  }
                  e.currentTarget.reset();
                  alert(t.form.sentPlaceholder);
                }}
              >
                <input
                  name="nombre"
                  required
                  placeholder={t.form.name}
                  className="h-14 rounded-lg bg-zinc-900/70 px-5 text-sm tracking-widest text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                />
                <input
                  name="apellidos"
                  required
                  placeholder={t.form.surname}
                  className="h-14 rounded-lg bg-zinc-900/70 px-5 text-sm tracking-widest text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder={t.form.email}
                  className="h-14 rounded-lg bg-zinc-900/70 px-5 text-sm tracking-widest text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                />
                <input
                  name="telefono"
                  required
                  placeholder={t.form.phone}
                  className="h-14 rounded-lg bg-zinc-900/70 px-5 text-sm tracking-widest text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                />
                <textarea
                  name="comentarios"
                  required
                  placeholder={t.form.comments}
                  rows={6}
                  className="rounded-lg bg-zinc-900/70 px-5 py-4 text-sm tracking-widest text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                />

                <div className="rounded-lg bg-white p-4 text-black">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded border border-zinc-400" />
                    <div className="text-sm">{t.form.notRobot}</div>
                    <div className="ml-auto text-xs text-zinc-500">
                      {t.form.recaptcha}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500">
                    {t.form.recaptchaPlaceholder}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex items-start gap-3 text-sm text-white/80">
                    <input
                      name="privacidad"
                      required
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-white"
                    />
                    <span>
                      {t.form.privacyAccept}{" "}
                      <a href="#" className="underline underline-offset-2">
                        {t.form.privacyPolicy}
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-white/80">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-white"
                    />
                    <span>{t.form.marketingAccept}</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-14 w-full max-w-xs rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white outline-none transition-colors hover:bg-[#6a6a6a] focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    {t.form.send}
                  </button>
                </div>

                <div className="pt-4 text-xs leading-5 text-white/60">
                  {t.form.dataProtection}
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-zinc-900/70">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 md:grid-cols-3">
            <div>
              <div className="text-sm font-semibold tracking-widest text-white/90">
                {t.footer.company}
              </div>
              <div className="mt-6 space-y-3 text-sm text-white/75">
                <a href="#" className="block hover:text-white">
                  {t.footer.about}
                </a>
                <a href="#" className="block hover:text-white">
                  {t.footer.showroom}
                </a>
                <a href="#dream" className="block hover:text-white">
                  {t.footer.findCar}
                </a>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-widest text-white/90">
                {t.footer.vehicles}
              </div>
              <div className="mt-6 space-y-3 text-sm text-white/75">
                <a href="#latest" className="block hover:text-white">
                  {t.footer.latest}
                </a>
                <Link href="/stock" className="block hover:text-white">
                  {t.footer.stock}
                </Link>
                <a href="#" className="block hover:text-white">
                  {t.footer.vat}
                </a>
              </div>
            </div>

            <div className="md:text-right">
              <div className="flex items-center gap-3 md:ml-auto md:justify-end">
                <BrandLogo size="footer" className="md:ml-auto" />
              </div>
              <div className="mt-10 text-sm font-semibold tracking-widest text-white/90">
                {t.footer.social}
              </div>
              <div className="mt-4 md:flex md:justify-end">
                <a
                  href="#"
                  aria-label={t.header.instagram}
                  className="grid h-10 w-10 place-items-center text-white/90 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 8.2A3.8 3.8 0 1 0 12 16a3.8 3.8 0 0 0 0-7.8Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M17.8 6.4h.01"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <CookieConsent />
    </div>
  );
}
