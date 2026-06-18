"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function StockPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-widest">{t.stock.title}</h1>
        <p className="mt-6 text-white/70">
          {t.stock.text}
        </p>
        <Link
          href="/"
          className="mt-10 inline-block rounded-lg bg-[#5a5a5a] px-6 py-3 text-sm font-semibold tracking-widest hover:bg-[#6a6a6a]"
        >
          {t.stock.back}
        </Link>
      </div>
    </main>
  );
}
