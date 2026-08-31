import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Check,
  Copy,
  Download,
  Fingerprint,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  pseudoSha256,
  rupiah,
  useOzik,
  type ClaimStatus,
  type Prescription,
} from "@/lib/oziktrace-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "BPJS Command Center — OzikTrace" },
      {
        name: "description",
        content:
          "Pusat kendali verifikator BPJS: metrik escrow, live claims feed dual-engine, inspector klaim, dan gateway settlement.",
      },
      { property: "og:title", content: "BPJS Command Center — OzikTrace" },
      {
        property: "og:description",
        content: "Monitor klaim JKN real-time dengan ML anomaly engine dan optical proof-of-dispense.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const FILTERS: { id: "ALL" | ClaimStatus; label: string }[] = [
  { id: "ALL", label: "Semua" },
  { id: "ESCROW_LOCKED", label: "Escrow" },
  { id: "ML_ANOMALY_ALERT", label: "Anomali ML" },
  { id: "QC_MISMATCH", label: "QC Mismatch" },
  { id: "READY_PICKUP", label: "Siap Ambil" },
  { id: "SETTLED", label: "Settled" },
];

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={
            "grid size-7 place-items-center rounded-md " +
            (tone === "danger"
              ? "bg-primary-soft text-primary"
              : tone === "success"
                ? "bg-success-soft text-success"
                : "bg-surface-strong text-foreground")
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function AdminPage() {
  const { prescriptions, settle } = useOzik();
  const [filter, setFilter] = useState<"ALL" | ClaimStatus>("ALL");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [autoSettle, setAutoSettle] = useState(true);
  const [strictQc, setStrictQc] = useState(true);

  const metrics = useMemo(() => {
    const total = prescriptions.reduce((s, r) => s + r.escrowCap, 0);
    const locked = prescriptions
      .filter((r) => r.status !== "SETTLED")
      .reduce((s, r) => s + r.escrowCap, 0);
    const flagged = prescriptions.filter(
      (r) => r.status === "ML_ANOMALY_ALERT" || r.status === "QC_MISMATCH",
    );
    const settled = prescriptions.filter((r) => r.status === "SETTLED");
    const saved = flagged.reduce((s, r) => s + r.escrowCap, 0);
    return { total, locked, flagged, settled, saved };
  }, [prescriptions]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return prescriptions.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.patientName.toLowerCase().includes(term) ||
        r.faskes.toLowerCase().includes(term) ||
        r.doctor.toLowerCase().includes(term)
      );
    });
  }, [prescriptions, filter, q]);

  const current = selected ? (prescriptions.find((r) => r.id === selected.id) ?? selected) : null;

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader
        title="BPJS Command Center"
        subtitle="Verifikator Pusat · Regional Jawa Barat"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            onClick={() => toast.success("Feed disinkronkan", { description: "Data klaim terbaru dimuat." })}
          >
            <RefreshCw className="size-3.5" />
            Sinkron
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={Wallet}
            label="Dana Escrow Tertahan"
            value={rupiah(metrics.locked)}
            sub={`dari total pagu ${rupiah(metrics.total)}`}
          />
          <Metric
            icon={ShieldAlert}
            label="Klaim Ditandai Engine"
            value={String(metrics.flagged.length)}
            sub="anomali ML + mismatch optik"
            tone="danger"
          />
          <Metric
            icon={BadgeCheck}
            label="Proof-of-Dispense Lolos"
            value={String(metrics.settled.length)}
            sub="tersegel SHA-256"
            tone="success"
          />
          <Metric
            icon={Banknote}
            label="Potensi Fraud Dicegah"
            value={rupiah(metrics.saved)}
            sub="ditahan sebelum settlement"
            tone="danger"
          />
        </div>

        <Tabs defaultValue="feed" className="mt-6">
          <TabsList>
            <TabsTrigger value="feed" className="gap-1.5">
              <Radio className="size-3.5" /> Live Claims Feed
            </TabsTrigger>
            <TabsTrigger value="gateway" className="gap-1.5">
              <Activity className="size-3.5" /> API &amp; Settlement Gateway
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4 min-w-0">
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari ID klaim, pasien, faskes, dokter…"
                    className="h-9 pl-8"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={
                        "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors " +
                        (filter === f.id
                          ? "border-primary/30 bg-primary-soft text-primary"
                          : "border-border text-muted-foreground hover:bg-surface")
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto max-w-full">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-2.5 font-medium">Klaim</th>
                      <th className="px-4 py-2.5 font-medium">Pasien / Faskes</th>
                      <th className="px-4 py-2.5 font-medium">Skor ML</th>
                      <th className="px-4 py-2.5 font-medium">Optical QC</th>
                      <th className="px-4 py-2.5 font-medium">Escrow</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-border/70 last:border-0 hover:bg-surface">
                        <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.patientName}</p>
                          <p className="text-xs text-muted-foreground">{r.faskes}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                "font-mono text-xs font-semibold " +
                                (r.mlScore >= 70
                                  ? "text-primary"
                                  : r.mlScore >= 40
                                    ? "text-warning"
                                    : "text-success")
                              }
                            >
                              {r.mlScore}
                            </span>
                            <Progress value={r.mlScore} className="h-1.5 w-20" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.qc ? `${r.qc.confidence.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums">{rupiah(r.escrowCap)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                            Inspeksi
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Tidak ada klaim yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gateway" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-5 lg:col-span-2">
                <h2 className="text-sm font-semibold">Endpoint Integrasi V-Claim</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Konsumsi status dispense real-time untuk rekonsiliasi klaim FKTP/FKRTL.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { m: "POST", p: "/api/public/claims/escrow", d: "Kunci pagu escrow saat resep terbit" },
                    { m: "GET", p: "/api/public/claims/:id/status", d: "Status dual-engine terkini" },
                    { m: "POST", p: "/api/public/claims/:id/settle", d: "Rilis dana setelah seal terverifikasi" },
                    { m: "POST", p: "/api/public/webhook/dispense", d: "Webhook proof-of-dispense" },
                  ].map((e) => (
                    <div
                      key={e.p}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
                    >
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold shrink-0">
                        {e.m}
                      </span>
                      <code className="font-mono text-xs break-all">{e.p}</code>
                      <span className="flex-1 text-xs text-muted-foreground min-w-[100px]">{e.d}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        onClick={() => {
                          navigator.clipboard?.writeText(e.p);
                          toast.success("Endpoint disalin");
                        }}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />
                <h3 className="text-sm font-semibold">Kebijakan Settlement</h3>
                <div className="mt-3 space-y-3">
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
                    <span className="text-sm">
                      Auto-settle klaim skor ML &lt; 40
                      <span className="block text-xs text-muted-foreground">
                        Dana dirilis otomatis setelah PIN pasien terverifikasi.
                      </span>
                    </span>
                    <Switch checked={autoSettle} onCheckedChange={setAutoSettle} />
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
                    <span className="text-sm">
                      Mode Optical QC ketat (&ge; 85%)
                      <span className="block text-xs text-muted-foreground">
                        Mismatch memaksa audit manual verifikator.
                      </span>
                    </span>
                    <Switch checked={strictQc} onCheckedChange={setStrictQc} />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <h2 className="text-sm font-semibold">Batch Settlement</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {prescriptions.filter((r) => r.status === "READY_PICKUP").length} klaim siap dirilis.
                </p>
                <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Nilai batch</p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                    {rupiah(
                      prescriptions
                        .filter((r) => r.status === "READY_PICKUP")
                        .reduce((s, r) => s + r.escrowCap, 0),
                    )}
                  </p>
                </div>
                <Button
                  className="mt-4 w-full gap-2"
                  onClick={() => {
                    const ready = prescriptions.filter((r) => r.status === "READY_PICKUP");
                    ready.forEach((r) => settle(r.id));
                    toast.success(`Batch settlement dijalankan`, {
                      description: `${ready.length} klaim dirilis · ref ${pseudoSha256(String(Date.now())).slice(0, 12)}`,
                    });
                  }}
                >
                  <Banknote className="size-4" /> Rilis batch
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 w-full gap-2"
                  onClick={() => toast.success("Laporan audit CSV disiapkan")}
                >
                  <Download className="size-4" /> Ekspor audit CSV
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={!!current} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm">{current.id}</span>
                  <StatusBadge status={current.status} />
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-8">
                <div className="rounded-lg border border-border bg-surface p-3 text-sm">
                  <p className="font-medium">{current.patientName}</p>
                  <p className="text-xs text-muted-foreground">NIK {current.nik}</p>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground">{current.doctor} · {current.sip}</p>
                  <p className="text-xs text-muted-foreground">{current.faskes}</p>
                  <p className="mt-1 text-xs">{current.diagnosis}</p>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                    <AlertTriangle className="size-3.5 text-primary" /> Engine 1 — ML Anomaly ({current.mlScore})
                  </h3>
                  <Progress value={current.mlScore} className="mt-2 h-1.5" />
                  <ul className="mt-3 space-y-1.5">
                    {current.mlFlags.map((f) => (
                      <li key={f} className="rounded-md border border-border bg-surface px-2.5 py-2 text-xs">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                    <Fingerprint className="size-3.5 text-primary" /> Engine 2 — Optical Proof
                  </h3>
                  {current.qc ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Confidence {current.qc.confidence.toFixed(1)}% ·{" "}
                        {current.qc.mismatch ? "MISMATCH" : "MATCH"}
                      </p>
                      {current.qc.extracted.map((e) => (
                        <div
                          key={e.name}
                          className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-xs"
                        >
                          <span>
                            {e.name} · {e.qty} unit
                          </span>
                          <span className={e.matched ? "text-success" : "text-primary"}>
                            {e.matched ? "cocok" : "tidak cocok"}
                          </span>
                        </div>
                      ))}
                      <pre className="rounded-md border border-border bg-surface p-2.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                        {current.qc.ocrLog.join("\n")}
                      </pre>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">Belum ada verifikasi optik.</p>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Pagu escrow</p>
                  <p className="font-mono text-lg font-semibold tabular-nums">{rupiah(current.escrowCap)}</p>
                  {current.sealHash && (
                    <p className="mt-2 font-mono text-[10px] break-all text-muted-foreground">
                      SEAL {current.sealHash}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    disabled={current.status === "SETTLED"}
                    onClick={() => {
                      settle(current.id);
                      toast.success("Klaim disetujui & dana dirilis");
                    }}
                  >
                    <Check className="size-4" /> Setujui settlement
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      toast.error("Klaim ditandai untuk audit lapangan", {
                        description: `${current.id} diteruskan ke tim anti-fraud.`,
                      })
                    }
                  >
                    Tahan & audit
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
