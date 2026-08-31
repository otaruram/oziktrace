import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ClaimStatus } from "@/lib/oziktrace-store";

const styles: Record<ClaimStatus, string> = {
  ESCROW_LOCKED: "border-border-strong bg-surface-strong text-foreground",
  ML_ANOMALY_ALERT: "border-primary/25 bg-primary-soft text-primary",
  QC_IN_PROGRESS: "border-warning/30 bg-warning-soft text-warning",
  QC_MISMATCH: "border-primary/25 bg-primary-soft text-primary",
  READY_PICKUP: "border-border-strong bg-background text-foreground",
  SETTLED: "border-success/25 bg-success-soft text-success",
};

const solidStyles: Record<ClaimStatus, string> = {
  ESCROW_LOCKED: "border-foreground/80 bg-foreground text-background",
  ML_ANOMALY_ALERT: "border-primary bg-primary text-primary-foreground",
  QC_IN_PROGRESS: "border-warning bg-warning text-background",
  QC_MISMATCH: "border-primary bg-crimson-gradient text-primary-foreground",
  READY_PICKUP: "border-border-strong bg-surface-strong text-foreground",
  SETTLED: "border-success bg-success text-background",
};

export function StatusBadge({
  status,
  className,
  solid,
}: {
  status: ClaimStatus;
  className?: string;
  solid?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium tracking-tight whitespace-nowrap uppercase",
        solid ? solidStyles[status] : styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status]}
    </span>
  );
}
