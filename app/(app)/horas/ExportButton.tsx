"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HourEntry } from "@/lib/supabase/database.types";

function toCsv(entries: HourEntry[]): string {
  const header = [
    "fecha",
    "billable",
    "admin",
    "otras_creditable",
    "nota",
  ].join(",");
  const lines = entries.map((e) =>
    [
      e.entry_date,
      e.billable_hours,
      e.admin_hours,
      e.other_creditable_hours,
      csvEscape(e.note ?? ""),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ExportButton({
  entries,
  label,
}: {
  entries: HourEntry[];
  label: string;
}) {
  function download() {
    const csv = toCsv(entries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `horas_${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={download}
      disabled={entries.length === 0}
    >
      <Download className="size-4" /> Exportar CSV
    </Button>
  );
}
