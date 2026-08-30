import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppHeader";
import { ROLES, useOzik, type Role } from "@/lib/oziktrace-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Portal — OzikTrace" },
      {
        name: "description",
        content:
          "Autentikasi portal OzikTrace dan pilih peran: dokter faskes, petugas apotek, pasien JKN, atau verifikator BPJS.",
      },
      { property: "og:title", content: "Masuk Portal — OzikTrace" },
      {
        property: "og:description",
        content: "Login simulasi dengan pemilih peran RBAC untuk demo gatekeeper klaim JKN.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setRole } = useOzik();
  const router = useRouter();

  const signIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSignedIn(true);
    }, 900);
  };

  const pick = (r: Role) => {
    setRole(r);
    router.navigate({ to: ROLES.find((x) => x.id === r)!.path });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="grid-paper pointer-events-none absolute inset-0" />
      <div className="relative flex items-center px-4 py-5 sm:px-6">
        <Logo />
      </div>

      <main className="relative flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-7 shadow-lift sm:p-8">
          {!signedIn ? (
            <>
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Lock className="size-5" />
              </span>
              <h1 className="mt-5 text-xl font-semibold">Masuk ke Portal OzikTrace</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Autentikasi terpusat untuk faskes, apotek, pasien JKN, dan verifikator BPJS.
              </p>

              <button
                onClick={signIn}
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-surface focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
                    />
                    <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
                    <path
                      fill="#EA4335"
                      d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4 5.6-4z"
                    />
                  </svg>
                )}
                Lanjutkan dengan Google
              </button>

              <div className="my-6 flex items-center gap-3 text-[11px] tracking-widest text-muted-foreground uppercase">
                <span className="h-px flex-1 bg-border" /> simulated sso <span className="h-px flex-1 bg-border" />
              </div>

              <input
                placeholder="nama@faskes.go.id"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 focus:outline-none"
              />
              <Button onClick={signIn} disabled={loading} className="mt-3 w-full shadow-crimson" size="lg">
                Kirim tautan masuk <ArrowRight className="size-4" />
              </Button>
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Dengan masuk Anda menyetujui kebijakan audit klaim BPJS.
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
                Terautentikasi
              </p>
              <h1 className="mt-2 text-xl font-semibold">Pilih peran demonstrasi</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Peran dapat ditukar kapan saja lewat Super Admin switcher di header.
              </p>
              <div className="mt-6 space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => pick(r.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-left transition-all hover:border-primary/40 hover:bg-primary-soft"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-strong text-base group-hover:bg-background">
                      {r.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{r.label}</span>
                      <span className="block font-mono text-[11px] text-muted-foreground">
                        {r.path}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
              <Link
                to="/"
                className="mt-6 block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Kembali ke beranda
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
