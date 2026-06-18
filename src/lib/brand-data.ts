import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  getBrandsCollectionName,
  getDb,
  getModelsCollectionName,
} from "@/lib/firebase";

export type BrandRecord = {
  id: string;
  name: string;
};

export function normalizeBrandName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function brandIdFromName(name: string) {
  return normalizeBrandName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function fetchBrandsFromFirestore(): Promise<BrandRecord[]> {
  const db = getDb();
  if (!db) return [];

  const snapshot = await getDocs(collection(db, getBrandsCollectionName()));
  const brands = snapshot.docs
    .map((item) => {
      const data = item.data();
      const name =
        typeof data.name === "string" && data.name.trim().length > 0
          ? normalizeBrandName(data.name)
          : "";

      if (!name) return null;

      return {
        id: item.id,
        name,
      };
    })
    .filter((item): item is BrandRecord => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return brands;
}

export async function createBrand(name: string) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const normalizedName = normalizeBrandName(name);
  if (!normalizedName) {
    throw new Error("La marca no puede estar vacía.");
  }

  const brandId = brandIdFromName(normalizedName);
  if (!brandId) {
    throw new Error(
      "No se pudo generar un identificador válido para la marca.",
    );
  }

  await setDoc(doc(db, getBrandsCollectionName(), brandId), {
    name: normalizedName,
    createdAt: serverTimestamp(),
  });

  return {
    id: brandId,
    name: normalizedName,
  };
}

export async function updateBrand(params: { brandId: string; name: string }) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const brandId = params.brandId.trim();
  const normalizedName = normalizeBrandName(params.name);

  if (!brandId) {
    throw new Error("La marca no es válida.");
  }

  if (!normalizedName) {
    throw new Error("La marca no puede estar vacía.");
  }

  const currentSnapshot = await getDoc(
    doc(db, getBrandsCollectionName(), brandId),
  );
  if (!currentSnapshot.exists()) {
    throw new Error("La marca no existe.");
  }

  const existingBrands = await getDocs(
    collection(db, getBrandsCollectionName()),
  );
  const duplicated = existingBrands.docs.some((item) => {
    if (item.id === brandId) return false;
    const data = item.data();
    return (
      typeof data.name === "string" &&
      normalizeBrandName(data.name).toLowerCase() ===
        normalizedName.toLowerCase()
    );
  });

  if (duplicated) {
    throw new Error("Ya existe otra marca con ese nombre.");
  }

  const relatedModelsSnapshot = await getDocs(
    query(
      collection(db, getModelsCollectionName()),
      where("brandId", "==", brandId),
    ),
  );

  const batch = writeBatch(db);
  batch.update(doc(db, getBrandsCollectionName(), brandId), {
    name: normalizedName,
    updatedAt: serverTimestamp(),
  });

  relatedModelsSnapshot.docs.forEach((item) => {
    batch.update(item.ref, {
      brandName: normalizedName,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();

  return {
    id: brandId,
    name: normalizedName,
  };
}

export async function deleteBrand(brandId: string) {
  const db = getDb();
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const relatedModelsSnapshot = await getDocs(
    query(
      collection(db, getModelsCollectionName()),
      where("brandId", "==", brandId),
    ),
  );

  const batch = writeBatch(db);
  batch.delete(doc(db, getBrandsCollectionName(), brandId));
  relatedModelsSnapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });
  await batch.commit();
}
