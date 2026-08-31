# OzikTrace Guardian

Role: Senior UI/UX Designer & Full-Stack Next.js (App Router, Tailwind CSS, Lucide Icons) Specialist



Task:



Design and build an end-to-end, high-fidelity frontend architecture for "OzikTrace" (Intelligent Dual-Engine Anti-Fraud & Proof-of-Dispense Gatekeeper for BPJS JKN).



---



1. STRICT DESIGN SYSTEM & COLOR PALETTE



- Design Philosophy: Minimalist, high-trust healthcare enterprise (Linear/Vercel-inspired).



- Dominant Base (90%): Pure White (`#FFFFFF`), Crisp Slate/Off-White (`#FAFAFA` / `#F4F4F5`), with ultra-clean subtle borders (`#E4E4E7`).



- Supporting Accent (10%): Medical Crimson / Vibrant Red (`#DC2626` / `#E11D48`) for primary buttons, active badges, fraud alerts, and key interactive states.



- Typography: Deep Charcoal/Black (`#09090B`) for headers and high-contrast labels, Muted Zinc (`#71717A`) for secondary metadata.



- Responsiveness: Multi-device optimized (Mobile-first for Patient, Tablet for Pharmacy/Apotek, Desktop for Doctor & BPJS Admin).



---



2. PAGE ARCHITECTURE & END-TO-END USER FLOWS



1. Landing Page (`/`)



- Hero Section: Clear value proposition ("Dual-Engine Anti-Fraud: Statistical Machine Learning Anomaly Detection & Physical Proof-of-Dispense Gatekeeper").



- Interactive Live Widget: 3-step visual demo: (1) E-Resep Sync & ML Tabular Scoring -> (2) Multimodal AI QC (Etiket & Strip Obat) -> (3) Patient PIN Confirmation & Escrow Release.



- Dual-Engine Feature Cards:



  - Engine 1 (Data-Centric ML): Historical billing pattern analysis, overprescribing detection, and duplicate claim screening.



  - Engine 2 (Physical Proof-of-Dispense): Vision-based optical verification + Cryptographic SHA-256 tamper-proof seal.



- CTA: Primary Red Button ("Mulai Akses Portal").



2. Authentication & Simulated RBAC Selector (`/auth`)



- Minimalist centered card on pure white backdrop with red accent focus border.



- Google OAuth simulated login button.



- Post-Auth Role Picker (4 Distinct Roles):



  - `[ 🩺 Dokter / Faskes ]` -> Redirects to `/doctor`



  - `[ 💊 Petugas Farmasi / Apotek ]` -> Redirects to `/pharmacy`



  - `[ 📱 Pasien JKN ]` -> Redirects to `/patient`



  - `[ 🏛️ BPJS Verifikator / Super Admin ]` -> Redirects to `/admin`



- Global Super Admin Mode: A persistent, clean dropdown switcher in the top-right header allowing instant role switching during demo presentations.



---



3. ROLE-SPECIFIC WORKSPACES & FEATURE REQUIREMENTS



A. DOKTER / FASKES WORKSPACE (`/doctor`) - Desktop Optimized



- Header: Doctor identity (Name, SIP, Faskes Code) + Quick Action Red Button `+ Terbitkan E-Resep Baru`.



- Pre-Check ML Widget: Live feedback box giving an instant "Anomali / Overdose Score" as the doctor types medications.



- E-Prescription Intake Modal:



  - Masked Patient NIK (`3273****1234`), Diagnosis (ICD-10 selector), and Dynamic Drug Items Repeater (Drug Name, Dosage, Qty, Usage Instructions).



  - Virtual Escrow Cap summary calculation.



  - "Terbitkan & Kunci Plafon Klaim" action button.



- Prescription History Table: List of active prescriptions with status badges (`ESCROW_LOCKED`, `QC_IN_PROGRESS`, `SETTLED`).



B. FARMASI / APOTEK WORKSPACE (`/pharmacy`) - Tablet/Touch Optimized



- Active Dispense Queue: List of ready-to-process prescriptions incoming from doctors.



- Multimodal Optical QC Studio (`/pharmacy/verify/[id]`):



  - Left pane: Doctor's prescription breakdown.



  - Right pane: Multi-Image Camera/Uploader (Min 2, Max 5 photos: Etiket Label + Physical Medicine Strips/Blisters).



  - AI Match Card: Displays visual matching confidence score (Extracts medicine name, dosage, and quantity directly from photos vs prescription).



  - Action button: "Cetak Label QR & Verifikasi QC Selesai".



C. PASIEN JKN PORTAL (`/patient` & `/track/[id]`) - Mobile-First (~375px)



- Clean, clutter-free mobile view accessed directly or via QR scan.



- Dispense Timeline: `E-Resep Diterbitkan` -> `Lolos Scan AI Farmasi` -> `Siap Diambil di Loket / Kurir`.



- Interactive 6-Digit PIN Pad: Patient enters OTP/PIN to prove physical handover of medications.



- Instant Verified State: Valid PIN triggers an animated badge: "BPJS CLAIM VERIFIED - PROOF-OF-DISPENSE TAMPER-PROOF SEAL (SHA-256)".



D. BPJS VERIFIKATOR & SUPER ADMIN COMMAND CENTER (`/admin`) - Wide Desktop



- Dual-Engine Metric Grid:



  - Metric 1: Total Resep & Plafon Terkunci (Rp).



  - Metric 2: Total Klaim Auto-Settled via Valid PIN.



  - Metric 3: Anomali Statistik Terdeteksi (ML Tabular Score).



  - Metric 4: Fraud Fisik Dicegah (AI Vision Mismatch: Etiket vs Strip).



- Unified Live Claims Feed: Table showing recent transactions across all faskes with filterable status badges (`NORMAL`, `ML_ANOMALY_ALERT`, `QC_MISMATCH`, `CLAIM_SETTLED`).



- Claim Inspector Drawer: Inspect full audit trail, side-by-side QC photos (2-5 images), OCR confidence logs, and SHA-256 cryptographic hashes.



- API & Settlement Gateway Tab:



  - API Keys Management (Generate/Revoke secret keys for SIMRS bridging).



  - Webhook URL configuration for BPJS VClaim auto-clearance.



  - Real-time simulation payload tester.



---



4. DELIVERABLES



- Responsive UI layouts using Next.js App Router (`app/page.tsx`, `app/auth/page.tsx`, `app/doctor/page.tsx`, `app/pharmacy/page.tsx`, `app/patient/page.tsx`, `app/track/[id]/page.tsx`, `app/admin/page.tsx`).



- Shared enterprise header with persistent Super Admin role switcher.



- Mock state machine demonstrating the end-to-end flow: Prescription Creation -> Optical AI QC -> PIN Verification -> Admin Settlement.



- Strict compliance with the 2-Color palette (Dominant White + Crimson Red).





Cek foto juga buatkan utk seliruh halaman ini ya end to end

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://oziktrace.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b26fae1-27bc-420b-98c2-26395d2b6eab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
