"use client";

import * as React from "react";
import type { Currency } from "@/lib/supabase/database.types";
import { updateProfile } from "@/lib/data/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  displayName: string | null;
  currencyDefault: Currency;
  usdMxnRate: number;
};

export function ProfileForm({
  displayName,
  currencyDefault,
  usdMxnRate,
}: Props) {
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const [name, setName] = React.useState(displayName ?? "");
  const [currency, setCurrency] = React.useState<Currency>(currencyDefault);
  const [rate, setRate] = React.useState(String(usdMxnRate));

  function onSave() {
    setSaved(false);
    startTransition(async () => {
      await updateProfile({
        display_name: name || null,
        currency_default: currency,
        usd_mxn_rate: Number(rate) || 0,
      });
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil y moneda</CardTitle>
        <CardDescription>
          La moneda por defecto y el tipo de cambio USD→MXN aplican a toda la
          app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="p-name">Nombre</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-cur">Moneda por defecto</Label>
            <Select
              id="p-cur"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="USD">USD ($)</option>
              <option value="MXN">MXN ($)</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-rate">Tipo de cambio USD→MXN</Label>
            <Input
              id="p-rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={pending}>
            Guardar
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">Guardado.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
