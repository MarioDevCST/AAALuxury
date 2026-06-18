"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { adminEmail } from "@/lib/admin-access";
import { signOutAdmin, subscribeToAuthState } from "@/lib/firebase-auth";

type MetricCard = {
  label: string;
  value: string;
  change: string;
};

type ChannelMetric = {
  label: string;
  value: number;
};

type VehicleMetric = {
  name: string;
  views: number;
  leads: number;
  conversion: string;
};

const primaryMetrics: MetricCard[] = [
  { label: "Visitas este mes", value: "12.480", change: "+18%" },
  { label: "Leads generados", value: "186", change: "+12%" },
  { label: "Clicks en WhatsApp", value: "94", change: "+21%" },
  { label: "Conversion media", value: "1,49%", change: "+0,2 pts" },
];

const acquisitionChannels: ChannelMetric[] = [
  { label: "Google", value: 46 },
  { label: "Instagram", value: 24 },
  { label: "Directo", value: 18 },
  { label: "Referidos", value: 12 },
];

const engagementMetrics: ChannelMetric[] = [
  { label: "Fichas vistas", value: 782 },
  { label: "Clicks telefono", value: 57 },
  { label: "Formularios", value: 35 },
  { label: "Solicitudes premium", value: 22 },
];

const topVehicles: VehicleMetric[] = [
  {
    name: "Porsche 911 Turbo S",
    views: 214,
    leads: 26,
    conversion: "12,1%",
  },
  {
    name: "Mercedes G63 AMG",
    views: 188,
    leads: 19,
    conversion: "10,1%",
  },
  {
    name: "Ferrari F8 Spider",
    views: 172,
    leads: 21,
    conversion: "12,2%",
  },
  {
    name: "Lamborghini Urus",
    views: 161,
    leads: 17,
    conversion: "10,6%",
  },
];

const topFilters: ChannelMetric[] = [
  { label: "Porsche", value: 132 },
  { label: "Mercedes", value: 118 },
  { label: "SUV", value: 91 },
  { label: "Automatico", value: 86 },
];

function MetricBarList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ChannelMetric[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="text-xs tracking-[0.3em] text-white/40">{title}</div>
      <p className="mt-3 text-sm leading-6 text-white/70">{description}</p>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/85">{item.label}</span>
              <span className="text-white/60">{item.value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-white/80"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const totalVehicleViews = useMemo(
    () => topVehicles.reduce((sum, vehicle) => sum + vehicle.views, 0),
    [],
  );

  if (loading) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs tracking-[0.4em] text-white/40">
              PANEL INTERNO
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Metricas del negocio
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
              Vista demo para presentar al cliente el tipo de informacion que
              podria consultar dentro del panel: captacion, interes comercial y
              rendimiento del catalogo.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10"
            >
              VOLVER AL ADMIN
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
            >
              <div className="text-xs tracking-[0.3em] text-white/40">
                KPI
              </div>
              <div className="mt-4 text-sm text-white/65">{metric.label}</div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight">
                {metric.value}
              </div>
              <div className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-200">
                {metric.change}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs tracking-[0.3em] text-white/40">
                  TOP VEHICULOS
                </div>
                <h2 className="mt-3 text-2xl font-bold">
                  Vehiculos con mas interes
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  Ranking demo con los coches que mas visitas y contactos
                  generan dentro del escaparate.
                </p>
              </div>
              <div className="text-sm text-white/50">
                {totalVehicleViews} visitas acumuladas
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs tracking-[0.25em] text-white/35">
                    <th className="pb-2 font-medium">VEHICULO</th>
                    <th className="pb-2 font-medium">VISTAS</th>
                    <th className="pb-2 font-medium">LEADS</th>
                    <th className="pb-2 font-medium">CONVERSION</th>
                  </tr>
                </thead>
                <tbody>
                  {topVehicles.map((vehicle) => (
                    <tr key={vehicle.name} className="rounded-xl bg-black/40">
                      <td className="rounded-l-xl px-4 py-4 text-sm text-white/90">
                        {vehicle.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/70">
                        {vehicle.views}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/70">
                        {vehicle.leads}
                      </td>
                      <td className="rounded-r-xl px-4 py-4 text-sm text-emerald-200">
                        {vehicle.conversion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-6">
            <MetricBarList
              title="CAPTACION"
              description="Distribucion demo de visitas por canal para explicar al cliente de donde llega el trafico."
              items={acquisitionChannels}
            />
            <MetricBarList
              title="INTERACCION"
              description="Eventos comerciales mas importantes: vistas de fichas, telefono, formularios y solicitudes premium."
              items={engagementMetrics}
            />
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <MetricBarList
            title="FILTROS MAS USADOS"
            description="Resumen demo de las marcas y criterios que mas utiliza el usuario al navegar por la web."
            items={topFilters}
          />

          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="text-xs tracking-[0.3em] text-white/40">
              RESUMEN EJECUTIVO
            </div>
            <h2 className="mt-4 text-2xl font-bold">Lectura rapida para demo</h2>
            <div className="mt-6 grid gap-4 text-sm leading-6 text-white/75">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                El trafico de mayor calidad llega desde Google y concentra la
                mayor parte de los leads.
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                Los deportivos premium generan mas interes que los SUV, aunque
                estos ultimos mantienen un volumen alto de visitas.
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                WhatsApp funciona como principal accion comercial, por encima
                del formulario y del telefono.
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                Este bloque sirve para enseñar al cliente como podria leer el
                negocio de un vistazo desde su panel.
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
