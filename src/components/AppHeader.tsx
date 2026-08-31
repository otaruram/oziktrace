import { Link, useRouter } from "@tanstack/react-router";
import { ChevronDown, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, useOzik, type Role } from "@/lib/oziktrace-store";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-md bg-crimson-gradient text-primary-foreground">
        <ShieldCheck className="size-4" />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Ozik<span className="text-primary">Trace</span>
        </span>
      )}
    </Link>
  );
}

export function RoleSwitcher() {
  const { role, setRole } = useOzik();
  const router = useRouter();
  const current = ROLES.find((r) => r.id === role) ?? ROLES[3]!;

  const go = (r: Role) => {
    setRole(r);
    const target = ROLES.find((x) => x.id === r)!;
    router.navigate({ to: target.path });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border bg-background font-medium">
          <span aria-hidden>{current.icon}</span>
          <span className="hidden sm:inline">{current.short}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Super Admin — Role Switcher
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem key={r.id} onSelect={() => go(r.id)} className="gap-2">
            <span aria-hidden>{r.icon}</span>
            <span className="flex-1">{r.label}</span>
            {r.id === role && <span className="size-1.5 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 sm:gap-4 px-2 sm:px-6 overflow-x-hidden">
        <div className="hidden sm:block shrink-0">
          <Logo compact={true} />
        </div>
        <span className="hidden h-5 w-px bg-border sm:block shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
        <ResetDemoButton />
        <RoleSwitcher />
      </div>
    </header>
  );
}

export function ResetDemoButton() {
  const { resetDemo } = useOzik();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-muted-foreground hover:text-foreground"
      onClick={() => {
        resetDemo();
        alert("Demo state telah direset ke kondisi awal.");
      }}
      title="Reset Demo Data"
    >
      <RotateCcw className="size-4" />
      <span className="hidden sm:inline text-xs">Reset</span>
    </Button>
  );
}
