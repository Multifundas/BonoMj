"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { CompensationYear } from "@/lib/supabase/database.types";

type CompYearContextValue = {
  years: CompensationYear[];
  activeId: string | null;
  setActiveId: (id: string) => void;
};

const Ctx = React.createContext<CompYearContextValue | null>(null);

export function useCompYears() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error("useCompYears debe usarse dentro de <CompYearProvider>");
  return ctx;
}

export function CompYearProvider({
  years,
  activeId,
  children,
}: {
  years: CompensationYear[];
  activeId: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setActiveId = React.useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("cy", id);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <Ctx.Provider value={{ years, activeId, setActiveId }}>
      {children}
    </Ctx.Provider>
  );
}
