"use client";

import * as React from "react";
import {
  formatMoney as fmtMoney,
  type Currency,
} from "@/lib/compensation/format";

type CurrencyContextValue = {
  currency: Currency;
  usdMxnRate: number;
  setCurrency: (c: Currency) => void;
  /** Formatea un monto en USD a la moneda activa. */
  money: (amountUsd: number) => string;
  /** Formatea un par bruto/neto (USD) a strings en la moneda activa. */
  moneyPair: (gross: number, net: number) => { gross: string; net: string };
};

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrency debe usarse dentro de <CurrencyProvider>");
  return ctx;
}

export function CurrencyProvider({
  initialCurrency,
  usdMxnRate,
  children,
}: {
  initialCurrency: Currency;
  usdMxnRate: number;
  children: React.ReactNode;
}) {
  const [currency, setCurrency] = React.useState<Currency>(initialCurrency);
  const money = React.useCallback(
    (amountUsd: number) => fmtMoney(amountUsd, currency, usdMxnRate),
    [currency, usdMxnRate],
  );
  const moneyPair = React.useCallback(
    (gross: number, net: number) => ({
      gross: fmtMoney(gross, currency, usdMxnRate),
      net: fmtMoney(net, currency, usdMxnRate),
    }),
    [currency, usdMxnRate],
  );
  return (
    <CurrencyContext.Provider
      value={{ currency, usdMxnRate, setCurrency, money, moneyPair }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
