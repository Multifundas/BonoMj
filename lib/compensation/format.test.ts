import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("añade sufijo USD con símbolo y separadores", () => {
    expect(formatMoney(1200)).toBe("$1,200.00 USD");
  });

  it("convierte a MXN y añade sufijo MXN", () => {
    // 1000 USD * 17 = 17,000 MXN
    expect(formatMoney(1000, "MXN", 17)).toBe("$17,000.00 MXN");
  });

  it("muestra cero correctamente en USD", () => {
    expect(formatMoney(0)).toBe("$0.00 USD");
  });
});
