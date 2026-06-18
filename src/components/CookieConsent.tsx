"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type ConsentChoice = "accepted" | "rejected";

const storageKey = "cookieConsentChoice";

export function CookieConsent() {
  const { t } = useLanguage();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === "accepted" || raw === "rejected") {
        queueMicrotask(() => {
          setChoice(raw);
          setOpen(false);
        });
        return;
      }
    } catch {}
    queueMicrotask(() => setOpen(true));
  }, []);

  const canShowRevisit = useMemo(() => choice !== null, [choice]);

  function persist(nextChoice: ConsentChoice) {
    setChoice(nextChoice);
    setOpen(false);
    try {
      localStorage.setItem(storageKey, nextChoice);
    } catch {}
  }

  if (!open && !canShowRevisit) return null;

  return (
    <>
      {canShowRevisit && !open ? (
        <button
          type="button"
          className="fixed left-6 bottom-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#1f7aff] text-white shadow-lg"
          onClick={() => setOpen(true)}
          aria-label={t.cookies.revisit}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
          >
            <path
              d="M12 3a9 9 0 1 0 9 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 7v6l4 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-start p-6 sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => (choice ? setOpen(false) : null)}
          />
          <section className="relative w-full max-w-xl rounded-md bg-white p-8 text-black shadow-2xl">
            <h2 className="text-2xl font-semibold">{t.cookies.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {t.cookies.text}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="h-11 rounded border border-zinc-300 px-5 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {t.cookies.customize}
              </button>
              <button
                type="button"
                className="h-11 rounded bg-zinc-200 px-5 text-sm font-medium"
                onClick={() => persist("rejected")}
              >
                {t.cookies.reject}
              </button>
              <button
                type="button"
                className="h-11 rounded bg-zinc-600 px-5 text-sm font-medium text-white"
                onClick={() => persist("accepted")}
              >
                {t.cookies.accept}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
