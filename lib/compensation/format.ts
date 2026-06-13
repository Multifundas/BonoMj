/**
 * Helpers de presentación. Regla: calcular con precisión completa,
 * redondear SOLO para mostrar (1–2 decimales en horas, 2 en dinero).
 */

export type Currency = "USD" | "MXN";

/** Convierte de USD a la moneda destino con el tipo de cambio dado. */
export function convertFromUsd(
  amountUsd: number,
  currency: Currency,
  usdMxnRate: number,
): number {
  return currency === "MXN" ? amountUsd * usdMxnRate : amountUsd;
}

/** Formatea dinero (2 decimales) con símbolo de moneda. */
export function formatMoney(
  amountUsd: number,
  currency: Currency = "USD",
  usdMxnRate = 1,
): string {
  const value = convertFromUsd(amountUsd, currency, usdMxnRate);
  return new Intl.NumberFormat(currency === "MXN" ? "es-MX" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formatea horas (1 decimal por defecto). */
export function formatHours(hours: number, decimals = 1): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(hours);
}

/** Formatea porcentaje (1 decimal). Recibe fracción (0.375 -> "37.5%"). */
export function formatPct(fraction: number, decimals = 1): string {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fraction);
}

/** Redondea a n decimales (para comparaciones de test/visualización). */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
