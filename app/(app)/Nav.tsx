"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Calculator,
  Wallet,
  TrendingUp,
  SlidersHorizontal,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useCurrency } from "@/components/CurrencyProvider";
import { signOut } from "@/app/(auth)/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/horas", label: "Captura de horas", icon: Clock },
  { href: "/calculos", label: "Calculadoras", icon: Calculator },
  { href: "/salario", label: "Salario y prestaciones", icon: Wallet },
  { href: "/proyeccion", label: "Proyección y ritmo", icon: TrendingUp },
  { href: "/simulador", label: "Simulador what-if", icon: SlidersHorizontal },
  { href: "/calendario", label: "Calendario y ausencias", icon: Calendar },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="px-5 py-5">
        <p className="text-lg font-bold tracking-tight">Mi Compensación</p>
        <p className="text-xs text-muted-foreground">
          True-Up + Production Bonus
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t p-3">
        <div className="px-1">
          <label className="text-xs text-muted-foreground">Moneda</label>
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "USD" | "MXN")}
            className="mt-1 h-8 text-xs"
          >
            <option value="USD">USD ($)</option>
            <option value="MXN">MXN ($)</option>
          </Select>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
