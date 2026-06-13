"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

  async function add() {
    if (!name || !amount) return;
    setPending(true);
    try {
      await createSalaryComponent({
        comp_year_id: compYearId,
        name,
        category,
        amount: Number(amount) || 0,
        frequency,
        is_taxable: isTaxable,
        notes: null,
      });
      setName("");
      setAmount("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    await deleteSalaryComponent(id);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salario base y prestaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-5">
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
        </div>
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
            Agregar concepto
          </Button>
        </div>

        {components.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead className="text-right">Mensual</TableHead>
                <TableHead className="text-right">Anual</TableHead>
                <TableHead className="text-right">Neto anual</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c) => {
                const comp = {
                  name: c.name,
                  category: c.category,
                  amount: Number(c.amount),
                  frequency: c.frequency,
                  isTaxable: c.is_taxable,
                };
                return (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(c.id)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
