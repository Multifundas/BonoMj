import { listCompYears, getProfile } from "@/lib/data/queries";
import { CompYearManager } from "./CompYearManager";
import { ProfileForm } from "./ProfileForm";

export default async function AjustesPage() {
  const [years, profile] = await Promise.all([listCompYears(), getProfile()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Crea años de compensación y configura tu moneda y tipo de cambio.
        </p>
      </div>

      <ProfileForm
        displayName={profile?.display_name ?? null}
        currencyDefault={profile?.currency_default ?? "USD"}
        usdMxnRate={profile?.usd_mxn_rate ?? 17}
      />

      <CompYearManager years={years} />
    </div>
  );
}
