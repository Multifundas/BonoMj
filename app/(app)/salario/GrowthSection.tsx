"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GrowthChart, type GrowthDatum } from "@/components/charts/GrowthChart";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPct } from "@/lib/compensation/format";
import type { YearGrowth } from "@/lib/compensation/salary";

export function GrowthSection({ growth }: { growth: YearGrowth[] }) {
  const { money } = useCurrency();
  const data: GrowthDatum[] = growth.map((g) => ({
    label: g.label,
    base: g.base,
    benefits: g.benefits,
    trueUp: g.trueUp,
    bonus: g.bonus,
    total: g.total,
  }));

  if (growth.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Captura más de un compensation year para ver el crecimiento.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crecimiento año con año</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <GrowthChart data={data} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Año</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">Prestaciones</TableHead>
              <TableHead className="text-right">True-up</TableHead>
              <TableHead className="text-right">Bono</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Crecimiento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {growth.map((g) => (
              <TableRow key={g.label}>
                <TableCell className="font-medium">{g.label}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(g.base)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(g.benefits)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(g.trueUp)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(g.bonus)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {money(g.total)}
                </TableCell>
                <TableCell className="text-right">
                  {g.deltaPct == null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge
                      variant={g.deltaPct >= 0 ? "success" : "destructive"}
                    >
                      {g.deltaPct >= 0 ? "+" : ""}
                      {formatPct(g.deltaPct)}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
