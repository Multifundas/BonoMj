import { redirect } from "next/navigation";
import {
  getUser,
  getProfile,
  listCompYears,
} from "@/lib/data/queries";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { CompYearProvider } from "@/components/CompYearProvider";
import { HelpModal } from "@/components/HelpModal";
import { quoteOfTheDay } from "@/lib/quotes";
import { fetchUsdMxnRate } from "@/lib/data/fx";
import { Nav } from "./Nav";
import { CompYearSwitcher } from "./CompYearSwitcher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, years, liveRate] = await Promise.all([
    getProfile(),
    listCompYears(),
    fetchUsdMxnRate(),
  ]);

  const currency = profile?.currency_default ?? "USD";
  // Tipo de cambio en vivo; si la API falla, usa el guardado o el default.
  const usdMxnRate = liveRate ?? profile?.usd_mxn_rate ?? 17;
  const activeId = years[0]?.id ?? null;
  const dailyQuote = quoteOfTheDay();

  return (
    <CurrencyProvider initialCurrency={currency} usdMxnRate={usdMxnRate}>
      <CompYearProvider years={years} activeId={activeId}>
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between gap-4 border-b bg-card/80 px-6 py-3 backdrop-blur">
              <div className="flex items-center gap-4">
                <CompYearSwitcher />
                <p className="hidden text-sm font-medium text-primary lg:block">
                  {dailyQuote}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Hola, {profile?.display_name ?? user.email}
                </p>
                <HelpModal />
              </div>
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
