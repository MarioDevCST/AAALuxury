export type Vehicle = {
  id: string;
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

export const fallbackVehicles: Vehicle[] = [
  {
    id: "porsche-911-992",
    brand: "Porsche",
    model: "911",
    title: "PORSCHE 911 992 CARRERA CABRIO",
    priceEUR: 149000,
    fuel: "Gasolina",
    month: "05",
    year: 2020,
    km: 21900,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "vw-golf-mk1",
    brand: "Volkswagen",
    model: "Golf",
    title: "VOLKSWAGEN GOLF MK1 CABRIOLET",
    priceEUR: 24900,
    fuel: "Gasolina",
    month: "03",
    year: 1991,
    km: 98300,
    transmission: "Manual",
    iva: "IVA No Deducible",
  },
  {
    id: "audi-rs6",
    brand: "Audi",
    model: "RS6",
    title: "AUDI RS6 MTM",
    priceEUR: 129900,
    fuel: "Gasolina",
    month: "11",
    year: 2020,
    km: 35500,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "vw-amarok",
    brand: "Volkswagen",
    model: "Amarok",
    title: "VOLKSWAGEN AMAROK",
    priceEUR: 57900,
    fuel: "Diesel",
    month: "02",
    year: 2024,
    km: 12500,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "mb-gls-400d",
    brand: "Mercedes-Benz",
    model: "GLS",
    title: "MERCEDES-BENZ GLS 400d 4MATIC",
    priceEUR: 114900,
    fuel: "Diesel",
    month: "07",
    year: 2020,
    km: 48200,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "porsche-cayenne-coupe-v6",
    brand: "Porsche",
    model: "Cayenne",
    title: "PORSCHE CAYENNE COUPE V6",
    priceEUR: 96900,
    fuel: "Gasolina",
    month: "09",
    year: 2020,
    km: 41700,
    transmission: "Automático",
    iva: "IVA No Deducible",
  },
  {
    id: "corvette-c8",
    brand: "Corvette",
    model: "C8",
    title: "CORVETTE C8 STINGRAY 70 ANIVERSARIO Z06",
    priceEUR: 189900,
    fuel: "Gasolina",
    month: "01",
    year: 2022,
    km: 6400,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "abarth-595",
    brand: "Abarth",
    model: "595",
    title: "ABARTH 595 CABRIO ED. MONSTER ENERGY YAMAHA",
    priceEUR: 28900,
    fuel: "Gasolina",
    month: "06",
    year: 2020,
    km: 51200,
    transmission: "Manual",
    iva: "IVA No Deducible",
  },
  {
    id: "landrover-svr",
    brand: "Land Rover",
    model: "Range Rover Sport",
    title: "LAND ROVER RANGE ROVER SPORT SVR",
    priceEUR: 104900,
    fuel: "Gasolina",
    month: "10",
    year: 2019,
    km: 55800,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "porsche-cayenne-gts",
    brand: "Porsche",
    model: "Cayenne",
    title: "PORSCHE CAYENNE GTS COUPE",
    priceEUR: 169900,
    fuel: "Gasolina",
    month: "04",
    year: 2025,
    km: 1200,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "audi-rs3",
    brand: "Audi",
    model: "RS3",
    title: "AUDI RS3 SPORTBACK NUEVO A ESTRENAR",
    priceEUR: 79900,
    fuel: "Gasolina",
    month: "02",
    year: 2026,
    km: 80,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
  {
    id: "bmw-m4",
    brand: "BMW",
    model: "M4",
    title: "BMW M4 COMPETITION Xdrive",
    priceEUR: 88900,
    fuel: "Gasolina",
    month: "08",
    year: 2022,
    km: 27100,
    transmission: "Automático",
    iva: "IVA Deducible",
  },
];

export function deriveBrandModels(
  vehicles: Vehicle[],
): Record<string, string[]> {
  const map = new Map<string, Set<string>>();

  for (const vehicle of vehicles) {
    if (!map.has(vehicle.brand)) {
      map.set(vehicle.brand, new Set());
    }
    map.get(vehicle.brand)?.add(vehicle.model);
  }

  return Object.fromEntries(
    [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([brand, models]) => [
        brand,
        [...models].sort((a, b) => a.localeCompare(b, "es")),
      ]),
  );
}

export function getVehicleImages(vehicle: Vehicle) {
  const images = [vehicle.imageSrc, ...(vehicle.imageGallery ?? [])]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(images)];
}
