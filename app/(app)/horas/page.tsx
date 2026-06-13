import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries } from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import { formatHours } from "@/lib/compensation/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyYear } from "@/components/EmptyYear";
import { HourEntryForm } from "./HourEntryForm";
import { HourEntryTable } from "./HourEntryTable";
import { ExportButton } from "./ExportButton";

export default async function HorasPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const entries = await listHourEntries(compYear.id);
  const s = buildYearSummary(compYear, entries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Captura de horas</h1>
        <p className="text-sm text-muted-foreground">
          Registra cortes diarios o semanales para {compYear.label}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Billable acumulado</p>
            <p className="text-xl font-bold tabular-nums">
              {formatHours(s.sumBillable)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Admin acumulado</p>
            <p className="text-xl font-bold tabular-nums">
              {formatHours(s.sumAdmin)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Otras acreditables</p>
            <p className="text-xl font-bold tabular-nums">
              {formatHours(s.sumOther)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total creditable</p>
            <p className="text-xl font-bold tabular-nums">
              {formatHours(s.result.totalCreditableHours)}
            </p>
          </CardContent>
        </Card>
      </div>

      <HourEntryForm compYearId={compYear.id} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Historial de cortes</CardTitle>
            <ExportButton entries={entries} label={compYear.label} />
          </div>
        </CardHeader>
        <CardContent>
          <HourEntryTable entries={entries} compYearId={compYear.id} />
        </CardContent>
      </Card>
    </div>
  );
}
