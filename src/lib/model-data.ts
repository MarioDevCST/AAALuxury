import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { brandIdFromName, normalizeBrandName } from "@/lib/brand-data";
import { getDb, getModelsCollectionName } from "@/lib/firebase";

export type ModelRecord = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
};

function normalizeModelName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function modelIdFromParts(brandId: string, modelName: string) {
  const normalizedModelId = brandIdFromName(modelName);
  return `${brandId}__${normalizedModelId}`;
}

export async function fetchModelsFromFirestore(): Promise<ModelRecord[]> {
  const db = getDb();
  if (!db) return [];

  const snapshot = await getDocs(collection(db, getModelsCollectionName()));
  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const name =
        typeof data.name === "string" && data.name.trim().length > 0
          ? normalizeModelName(data.name)
          : "";
      const brandId =
        typeof data.brandId === "string" && data.brandId.trim().length > 0
          ? data.brandId.trim()
          : "";
      const brandName =
        typeof data.brandName === "string" && data.brandName.trim().length > 0
          ? normalizeBrandName(data.brandName)
          : "";

      if (!name || !brandId || !brandName) return null;

      return {
        id: item.id,
        name,
        brandId,
        brandName,
      };
    })
    .filter((item): item is ModelRecord => item !== null)
    .sort((a, b) => {
      const brandCompare = a.brandName.localeCompare(b.brandName, "es");
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name, "es");
    });
}

export async function createModel(params: {
  brandId: string;
  brandName: string;
  name: string;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const brandId = params.brandId.trim();
  const brandName = normalizeBrandName(params.brandName);
  const modelName = normalizeModelName(params.name);

  if (!brandId || !brandName) {
    throw new Error("Selecciona una marca válida.");
  }

  if (!modelName) {
    throw new Error("El modelo no puede estar vacío.");
  }

  const modelId = modelIdFromParts(brandId, modelName);
  if (!modelId.endsWith("__")) {
    await setDoc(doc(db, getModelsCollectionName(), modelId), {
      name: modelName,
      brandId,
      brandName,
      createdAt: serverTimestamp(),
    });

    return {
      id: modelId,
      name: modelName,
      brandId,
      brandName,
    };
  }

  throw new Error("No se pudo generar un identificador válido para el modelo.");
}

export async function updateModel(params: {
  modelId: string;
  brandId: string;
  brandName: string;
  name: string;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const modelId = params.modelId.trim();
  const brandId = params.brandId.trim();
  const brandName = normalizeBrandName(params.brandName);
  const modelName = normalizeModelName(params.name);

  if (!modelId || !brandId || !brandName) {
    throw new Error("El modelo no es válido.");
  }

  if (!modelName) {
    throw new Error("El modelo no puede estar vacío.");
  }

  const existingModels = await getDocs(
    query(
      collection(db, getModelsCollectionName()),
      where("brandId", "==", brandId),
    ),
  );

  const duplicated = existingModels.docs.some((item) => {
    if (item.id === modelId) return false;
    const data = item.data();
    return (
      typeof data.name === "string" &&
      normalizeModelName(data.name).toLowerCase() === modelName.toLowerCase()
    );
  });

  if (duplicated) {
    throw new Error("Ya existe otro modelo con ese nombre en esta marca.");
  }

  await updateDoc(doc(db, getModelsCollectionName(), modelId), {
    name: modelName,
    brandName,
    updatedAt: serverTimestamp(),
  });

  return {
    id: modelId,
    name: modelName,
    brandId,
    brandName,
  };
}

export async function fetchModelsByBrandId(brandId: string) {
  const db = getDb();
  if (!db || !brandId) return [];

  const snapshot = await getDocs(
    query(
      collection(db, getModelsCollectionName()),
      where("brandId", "==", brandId),
    ),
  );

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const name =
        typeof data.name === "string" && data.name.trim().length > 0
          ? normalizeModelName(data.name)
          : "";
      return name || null;
    })
    .filter((item): item is string => item !== null)
    .sort((a, b) => a.localeCompare(b, "es"));
}
