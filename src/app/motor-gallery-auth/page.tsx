"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminEmail, hasSecretAdminAccess } from "@/lib/admin-access";
import {
  signInAdmin,
  signOutAdmin,
  subscribeToAuthState,
} from "@/lib/firebase-auth";
import { getMissingFirebaseEnvKeys, hasFirebaseEnv } from "@/lib/firebase";

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const missingEnv = getMissingFirebaseEnvKeys();

  useEffect(() => {
    if (!hasSecretAdminAccess()) {
      router.replace("/");
      return;
    }
    queueMicrotask(() => setCheckingAccess(false));
  }, [router]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        router.replace("/admin");
      }
    });

    return unsubscribe;
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credential = await signInAdmin(email.trim(), password);
      if (credential.user.email?.toLowerCase() !== adminEmail) {
        await signOutAdmin();
        throw new Error("Esta cuenta no tiene permisos de administrador.");
      }
      router.replace("/admin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAccess) {
    return <main className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <div className="text-xs tracking-[0.4em] text-white/40">
          ACCESO INTERNO
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
          Login de administrador
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/70">
          Esta pantalla ya usa Firebase Auth con email y password. Mantengo el
          acceso oculto detrás del formulario público, pero la autenticación
          real ocurre aquí.
        </p>

        {!hasFirebaseEnv() ? (
          <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            Firebase no está configurado todavía. Rellena las credenciales en
            `.env.local` para poder iniciar sesión.
            {missingEnv.length > 0 ? (
              <div className="mt-3 text-xs text-amber-100/90">
                Faltan: {missingEnv.join(", ")}
              </div>
            ) : null}
          </div>
        ) : null}

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail admin"
            className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
            autoComplete="current-password"
          />
          {error ? (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading || !hasFirebaseEnv()}
            className="h-14 rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white transition-colors hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}
