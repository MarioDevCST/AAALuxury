"use client";

import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";

export function MediaSlot({
  alt,
  src,
  priority,
  sizes,
}: {
  alt: string;
  src?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const { t } = useLanguage();

  if (!src) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-900 opacity-70" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded border border-white/20 px-3 py-1 text-xs tracking-widest text-white/70">
            {t.vehicle.photoPlaceholder}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}
