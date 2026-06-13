"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { upsertHourEntry } from "@/lib/data/actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function HourEntryForm({ compYearId }: { compYearId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [date, setDate] = React.useState(todayISO());
  const [billable, setBillable] = React.useState("");
  const [admin, setAdmin] = React.useState("");
  const [other, setOther] = React.useState("");
  const [note, setNote] = React.useState("");

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await upsertHourEntry({
        comp_year_id: compYearId,
        entry_date: date,
        billable_hours: Number(billable) || 0,
        admin_hours: Number(admin) || 0,
        other_creditable_hours: Number(other) || 0,
        note: note || null,
      });
      setBillable("");
      setAdmin("");
      setOther("");
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setPending(false);
    }
  }

  const fields = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="date">Fecha del corte</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="billable">Horas billable</Label>
        <Input
          id="billable"
          type="number"
          step="0.1"
          min="0"
          value={billable}
          onChange={(e) => setBillable(e.target.value)}
          placeholder="0.0"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="admin">Horas administrativas</Label>
        <Input
          id="admin"
          type="number"
          step="0.1"
          min="0"
          value={admin}
          onChange={(e) => setAdmin(e.target.value)}
          placeholder="0.0"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="other">Otras acreditables</Label>
        <Input
          id="other"
          type="number"
          step="0.1"
          min="0"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="0.0"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="note">Nota (opcional)</Label>
        <Input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ej. corte de la semana"
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="diario">
          <TabsList>
            <TabsTrigger value="diario">Corte diario</TabsTrigger>
            <TabsTrigger value="semanal">Corte semanal</TabsTrigger>
          </TabsList>
          <TabsContent value="diario">{fields}</TabsContent>
          <TabsContent value="semanal">
            <p className="mb-3 text-sm text-muted-foreground">
              Captura el acumulado de la semana en un solo registro. Usa la fecha
              del último día de la semana.
            </p>
            {fields}
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Guardando…" : "Guardar corte"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDate(todayISO());
            }}
            disabled={pending}
          >
            Hoy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
