"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para componentes de cliente ("use client").
 * Usa solo la anon key pública (RLS protege los datos).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
