"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useCompYears } from "@/components/CompYearProvider";

export function CompYearSwitcher() {
  const { years, activeId, setActiveId } = useCompYears();
  const searchParams = useSearchParams();
  const selected = searchParams.get("cy") ?? activeId ?? "";

  if (years.length === 0) {
    return (
      <Link
        href="/ajustes"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Plus className="size-4" /> Crear compensation year
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Año:</span>
      <Select
        value={selected}
        onChange={(e) => setActiveId(e.target.value)}
        className="h-9 w-40"
      >
        {years.map((y) => (
          <option key={y.id} value={y.id}>
            {y.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
