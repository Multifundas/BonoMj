import "server-only";

/**
 * Obtiene el tipo de cambio USD→MXN en vivo desde Frankfurter (API keyless,
 * basada en tasas del BCE). Cacheado 1 hora vía el fetch de Next.
 * Devuelve null ante cualquier fallo para que el caller use su fallback.
 */
export async function fetchUsdMxnRate(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN",
      { next: { revalidate: 3600 } }, // máx 1 fetch/hora
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { rates?: { MXN?: number } };
    const rate = json?.rates?.MXN;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
