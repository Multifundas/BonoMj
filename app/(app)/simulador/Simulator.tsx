"use client";

import * as React from "react";
import type { CompParams } from "@/lib/compensation/types";
import { trueUpCeiling } from "@/lib/compensation/types";
import { computeCompensation } from "@/lib/compensation/core";
import { formatHours } from "@/lib/compensation/format";
import { applyIsr } from "@/lib/compensation/tax";
import { useCurrency } from "@/components/CurrencyProvider";
import { Kpi } from "@/components/Kpi";
import { ZoneBar } from "@/components/ZoneBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: CompParams;
  initialBillable: number;
  initialOther: number;
};

export function Simulator({ params, initialBillable, initialOther }: Props) {
  const { money } = useCurrency();
  const [billable, setBillable] = React.useState(Math.round(initialBillable));
  const [other, setOther] = React.useState(Math.round(initialOther));
  const [applyCap, setApplyCap] = React.useState(params.applyAdminCap);

  const effParams: CompParams = { ...params, applyAdminCap: applyCap };
  const r = computeCompensation(
    { billableHours: billable, otherCreditableHours: other },
    effParams,
  );

  const ceiling = trueUpCeiling(effParams);
  const maxBillable = Math.max(2400, Math.round(initialBillable) + 400);
  const maxOther = Math.max(400, Math.round(initialOther) + 200);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
          <CardDescription>
            Ajusta horas y el cap admin para ver el impacto en vivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Horas billable</Label>
              <span className="text-sm font-semibold tabular-nums">
                {formatHours(billable, 0)}
              </span>
            </div>
            <Slider
              value={billable}
              onValueChange={setBillable}
              min={0}
              max={maxBillable}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Otras horas acreditables (admin + otras)</Label>
              <span className="text-sm font-semibold tabular-nums">
                {formatHours(other, 0)}
              </span>
            </div>
            <Slider
              value={other}
              onValueChange={setOther}
              min={0}
              max={maxOther}
              step={5}
            />
          </div>

          <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <input
              type="checkbox"
              checked={applyCap}
              onChange={(e) => setApplyCap(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span>
              Aplicar cap admin{" "}
              <Badge variant={applyCap ? "warning" : "secondary"}>
                {applyCap
                  ? `ON · ${formatHours(params.adminCap, 0)} h`
                  : "OFF"}
              </Badge>
            </span>
          </label>

          {applyCap && other > params.adminCap && (
            <p className="text-sm text-amber-700">
              {formatHours(other - params.adminCap)} horas admin se desperdician
              arriba del cap.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Kpi
            label="Salary True-Up"
            value={money(r.salaryTrueUp)}
            subValue={`Neto ${money(applyIsr(r.salaryTrueUp, params.isrEffectiveRatePct))}`}
            hint={`${formatHours(r.trueUpQualifyingHours)} h calificadas`}
            accent="trueup"
          />
          <Kpi
            label="Production Bonus"
            value={money(r.productionBonus)}
            subValue={`Neto ${money(applyIsr(r.productionBonus, params.isrEffectiveRatePct))}`}
            hint={
              r.isEligible
                ? `${formatHours(r.bonusQualifyingHours)} h arriba de ${formatHours(ceiling, 0)}`
                : "No elegible (gate billable)"
            }
            accent="bonus"
          />
        </div>

        <Kpi
          label="Compensación variable total"
          value={money(r.totalVariable)}
          subValue={`Neto ${money(applyIsr(r.totalVariable, params.isrEffectiveRatePct))}`}
          hint={`${formatHours(r.totalCreditableHours)} h creditable totales`}
          accent="default"
        />

        <Card>
          <CardContent className="p-5">
            <ZoneBar
              current={r.totalCreditableHours}
              par={effParams.parHours}
              ceiling={ceiling}
              goal={ceiling + 300}
            />
            {!r.isEligible && (
              <p className="mt-3 text-sm text-amber-700">
                ⚠️ Aún no calificas para el bono: necesitas más de{" "}
                {formatHours(effParams.parHours, 0)} horas billable (el gate es
                sobre billable, no creditable).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
