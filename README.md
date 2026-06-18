## WebCoches

- Landing en `Next.js` preparada para cargar vehículos desde `Firebase Firestore`.
- Si no hay credenciales o la colección está vacía, la web usa un fallback local para no romperse.

## Arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Firebase

1. Copia `firebase.env.example` a `.env.local`
2. Rellena tus credenciales de Firebase
3. Crea colecciones en Firestore llamadas `vehicles`, `brands` y `models`, o cambia las variables `NEXT_PUBLIC_FIREBASE_*_COLLECTION`
4. Activa `Email/Password` en `Firebase Authentication`
5. Crea un usuario administrador, por ejemplo `admin@admin.com`
6. Reinicia el servidor

```bash
cp firebase.env.example .env.local
```

## Estructura esperada en Firestore

Cada documento de la colección puede tener estos campos:

```ts
{
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
  imageSrc: "/o-url-de-la-imagen.jpg"
}
```

También se aceptan alias comunes como `marca`, `modelo`, `titulo`, `precio`, `combustible`, `mes`, `anio`, `kilometros`, `cambio`, `imageUrl` o `foto`.

## Archivos clave

- `src/lib/firebase.ts`: inicialización del cliente Firebase
- `src/lib/vehicle-data.ts`: lectura y normalización de datos desde Firestore
- `src/lib/brand-data.ts`: lectura y escritura de marcas en Firestore
- `src/lib/model-data.ts`: lectura y escritura de modelos en Firestore
- `src/lib/vehicles.ts`: tipos, helpers y fallback local
- `src/components/Landing.tsx`: uso de los datos en la landing
- `src/app/admin/coches/nuevo/page.tsx`: formulario de alta de coches

## Comportamiento actual

- Con credenciales válidas + colección con datos: carga desde Firestore
- Sin credenciales o si Firestore falla: usa datos locales de respaldo
- Si en el formulario público introduces `Nombre = admin` y `E-mail = admin@admin.com`, se abre el login interno secreto
- El área `/admin` requiere una sesión válida de Firebase Auth y está restringida al email `admin@admin.com`
- Las marcas creadas en `/admin` se guardan en la colección `brands` y alimentan el `select` de marcas de la landing
- Los modelos se guardan en `models` vinculados a una marca y el `select` de modelos solo muestra los asociados a la marca elegida
- Desde `/admin/coches/nuevo` puedes crear vehículos en Firestore usando marcas y modelos ya cargados
