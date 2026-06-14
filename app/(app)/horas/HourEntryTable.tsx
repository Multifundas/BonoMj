"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHours } from "@/lib/compensation/format";
import { deleteHourEntry, upsertHourEntry } from "@/lib/data/actions";
import type { HourEntry } from "@/lib/supabase/database.types";

type Draft = {
  entry_date: string;
  billable: string;
  admin: string;
  other: string;
  note: string;
};

export function HourEntryTable({
  entries,
  compYearId,
}: {
  entries: HourEntry[];
  compYearId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function startEdit(e: HourEntry) {
    setError(null);
    setEditingId(e.id);
    setDraft({
      entry_date: e.entry_date,
      billable: String(Number(e.billable_hours)),
      admin: String(Number(e.admin_hours)),
      other: String(Number(e.other_creditable_hours)),
      note: e.note ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await upsertHourEntry(
        {
          comp_year_id: compYearId,
          entry_date: draft.entry_date,
          billable_hours: Number(draft.billable) || 0,
          admin_hours: Number(draft.admin) || 0,
          other_creditable_hours: Number(draft.other) || 0,
          note: draft.note || null,
        },
        id,
      );
      cancelEdit();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

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
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Billable</TableHead>
            <TableHead className="text-right">Admin</TableHead>
            <TableHead className="text-right">Otras</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => {
            const editing = editingId === e.id && draft !== null;
            return (
              <TableRow key={e.id}>
                {editing ? (
                  <>
                    <TableCell>
                      <Input
                        type="date"
                        className="h-8"
                        value={draft.entry_date}
                        onChange={(ev) =>
                          setDraft({ ...draft, entry_date: ev.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        className="h-8 text-right"
                        value={draft.billable}
                        onChange={(ev) =>
                          setDraft({ ...draft, billable: ev.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        className="h-8 text-right"
                        value={draft.admin}
                        onChange={(ev) =>
                          setDraft({ ...draft, admin: ev.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        className="h-8 text-right"
                        value={draft.other}
                        onChange={(ev) =>
                          setDraft({ ...draft, other: ev.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8"
                        value={draft.note}
                        onChange={(ev) =>
                          setDraft({ ...draft, note: ev.target.value })
                        }
                        placeholder="Nota"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveEdit(e.id)}
                          disabled={saving}
                          aria-label="Guardar cambios"
                        >
                          <Check className="size-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEdit}
                          disabled={saving}
                          aria-label="Cancelar edición"
                        >
                          <X className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="tabular-nums">
                      {e.entry_date}
                    </TableCell>
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(e)}
                          disabled={editingId !== null || deleting === e.id}
                          aria-label="Editar corte"
                        >
                          <Pencil className="size-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(e.id)}
                          disabled={editingId !== null || deleting === e.id}
                          aria-label="Eliminar corte"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
