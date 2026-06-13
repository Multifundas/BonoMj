import { Badge } from "@/components/ui/badge";
import type { PaceStatus } from "@/lib/compensation/pacing";

const MAP: Record<
  PaceStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  adelantada: { label: "Vas adelantada", variant: "success" },
  en_ritmo: { label: "En ritmo", variant: "success" },
  atrasada: { label: "Vas atrasada", variant: "destructive" },
};

export function PaceBadge({ status }: { status: PaceStatus }) {
  const m = MAP[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
