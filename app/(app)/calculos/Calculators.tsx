"use client";

import * as React from "react";
import {
  hoursForTargetBonus,
  hoursRemainingForGoal,
  projectAtCurrentHours,
  adminHoursStatus,
  type Snapshot,
} from "@/lib/compensation/calculators";
import type { CompParams } from "@/lib/compensation/types";
import { formatHours } from "@/lib/compensation/format";
import { useCurrency } from "@/components/CurrencyProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = {
  params: CompParams;
  snapshot: Snapshot;
  currentAdmin: number;
  weeksRemaining: number;
  monthsRemaining: number;
};

export function Calculators(props: Props) {
  return (
    <Tabs defaultValue="c1">
      <TabsList className="flex-wrap">
        <TabsTrigger value="c1">1 · Horas para un bono</TabsTrigger>
        <TabsTrigger value="c2">2 · Horas faltantes</TabsTrigger>
        <TabsTrigger value="c3">3 · True-up y bono hoy</TabsTrigger>
        <TabsTrigger value="c4">4 · Horas admin</TabsTrigger>
      </TabsList>
      <TabsContent value="c1">
        <Calc1 {...props} />
      </TabsContent>
      <TabsContent value="c2">
        <Calc2 {...props} />
      </TabsContent>
      <TabsContent value="c3">
        <Calc3 {...props} />
      </TabsContent>
      <TabsContent value="c4">
        <Calc4 {...props} />
      </TabsContent>
    </Tabs>
  );
}

function Result({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}

// --- Cálculo 1 ---
function Calc1({ params, snapshot, weeksRemaining, monthsRemaining }: Props) {
  const { money } = useCurrency();
  const [target, setTarget] = React.useState("20000");
  const r = hoursForTargetBonus(
    {
      targetBonus: Number(target) || 0,
      snapshot,
      weeksRemaining,
      monthsRemaining,
    },
    params,
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Cuántas horas necesito para un bono objetivo?</CardTitle>
        <CardDescription>
          Tarifa del bono: {money(r.effectiveBonusRatePerHour)}/hora.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs space-y-1">
          <Label htmlFor="target">Bono objetivo</Label>
          <Input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <Result>
          <p>
            Necesitas{" "}
            <strong>{formatHours(r.needTotalCreditable)}</strong> horas total
            creditable (de las cuales {formatHours(r.needBonusHours)} arriba de
            1,700).
          </p>
          <p>
            Desde tu corte faltan{" "}
            <strong>{formatHours(r.additionalCreditable)}</strong> horas:{" "}
            {formatHours(r.weeklyNeeded)} h/semana ·{" "}
            {formatHours(r.monthlyNeeded)} h/mes.
          </p>
          {r.gateNotMet && (
            <p className="mt-2 text-amber-700">
              ⚠️ Faltan {formatHours(r.billableNeededForGate)} horas billable
              para activar el bono (gate de {formatHours(params.parHours, 0)}).
            </p>
          )}
        </Result>
      </CardContent>
    </Card>
  );
}

// --- Cálculo 2 ---
function Calc2({ snapshot }: Props) {
  const [goalTotal, setGoalTotal] = React.useState("1900");
  const [goalBillable, setGoalBillable] = React.useState("1750");
  const r = hoursRemainingForGoal({
    goalTotalCreditable: Number(goalTotal) || undefined,
    goalBillable: Number(goalBillable) || undefined,
    snapshot,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Cuántas horas me faltan para mi objetivo?</CardTitle>
        <CardDescription>
          Corte actual: {formatHours(snapshot.currentBillable)} billable ·{" "}
          {formatHours(snapshot.currentTotalCreditable)} creditable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid max-w-md gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="gt">Meta total creditable</Label>
            <Input
              id="gt"
              type="number"
              value={goalTotal}
              onChange={(e) => setGoalTotal(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gb">Meta billable</Label>
            <Input
              id="gb"
              type="number"
              value={goalBillable}
              onChange={(e) => setGoalBillable(e.target.value)}
            />
          </div>
        </div>
        <Result>
          {r.remainingTotalCreditable != null && (
            <p>
              Faltan{" "}
              <strong>{formatHours(r.remainingTotalCreditable)}</strong> horas
              total creditable.
            </p>
          )}
          {r.remainingBillable != null && (
            <p>
              Faltan <strong>{formatHours(r.remainingBillable)}</strong> horas
              billable.
            </p>
          )}
        </Result>
      </CardContent>
    </Card>
  );
}

// --- Cálculo 3 ---
function Calc3({ params, snapshot, currentAdmin }: Props) {
  const { money } = useCurrency();
  const [billable, setBillable] = React.useState(
    String(snapshot.currentBillable),
  );
  const [other, setOther] = React.useState(String(currentAdmin));
  const r = projectAtCurrentHours(
    {
      billableHours: Number(billable) || 0,
      otherCreditableHours: Number(other) || 0,
    },
    params,
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Qué true-up y bono tendría con estas horas?</CardTitle>
        <CardDescription>
          Edita las horas para simular un escenario puntual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid max-w-md gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="b3">Billable</Label>
            <Input
              id="b3"
              type="number"
              value={billable}
              onChange={(e) => setBillable(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="o3">Otras acreditables</Label>
            <Input
              id="o3"
              type="number"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>
        </div>
        <Result>
          {r.isEligible ? (
            <>
              <p>
                True-up: <strong>{money(r.trueUp)}</strong> (
                {formatHours(r.trueUpQualifyingHours)} h).
              </p>
              <p>
                Bono: <strong>{money(r.bonus)}</strong> (
                {formatHours(r.bonusQualifyingHours)} h arriba de 1,700).
              </p>
            </>
          ) : (
            <p className="text-amber-700">
              Aún no calificas: faltan{" "}
              {formatHours(r.billableNeededForGate)} horas billable para cruzar
              el threshold de {formatHours(params.parHours, 0)}.
            </p>
          )}
        </Result>
      </CardContent>
    </Card>
  );
}

// --- Cálculo 4 ---
function Calc4({ params, currentAdmin }: Props) {
  const [admin, setAdmin] = React.useState(String(currentAdmin));
  const r = adminHoursStatus({ adminToDate: Number(admin) || 0 }, params);
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Cuántas administrative hours llevo?</CardTitle>
        <CardDescription>
          Cap admin: {r.capActive ? `ON (${formatHours(params.adminCap, 0)})` : "OFF"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs space-y-1">
          <Label htmlFor="a4">Horas admin acumuladas</Label>
          <Input
            id="a4"
            type="number"
            value={admin}
            onChange={(e) => setAdmin(e.target.value)}
          />
        </div>
        <Result>
          <p>
            Acumuladas: <strong>{formatHours(r.adminToDate)}</strong>.
          </p>
          <p>
            Contribuyen al creditable:{" "}
            <strong>{formatHours(r.creditableContribution)}</strong>.
          </p>
          {r.capActive && r.wastedAboveCap > 0 && (
            <p className="text-amber-700">
              {formatHours(r.wastedAboveCap)} horas se desperdician arriba del
              cap.
            </p>
          )}
        </Result>
      </CardContent>
    </Card>
  );
}
