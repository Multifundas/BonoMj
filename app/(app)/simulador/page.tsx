import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries } from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import { toCompParams } from "@/lib/compensation/adapters";
import { EmptyYear } from "@/components/EmptyYear";
import { Simulator } from "./Simulator";

export default async function SimuladorPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const entries = await listHourEntries(compYear.id);
  const s = buildYearSummary(compYear, entries);
  const params = toCompParams(compYear);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulador what-if</h1>
        <p className="text-sm text-muted-foreground">
          Mueve los sliders para ver cómo cambian tu true-up y bono. Activa o
          desactiva el cap admin para ver su efecto.
        </p>
      </div>

      <Simulator
        params={params}
        initialBillable={s.result.billableHours}
        initialOther={s.sumOtherTotal}
      />
    </div>
  );
}
