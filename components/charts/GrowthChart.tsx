"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/components/CurrencyProvider";

export type GrowthDatum = {
  label: string;
  base: number;
  benefits: number;
  trueUp: number;
  bonus: number;
  total: number;
};

const COLORS = {
  base: "#94a3b8",
  benefits: "#cbd5e1",
  trueUp: "#34d399",
  bonus: "#fbbf24",
};

export function GrowthChart({ data }: { data: GrowthDatum[] }) {
  const { money } = useCurrency();
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" />
        <YAxis
          tickFormatter={(v: number) =>
            new Intl.NumberFormat("en-US", {
              notation: "compact",
            }).format(v)
          }
        />
        <Tooltip
          formatter={(value: number, name: string) => [money(value), name]}
        />
        <Legend />
        <Bar dataKey="base" stackId="a" name="Base" fill={COLORS.base} />
        <Bar
          dataKey="benefits"
          stackId="a"
          name="Prestaciones"
          fill={COLORS.benefits}
        />
        <Bar
          dataKey="trueUp"
          stackId="a"
          name="True-up"
          fill={COLORS.trueUp}
        />
        <Bar dataKey="bonus" stackId="a" name="Bono" fill={COLORS.bonus}>
          {data.map((_, i) => (
            <Cell key={i} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
