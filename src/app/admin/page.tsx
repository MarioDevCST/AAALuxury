"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { adminEmail, revokeSecretAdminAccess } from "@/lib/admin-access";
import { signOutAdmin, subscribeToAuthState } from "@/lib/firebase-auth";
import {
  createBrand,
  deleteBrand,
  fetchBrandsFromFirestore,
  type BrandRecord,
  updateBrand,
} from "@/lib/brand-data";
import { hasFirebaseEnv } from "@/lib/firebase";
import {
  createModel,
  fetchModelsFromFirestore,
  type ModelRecord,
  updateModel,
} from "@/lib/model-data";
import { deleteVehicle, fetchVehiclesForAdmin } from "@/lib/vehicle-data";
import { getVehicleImages, type Vehicle } from "@/lib/vehicles";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brandName, setBrandName] = useState("");
  const [modelInputs, setModelInputs] = useState<Record<string, string>>({});
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingModelBrandId, setSavingModelBrandId] = useState("");
  const [creatingModelBrandId, setCreatingModelBrandId] = useState("");
  const [editingBrandId, setEditingBrandId] = useState("");
  const [editingBrandName, setEditingBrandName] = useState("");
  const [savingEditedBrandId, setSavingEditedBrandId] = useState("");
  const [editingModelId, setEditingModelId] = useState("");
  const [editingModelName, setEditingModelName] = useState("");
  const [savingEditedModelId, setSavingEditedModelId] = useState("");
  const [deletingBrandId, setDeletingBrandId] = useState("");
  const [deletingVehicleId, setDeletingVehicleId] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  const modelsByBrand = useMemo(() => {
    return models.reduce<Record<string, ModelRecord[]>>((acc, item) => {
      if (!acc[item.brandId]) acc[item.brandId] = [];
      acc[item.brandId].push(item);
      acc[item.brandId].sort((a, b) => a.name.localeCompare(b.name, "es"));
      return acc;
    }, {});
  }, [models]);

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

    async function loadAdminData() {
      try {
        const [loadedBrands, loadedModels, loadedVehicles] = await Promise.all([
          fetchBrandsFromFirestore(),
          fetchModelsFromFirestore(),
          fetchVehiclesForAdmin(),
        ]);
        if (!cancelled) {
          setBrands(loadedBrands);
          setModels(loadedModels);
          setVehicles(loadedVehicles);
        }
      } catch {
        if (!cancelled) {
          setBrands([]);
          setModels([]);
          setVehicles([]);
        }
      }
    }

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await signOutAdmin();
    revokeSecretAdminAccess();
    router.replace("/");
  }

  async function handleCreateBrand(nextName: string) {
    const name = nextName.trim();
    if (!name) return;

    setSavingBrand(true);
    setAdminMessage("");
    setAdminError("");

    try {
      const created = await createBrand(name);
      setBrands((current) => {
        const merged = [
          ...current.filter((item) => item.id !== created.id),
          created,
        ];
        return merged.sort((a, b) => a.name.localeCompare(b.name, "es"));
      });
      setBrandName("");
      setAdminMessage(`Marca creada: ${created.name}`);
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "No se pudo crear la marca.",
      );
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleDeleteBrand(brand: BrandRecord) {
    setDeletingBrandId(brand.id);
    setAdminMessage("");
    setAdminError("");

    try {
      await deleteBrand(brand.id);
      setBrands((current) => current.filter((item) => item.id !== brand.id));
      setModels((current) =>
        current.filter((item) => item.brandId !== brand.id),
      );
      setModelInputs((current) => {
        const next = { ...current };
        delete next[brand.id];
        return next;
      });
      setAdminMessage(`Marca eliminada: ${brand.name}`);
    } catch (error) {
      setAdminError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la marca.",
      );
    } finally {
      setDeletingBrandId("");
    }
  }

  async function handleUpdateBrand(brand: BrandRecord) {
    const nextName = editingBrandName.trim();
    if (!nextName) {
      setAdminError("Escribe un nombre para la marca.");
      return;
    }

    setSavingEditedBrandId(brand.id);
    setAdminMessage("");
    setAdminError("");

    try {
      const updated = await updateBrand({
        brandId: brand.id,
        name: nextName,
      });
      setBrands((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
      setModels((current) =>
        current
          .map((item) =>
            item.brandId === updated.id
              ? { ...item, brandName: updated.name }
              : item,
          )
          .sort((a, b) => {
            const brandCompare = a.brandName.localeCompare(b.brandName, "es");
            if (brandCompare !== 0) return brandCompare;
            return a.name.localeCompare(b.name, "es");
          }),
      );
      setEditingBrandId("");
      setEditingBrandName("");
      setAdminMessage(`Marca actualizada: ${updated.name}`);
    } catch (error) {
      setAdminError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la marca.",
      );
    } finally {
      setSavingEditedBrandId("");
    }
  }

  async function handleCreateModel(brand: BrandRecord) {
    const modelName = (modelInputs[brand.id] ?? "").trim();
    if (!modelName) {
      setAdminError("Escribe un modelo antes de guardarlo.");
      return;
    }

    setSavingModelBrandId(brand.id);
    setAdminMessage("");
    setAdminError("");

    try {
      const created = await createModel({
        brandId: brand.id,
        brandName: brand.name,
        name: modelName,
      });
      setModels((current) => {
        const merged = [
          ...current.filter((item) => item.id !== created.id),
          created,
        ];
        return merged.sort((a, b) => {
          const brandCompare = a.brandName.localeCompare(b.brandName, "es");
          if (brandCompare !== 0) return brandCompare;
          return a.name.localeCompare(b.name, "es");
        });
      });
      setModelInputs((current) => ({
        ...current,
        [brand.id]: "",
      }));
      setCreatingModelBrandId("");
      setAdminMessage(`Modelo creado: ${created.brandName} ${created.name}`);
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "No se pudo crear el modelo.",
      );
    } finally {
      setSavingModelBrandId("");
    }
  }

  async function handleUpdateModel(model: ModelRecord) {
    const nextName = editingModelName.trim();
    if (!nextName) {
      setAdminError("Escribe un nombre para el modelo.");
      return;
    }

    setSavingEditedModelId(model.id);
    setAdminMessage("");
    setAdminError("");

    try {
      const updated = await updateModel({
        modelId: model.id,
        brandId: model.brandId,
        brandName: model.brandName,
        name: nextName,
      });
      setModels((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => {
            const brandCompare = a.brandName.localeCompare(b.brandName, "es");
            if (brandCompare !== 0) return brandCompare;
            return a.name.localeCompare(b.name, "es");
          }),
      );
      setEditingModelId("");
      setEditingModelName("");
      setAdminMessage(
        `Modelo actualizado: ${updated.brandName} ${updated.name}`,
      );
    } catch (error) {
      setAdminError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el modelo.",
      );
    } finally {
      setSavingEditedModelId("");
    }
  }

  async function handleDeleteVehicle(vehicle: Vehicle) {
    setDeletingVehicleId(vehicle.id);
    setAdminMessage("");
    setAdminError("");

    try {
      await deleteVehicle(vehicle.id);
      setVehicles((current) =>
        current.filter((item) => item.id !== vehicle.id),
      );
      setAdminMessage(`Coche eliminado: ${vehicle.title}`);
    } catch (error) {
      setAdminError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el coche.",
      );
    } finally {
      setDeletingVehicleId("");
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs tracking-[0.4em] text-white/40">
              PANEL INTERNO
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Administrador
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Sesión iniciada como `{user.email}`. De momento dejo esta página
              preparada como puerta de entrada para el CRUD de coches.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
            >
              VOLVER
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-[#5a5a5a] px-5 py-3 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a]"
            >
              CERRAR SESION
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid gap-6">
            <article className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
              <div className="text-xs tracking-[0.3em] text-white/40">
                COCHES
              </div>
              <div className="mt-4 text-xl font-bold">Alta y edición</div>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Gestiona los vehículos y publícalos en la landing.
              </p>
              <Link
                href="/admin/coches/nuevo"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#5a5a5a] px-5 text-xs font-semibold tracking-widest text-white hover:bg-[#6a6a6a]"
              >
                CREAR COCHE
              </Link>
            </article>

            <article className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
              <div className="text-xs tracking-[0.3em] text-white/40">
                METRICAS
              </div>
              <div className="mt-4 text-xl font-bold">
                Rendimiento del negocio
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Accede a un panel demo con visitas, leads, vehículos más vistos
                y métricas comerciales para enseñar al cliente.
              </p>
              <Link
                href="/admin/metricas"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-5 text-xs font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                VER METRICAS
              </Link>
            </article>
          </div>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs tracking-[0.3em] text-white/40">
                  MARCAS
                </div>
                <h2 className="mt-3 text-2xl font-bold">
                  Crear marcas de coches
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  Estas marcas se guardan en Firestore y alimentan el selector
                  de marca y modelo del formulario de alta.
                </p>
              </div>
              <div className="text-sm text-white/50">
                {hasFirebaseEnv()
                  ? `${brands.length} marcas en base de datos`
                  : "Firebase pendiente de configurar"}
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nueva marca"
                className="h-14 rounded-lg bg-black px-5 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
              />
              <button
                type="button"
                onClick={() => void handleCreateBrand(brandName)}
                disabled={savingBrand || !hasFirebaseEnv()}
                className="h-14 rounded-lg bg-[#5a5a5a] px-6 text-sm font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40 sm:w-fit"
              >
                {savingBrand ? "GUARDANDO..." : "CREAR MARCA"}
              </button>
            </div>

            {adminMessage ? (
              <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {adminMessage}
              </div>
            ) : null}

            {adminError ? (
              <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                {adminError}
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {editingBrandId === brand.id ? (
                        <div className="grid gap-3">
                          <input
                            value={editingBrandName}
                            onChange={(e) =>
                              setEditingBrandName(e.target.value)
                            }
                            className="h-10 rounded-lg bg-black px-3 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => void handleUpdateBrand(brand)}
                              disabled={savingEditedBrandId === brand.id}
                              className="rounded-lg bg-[#5a5a5a] px-3 py-2 text-[11px] font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {savingEditedBrandId === brand.id
                                ? "GUARDANDO..."
                                : "GUARDAR"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBrandId("");
                                setEditingBrandName("");
                              }}
                              disabled={savingEditedBrandId === brand.id}
                              className="rounded-lg border border-white/20 px-3 py-2 text-[11px] font-semibold tracking-widest text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              CANCELAR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm tracking-wider text-white/90">
                          {brand.name}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-white/45">
                        {(modelsByBrand[brand.id] ?? []).length} modelos
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Editar ${brand.name}`}
                        onClick={() => {
                          setEditingBrandId(brand.id);
                          setEditingBrandName(brand.name);
                          setAdminError("");
                          setAdminMessage("");
                        }}
                        disabled={
                          deletingBrandId === brand.id ||
                          savingBrand ||
                          savingModelBrandId === brand.id ||
                          savingEditedBrandId === brand.id ||
                          !hasFirebaseEnv()
                        }
                        className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 20h4l10-10-4-4L4 16v4Zm11-13 4 4M13 6l4 4"
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
                        aria-label={`Eliminar ${brand.name}`}
                        onClick={() => void handleDeleteBrand(brand)}
                        disabled={
                          deletingBrandId === brand.id ||
                          savingBrand ||
                          savingModelBrandId === brand.id ||
                          savingEditedBrandId === brand.id ||
                          !hasFirebaseEnv()
                        }
                        className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7h16M10 11v6M14 11v6M9 4h6l1 2H8l1-2Zm-2 3 1 12h8l1-12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {(modelsByBrand[brand.id] ?? []).length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {(modelsByBrand[brand.id] ?? []).map((model) => (
                        <div
                          key={model.id}
                          className="rounded-xl border border-white/10 bg-black/30 p-3"
                        >
                          {editingModelId === model.id ? (
                            <div className="grid gap-3">
                              <input
                                value={editingModelName}
                                onChange={(e) =>
                                  setEditingModelName(e.target.value)
                                }
                                className="h-10 min-w-0 rounded-lg bg-black px-3 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateModel(model)}
                                  disabled={savingEditedModelId === model.id}
                                  className="h-10 rounded-lg bg-[#5a5a5a] px-4 text-xs font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {savingEditedModelId === model.id
                                    ? "GUARDANDO..."
                                    : "ACEPTAR"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingModelId("");
                                    setEditingModelName("");
                                  }}
                                  disabled={savingEditedModelId === model.id}
                                  className="h-10 rounded-lg border border-white/20 px-4 text-xs font-semibold tracking-widest text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  CANCELAR
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm tracking-wider text-white/80">
                                {model.name}
                              </span>
                              <button
                                type="button"
                                aria-label={`Editar ${model.name}`}
                                onClick={() => {
                                  setCreatingModelBrandId("");
                                  setEditingModelId(model.id);
                                  setEditingModelName(model.name);
                                  setAdminError("");
                                  setAdminMessage("");
                                }}
                                disabled={
                                  savingEditedModelId === model.id ||
                                  !hasFirebaseEnv()
                                }
                                className="text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M4 20h4l10-10-4-4L4 16v4Zm11-13 4 4M13 6l4 4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-white/45">
                      Sin modelos asociados.
                    </div>
                  )}
                  <div className="mt-4">
                    {creatingModelBrandId === brand.id ? (
                      <div className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                        <input
                          value={modelInputs[brand.id] ?? ""}
                          onChange={(e) =>
                            setModelInputs((current) => ({
                              ...current,
                              [brand.id]: e.target.value,
                            }))
                          }
                          placeholder={`Nuevo modelo para ${brand.name}`}
                          className="h-11 rounded-lg bg-black px-4 text-sm tracking-widest text-white outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCreateModel(brand)}
                            disabled={
                              savingModelBrandId === brand.id ||
                              deletingBrandId === brand.id ||
                              !hasFirebaseEnv()
                            }
                            className="h-10 rounded-lg bg-[#5a5a5a] px-4 text-xs font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingModelBrandId === brand.id
                              ? "GUARDANDO..."
                              : "ACEPTAR"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingModelBrandId("");
                              setModelInputs((current) => ({
                                ...current,
                                [brand.id]: "",
                              }));
                            }}
                            disabled={savingModelBrandId === brand.id}
                            className="h-10 rounded-lg border border-white/20 px-4 text-xs font-semibold tracking-widest text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModelId("");
                          setEditingModelName("");
                          setCreatingModelBrandId(brand.id);
                          setAdminError("");
                          setAdminMessage("");
                        }}
                        disabled={
                          deletingBrandId === brand.id ||
                          savingModelBrandId === brand.id ||
                          !hasFirebaseEnv()
                        }
                        className="h-11 rounded-lg bg-[#5a5a5a] px-4 text-xs font-semibold tracking-widest text-white hover:bg-[#6a6a6a] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ANADIR OTRO MODELO
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs tracking-[0.3em] text-white/40">
                ANUNCIOS
              </div>
              <h2 className="mt-3 text-2xl font-bold">Coches publicados</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Revisa los anuncios creados y elimina los que ya no quieras
                mostrar en la landing.
              </p>
            </div>
            <div className="text-sm text-white/50">
              {hasFirebaseEnv()
                ? `${vehicles.length} coches publicados`
                : "Firebase pendiente de configurar"}
            </div>
          </div>

          {vehicles.length > 0 ? (
            <div className="mt-8 grid gap-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                      {getVehicleImages(vehicle)[0] ? (
                        <Image
                          src={getVehicleImages(vehicle)[0]}
                          alt={vehicle.title}
                          fill
                          unoptimized
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] tracking-[0.25em] text-white/35">
                          FOTO
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs tracking-[0.25em] text-white/40">
                        {vehicle.brand.toUpperCase()} /{" "}
                        {vehicle.model.toUpperCase()}
                      </div>
                      <div className="mt-2 truncate text-base font-semibold text-white/90">
                        {vehicle.title}
                      </div>
                      <div className="mt-2 text-sm text-white/55">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        }).format(vehicle.priceEUR)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/stock/${vehicle.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-xs font-semibold tracking-widest text-white/80 hover:bg-white/10"
                    >
                      VER FICHA
                    </Link>
                    <Link
                      href={`/admin/coches/${vehicle.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-xs font-semibold tracking-widest text-white/80 hover:bg-white/10"
                    >
                      EDITAR
                    </Link>
                    <button
                      type="button"
                      aria-label={`Eliminar ${vehicle.title}`}
                      onClick={() => void handleDeleteVehicle(vehicle)}
                      disabled={
                        deletingVehicleId === vehicle.id || !hasFirebaseEnv()
                      }
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-red-400/20 px-4 text-xs font-semibold tracking-widest text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingVehicleId === vehicle.id
                        ? "ELIMINANDO..."
                        : "ELIMINAR"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-white/55">
              Todavia no hay coches creados para mostrar en este listado.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
