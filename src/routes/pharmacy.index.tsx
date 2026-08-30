import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, ClipboardList, Pill } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { rupiah, useOzik } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/pharmacy/")({
  head: () => ({
    meta: [
      { title: "Workspace Apotek — OzikTrace" },
      {
        name: "description",
        content:
          "Antrean dispense apotek dengan studio QC optik multimodal: foto etiket dan strip obat dicocokkan ke e-resep dokter.",
      },
      { property: "og:title", content: "Workspace Apotek — OzikTrace" },
      {
        property: "og:description",
        content: "Proses antrean resep dan jalankan verifikasi optik sebelum obat diserahkan.",
      },
    ],
  }),
  component: PharmacyPage,
});

function PharmacyPage() {
  const { prescriptions } = useOzik();
  const queue = prescriptions.filter((r) => r.status !== "SETTLED");
  const done = prescriptions.filter((r) => r.status === "SETTLED");

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title="Workspace Farmasi / Apotek" subtitle="Apotek Kimia Farma 042 — 0102A042" />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Antrean aktif", String(queue.length), ClipboardList],
            ["Menunggu QC optik", String(queue.filter((q) => !q.qc).length), Camera],
            ["Diserahkan hari ini", String(done.length), Pill],
          ].map(([label, value, Icon]) => {
            const I = Icon as typeof Pill;
            return (
              <div key={label as string} className="rounded-2xl border border-border bg-background p-5">
                <I className="size-4 text-muted-foreground" />
                <p className="mt-3 text-2xl font-semibold">{value as string}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label as string}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h1 className="text-sm font-medium">Active Dispense Queue</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Resep masuk dari faskes. Jalankan Optical QC Studio sebelum penyerahan obat.
            </p>
          </div>

          <ul className="divide-y divide-border">
            {queue.map((rx) => (
              <li key={rx.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">{rx.id}</span>
                    <StatusBadge status={rx.status} />
                    {rx.mlScore >= 70 && (
                      <span className="rounded-md border border-primary/25 bg-primary-soft px-2 py-0.5 font-mono text-[10px] text-primary">
                        ML {rx.mlScore}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-base font-medium">{rx.patientName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {rx.nik} · {rx.items.length} item · {rupiah(rx.escrowCap)}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{rx.diagnosis}</p>
                </div>
                <Button asChild size="lg" className="shrink-0 shadow-crimson">
                  <Link to="/pharmacy/verify/$id" params={{ id: rx.id }}>
                    Buka QC Studio <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </li>
            ))}
            {queue.length === 0 && (
              <li className="p-10 text-center text-sm text-muted-foreground">Antrean kosong.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
