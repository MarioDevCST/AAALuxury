"use client";

import Image from "next/image";

export function BrandLogo({
  size = "header",
  className = "",
}: {
  size?: "header" | "footer";
  className?: string;
}) {
  const sizeClasses =
    size === "footer"
      ? "h-12 w-[220px] sm:h-14 sm:w-[260px]"
      : "h-10 w-[180px] sm:h-12 sm:w-[220px]";

  return (
    <div className={`relative ${sizeClasses} ${className}`.trim()}>
      <Image
        src="/branding/logo/logo_main.png"
        alt="AAA Luxury & Sport Rental Car"
        fill
        priority
        sizes={
          size === "footer"
            ? "(max-width: 640px) 220px, 260px"
            : "(max-width: 640px) 180px, 220px"
        }
        className="object-contain object-left"
      />
    </div>
  );
}
