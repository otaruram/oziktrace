import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, BadgeCheck, Plus, Stethoscope, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rupiah, scorePrescription, useOzik, type DrugItem } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Workspace Dokter — OzikTrace" },
      {
        name: "description",
        content:
          "Terbitkan e-resep JKN dengan pre-check anomali machine learning dan penguncian plafon klaim escrow secara langsung.",
      },
      { property: "og:title", content: "Workspace Dokter — OzikTrace" },
      {
        property: "og:description",
        content: "Pre-check ML real-time saat menulis resep, lalu kunci plafon klaim di escrow.",
      },
    ],
  }),
  component: DoctorPage,
});

const ICD = [
  "E11.9 — Diabetes melitus tipe 2 tanpa komplikasi",
  "I10 — Hipertensi esensial",
  "J06.9 — Infeksi saluran napas atas akut",
  "K21.0 — GERD dengan esofagitis",
  "M54.5 — Nyeri punggung bawah",
];

const emptyItem = (): DrugItem => ({ name: "", dosage: "", qty: 0, usage: "", unitPrice: 1000 });

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 focus:outline-none";

function DoctorPage() {
  const { prescriptions, createPrescription } = useOzik();
  const [open, setOpen] = useState(false);
  const [nik, setNik] = useState("3273****1234");
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState<string>(ICD[0]!);
  const [items, setItems] = useState<DrugItem[]>([emptyItem()]);

  const { score, flags } = useMemo(() => scorePrescription(items, diagnosis), [items, diagnosis]);
  const cap = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const level = score >= 70 ? "TINGGI" : score >= 40 ? "SEDANG" : "RENDAH";

  const setItem = (idx: number, patch: Partial<DrugItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const submit = () => {
    if (!items.some((i) => i.name.trim())) {
      toast.error("Minimal satu item obat harus diisi.");
      return;
    }
    const rx = createPrescription({
      patientName: patientName || "Pasien JKN",
      nik,
      diagnosis,
      items: items.filter((i) => i.name.trim()),
    });
    setOpen(false);
    setItems([emptyItem()]);
    setPatientName("");
    toast.success(`${rx.id} diterbitkan — plafon ${rupiah(rx.escrowCap)} terkunci di escrow.`);
  };

  const mine = prescriptions;

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title="Workspace Dokter / Faskes" subtitle="RSUD Cibabat — Kode Faskes 0102R001" />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Stethoscope className="size-6" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">dr. Andi Prasetyo, Sp.PD</h1>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                SIP.446/1182/DPMPTSP · Faskes 0102R001 · Shift 08.00–16.00
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-crimson">
                <Plus className="size-4" /> Terbitkan E-Resep Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Intake E-Resep JKN</DialogTitle>
                <DialogDescription>
                  Skor anomali dihitung langsung saat Anda mengetik. Plafon klaim dikunci saat resep
                  diterbitkan.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">NIK Pasien (masked)</label>
                  <input value={nik} onChange={(e) => setNik(e.target.value)} className={`${field} mt-1.5 font-mono`} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nama Pasien</label>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Siti Rahmawati"
                    className={`${field} mt-1.5`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Diagnosis (ICD-10)</label>
                  <select
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className={`${field} mt-1.5`}
                  >
                    {ICD.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Item Obat</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Isi nama obat, dosis, jumlah, dan aturan pakai.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setItems((p) => [...p, emptyItem()])}
                  >
                    <Plus className="size-3.5" /> Tambah
                  </Button>
                </div>

                <div className="hidden grid-cols-12 gap-3 border-b border-border bg-surface/60 px-4 py-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase sm:grid">
                  <span className="col-span-4">Nama obat</span>
                  <span className="col-span-2">Dosis</span>
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-3">Aturan pakai</span>
                  <span className="col-span-1 text-right">—</span>
                </div>

                <div className="divide-y divide-border">
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className="grid gap-2 px-4 py-3 transition-colors hover:bg-surface sm:grid-cols-12 sm:items-center sm:gap-3"
                    >
                      <div className="sm:col-span-4">
                        <label className="mb-1 block text-[10px] font-medium text-muted-foreground sm:hidden">
                          Nama obat
                        </label>
                        <input
                          className={field}
                          placeholder="Metformin 500mg"
                          value={it.name}
                          onChange={(e) => setItem(i, { name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:col-span-4 sm:grid-cols-2 sm:gap-3">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-muted-foreground sm:hidden">
                            Dosis
                          </label>
                          <input
                            className={field}
                            placeholder="500mg"
                            value={it.dosage}
                            onChange={(e) => setItem(i, { dosage: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-muted-foreground sm:hidden">
                            Qty
                          </label>
                          <input
                            className={`${field} text-right font-mono tabular-nums`}
                            type="number"
                            min={0}
                            placeholder="0"
                            value={it.qty || ""}
                            onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="mb-1 block text-[10px] font-medium text-muted-foreground sm:hidden">
                          Aturan pakai
                        </label>
                        <input
                          className={field}
                          placeholder="2x1 sesudah makan"
                          value={it.usage}
                          onChange={(e) => setItem(i, { usage: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => setItems((p) => p.filter((_, x) => x !== i))}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary sm:col-span-1 sm:h-auto sm:self-stretch"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="size-4" />
                        <span className="sm:hidden">Hapus item</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <MlWidget score={score} level={level} flags={flags} compact />

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Virtual Escrow Cap</p>
                  <p className="text-xl font-semibold tabular-nums">{rupiah(cap)}</p>
                </div>
                <Button size="lg" className="shrink-0 shadow-crimson" onClick={submit}>
                  Terbitkan &amp; Kunci Plafon Klaim
                </Button>
              </div>

            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-medium">Riwayat E-Resep</h2>
              <span className="font-mono text-xs text-muted-foreground">{mine.length} resep</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    <th className="px-5 py-3">ID Resep</th>
                    <th className="px-5 py-3">Pasien</th>
                    <th className="px-5 py-3">Diagnosis</th>
                    <th className="px-5 py-3">Plafon</th>
                    <th className="px-5 py-3">ML</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((rx) => (
                    <tr key={rx.id} className="border-b border-border last:border-0 hover:bg-surface">
                      <td className="px-5 py-3.5 font-mono text-xs">{rx.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{rx.patientName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{rx.nik}</p>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-muted-foreground">
                        {rx.diagnosis}
                      </td>
                      <td className="px-5 py-3.5 font-medium">{rupiah(rx.escrowCap)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-semibold ${severityOf(rx.mlScore).text}`}
                          >
                            {rx.mlScore}
                          </span>
                          <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-surface-strong sm:block">
                            <span
                              className={`block h-full rounded-full ${severityOf(rx.mlScore).bar}`}
                              style={{ width: `${Math.max(rx.mlScore, 3)}%` }}
                            />
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={rx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <MlWidget score={score} level={level} flags={flags} />
        </div>
      </main>
    </div>
  );
}

const SEVERITY = [
  {
    max: 20,
    key: "low",
    label: "RENDAH",
    text: "text-success",
    bar: "bg-success",
    soft: "bg-success-soft",
    border: "border-success/30",
  },
  {
    max: 50,
    key: "mid",
    label: "SEDANG",
    text: "text-warning",
    bar: "bg-warning",
    soft: "bg-warning-soft",
    border: "border-warning/40",
  },
  {
    max: 101,
    key: "high",
    label: "TINGGI",
    text: "text-primary",
    bar: "bg-crimson-gradient",
    soft: "bg-primary-soft",
    border: "border-primary/40",
  },
] as const;

export function severityOf(score: number) {
  return SEVERITY.find((s) => score < s.max) ?? SEVERITY[2];
}

function MlWidget({
  score,
  flags,
  compact,
}: {
  score: number;
  level?: string;
  flags: string[];
  compact?: boolean;
}) {
  const sev = severityOf(score);
  const danger = sev.key === "high";
  return (
    <section
      className={`rounded-2xl border bg-background p-5 ${danger ? sev.border : "border-border"} ${compact ? "" : "h-fit"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className={`size-4 shrink-0 ${sev.text}`} />
          <p className="truncate text-sm font-medium">Pre-Check ML — Anomaly Score</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest uppercase ${sev.soft} ${sev.text}`}
        >
          {sev.label}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <p className={`text-4xl font-semibold tabular-nums ${sev.text}`}>{score}</p>
        <p className="mb-1.5 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          / 100 risiko
        </p>
      </div>

      {/* Severity bar with threshold ticks */}
      <div className="relative mt-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-strong">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${sev.bar}`}
            style={{ width: `${Math.max(score, 2)}%` }}
          />
        </div>
        <span className="absolute top-0 h-2.5 w-px bg-background/80" style={{ left: "20%" }} />
        <span className="absolute top-0 h-2.5 w-px bg-background/80" style={{ left: "50%" }} />
      </div>
      <div className="mt-1.5 grid grid-cols-3 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
        <span className={sev.key === "low" ? "text-success" : ""}>0–19 aman</span>
        <span className={`text-center ${sev.key === "mid" ? "text-warning" : ""}`}>20–50 tinjau</span>
        <span className={`text-right ${sev.key === "high" ? "text-primary" : ""}`}>51+ tahan</span>
      </div>

      <ul className="mt-4 space-y-2">
        {flags.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
            {danger ? (
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-primary" />
            ) : (
              <BadgeCheck className={`mt-0.5 size-3.5 shrink-0 ${sev.text}`} />
            )}
            <span className="min-w-0">{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

