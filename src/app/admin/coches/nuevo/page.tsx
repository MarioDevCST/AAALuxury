"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { adminEmail } from "@/lib/admin-access";
import { subscribeToAuthState, signOutAdmin } from "@/lib/firebase-auth";
import { hasFirebaseEnv } from "@/lib/firebase";
import { fetchBrandsFromFirestore, type BrandRecord } from "@/lib/brand-data";
import { fetchModelsFromFirestore, type ModelRecord } from "@/lib/model-data";
import { createVehicle } from "@/lib/vehicle-data";

type VehicleFormState = {
  brandId: string;
  brand: string;
  model: string;
  title: string;
  priceEUR: string;
  fuel: string;
  month: string;
  year: string;
  km: string;
  transmission: string;
  iva: string;
  imageGalleryText: string;
};

const fuelOptions = ["Gasolina", "Diesel", "Hibrido", "Electrico"] as const;
const transmissionOptions = ["Manual", "Automático"] as const;
const ivaOptions = ["IVA Deducible", "IVA No Deducible"] as const;

const initialForm: VehicleFormState = {
  brandId: "",
  brand: "",
  model: "",
  title: "",
  priceEUR: "",
  fuel: "Gasolina",
  month: "",
  year: String(new Date().getFullYear()),
  km: "",
  transmission: "Automático",
  iva: "IVA Deducible",
  imageGalleryText: "",
};

function parseImageGallery(value: string) {
  return [...new Set(value.split("\n").map((item) => item.trim()).filter(Boolean))];
}

export default function NewVehiclePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [form, setForm] = useState<VehicleFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        router.replace("/motor-gallery-auth");
        return;
      }

      if (nextUser.email?.toLowerCase() !== adminEmail) {
        void signOutAdmin().finally(() => {
          router.replace("/");
        });
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [loadedBrands, loadedModels] = await Promise.all([
          fetchBrandsFromFirestore(),
          fetchModelsFromFirestore(),
        ]);

        if (cancelled) return;

        setBrands(loadedBrands);
        setModels(loadedModels);
        setForm((current) => {
          const nextBrand =
            current.brandId &&
            loadedBrands.some((brand) => brand.id === current.brandId)
              ? loadedBrands.find((brand) => brand.id === current.brandId)
              : loadedBrands[0];

          if (!nextBrand) return current;

          if (
            current.brandId &&
            loadedBrands.some((brand) => brand.id === current.brandId)
          ) {
            return current;
          }

          return {
            ...current,
            brandId: nextBrand?.id ?? "",
            brand: nextBrand?.name ?? "",
            model: "",
          };
        });
      } catch {
        if (cancelled) return;
        setBrands([]);
        setModels([]);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableModels = useMemo(() => {
    if (!form.brandId) return [];
    return models
      .filter((model) => model.brandId === form.brandId)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [form.brandId, models]);

  function handleBrandChange(nextBrandId: string) {
    const selectedBrand = brands.find((brand) => brand.id === nextBrandId);
    setForm((current) => ({
      ...current,
      brandId: nextBrandId,
      brand: selectedBrand?.name ?? "",
      model: "",
    }));
  }

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    e,
  ) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createVehicle({
        brand: form.brand,
        model: form.model,
        title: form.title,
        priceEUR: Number(form.priceEUR),
        fuel: form.fuel,
        month: form.month,
        year: Number(form.year),
        km: Number(form.km),
        transmission: form.transmission,
        iva: form.iva,
        imageSrc: parseImageGallery(form.imageGalleryText)[0],
        imageGallery: parseImageGallery(form.imageGalleryText),
      });
      router.push("/#latest");
      router.refresh();
      return;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo crear el coche.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs tracking-[0.4em] text-white/40">COCHES</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Crear coche
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Completa los datos basicos del vehiculo para guardarlo en la
              coleccion `vehicles` de Firestore.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
            >
              VOLVER AL PANEL
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                MARCA
              </span>
              <select
                value={form.brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                disabled={!brands.length || !hasFirebaseEnv()}
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <option value="">Selecciona marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                MODELO
              </span>
              <select
                value={form.model}
                onChange={(e) =>
                  setForm((current) => ({ ...current, model: e.target.value }))
                }
                disabled={!availableModels.length || !hasFirebaseEnv()}
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <option value="">Selecciona modelo</option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs tracking-widest text-white/60">
                TITULO
              </span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((current) => ({ ...current, title: e.target.value }))
                }
                placeholder="PORSCHE 911 CARRERA 4S"
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                PRECIO
              </span>
              <input
                type="number"
                min="0"
                value={form.priceEUR}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    priceEUR: e.target.value,
                  }))
                }
                placeholder="129900"
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                COMBUSTIBLE
              </span>
              <select
                value={form.fuel}
                onChange={(e) =>
                  setForm((current) => ({ ...current, fuel: e.target.value }))
                }
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {fuelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">MES</span>
              <input
                value={form.month}
                onChange={(e) =>
                  setForm((current) => ({ ...current, month: e.target.value }))
                }
                placeholder="06"
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">ANO</span>
              <input
                type="number"
                min="1900"
                value={form.year}
                onChange={(e) =>
                  setForm((current) => ({ ...current, year: e.target.value }))
                }
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                CAMBIO
              </span>
              <select
                value={form.transmission}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    transmission: e.target.value,
                  }))
                }
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {transmissionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                KM
              </span>
              <input
                type="number"
                min="0"
                value={form.km}
                onChange={(e) =>
                  setForm((current) => ({ ...current, km: e.target.value }))
                }
                placeholder="25000"
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-widest text-white/60">
                IVA
              </span>
              <select
                value={form.iva}
                onChange={(e) =>
                  setForm((current) => ({ ...current, iva: e.target.value }))
                }
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {ivaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs tracking-widest text-white/60">
                IMAGENES
              </span>
              <textarea
                value={form.imageGalleryText}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    imageGalleryText: e.target.value,
                  }))
                }
                placeholder={
                  "https://.../foto-1.jpg\nhttps://.../foto-2.jpg\nhttps://.../foto-3.jpg"
                }
                rows={5}
                className="rounded-lg bg-black px-5 py-4 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
              <span className="text-xs leading-5 text-white/45">
                Introduce una URL por linea. La primera imagen se usara como
                portada en el listado.
              </span>
            </label>
          </div>

          {!brands.length ? (
            <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              Crea al menos una marca y un modelo en el panel admin antes de dar
              de alta un coche.
            </div>
          ) : null}

          {!availableModels.length && form.brandId ? (
            <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              La marca seleccionada no tiene modelos. Anade uno desde el panel
              admin para continuar.
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              className="inline-flex h-14 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
            >
              CANCELAR
            </Link>
            <button
              type="submit"
              disabled={
                saving ||
                !hasFirebaseEnv() ||
                (!brands.length && !availableModels.length)
              }
              className="h-14 rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "GUARDANDO..." : "CREAR COCHE"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
