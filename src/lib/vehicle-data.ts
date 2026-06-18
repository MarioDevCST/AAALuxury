import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDb, getVehiclesCollectionName } from "@/lib/firebase";
import { fallbackVehicles, type Vehicle } from "@/lib/vehicles";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asCreatedAtMillis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFuel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "gasolina" || normalized === "petrol") return "Gasolina";
  if (normalized === "diesel") return "Diesel";
  if (
    normalized === "hibrido" ||
    normalized === "híbrido" ||
    normalized === "hybrid"
  ) {
    return "Híbrido";
  }
  if (
    normalized === "electrico" ||
    normalized === "eléctrico" ||
    normalized === "electric"
  ) {
    return "Eléctrico";
  }

  return value.trim();
}

function normalizeIva(value: string) {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "iva deducible" ||
    normalized === "deducible" ||
    normalized === "deductible"
  ) {
    return "IVA Deducible";
  }

  if (
    normalized === "iva no deducible" ||
    normalized === "no deducible" ||
    normalized === "not deductible"
  ) {
    return "IVA No Deducible";
  }

  return value.trim();
}

function normalizeTransmission(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "manual") return "Manual";
  if (
    normalized === "automatico" ||
    normalized === "automático" ||
    normalized === "automatic"
  ) {
    return "Automático";
  }

  return value.trim();
}

function normalizeVehicle(
  id: string,
  raw: Record<string, unknown>,
): Vehicle | null {
  const brand = asString(raw.brand ?? raw.marca);
  const model = asString(raw.model ?? raw.modelo);
  const title = asString(raw.title ?? raw.titulo ?? raw.name ?? raw.nombre);

  if (!brand || !model || !title) return null;

  const imageSrc = asString(
    raw.imageSrc ?? raw.imageUrl ?? raw.image ?? raw.foto,
  ).trim();
  const imageGallery = [
    imageSrc,
    ...asStringArray(raw.imageGallery),
    ...asStringArray(raw.images),
    ...asStringArray(raw.gallery),
    ...asStringArray(raw.photos),
    ...asStringArray(raw.fotos),
  ].filter(Boolean);

  return {
    id,
    brand,
    model,
    title,
    priceEUR: asNumber(
      raw.priceEUR ?? raw.price ?? raw.precio ?? raw.pricePerDayEUR,
    ),
    fuel: normalizeFuel(asString(raw.fuel ?? raw.combustible, "Gasolina")),
    month: asString(raw.month ?? raw.mes, "01"),
    year: asNumber(raw.year ?? raw.anio ?? raw.ano),
    km: asNumber(raw.km ?? raw.kilometros ?? raw.kilometers),
    transmission: normalizeTransmission(
      asString(raw.transmission ?? raw.cambio, "Automático"),
    ),
    iva: normalizeIva(asString(raw.iva ?? raw.vat, "IVA Deducible")),
    imageSrc: imageGallery[0],
    imageGallery: [...new Set(imageGallery)],
  };
}

export async function fetchVehiclesFromFirestore(): Promise<Vehicle[]> {
  const db = getDb();
  if (!db) return fallbackVehicles;

  const snapshot = await getDocs(collection(db, getVehiclesCollectionName()));
  const vehicles = snapshot.docs
    .map((doc) => {
      const raw = doc.data();
      const vehicle = normalizeVehicle(doc.id, raw);
      if (!vehicle) return null;
      return {
        vehicle,
        createdAt: asCreatedAtMillis(raw.createdAt),
      };
    })
    .filter(
      (item): item is { vehicle: Vehicle; createdAt: number } => item !== null,
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => item.vehicle);

  return vehicles.length > 0 ? vehicles : fallbackVehicles;
}

export async function fetchVehiclesForAdmin(): Promise<Vehicle[]> {
  const db = getDb();
  if (!db) return [];

  const snapshot = await getDocs(collection(db, getVehiclesCollectionName()));
  return snapshot.docs
    .map((doc) => {
      const raw = doc.data();
      const vehicle = normalizeVehicle(doc.id, raw);
      if (!vehicle) return null;
      return {
        vehicle,
        createdAt: asCreatedAtMillis(raw.createdAt),
      };
    })
    .filter(
      (item): item is { vehicle: Vehicle; createdAt: number } => item !== null,
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => item.vehicle);
}

export async function fetchVehicleByIdFromFirestore(id: string) {
  const db = getDb();
  if (!db) {
    return fallbackVehicles.find((vehicle) => vehicle.id === id) ?? null;
  }

  const snapshot = await getDoc(doc(db, getVehiclesCollectionName(), id));
  if (!snapshot.exists()) return null;

  return normalizeVehicle(snapshot.id, snapshot.data());
}

export type CreateVehicleInput = {
  brand: string;
  model: string;
  title: string;
  priceEUR: number;
  fuel: string;
  month: string;
  year: number;
  km: number;
  transmission: string;
  iva: string;
  imageSrc?: string;
  imageGallery?: string[];
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createVehicle(input: CreateVehicleInput) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const cleanedImages = [input.imageSrc ?? "", ...(input.imageGallery ?? [])]
    .map((value) => cleanText(value))
    .filter(Boolean);

  const payload: CreateVehicleInput = {
    brand: cleanText(input.brand),
    model: cleanText(input.model),
    title: cleanText(input.title),
    priceEUR: Number(input.priceEUR),
    fuel: normalizeFuel(cleanText(input.fuel)),
    month: cleanText(input.month),
    year: Number(input.year),
    km: Number(input.km),
    transmission: normalizeTransmission(cleanText(input.transmission)),
    iva: normalizeIva(cleanText(input.iva)),
    imageSrc: cleanedImages[0] ?? "",
    imageGallery: [...new Set(cleanedImages)],
  };

  if (!payload.brand || !payload.model || !payload.title) {
    throw new Error("Marca, modelo y titulo son obligatorios.");
  }

  if (!Number.isFinite(payload.priceEUR) || payload.priceEUR < 0) {
    throw new Error("El precio debe ser un numero valido.");
  }

  if (!Number.isFinite(payload.year) || payload.year < 1900) {
    throw new Error("El ano debe ser valido.");
  }

  if (!payload.month) {
    throw new Error("El mes es obligatorio.");
  }

  if (!Number.isFinite(payload.km) || payload.km < 0) {
    throw new Error("Los kilometros deben ser validos.");
  }

  if (!payload.fuel) {
    throw new Error("El combustible es obligatorio.");
  }

  if (!payload.transmission) {
    throw new Error("La transmision es obligatoria.");
  }

  if (!payload.iva) {
    throw new Error("El IVA es obligatorio.");
  }

  const created = await addDoc(collection(db, getVehiclesCollectionName()), {
    ...payload,
    imageSrc: payload.imageSrc || "",
    imageGallery: payload.imageGallery ?? [],
    createdAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateVehicle(
  vehicleId: string,
  input: CreateVehicleInput,
) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const normalizedId = vehicleId.trim();
  if (!normalizedId) {
    throw new Error("El coche no es válido.");
  }

  const cleanedImages = [input.imageSrc ?? "", ...(input.imageGallery ?? [])]
    .map((value) => cleanText(value))
    .filter(Boolean);

  const payload: CreateVehicleInput = {
    brand: cleanText(input.brand),
    model: cleanText(input.model),
    title: cleanText(input.title),
    priceEUR: Number(input.priceEUR),
    fuel: normalizeFuel(cleanText(input.fuel)),
    month: cleanText(input.month),
    year: Number(input.year),
    km: Number(input.km),
    transmission: normalizeTransmission(cleanText(input.transmission)),
    iva: normalizeIva(cleanText(input.iva)),
    imageSrc: cleanedImages[0] ?? "",
    imageGallery: [...new Set(cleanedImages)],
  };

  if (!payload.brand || !payload.model || !payload.title) {
    throw new Error("Marca, modelo y titulo son obligatorios.");
  }

  if (!Number.isFinite(payload.priceEUR) || payload.priceEUR < 0) {
    throw new Error("El precio debe ser un numero valido.");
  }

  if (!Number.isFinite(payload.year) || payload.year < 1900) {
    throw new Error("El ano debe ser valido.");
  }

  if (!payload.month) {
    throw new Error("El mes es obligatorio.");
  }

  if (!Number.isFinite(payload.km) || payload.km < 0) {
    throw new Error("Los kilometros deben ser validos.");
  }

  if (!payload.fuel) {
    throw new Error("El combustible es obligatorio.");
  }

  if (!payload.transmission) {
    throw new Error("La transmision es obligatoria.");
  }

  if (!payload.iva) {
    throw new Error("El IVA es obligatorio.");
  }

  await updateDoc(doc(db, getVehiclesCollectionName(), normalizedId), {
    ...payload,
    imageSrc: payload.imageSrc || "",
    imageGallery: payload.imageGallery ?? [],
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(vehicleId: string) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const normalizedId = vehicleId.trim();
  if (!normalizedId) {
    throw new Error("El coche no es válido.");
  }

  await deleteDoc(doc(db, getVehiclesCollectionName(), normalizedId));
}
