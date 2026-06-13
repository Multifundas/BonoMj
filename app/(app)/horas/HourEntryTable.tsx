"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatHours } from "@/lib/compensation/format";
import { deleteHourEntry } from "@/lib/data/actions";
import type { HourEntry } from "@/lib/supabase/database.types";

export function HourEntryTable({
  entries,
  compYearId,
}: {
  entries: HourEntry[];
  compYearId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<string | null>(null);

  async function remove(id: string) {
    setDeleting(id);
    try {
      await deleteHourEntry(id, compYearId);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin cortes registrados todavía.
      </p>
    );
  }

  // Mostrar más reciente primero.
  const rows = [...entries].reverse();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Billable</TableHead>
          <TableHead className="text-right">Admin</TableHead>
          <TableHead className="text-right">Otras</TableHead>
          <TableHead>Nota</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="tabular-nums">{e.entry_date}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatHours(Number(e.billable_hours))}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatHours(Number(e.admin_hours))}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatHours(Number(e.other_creditable_hours))}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {e.note ?? "—"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(e.id)}
                disabled={deleting === e.id}
                aria-label="Eliminar corte"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
