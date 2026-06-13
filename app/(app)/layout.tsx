import { redirect } from "next/navigation";
import {
  getUser,
  getProfile,
  listCompYears,
} from "@/lib/data/queries";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { CompYearProvider } from "@/components/CompYearProvider";
import { Nav } from "./Nav";
import { CompYearSwitcher } from "./CompYearSwitcher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, years] = await Promise.all([getProfile(), listCompYears()]);

  const currency = profile?.currency_default ?? "USD";
  const usdMxnRate = profile?.usd_mxn_rate ?? 17;
  const activeId = years[0]?.id ?? null;

  return (
    <CurrencyProvider initialCurrency={currency} usdMxnRate={usdMxnRate}>
      <CompYearProvider years={years} activeId={activeId}>
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between border-b bg-card px-6 py-3">
              <CompYearSwitcher />
              <p className="text-sm text-muted-foreground">
                Hola, {profile?.display_name ?? user.email}
              </p>
            </header>
            <main className="flex-1 overflow-auto bg-muted/20 p-6">
              {children}
            </main>
          </div>
        </div>
      </CompYearProvider>
    </CurrencyProvider>
  );
}
