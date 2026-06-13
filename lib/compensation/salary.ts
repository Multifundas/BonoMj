/**
 * Salario, prestaciones y compensación mensual real (sección 7).
 * Funciones puras: la captura/persistencia vive en Supabase, no aquí.
 */

export type ComponentFrequency = "mensual" | "anual" | "unica";

export type ComponentCategory =
  | "base"
  | "aguinaldo"
  | "prima_vacacional"
  | "vales"
  | "seguro_gastos_medicos"
  | "401k"
  | "ptos"
  | "bono_otro";

export type SalaryComponent = {
  name: string;
  category: ComponentCategory;
  amount: number;
  frequency: ComponentFrequency;
  isTaxable: boolean;
};

/** Normaliza un componente a su valor ANUAL. */
export function annualizeComponent(c: SalaryComponent): number {
  switch (c.frequency) {
    case "mensual":
      return c.amount * 12;
    case "anual":
    case "unica":
      return c.amount;
  }
}

/** Normaliza un componente a su valor MENSUAL prorrateado. */
export function monthlyizeComponent(c: SalaryComponent): number {
  return annualizeComponent(c) / 12;
}

export type CompensationBreakdown = {
  /** Suma anual de todos los componentes (base + prestaciones). */
  fixedAnnual: number;
  /** Suma mensual prorrateada de componentes. */
  fixedMonthly: number;
  /** Variable anual (true-up + bono). */
  variableAnnual: number;
  /** Variable mensual prorrateado. */
  variableMonthly: number;
  /** Total anual = fijo + variable. */
  totalAnnual: number;
  /** Total mensual real = fijo mensual + variable mensual prorrateado. */
  totalMonthly: number;
};

/**
 * Compensación mensual real = base mensual + prestaciones prorrateadas
 * + (true-up + bono) prorrateados a 12 meses.
 */
export function compensationBreakdown(
  components: SalaryComponent[],
  variableAnnual: number,
): CompensationBreakdown {
  const fixedAnnual = components.reduce(
    (sum, c) => sum + annualizeComponent(c),
    0,
  );
  const fixedMonthly = fixedAnnual / 12;
  const variableMonthly = variableAnnual / 12;
  return {
    fixedAnnual,
    fixedMonthly,
    variableAnnual,
    variableMonthly,
    totalAnnual: fixedAnnual + variableAnnual,
    totalMonthly: fixedMonthly + variableMonthly,
  };
}

export type YearTotal = {
  label: string;
  base: number;
  benefits: number;
  trueUp: number;
  bonus: number;
  total: number;
};

export type YearGrowth = YearTotal & {
  /** Cambio absoluto vs. el año previo (null para el primero). */
  deltaAmount: number | null;
  /** Cambio porcentual vs. el año previo (null para el primero). */
  deltaPct: number | null;
};

/**
 * Calcula el crecimiento año con año. Asume `years` ordenados cronológicamente.
 */
export function yearOverYearGrowth(years: YearTotal[]): YearGrowth[] {
  return years.map((y, i) => {
    if (i === 0) {
      return { ...y, deltaAmount: null, deltaPct: null };
    }
    const prev = years[i - 1];
    const deltaAmount = y.total - prev.total;
    const deltaPct = prev.total !== 0 ? deltaAmount / prev.total : null;
    return { ...y, deltaAmount, deltaPct };
  });
}
