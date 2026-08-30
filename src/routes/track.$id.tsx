import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleDot,
  FileCheck2,
  Package,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { rupiah, useOzik } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/track/$id")({
  head: () => ({
    meta: [
      { title: "Lacak Resep & Konfirmasi PIN — OzikTrace" },
      {
        name: "description",
        content:
          "Linimasa penyerahan obat JKN dan pad PIN 6 digit untuk membuktikan penerimaan fisik dengan segel SHA-256.",
      },
      { property: "og:title", content: "Lacak Resep & Konfirmasi PIN — OzikTrace" },
      {
        property: "og:description",
        content: "Masukkan PIN 6 digit untuk melepas klaim dari escrow BPJS.",
      },
    ],
  }),
  component: TrackPage,
});

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

function TrackPage() {
  const { id } = Route.useParams();
  const { prescriptions, verifyPin } = useOzik();
  const rx = prescriptions.find((r) => r.id === id);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  if (!rx) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader title="Lacak Resep" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Resep {id} tidak ditemukan.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/patient">Kembali</Link>
          </Button>
        </div>
      </div>
    );
  }

  const settled = rx.status === "SETTLED";
  const steps = [
    { label: "E-Resep Diterbitkan", icon: FileCheck2, done: true },
    { label: "Lolos Scan AI Farmasi", icon: ScanLine, done: !!rx.qc && !rx.qc.mismatch },
    { label: "Siap Diambil di Loket / Kurir", icon: Package, done: rx.status === "READY_PICKUP" || settled },
    { label: "Diterima & Klaim Terverifikasi", icon: ShieldCheck, done: settled },
  ];

  const press = (k: string) => {
    if (k === "⌫") return setPin((p) => p.slice(0, -1));
    if (!k || pin.length >= 6) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        const ok = verifyPin(rx.id, next);
        if (!ok) {
          setShake(true);
          setPin("");
          setTimeout(() => setShake(false), 500);
          toast.error("PIN tidak valid. Minta ulang kode ke petugas apotek.");
        } else {
          toast.success("Proof-of-Dispense terverifikasi — klaim dilepas dari escrow.");
        }
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title="Lacak Penyerahan Obat" subtitle={rx.id} />

      <main className="mx-auto w-full max-w-md px-4 py-6 pb-16">
        <Link
          to="/patient"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Resep saya
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted-foreground">{rx.id}</span>
            <StatusBadge status={rx.status} />
          </div>
          <h1 className="mt-3 text-lg font-semibold">{rx.patientName}</h1>
          <p className="font-mono text-xs text-muted-foreground">
            {rx.nik} · {rx.faskes}
          </p>
          <ul className="mt-4 space-y-2">
            {rx.items.map((it, i) => (
              <li key={i} className="flex justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs">
                <span className="font-medium">
                  {it.name} <span className="text-muted-foreground">· {it.usage}</span>
                </span>
                <span className="font-mono text-muted-foreground">{it.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Plafon klaim escrow <span className="font-medium text-foreground">{rupiah(rx.escrowCap)}</span>
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-4 rounded-2xl border border-border bg-background p-5">
          <h2 className="text-sm font-medium">Dispense Timeline</h2>
          <ol className="mt-4 space-y-1">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full border ${
                      s.done
                        ? "border-primary/30 bg-crimson-gradient text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {s.done ? <Check className="size-3.5" /> : <CircleDot className="size-3.5" />}
                  </span>
                  {i < steps.length - 1 && (
                    <span className={`w-px flex-1 ${s.done ? "bg-primary/30" : "bg-border"}`} />
                  )}
                </div>
                <div className="pb-5">
                  <p className={`text-sm ${s.done ? "font-medium" : "text-muted-foreground"}`}>{s.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    {s.done ? "selesai" : "menunggu"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* PIN / seal */}
        {settled ? (
          <div className="animate-seal mt-4 rounded-2xl border border-success/30 bg-success-soft p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-background text-success">
              <ShieldCheck className="size-6" />
            </span>
            <p className="mt-4 text-sm font-semibold tracking-tight text-success">
              BPJS CLAIM VERIFIED
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PROOF-OF-DISPENSE TAMPER-PROOF SEAL (SHA-256)
            </p>
            <p className="mt-4 rounded-lg border border-border bg-background p-3 font-mono text-[10px] break-all">
              {rx.sealHash}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-background p-5">
            <h2 className="text-sm font-medium">Konfirmasi Penerimaan Obat</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Masukkan 6 digit PIN dari petugas apotek. Demo PIN:{" "}
              <span className="font-mono text-foreground">{rx.pin}</span>
            </p>

            <div className={`mt-5 flex justify-center gap-2 ${shake ? "animate-pulse" : ""}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`grid h-12 w-10 place-items-center rounded-lg border font-mono text-lg ${
                    pin.length === i
                      ? "animate-pulse-ring border-primary"
                      : pin[i]
                        ? "border-border-strong bg-surface"
                        : "border-border"
                  }`}
                >
                  {pin[i] ? "•" : ""}
                </span>
              ))}
            </div>

            <div className="mx-auto mt-6 grid max-w-[280px] grid-cols-3 gap-2">
              {KEYS.map((k, i) =>
                k === "" ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    onClick={() => press(k)}
                    className="h-14 rounded-xl border border-border bg-background text-lg font-medium transition-colors active:bg-primary-soft active:text-primary"
                  >
                    {k}
                  </button>
                ),
              )}
            </div>

            {rx.status === "QC_MISMATCH" && (
              <p className="mt-5 rounded-lg border border-primary/25 bg-primary-soft p-3 text-center text-xs text-primary">
                QC optik menemukan ketidaksesuaian. Konfirmasi ditahan hingga verifikator BPJS meninjau.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
