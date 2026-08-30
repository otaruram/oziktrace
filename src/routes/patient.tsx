import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Smartphone } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { rupiah, useOzik } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Portal Pasien JKN — OzikTrace" },
      {
        name: "description",
        content:
          "Pantau status e-resep JKN Anda, lihat linimasa penyerahan obat, dan konfirmasi penerimaan dengan PIN 6 digit.",
      },
      { property: "og:title", content: "Portal Pasien JKN — OzikTrace" },
      {
        property: "og:description",
        content: "Linimasa resep dan konfirmasi PIN penerimaan obat langsung dari ponsel.",
      },
    ],
  }),
  component: PatientPage,
});

function PatientPage() {
  const { prescriptions } = useOzik();

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title="Portal Pasien JKN" subtitle="Siti Rahmawati · 0001 2345 6789" />

      <main className="mx-auto w-full max-w-md px-4 py-6">
        <div className="rounded-2xl border border-border bg-background p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Smartphone className="size-5" />
          </span>
          <h1 className="mt-4 text-lg font-semibold">Resep saya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih resep untuk melihat linimasa dan memasukkan PIN saat obat diterima.
          </p>
        </div>

        <ul className="mt-4 space-y-3">
          {prescriptions.map((rx) => (
            <li key={rx.id}>
              <Link
                to="/track/$id"
                params={{ id: rx.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary-soft"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{rx.id}</span>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium">
                    {rx.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {rx.faskes.split("—")[0]!.trim()} · {rupiah(rx.escrowCap)}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Anda juga dapat memindai QR pada label obat di loket apotek.
        </p>
      </main>
    </div>
  );
}
