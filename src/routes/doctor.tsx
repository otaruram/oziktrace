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
  const [diagnosis, setDiagnosis] = useState(ICD[0]);
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

              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Item Obat</p>
                  <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, emptyItem()])}>
                    <Plus className="size-3.5" /> Tambah item
                  </Button>
                </div>
                <div className="mt-3 space-y-3">
                  {items.map((it, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface p-3">
                      <div className="grid gap-2 sm:grid-cols-12">
                        <input
                          className={`${field} sm:col-span-4`}
                          placeholder="Nama obat"
                          value={it.name}
                          onChange={(e) => setItem(i, { name: e.target.value })}
                        />
                        <input
                          className={`${field} sm:col-span-2`}
                          placeholder="Dosis"
                          value={it.dosage}
                          onChange={(e) => setItem(i, { dosage: e.target.value })}
                        />
                        <input
                          className={`${field} sm:col-span-2`}
                          type="number"
                          placeholder="Qty"
                          value={it.qty || ""}
                          onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                        />
                        <input
                          className={`${field} sm:col-span-3`}
                          placeholder="Aturan pakai"
                          value={it.usage}
                          onChange={(e) => setItem(i, { usage: e.target.value })}
                        />
                        <button
                          onClick={() => setItems((p) => p.filter((_, x) => x !== i))}
                          className="grid place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:col-span-1"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <MlWidget score={score} level={level} flags={flags} compact />

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Virtual Escrow Cap</p>
                  <p className="text-xl font-semibold">{rupiah(cap)}</p>
                </div>
                <Button size="lg" className="shadow-crimson" onClick={submit}>
                  Terbitkan & Kunci Plafon Klaim
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
                        <span
                          className={`font-mono text-xs ${rx.mlScore >= 70 ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {rx.mlScore}
                        </span>
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

function MlWidget({
  score,
  level,
  flags,
  compact,
}: {
  score: number;
  level: string;
  flags: string[];
  compact?: boolean;
}) {
  const danger = score >= 70;
  return (
    <section
      className={`rounded-2xl border bg-background p-5 ${danger ? "border-primary/30" : "border-border"} ${compact ? "" : "h-fit"}`}
    >
      <div className="flex items-center gap-2">
        <Activity className={`size-4 ${danger ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm font-medium">Pre-Check ML — Anomali / Overdose Score</p>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <p className={`text-4xl font-semibold ${danger ? "text-primary" : ""}`}>{score}</p>
        <p className="mb-1.5 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          / 100 · risiko {level}
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
        <div
          className={`h-full rounded-full transition-all duration-500 ${danger ? "bg-crimson-gradient" : "bg-foreground/70"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {flags.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
            {danger ? (
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-primary" />
            ) : (
              <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
            )}
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
