"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import { adminEmail } from "@/lib/admin-access";
import { subscribeToAuthState } from "@/lib/firebase-auth";

export function AdminQuickAccess() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;
  if (pathname.startsWith("/admin")) return null;
  if (user?.email?.toLowerCase() !== adminEmail) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 items-center rounded-full border border-white/20 bg-black/85 px-5 text-xs font-semibold tracking-widest text-white shadow-2xl backdrop-blur hover:bg-black"
    >
      VOLVER AL PANEL
    </Link>
  );
}
