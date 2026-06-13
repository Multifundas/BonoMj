import { describe, expect, it } from "vitest";
import { applyIsr, grossNet, componentsGrossNet } from "./tax";
import { round } from "./format";
import type { SalaryComponent } from "./salary";

describe("applyIsr", () => {
  it("aplica la tasa: 1000 al 20% = 800", () => {
    expect(applyIsr(1000, 0.2)).toBe(800);
  });
  it("tasa 0 deja el monto íntegro", () => {
    expect(applyIsr(1000, 0)).toBe(1000);
  });
  it("clampa tasa negativa a 0", () => {
    expect(applyIsr(1000, -0.5)).toBe(1000);
  });
  it("clampa tasa mayor a 0.99", () => {
    expect(round(applyIsr(1000, 1.5), 2)).toBe(round(1000 * 0.01, 2));
  });
});

describe("grossNet", () => {
  it("devuelve bruto y neto", () => {
    expect(grossNet(1000, 0.3)).toEqual({ gross: 1000, net: 700 });
  });
});

describe("componentsGrossNet", () => {
  const components: SalaryComponent[] = [
    { name: "Base", category: "base", amount: 1000, frequency: "anual", isTaxable: true },
    { name: "Vales", category: "vales", amount: 200, frequency: "anual", isTaxable: false },
  ];

  it("respeta is_taxable: grava el base, exenta los vales (anual)", () => {
    // gross = 1000 + 200 = 1200; net = 800 (gravable) + 200 (exento) = 1000
    const r = componentsGrossNet(components, 0.2, "annual");
    expect(r.gross).toBe(1200);
    expect(r.net).toBe(1000);
  });

  it("prorratea a mensual usando monthlyizeComponent", () => {
    // anual /12: gross = 100; net = (1000/12)*0.8 + (200/12)
    const r = componentsGrossNet(components, 0.2, "monthly");
    expect(round(r.gross, 4)).toBe(round(1200 / 12, 4));
    expect(round(r.net, 4)).toBe(
      round((1000 / 12) * 0.8 + 200 / 12, 4),
    );
  });

  it("tasa 0: neto = bruto", () => {
    const r = componentsGrossNet(components, 0, "annual");
    expect(r.net).toBe(r.gross);
  });
});
