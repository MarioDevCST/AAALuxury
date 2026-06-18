"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MediaSlot } from "@/components/MediaSlot";

type ImageCarouselProps = {
  alt: string;
  images?: string[];
  priority?: boolean;
  sizes?: string;
  autoplayOnHover?: boolean;
  intervalMs?: number;
  resetOnMouseLeave?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  showThumbnails?: boolean;
};

export function ImageCarousel({
  alt,
  images = [],
  priority,
  sizes,
  autoplayOnHover = false,
  intervalMs = 1200,
  resetOnMouseLeave = false,
  showControls = false,
  showIndicators = true,
  showThumbnails = false,
}: ImageCarouselProps) {
  const sanitizedImages = useMemo(
    () => [...new Set(images.map((item) => item.trim()).filter(Boolean))],
    [images],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (sanitizedImages.length <= 1) return;
    if (autoplayOnHover && !isHovering) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % sanitizedImages.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [autoplayOnHover, intervalMs, isHovering, sanitizedImages.length]);

  const activeIndex = currentIndex < sanitizedImages.length ? currentIndex : 0;
  const currentImage = sanitizedImages[activeIndex];
  const hasMultipleImages = sanitizedImages.length > 1;

  function goToPrevious() {
    if (!hasMultipleImages) return;
    setCurrentIndex((current) =>
      current === 0 ? sanitizedImages.length - 1 : current - 1,
    );
  }

  function goToNext() {
    if (!hasMultipleImages) return;
    setCurrentIndex((current) => (current + 1) % sanitizedImages.length);
  }

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        if (resetOnMouseLeave) {
          setCurrentIndex(0);
        }
      }}
    >
      <div className="relative">
        {sanitizedImages.length > 0 ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
            {sanitizedImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill
                  unoptimized
                  priority={priority && index === 0}
                  sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <MediaSlot
            alt={alt}
            src={currentImage}
            priority={priority}
            sizes={sizes}
          />
        )}

        {hasMultipleImages ? (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.25em] text-white/85">
            {activeIndex + 1}/{sanitizedImages.length}
          </div>
        ) : null}

        {showControls && hasMultipleImages ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white transition hover:bg-black/75"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m15 18-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={goToNext}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white transition hover:bg-black/75"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m9 18 6-6-6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {showIndicators && hasMultipleImages ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {sanitizedImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition ${
                index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      ) : null}

      {showThumbnails && hasMultipleImages ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {sanitizedImages.map((image, index) => (
            <button
              key={`${image}-thumb-${index}`}
              type="button"
              aria-label={`Seleccionar imagen ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-[16/10] overflow-hidden rounded-xl border ${
                index === activeIndex
                  ? "border-white/60"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 25vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
