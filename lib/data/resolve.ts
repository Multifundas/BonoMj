import "server-only";
import { getActiveCompYear, getCompYear } from "./queries";
import type { CompensationYear } from "@/lib/supabase/database.types";

/**
 * Resuelve el compensation year a usar en una página:
 * respeta ?cy=<id> si viene; si no, usa el activo (el que contiene hoy)
 * o el más reciente.
 */
export async function resolveCompYear(
  searchParams?: { cy?: string },
): Promise<CompensationYear | null> {
  if (searchParams?.cy) {
    const cy = await getCompYear(searchParams.cy);
    if (cy) return cy;
  }
  return getActiveCompYear();
}
