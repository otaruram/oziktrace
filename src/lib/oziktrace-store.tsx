import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Role = "doctor" | "pharmacy" | "patient" | "admin";

export const ROLES: { id: Role; label: string; short: string; path: string; icon: string }[] = [
  { id: "doctor", label: "Dokter / Faskes", short: "Dokter", path: "/doctor", icon: "🩺" },
  { id: "pharmacy", label: "Petugas Farmasi / Apotek", short: "Apotek", path: "/pharmacy", icon: "💊" },
  { id: "patient", label: "Pasien JKN", short: "Pasien", path: "/patient", icon: "📱" },
  { id: "admin", label: "BPJS Verifikator / Super Admin", short: "BPJS Admin", path: "/admin", icon: "🏛️" },
];

export type ClaimStatus =
  | "ESCROW_LOCKED"
  | "ML_ANOMALY_ALERT"
  | "QC_IN_PROGRESS"
  | "QC_MISMATCH"
  | "READY_PICKUP"
  | "SETTLED";

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  ESCROW_LOCKED: "ESCROW_LOCKED",
  ML_ANOMALY_ALERT: "ML_ANOMALY_ALERT",
  QC_IN_PROGRESS: "QC_IN_PROGRESS",
  QC_MISMATCH: "QC_MISMATCH",
  READY_PICKUP: "READY_PICKUP",
  SETTLED: "CLAIM_SETTLED",
};

export type DrugItem = {
  name: string;
  dosage: string;
  qty: number;
  usage: string;
  unitPrice: number;
};

export type QcResult = {
  photos: string[];
  confidence: number;
  extracted: { name: string; dosage: string; qty: number; matched: boolean }[];
  mismatch: boolean;
  ocrLog: string[];
};

export type Prescription = {
  id: string;
  patientName: string;
  nik: string;
  faskes: string;
  doctor: string;
  sip: string;
  diagnosis: string;
  items: DrugItem[];
  escrowCap: number;
  status: ClaimStatus;
  mlScore: number;
  mlFlags: string[];
  qc?: QcResult;
  pin: string;
  sealHash?: string;
  createdAt: string;
};

/* ---------------- ML heuristics (mock statistical engine) ---------------- */

const HIGH_RISK = ["oxycodone", "tramadol", "codein", "diazepam", "alprazolam", "kodein"];

export function scorePrescription(items: DrugItem[], diagnosis: string) {
  let score = 8;
  const flags: string[] = [];
  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  if (totalQty > 90) {
    score += 34;
    flags.push(`Volume dispensing tinggi (${totalQty} unit) vs median faskes 42 unit`);
  } else if (totalQty > 50) {
    score += 16;
    flags.push(`Kuantitas di atas persentil 80 populasi faskes`);
  }
  if (items.length > 4) {
    score += 18;
    flags.push(`Polifarmasi: ${items.length} item dalam 1 resep (ambang 4)`);
  }
  const names = items.map((i) => i.name.trim().toLowerCase()).filter(Boolean);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) {
    score += 25;
    flags.push(`Duplikasi item terdeteksi: ${[...new Set(dup)].join(", ")}`);
  }
  const risky = names.filter((n) => HIGH_RISK.some((h) => n.includes(h)));
  if (risky.length) {
    score += 28;
    flags.push(`Golongan obat pengawasan ketat: ${risky.join(", ")}`);
  }
  if (!diagnosis) {
    score += 10;
    flags.push("Diagnosis ICD-10 belum dipilih — pola klaim tidak dapat divalidasi");
  }
  score = Math.max(2, Math.min(98, Math.round(score)));
  if (!flags.length) flags.push("Pola billing historis konsisten dengan kohort diagnosis");
  return { score, flags };
}

export function rupiah(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));
}

export function pseudoSha256(input: string) {
  // Deterministic 64-hex digest for demo seals (not cryptographic).
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  const out: string[] = [];
  for (let i = 0; i < input.length; i++) {
    h1 = (h1 ^ input.charCodeAt(i)) >>> 0;
    h1 = (h1 * 16777619) >>> 0;
    h2 = (h2 + h1 * (i + 7)) >>> 0;
  }
  let seed = (h1 ^ h2) >>> 0;
  for (let i = 0; i < 8; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    out.push(seed.toString(16).padStart(8, "0"));
  }
  return out.join("").slice(0, 64);
}

/* ---------------- Seed data ---------------- */

function seed(): Prescription[] {
  return [
    {
      id: "RX-2408-0091",
      patientName: "Siti Rahmawati",
      nik: "3273****1234",
      faskes: "RSUD Cibabat — 0102R001",
      doctor: "dr. Andi Prasetyo, Sp.PD",
      sip: "SIP.446/1182/DPMPTSP",
      diagnosis: "E11.9 — Diabetes melitus tipe 2 tanpa komplikasi",
      items: [
        { name: "Metformin 500mg", dosage: "500 mg", qty: 60, usage: "2x1 sesudah makan", unitPrice: 1250 },
        { name: "Glimepiride 2mg", dosage: "2 mg", qty: 30, usage: "1x1 pagi", unitPrice: 2400 },
      ],
      escrowCap: 60 * 1250 + 30 * 2400,
      status: "READY_PICKUP",
      mlScore: 14,
      mlFlags: ["Pola billing historis konsisten dengan kohort diagnosis"],
      qc: {
        photos: [],
        confidence: 97.4,
        extracted: [
          { name: "Metformin 500mg", dosage: "500 mg", qty: 60, matched: true },
          { name: "Glimepiride 2mg", dosage: "2 mg", qty: 30, matched: true },
        ],
        mismatch: false,
        ocrLog: ["Etiket OCR conf 0.981", "Strip blister OCR conf 0.967", "Cross-match resep ✓"],
      },
      pin: "418302",
      createdAt: "2026-08-30T08:12:00Z",
    },
    {
      id: "RX-2408-0088",
      patientName: "Bagas Nugroho",
      nik: "3175****8890",
      faskes: "Klinik Pratama Sehat — 0102K118",
      doctor: "dr. Lina Kusuma",
      sip: "SIP.446/0912/DPMPTSP",
      diagnosis: "J06.9 — Infeksi saluran napas atas akut",
      items: [
        { name: "Amoxicillin 500mg", dosage: "500 mg", qty: 120, usage: "3x1", unitPrice: 900 },
        { name: "Tramadol 50mg", dosage: "50 mg", qty: 40, usage: "2x1 bila nyeri", unitPrice: 3100 },
        { name: "Paracetamol 500mg", dosage: "500 mg", qty: 30, usage: "3x1", unitPrice: 500 },
        { name: "Amoxicillin 500mg", dosage: "500 mg", qty: 30, usage: "3x1", unitPrice: 900 },
        { name: "Vitamin B Complex", dosage: "1 tab", qty: 30, usage: "1x1", unitPrice: 700 },
      ],
      escrowCap: 120 * 900 + 40 * 3100 + 30 * 500 + 30 * 900 + 30 * 700,
      status: "ML_ANOMALY_ALERT",
      mlScore: 87,
      mlFlags: [
        "Volume dispensing tinggi (250 unit) vs median faskes 42 unit",
        "Polifarmasi: 5 item dalam 1 resep (ambang 4)",
        "Duplikasi item terdeteksi: amoxicillin 500mg",
        "Golongan obat pengawasan ketat: tramadol 50mg",
      ],
      pin: "930117",
      createdAt: "2026-08-30T07:40:00Z",
    },
    {
      id: "RX-2408-0084",
      patientName: "Dewi Anggraini",
      nik: "3671****4471",
      faskes: "Apotek Kimia Farma 042 — 0102A042",
      doctor: "dr. Rangga Wijaya",
      sip: "SIP.446/0771/DPMPTSP",
      diagnosis: "I10 — Hipertensi esensial",
      items: [
        { name: "Amlodipine 10mg", dosage: "10 mg", qty: 30, usage: "1x1 malam", unitPrice: 1100 },
        { name: "Candesartan 8mg", dosage: "8 mg", qty: 30, usage: "1x1 pagi", unitPrice: 2600 },
      ],
      escrowCap: 30 * 1100 + 30 * 2600,
      status: "QC_MISMATCH",
      mlScore: 31,
      mlFlags: ["Kuantitas di atas persentil 80 populasi faskes"],
      qc: {
        photos: [],
        confidence: 61.2,
        extracted: [
          { name: "Amlodipine 5mg", dosage: "5 mg", qty: 30, matched: false },
          { name: "Candesartan 8mg", dosage: "8 mg", qty: 30, matched: true },
        ],
        mismatch: true,
        ocrLog: [
          "Etiket OCR conf 0.884",
          "Strip blister OCR conf 0.612 — dosis terbaca 5 mg",
          "Cross-match resep ✗ (Amlodipine 10mg ≠ 5mg)",
        ],
      },
      pin: "205846",
      createdAt: "2026-08-29T14:05:00Z",
    },
    {
      id: "RX-2408-0080",
      patientName: "Hendra Saputra",
      nik: "3204****2210",
      faskes: "Puskesmas Cimahi Tengah — 0102P009",
      doctor: "dr. Maya Anindita",
      sip: "SIP.446/0455/DPMPTSP",
      diagnosis: "K21.0 — GERD dengan esofagitis",
      items: [{ name: "Omeprazole 20mg", dosage: "20 mg", qty: 30, usage: "1x1 sebelum makan", unitPrice: 1500 }],
      escrowCap: 45000,
      status: "SETTLED",
      mlScore: 9,
      mlFlags: ["Pola billing historis konsisten dengan kohort diagnosis"],
      qc: {
        photos: [],
        confidence: 98.8,
        extracted: [{ name: "Omeprazole 20mg", dosage: "20 mg", qty: 30, matched: true }],
        mismatch: false,
        ocrLog: ["Etiket OCR conf 0.992", "Strip blister OCR conf 0.984", "Cross-match resep ✓"],
      },
      pin: "774519",
      sealHash: pseudoSha256("RX-2408-0080|SETTLED"),
      createdAt: "2026-08-29T09:30:00Z",
    },
  ];
}

/* ---------------- Context ---------------- */

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  prescriptions: Prescription[];
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  createPrescription: (p: {
    patientName: string;
    nik: string;
    diagnosis: string;
    items: DrugItem[];
  }) => Prescription;
  submitQc: (id: string, photos: string[]) => QcResult;
  verifyPin: (id: string, pin: string) => boolean;
  settle: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function OzikStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => seed());
  const [activePatientId, setActivePatientId] = useState("RX-2408-0091");

  const createPrescription: Ctx["createPrescription"] = useCallback((p) => {
    const { score, flags } = scorePrescription(p.items, p.diagnosis);
    const escrowCap = p.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const rx: Prescription = {
      id: "RX-2408-" + String(Math.floor(1000 + Math.random() * 8999)).slice(0, 4),
      patientName: p.patientName || "Pasien JKN",
      nik: p.nik,
      faskes: "RSUD Cibabat — 0102R001",
      doctor: "dr. Andi Prasetyo, Sp.PD",
      sip: "SIP.446/1182/DPMPTSP",
      diagnosis: p.diagnosis,
      items: p.items,
      escrowCap,
      status: score >= 70 ? "ML_ANOMALY_ALERT" : "ESCROW_LOCKED",
      mlScore: score,
      mlFlags: flags,
      pin: String(Math.floor(100000 + Math.random() * 899999)),
      createdAt: new Date().toISOString(),
    };
    setPrescriptions((prev) => [rx, ...prev]);
    return rx;
  }, []);

  const submitQc: Ctx["submitQc"] = useCallback((id, photos) => {
    let result: QcResult = {
      photos,
      confidence: 0,
      extracted: [],
      mismatch: false,
      ocrLog: [],
    };
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== id) return rx;
        const base = 78 + photos.length * 4.6;
        const confidence = Math.min(99.1, Number(base.toFixed(1)));
        const mismatch = confidence < 85;
        const extracted = rx.items.map((it, idx) => ({
          name: it.name,
          dosage: it.dosage,
          qty: it.qty,
          matched: !(mismatch && idx === 0),
        }));
        result = {
          photos,
          confidence,
          mismatch,
          extracted,
          ocrLog: [
            `Etiket OCR conf ${(confidence / 100).toFixed(3)}`,
            `Strip blister OCR conf ${((confidence - 2.4) / 100).toFixed(3)}`,
            mismatch ? "Cross-match resep ✗ — item #1 tidak sesuai" : "Cross-match resep ✓",
            `Frame dianalisis: ${photos.length}`,
          ],
        };
        return { ...rx, qc: result, status: mismatch ? "QC_MISMATCH" : "READY_PICKUP" };
      }),
    );
    return result;
  }, []);

  const verifyPin: Ctx["verifyPin"] = useCallback(
    (id, pin) => {
      const rx = prescriptions.find((r) => r.id === id);
      if (!rx || rx.pin !== pin) return false;
      setPrescriptions((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "SETTLED", sealHash: pseudoSha256(`${r.id}|${pin}|${r.escrowCap}`) }
            : r,
        ),
      );
      return true;
    },
    [prescriptions],
  );

  const settle: Ctx["settle"] = useCallback((id) => {
    setPrescriptions((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "SETTLED", sealHash: r.sealHash ?? pseudoSha256(r.id) } : r,
      ),
    );
  }, []);

  const resetDemo: Ctx["resetDemo"] = useCallback(() => {
    setPrescriptions(seed());
    setActivePatientId("RX-2408-0091");
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      prescriptions,
      activePatientId,
      setActivePatientId,
      createPrescription,
      submitQc,
      verifyPin,
      settle,
      resetDemo,
    }),
    [role, prescriptions, activePatientId, createPrescription, submitQc, verifyPin, settle, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useOzik() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useOzik must be used inside OzikStoreProvider");
  return ctx;
}
