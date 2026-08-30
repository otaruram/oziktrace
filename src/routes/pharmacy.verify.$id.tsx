import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  QrCode,
  ScanLine,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { rupiah, useOzik, type QcResult } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/pharmacy/verify/$id")({
  head: () => ({
    meta: [
      { title: "Optical QC Studio — OzikTrace" },
      {
        name: "description",
        content:
          "Studio verifikasi optik multimodal: unggah 2–5 foto etiket dan strip obat untuk dicocokkan dengan e-resep.",
      },
      { property: "og:title", content: "Optical QC Studio — OzikTrace" },
      {
        property: "og:description",
        content: "Cocokkan foto etiket dan strip obat dengan resep dokter sebelum penyerahan.",
      },
    ],
  }),
  component: VerifyPage,
});

const SLOTS = ["Etiket label", "Strip / blister 1", "Strip / blister 2", "Kemasan luar", "Bukti serah"];

function VerifyPage() {
  const { id } = Route.useParams();
  const { prescriptions, submitQc } = useOzik();
  const router = useRouter();
  const rx = prescriptions.find((r) => r.id === id);

  const [photos, setPhotos] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<QcResult | null>(null);

  if (!rx) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader title="Optical QC Studio" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Resep {id} tidak ditemukan.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/pharmacy">Kembali ke antrean</Link>
          </Button>
        </div>
      </div>
    );
  }

  const addPhoto = () => {
    if (photos.length >= 5) return toast.error("Maksimal 5 foto.");
    setPhotos((p) => [...p, SLOTS[p.length] ?? `Frame ${p.length + 1}`]);
  };

  const runScan = () => {
    if (photos.length < 2) return toast.error("Minimal 2 foto: etiket dan strip obat.");
    setScanning(true);
    setTimeout(() => {
      const r = submitQc(rx.id, photos);
      setResult(r);
      setScanning(false);
      toast[r.mismatch ? "error" : "success"](
        r.mismatch ? "QC MISMATCH — klaim ditahan" : `QC lolos — confidence ${r.confidence}%`,
      );
    }, 1400);
  };

  const finish = () => {
    toast.success("Label QR dicetak. Pasien dapat memindai untuk konfirmasi PIN.");
    router.navigate({ to: "/track/$id", params: { id: rx.id } });
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title="Multimodal Optical QC Studio" subtitle={`${rx.id} · ${rx.patientName}`} />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/pharmacy"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Antrean dispense
        </Link>

        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {/* Left: prescription */}
          <section className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Rincian Resep Dokter</h2>
              <StatusBadge status={rx.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                ["Pasien", rx.patientName],
                ["NIK", rx.nik],
                ["Dokter", rx.doctor],
                ["Faskes", rx.faskes],
                ["Diagnosis", rx.diagnosis],
                ["Plafon escrow", rupiah(rx.escrowCap)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr className="text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    <th className="px-3 py-2">Obat</th>
                    <th className="px-3 py-2">Dosis</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Aturan</th>
                  </tr>
                </thead>
                <tbody>
                  {rx.items.map((it, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2.5 font-medium">{it.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{it.dosage}</td>
                      <td className="px-3 py-2.5 font-mono">{it.qty}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{it.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right: uploader + AI match */}
          <section className="space-y-5">
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Camera / Uploader — Etiket & Strip Obat</h2>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {photos.length}/5 · min 2
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-surface-strong"
                  >
                    <div className="grid h-full place-items-center">
                      <ScanLine className="size-6 text-muted-foreground" />
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-background/90 px-1.5 py-0.5 font-mono text-[9px]">
                      {p}
                    </span>
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, x) => x !== i))}
                      className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md border border-border bg-background text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                      aria-label="Hapus foto"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    onClick={addPhoto}
                    className="grid aspect-4/3 place-items-center rounded-xl border border-dashed border-border-strong bg-surface text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-primary"
                  >
                    <span className="flex flex-col items-center gap-1.5">
                      <ImagePlus className="size-5" />
                      <span className="text-[11px]">Ambil foto</span>
                    </span>
                  </button>
                )}
              </div>

              <Button onClick={runScan} disabled={scanning} size="lg" className="mt-5 w-full shadow-crimson">
                {scanning ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
                {scanning ? "Menganalisis frame…" : "Jalankan AI Vision Match"}
              </Button>
            </div>

            {result && (
              <div
                className={`rounded-2xl border bg-background p-5 ${result.mismatch ? "border-primary/40" : "border-border"}`}
              >
                <div className="flex items-center gap-2">
                  {result.mismatch ? (
                    <TriangleAlert className="size-4 text-primary" />
                  ) : (
                    <CheckCircle2 className="size-4 text-success" />
                  )}
                  <h2 className="text-sm font-medium">
                    AI Match Card — {result.mismatch ? "MISMATCH TERDETEKSI" : "SESUAI RESEP"}
                  </h2>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <p className={`text-4xl font-semibold ${result.mismatch ? "text-primary" : ""}`}>
                    {result.confidence}%
                  </p>
                  <p className="mb-1.5 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                    visual match confidence
                  </p>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className={`h-full rounded-full ${result.mismatch ? "bg-crimson-gradient" : "bg-foreground/70"}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>

                <ul className="mt-4 space-y-2">
                  {result.extracted.map((e, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs"
                    >
                      <span>
                        <span className="font-medium">{e.name}</span>{" "}
                        <span className="text-muted-foreground">
                          · {e.dosage} · {e.qty} unit
                        </span>
                      </span>
                      <span className={`font-mono text-[10px] ${e.matched ? "text-success" : "text-primary"}`}>
                        {e.matched ? "MATCH" : "MISMATCH"}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                  {result.ocrLog.map((l) => (
                    <p key={l} className="font-mono text-[11px] text-muted-foreground">
                      {l}
                    </p>
                  ))}
                </div>

                <Button
                  onClick={finish}
                  disabled={result.mismatch}
                  size="lg"
                  className="mt-5 w-full shadow-crimson"
                >
                  <QrCode className="size-4" /> Cetak Label QR & Verifikasi QC Selesai
                </Button>
                {result.mismatch && (
                  <p className="mt-2 text-center text-xs text-primary">
                    Klaim ditahan otomatis. Eskalasi ke verifikator BPJS.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
