import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/compensation/alerts";

const STYLE: Record<
  Alert["severity"],
  { wrap: string; icon: typeof Info }
> = {
  warning: {
    wrap: "border-amber-300 bg-amber-50 text-amber-900",
    icon: AlertTriangle,
  },
  info: {
    wrap: "border-sky-300 bg-sky-50 text-sky-900",
    icon: Info,
  },
  success: {
    wrap: "border-emerald-300 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
};

export function Alerts({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const s = STYLE[a.severity];
        const Icon = s.icon;
        return (
          <div
            key={a.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-sm",
              s.wrap,
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="opacity-90">{a.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
