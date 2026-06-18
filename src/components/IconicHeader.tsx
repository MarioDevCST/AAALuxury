"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { supportedLanguages, type Language } from "@/lib/i18n";

export type SearchFilters = {
  brand: string;
  model: string;
  iva: string;
};

export function IconicHeader({
  filters,
  brands,
  models,
  onChangeFilters,
  onSearch,
}: {
  filters: SearchFilters;
  brands: string[];
  models: string[];
  onChangeFilters: (next: SearchFilters) => void;
  onSearch: () => void;
}) {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languageLabel = useMemo(() => lang.toUpperCase(), [lang]);

  function pickLanguage(next: Language) {
    setLang(next);
    setLangMenuOpen(false);
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
          <button
            type="button"
            aria-label={t.header.openMenu}
            className="grid h-12 w-12 place-items-center text-white"
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <BrandLogo />

          <div className="hidden items-center gap-10 text-white md:flex">
            <a
              href="tel:+34937070504"
              className="text-base font-semibold tracking-wider lg:text-lg"
            >
              +34 937 070 504
            </a>
            <a
              href="tel:+34683124134"
              className="text-base font-semibold tracking-wider lg:text-lg"
            >
              +34 683 12 41 34
            </a>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label={t.header.whatsapp}
                className="grid h-10 w-10 place-items-center text-white/90 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8.6 7.9c-.4.4-.6 1-.5 1.6.2 1.4 1.4 3.4 3.3 5.1 1.8 1.7 3.9 2.8 5.2 3 0 0 1.2.2 1.8-.5.4-.4.5-1 .4-1.5l-.4-1c-.1-.3-.5-.5-.8-.4l-1.2.3c-.3.1-.6 0-.8-.2l-1.8-1.6c-.2-.2-.3-.6-.2-.9l.3-1.1c.1-.3-.1-.7-.4-.9l-1-.4c-.5-.2-1.1-.1-1.5.4l-.5.6c-.2.2-.5.3-.8.1-1-.7-2-1.7-2.7-2.6-.2-.3-.2-.6.1-.8l.6-.5Z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label={t.header.instagram}
                className="grid h-10 w-10 place-items-center text-white/90 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
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

              <div className="relative">
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded border border-white/20 text-xs font-semibold tracking-widest text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label={t.header.language}
                  onClick={() => setLangMenuOpen((v) => !v)}
                >
                  {languageLabel}
                </button>
                {langMenuOpen ? (
                  <div className="absolute right-0 top-12 w-40 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
                    {supportedLanguages.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => pickLanguage(code)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm tracking-widest text-white/90 hover:bg-white/10"
                      >
                        <span>{code.toUpperCase()}</span>
                        {code === lang ? (
                          <span className="text-white/60">✓</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/20" />

        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative">
              <span className="sr-only">{t.search.brand}</span>
              <select
                className="h-14 w-full appearance-none rounded-lg bg-[#5a5a5a] px-5 pr-12 text-sm tracking-widest text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                value={filters.brand}
                onChange={(e) =>
                  onChangeFilters({
                    brand: e.target.value,
                    model: "",
                    iva: filters.iva,
                  })
                }
              >
                <option value="">{t.search.brand}</option>
                <option value="__all__">{t.search.allBrands}</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/80">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>

            <label className="relative">
              <span className="sr-only">{t.search.model}</span>
              <select
                className="h-14 w-full appearance-none rounded-lg bg-[#5a5a5a] px-5 pr-12 text-sm tracking-widest text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                value={filters.model}
                onChange={(e) =>
                  onChangeFilters({
                    brand: filters.brand,
                    model: e.target.value,
                    iva: filters.iva,
                  })
                }
                disabled={!filters.brand || filters.brand === "__all__"}
              >
                <option value="">{t.search.model}</option>
                {!filters.brand || filters.brand === "__all__" ? (
                  <option value="" disabled>
                    {t.search.selectBrandFirst}
                  </option>
                ) : null}
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/80">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>

            <label className="relative">
              <span className="sr-only">{t.search.vat}</span>
              <select
                className="h-14 w-full appearance-none rounded-lg bg-[#5a5a5a] px-5 pr-12 text-sm tracking-widest text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                value={filters.iva}
                onChange={(e) =>
                  onChangeFilters({
                    brand: filters.brand,
                    model: filters.model,
                    iva: e.target.value,
                  })
                }
              >
                <option value="">{t.search.vat}</option>
                <option value="__all__">{t.search.allVat}</option>
                <option value="IVA Deducible">{t.search.vatDeductible}</option>
                <option value="IVA No Deducible">
                  {t.search.vatNotDeductible}
                </option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/80">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>

            <button
              type="button"
              className="h-14 rounded-lg bg-[#5a5a5a] px-5 text-sm font-semibold tracking-widest text-white outline-none transition-colors hover:bg-[#6a6a6a] focus-visible:ring-2 focus-visible:ring-white/50"
              onClick={onSearch}
            >
              {t.search.search}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="relative h-full w-full max-w-sm bg-black p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm tracking-[0.4em] text-white/70">
                {t.header.menu}
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center"
                onClick={() => setMenuOpen(false)}
                aria-label={t.header.closeMenu}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-10 space-y-6 text-lg tracking-wider">
              <a
                href="#latest"
                className="block hover:text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {t.footer.latest}
              </a>
              <a
                href="#"
                className="block hover:text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {t.footer.stock}
              </a>
              <a
                href="#"
                className="block hover:text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {t.footer.vat}
              </a>
              <a
                href="#"
                className="block hover:text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {t.footer.about}
              </a>
              <a
                href="#dream"
                className="block hover:text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {t.footer.findCar}
              </a>
            </div>
            <div className="mt-12 border-t border-white/10 pt-8 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <div className="text-xs tracking-widest text-white/60">
                  {t.header.language}
                </div>
                <div className="flex items-center gap-2">
                  {supportedLanguages.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => pickLanguage(code)}
                      className={`h-9 w-12 rounded border px-2 text-xs font-semibold tracking-widest ${
                        code === lang
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <a href="tel:+34937070504" className="block hover:text-white">
                  +34 937 070 504
                </a>
                <a href="tel:+34683124134" className="block hover:text-white">
                  +34 683 12 41 34
                </a>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
