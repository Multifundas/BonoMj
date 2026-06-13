"use client";

import * as React from "react";
import type { CompensationYear } from "@/lib/supabase/database.types";
import { createCompYear, type CompYearInput } from "@/lib/data/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPct } from "@/lib/compensation/format";

function defaultDates() {
  // Año fiscal que contiene hoy (1-may → 30-abr).
  const now = new Date();
  const y = now.getUTCFullYear();
  const startThisYear = Date.UTC(y, 4, 1);
  const startYear = now.getTime() >= startThisYear ? y : y - 1;
  return {
    start: `${startYear}-05-01`,
    end: `${startYear + 1}-04-30`,
    label: `CY${String((startYear + 1) % 100).padStart(2, "0")}`,
  };
}

export function CompYearManager({ years }: { years: CompensationYear[] }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const d = defaultDates();

  const [label, setLabel] = React.useState(d.label);
  const [startDate, setStartDate] = React.useState(d.start);
  const [endDate, setEndDate] = React.useState(d.end);
  const [parHours, setParHours] = React.useState("1200");
  const [trueUpMax, setTrueUpMax] = React.useState("500");
  const [bonusRatePct, setBonusRatePct] = React.useState("37.5");
  const [blendedRate, setBlendedRate] = React.useState("318.4");
  const [trueUpRate, setTrueUpRate] = React.useState("70.35054");
  const [applyCap, setApplyCap] = React.useState(false);
  const [adminCap, setAdminCap] = React.useState("100");
  const [evalOk, setEvalOk] = React.useState(true);
  const [isr, setIsr] = React.useState("20");
  const [baseSalary, setBaseSalary] = React.useState("");
  const [paidToDate, setPaidToDate] = React.useState("0");

  function onCreate() {
    setError(null);
    const input: CompYearInput = {
      label,
      start_date: startDate,
      end_date: endDate,
      par_hours: Number(parHours) || 0,
      true_up_max_hours: Number(trueUpMax) || 0,
      bonus_rate_pct: (Number(bonusRatePct) || 0) / 100,
      blended_billing_rate: blendedRate ? Number(blendedRate) : null,
      bonus_rate_per_hour: null,
      true_up_rate_per_hour: Number(trueUpRate) || 0,
      apply_admin_cap: applyCap,
      admin_cap: Number(adminCap) || 0,
      evaluation_satisfactory: evalOk,
      isr_effective_rate_pct: (Number(isr) || 0) / 100,
      base_salary: baseSalary ? Number(baseSalary) : null,
      salary_paid_to_date: Number(paidToDate) || 0,
    };
    startTransition(async () => {
      try {
        await createCompYear(input);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear el año");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Años de compensación</CardTitle>
        <CardDescription>
          El año fiscal va del 1 de mayo al 30 de abril. La tarifa del true-up
          es un input por año (ver notas de reglas).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {years.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Año</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Par</TableHead>
                <TableHead className="text-right">True-up máx</TableHead>
                <TableHead className="text-right">ISR</TableHead>
                <TableHead>Cap admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((y) => (
                <TableRow key={y.id}>
                  <TableCell className="font-medium">{y.label}</TableCell>
                  <TableCell>
                    {y.start_date} → {y.end_date}
                  </TableCell>
                  <TableCell className="text-right">{y.par_hours}</TableCell>
                  <TableCell className="text-right">
                    {y.true_up_max_hours}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPct(Number(y.isr_effective_rate_pct))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={y.apply_admin_cap ? "warning" : "secondary"}>
                      {y.apply_admin_cap ? `ON · ${y.admin_cap}` : "OFF"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="rounded-lg border p-4">
          <p className="mb-4 text-sm font-semibold">Nuevo año de compensación</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Etiqueta" id="cy-label">
              <Input
                id="cy-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
            <Field label="Inicio" id="cy-start">
              <Input
                id="cy-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="Fin" id="cy-end">
              <Input
                id="cy-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
            <Field label="Par hours" id="cy-par">
              <Input
                id="cy-par"
                type="number"
                value={parHours}
                onChange={(e) => setParHours(e.target.value)}
              />
            </Field>
            <Field label="True-up máx (horas)" id="cy-tumax">
              <Input
                id="cy-tumax"
                type="number"
                value={trueUpMax}
                onChange={(e) => setTrueUpMax(e.target.value)}
              />
            </Field>
            <Field label="Bono % del blended" id="cy-bpct">
              <Input
                id="cy-bpct"
                type="number"
                step="0.1"
                value={bonusRatePct}
                onChange={(e) => setBonusRatePct(e.target.value)}
              />
            </Field>
            <Field label="Blended billing rate" id="cy-blended">
              <Input
                id="cy-blended"
                type="number"
                step="0.01"
                value={blendedRate}
                onChange={(e) => setBlendedRate(e.target.value)}
              />
            </Field>
            <Field label="True-up $/hora" id="cy-turate">
              <Input
                id="cy-turate"
                type="number"
                step="0.00001"
                value={trueUpRate}
                onChange={(e) => setTrueUpRate(e.target.value)}
              />
            </Field>
            <Field label="Admin cap (horas)" id="cy-cap">
              <Input
                id="cy-cap"
                type="number"
                value={adminCap}
                onChange={(e) => setAdminCap(e.target.value)}
              />
            </Field>
            <Field label="ISR efectiva (%)" id="cy-isr">
              <Input
                id="cy-isr"
                type="number"
                step="0.1"
                value={isr}
                onChange={(e) => setIsr(e.target.value)}
              />
            </Field>
            <Field label="Salario base (anual)" id="cy-base">
              <Input
                id="cy-base"
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
              />
            </Field>
            <Field label="Salario pagado a la fecha" id="cy-paid">
              <Input
                id="cy-paid"
                type="number"
                value={paidToDate}
                onChange={(e) => setPaidToDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyCap}
                onChange={(e) => setApplyCap(e.target.checked)}
                className="size-4 accent-primary"
              />
              Aplicar cap admin
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={evalOk}
                onChange={(e) => setEvalOk(e.target.checked)}
                className="size-4 accent-primary"
              />
              Evaluación satisfactoria
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="mt-4">
            <Button onClick={onCreate} disabled={pending}>
              Crear año
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
