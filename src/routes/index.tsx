import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Camera,
  Fingerprint,
  Lock,
  ScanLine,
  ShieldCheck,
  Sigma,
  Layers,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, RoleSwitcher } from "@/components/AppHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OzikTrace — Dual-Engine Anti-Fraud BPJS JKN" },
      {
        name: "description",
        content:
          "Gatekeeper anti-fraud JKN dua mesin: skoring anomali machine learning pada e-resep dan verifikasi optik proof-of-dispense bersegel SHA-256.",
      },
      { property: "og:title", content: "OzikTrace — Dual-Engine Anti-Fraud BPJS JKN" },
      {
        property: "og:description",
        content:
          "Deteksi anomali statistik + bukti fisik penyerahan obat. Plafon klaim terkunci sampai PIN pasien diverifikasi.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: ScanLine,
    tag: "Langkah 01",
    title: "E-Resep Sync & ML Tabular Scoring",
    body: "Resep dokter tersinkron dari SIMRS. Mesin tabular menilai pola billing historis dan mengunci plafon klaim di escrow virtual.",
    meta: "ML anomaly score: 14 / 100 — NORMAL",
  },
  {
    icon: Camera,
    tag: "Langkah 02",
    title: "Multimodal AI QC (Etiket & Strip Obat)",
    body: "Petugas apotek memotret etiket dan strip fisik. Vision model mengekstraksi nama, dosis, dan kuantitas lalu mencocokkan ke resep.",
    meta: "Visual match confidence: 97.4% — LOLOS",
  },
  {
    icon: Fingerprint,
    tag: "Langkah 03",
    title: "PIN Pasien & Escrow Release",
    body: "Pasien memasukkan 6 digit PIN saat obat diterima. Segel SHA-256 terbentuk dan klaim dilepas otomatis ke BPJS VClaim.",
    meta: "Seal: 9f2c…a71d — CLAIM SETTLED",
  },
];

function Landing() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-4 hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#engine" className="transition-colors hover:text-foreground">
              Dual Engine
            </a>
            <a href="#alur" className="transition-colors hover:text-foreground">
              Alur Kerja
            </a>
            <a href="#integrasi" className="transition-colors hover:text-foreground">
              Integrasi
            </a>
          </nav>
          <div className="flex-1" />
          <RoleSwitcher />
          <Button asChild size="sm" className="shadow-crimson">
            <Link to="/auth">Mulai Akses Portal</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-paper pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Gatekeeper klaim JKN — versi simulasi nasional
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold sm:text-6xl">
            Dual-Engine Anti-Fraud untuk setiap rupiah klaim{" "}
            <span className="text-primary">BPJS JKN</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Statistical Machine Learning Anomaly Detection pada data e-resep, dipadukan Physical
            Proof-of-Dispense Gatekeeper berbasis visi komputer dan segel kriptografis SHA-256.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="shadow-crimson">
              <Link to="/auth">
                Mulai Akses Portal <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/admin">Lihat Command Center</Link>
            </Button>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {[
              ["Rp 4,82 M", "Plafon terkunci escrow"],
              ["98,1%", "Klaim auto-settled via PIN"],
              ["312", "Anomali statistik terdeteksi"],
              ["87", "Fraud fisik dicegah"],
            ].map(([v, k]) => (
              <div key={k} className="bg-background px-5 py-4">
                <dt className="text-xl font-semibold tracking-tight">{v}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Live widget */}
      <section id="alur" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">Live Demo</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Tiga gerbang sebelum satu klaim dibayar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Setiap resep melewati pemeriksaan data, pemeriksaan fisik, dan konfirmasi pasien.
            Gagal satu gerbang, dana tetap tertahan di escrow.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="flex flex-col gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setActive(i)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active === i
                    ? "border-primary/30 bg-primary-soft"
                    : "border-border bg-background hover:bg-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      active === i
                        ? "bg-crimson-gradient text-primary-foreground"
                        : "bg-surface-strong text-muted-foreground"
                    }`}
                  >
                    <s.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      {s.tag}
                    </p>
                    <p className="truncate text-sm font-medium">{s.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lift sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-mono text-xs text-muted-foreground">
                oziktrace://pipeline/RX-2408-0091
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-primary uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" /> processing
              </span>
            </div>
            <div className="pt-6">
              <h3 className="text-xl font-semibold">{STEPS[active].title}</h3>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">{STEPS[active].body}</p>
              <div className="mt-6 rounded-xl border border-border bg-background p-4">
                <p className="font-mono text-xs">{STEPS[active].meta}</p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-crimson-gradient transition-all duration-700"
                    style={{ width: `${(active + 1) * 33.4}%` }}
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
                {["Escrow", "Optical QC", "PIN Seal"].map((l, i) => (
                  <div key={l} className="bg-background px-3 py-3 text-center">
                    <p
                      className={`text-xs font-medium ${i <= active ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {l}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {i < active ? "PASSED" : i === active ? "RUNNING" : "QUEUED"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual engine */}
      <section id="engine" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: BrainCircuit,
                label: "Engine 01 — Data-Centric ML",
                title: "Statistical Anomaly Detection",
                points: [
                  ["Analisis pola billing historis", Sigma],
                  ["Deteksi overprescribing per kohort diagnosis", Layers],
                  ["Screening klaim duplikat lintas faskes", ShieldCheck],
                ],
              },
              {
                icon: Camera,
                label: "Engine 02 — Physical Proof-of-Dispense",
                title: "Optical Verification Gatekeeper",
                points: [
                  ["Pencocokan visual etiket vs strip obat", ScanLine],
                  ["Segel tamper-proof SHA-256 per transaksi", Lock],
                  ["Konfirmasi PIN 6 digit oleh pasien", KeyRound],
                ],
              },
            ].map((e) => (
              <div key={e.title} className="rounded-2xl border border-border bg-background p-7">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <e.icon className="size-5" />
                </span>
                <p className="mt-5 font-mono text-[10px] tracking-widest text-primary uppercase">
                  {e.label}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{e.title}</h3>
                <ul className="mt-5 space-y-3">
                  {e.points.map(([p, Ico]) => {
                    const I = Ico as typeof ShieldCheck;
                    return (
                      <li key={p as string} className="flex items-start gap-3 text-sm">
                        <I className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{p as string}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrasi */}
      <section id="integrasi" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-2xl border border-border p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Jembatan SIMRS ke VClaim tanpa mengubah alur faskes
              </h2>
              <p className="mt-3 text-muted-foreground">
                API key per faskes, webhook auto-clearance ke BPJS VClaim, dan audit trail lengkap
                berisi foto QC, log OCR, serta hash kriptografis setiap penyerahan obat.
              </p>
            </div>
            <Button asChild size="lg" className="shadow-crimson">
              <Link to="/auth">
                Mulai Akses Portal <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Simulasi produk. Data pasien pada demo ini fiktif dan termasker.</p>
        </div>
      </footer>
    </div>
  );
}
