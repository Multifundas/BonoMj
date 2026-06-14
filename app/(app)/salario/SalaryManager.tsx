"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/components/CurrencyProvider";
import {
  createSalaryComponent,
  deleteSalaryComponent,
  updateSalaryComponent,
} from "@/lib/data/actions";
import {
  annualizeComponent,
  monthlyizeComponent,
  type ComponentCategory,
  type ComponentFrequency,
} from "@/lib/compensation/salary";
import { applyIsr } from "@/lib/compensation/tax";
import type { SalaryComponentRow } from "@/lib/supabase/database.types";

const CATEGORIES: { value: ComponentCategory; label: string }[] = [
  { value: "base", label: "Salario base" },
  { value: "aguinaldo", label: "Aguinaldo" },
  { value: "prima_vacacional", label: "Prima vacacional" },
  { value: "vales", label: "Vales / despensa" },
  { value: "seguro_gastos_medicos", label: "Seguro gastos médicos" },
  { value: "401k", label: "Fondo de ahorro / 401k" },
  { value: "ptos", label: "PTOs" },
  { value: "bono_otro", label: "Otro bono" },
];

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<ComponentCategory, string>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

type EditDraft = {
  name: string;
  category: ComponentCategory;
  amount: string;
  frequency: ComponentFrequency;
  isTaxable: boolean;
  effectiveDate: string;
};

type ConceptGroup = {
  key: string;
  category: ComponentCategory;
  name: string;
  // Movimientos ordenados por fecha desc (más reciente primero).
  movements: SalaryComponentRow[];
};

function groupByConcept(rows: SalaryComponentRow[]): ConceptGroup[] {
  const map = new Map<string, ConceptGroup>();
  for (const r of rows) {
    const key = `${r.category}|${r.name}`;
    let g = map.get(key);
    if (!g) {
      g = { key, category: r.category, name: r.name, movements: [] };
      map.set(key, g);
    }
    g.movements.push(r);
  }
  for (const g of map.values()) {
    g.movements.sort((a, b) => {
      if (a.effective_date !== b.effective_date)
        return b.effective_date.localeCompare(a.effective_date);
      return b.created_at.localeCompare(a.created_at);
    });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function SalaryManager({
  compYearId,
  components,
  isr,
}: {
  compYearId: string;
  components: SalaryComponentRow[];
  isr: number;
}) {
  const router = useRouter();
  const { money } = useCurrency();
  const [pending, setPending] = React.useState(false);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<ComponentCategory>("base");
  const [amount, setAmount] = React.useState("");
  const [frequency, setFrequency] =
    React.useState<ComponentFrequency>("mensual");
  const [isTaxable, setIsTaxable] = React.useState(true);
  const [effectiveDate, setEffectiveDate] = React.useState(today());

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<EditDraft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function add() {
    if (!name || !amount) return;
    setPending(true);
    setError(null);
    try {
      await createSalaryComponent({
        comp_year_id: compYearId,
        name,
        category,
        amount: Number(amount) || 0,
        frequency,
        is_taxable: isTaxable,
        effective_date: effectiveDate,
        notes: null,
      });
      setName("");
      setAmount("");
      setEffectiveDate(today());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setPending(false);
    }
  }

  function startEdit(c: SalaryComponentRow) {
    setError(null);
    setEditingId(c.id);
    setDraft({
      name: c.name,
      category: c.category,
      amount: String(Number(c.amount)),
      frequency: c.frequency,
      isTaxable: c.is_taxable,
      effectiveDate: c.effective_date,
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
      await updateSalaryComponent(id, {
        comp_year_id: compYearId,
        name: draft.name,
        category: draft.category,
        amount: Number(draft.amount) || 0,
        frequency: draft.frequency,
        is_taxable: draft.isTaxable,
        effective_date: draft.effectiveDate,
        notes: null,
      });
      cancelEdit();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await deleteSalaryComponent(id);
    router.refresh();
  }

  const groups = groupByConcept(components);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salario base y prestaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="space-y-1 md:col-span-2">
            <Label>Concepto</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Salario base"
            />
          </div>
          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ComponentCategory)
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Monto</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label>Frecuencia</Label>
            <Select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as ComponentFrequency)
              }
            >
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
              <option value="unica">Única</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Vigente desde</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Para registrar un aumento, agrega un nuevo movimiento con la fecha y
          el monto nuevos usando el mismo concepto y categoría; el anterior se
          conserva como historial.
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTaxable}
              onChange={(e) => setIsTaxable(e.target.checked)}
            />
            Gravable
          </label>
          <Button onClick={add} disabled={pending || !name || !amount}>
            Agregar movimiento
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.key} className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold">{g.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {CATEGORY_LABEL[g.category] ?? g.category}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vigente desde</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead className="text-right">Mensual</TableHead>
                      <TableHead className="text-right">Anual</TableHead>
                      <TableHead className="text-right">Neto anual</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.movements.map((c, idx) => {
                      const editing = editingId === c.id && draft !== null;
                      const isCurrent = idx === 0;
                      const comp = {
                        name: c.name,
                        category: c.category,
                        amount: Number(c.amount),
                        frequency: c.frequency,
                        isTaxable: c.is_taxable,
                      };
                      if (editing) {
                        return (
                          <TableRow key={c.id}>
                            <TableCell>
                              <Input
                                type="date"
                                className="h-8"
                                value={draft.effectiveDate}
                                onChange={(ev) =>
                                  setDraft({
                                    ...draft,
                                    effectiveDate: ev.target.value,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                className="h-8"
                                value={draft.frequency}
                                onChange={(ev) =>
                                  setDraft({
                                    ...draft,
                                    frequency: ev.target
                                      .value as ComponentFrequency,
                                  })
                                }
                              >
                                <option value="mensual">Mensual</option>
                                <option value="anual">Anual</option>
                                <option value="unica">Única</option>
                              </Select>
                            </TableCell>
                            <TableCell colSpan={2}>
                              <Input
                                type="number"
                                className="h-8 text-right"
                                value={draft.amount}
                                onChange={(ev) =>
                                  setDraft({
                                    ...draft,
                                    amount: ev.target.value,
                                  })
                                }
                                placeholder="Monto"
                              />
                            </TableCell>
                            <TableCell>
                              <label className="flex items-center justify-end gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={draft.isTaxable}
                                  onChange={(ev) =>
                                    setDraft({
                                      ...draft,
                                      isTaxable: ev.target.checked,
                                    })
                                  }
                                />
                                Gravable
                              </label>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => saveEdit(c.id)}
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
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="tabular-nums">
                            <span className="inline-flex items-center gap-2">
                              {c.effective_date}
                              {isCurrent && (
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                                  Actual
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">
                            {c.frequency}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(monthlyizeComponent(comp))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(annualizeComponent(comp))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {money(
                              comp.isTaxable
                                ? applyIsr(annualizeComponent(comp), isr)
                                : annualizeComponent(comp),
                            )}
                            {!comp.isTaxable && (
                              <span className="ml-1 text-xs">(exento)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(c)}
                                disabled={editingId !== null}
                                aria-label="Editar movimiento"
                              >
                                <Pencil className="size-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(c.id)}
                                disabled={editingId !== null}
                                aria-label="Eliminar movimiento"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
