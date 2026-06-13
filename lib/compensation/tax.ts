/**
 * Estimación de impuestos (ISR México) — lógica pura y testeable.
 *
 * Modelo: TASA EFECTIVA única configurable por año de compensación.
 * NO es la tabla progresiva del ISR ni incluye subsidio al empleo; es una
 * aproximación para mostrar un neto orientativo junto al bruto.
 *
 * Regla de gravabilidad:
 *  - El variable (true-up + bono) se considera 100% gravable.
 *  - Los componentes fijos respetan su flag `isTaxable`: lo exento pasa íntegro.
 */

import type { GrossNet } from "./types";
import type { SalaryComponent } from "./salary";
import { annualizeComponent, monthlyizeComponent } from "./salary";

/** Limita un número al rango [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Neto = bruto * (1 - tasa). La tasa se clampa al rango [0, 0.99] para evitar
 * netos negativos o tasas inválidas.
 */
export function applyIsr(grossUsd: number, isrRatePct: number): number {
  const rate = clamp(isrRatePct, 0, 0.99);
  return grossUsd * (1 - rate);
}

/** Devuelve { gross, net } para un monto totalmente gravable. */
export function grossNet(grossUsd: number, isrRatePct: number): GrossNet {
  return { gross: grossUsd, net: applyIsr(grossUsd, isrRatePct) };
}

/**
 * Calcula { gross, net } de un arreglo de componentes respetando `isTaxable`.
 * Los gravables aplican ISR; los exentos pasan íntegros al neto.
 *
 * @param period "annual" usa annualizeComponent, "monthly" usa monthlyizeComponent.
 */
export function componentsGrossNet(
  components: SalaryComponent[],
  isrRatePct: number,
  period: "annual" | "monthly",
): GrossNet {
  const normalize =
    period === "annual" ? annualizeComponent : monthlyizeComponent;

  let gross = 0;
  let net = 0;
  for (const c of components) {
    const amount = normalize(c);
    gross += amount;
    net += c.isTaxable ? applyIsr(amount, isrRatePct) : amount;
  }
  return { gross, net };
}
