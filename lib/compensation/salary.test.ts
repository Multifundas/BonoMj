import { describe, expect, it } from "vitest";
import {
  annualizeComponent,
  compensationBreakdown,
  yearOverYearGrowth,
  type SalaryComponent,
  type YearTotal,
} from "./salary";
import { round } from "./format";

const components: SalaryComponent[] = [
  { name: "Base", category: "base", amount: 8000, frequency: "mensual", isTaxable: true },
  { name: "Aguinaldo", category: "aguinaldo", amount: 12000, frequency: "anual", isTaxable: true },
  { name: "Vales", category: "vales", amount: 1000, frequency: "mensual", isTaxable: false },
];

describe("annualizeComponent", () => {
  it("mensual ×12", () => {
    expect(annualizeComponent(components[0])).toBe(96000);
  });
  it("anual tal cual", () => {
    expect(annualizeComponent(components[1])).toBe(12000);
  });
});

describe("compensationBreakdown", () => {
  it("suma fijo + variable y prorratea a mensual", () => {
    // fixedAnnual = 96000 + 12000 + 12000 = 120000
    const r = compensationBreakdown(components, 50000);
    expect(r.fixedAnnual).toBe(120000);
    expect(round(r.fixedMonthly, 2)).toBe(10000);
    expect(r.variableAnnual).toBe(50000);
    expect(round(r.variableMonthly, 2)).toBe(round(50000 / 12, 2));
    expect(r.totalAnnual).toBe(170000);
    expect(round(r.totalMonthly, 2)).toBe(round(170000 / 12, 2));
  });
});

describe("yearOverYearGrowth", () => {
  const years: YearTotal[] = [
    { label: "CY24", base: 90000, benefits: 20000, trueUp: 10000, bonus: 0, total: 120000 },
    { label: "CY25", base: 95000, benefits: 22000, trueUp: 12000, bonus: 5000, total: 134000 },
    { label: "CY26", base: 100000, benefits: 24000, trueUp: 35175.27, bonus: 14817.54, total: 173992.81 },
  ];

  it("primer año sin delta", () => {
    const g = yearOverYearGrowth(years);
    expect(g[0].deltaAmount).toBeNull();
    expect(g[0].deltaPct).toBeNull();
  });

  it("calcula delta absoluto y porcentual", () => {
    const g = yearOverYearGrowth(years);
    expect(g[1].deltaAmount).toBe(14000);
    expect(round(g[1].deltaPct!, 4)).toBe(round(14000 / 120000, 4));
    expect(round(g[2].deltaAmount!, 2)).toBe(round(173992.81 - 134000, 2));
  });
});
