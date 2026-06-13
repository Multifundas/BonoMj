import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries, listAbsences } from "@/lib/data/queries";
import { EmptyYear } from "@/components/EmptyYear";
import { formatHours } from "@/lib/compensation/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const TYPE_LABEL: Record<string, string> = {
  vacaciones: "Vacaciones",
  feriado: "Feriado",
  personal: "Personal",
};

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const [entries, absences] = await Promise.all([
    listHourEntries(compYear.id),
    listAbsences(compYear.id),
  ]);

  // Acumulado mensual de horas (por mes calendario del entry_date).
  const byMonth = new Map<
    string,
    { billable: number; admin: number; other: number }
  >();
  for (const e of entries) {
    const d = new Date(e.entry_date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const cur = byMonth.get(key) ?? { billable: 0, admin: 0, other: 0 };
    cur.billable += Number(e.billable_hours);
    cur.admin += Number(e.admin_hours);
    cur.other += Number(e.other_creditable_hours);
    byMonth.set(key, cur);
  }
  const months = [...byMonth.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  function monthLabel(key: string): string {
    const [y, m] = key.split("-");
    return `${MONTHS[Number(m) - 1]} ${y}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Calendario y ausencias
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen mensual de horas y ausencias registradas del año.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horas por mes</CardTitle>
          <CardDescription>
            Acumulados mensuales según la fecha de cada corte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {months.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay cortes registrados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Admin</TableHead>
                  <TableHead className="text-right">Otras</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map(([key, v]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {monthLabel(key)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatHours(v.billable)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatHours(v.admin)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatHours(v.other)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatHours(v.billable + v.admin + v.other)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ausencias planeadas</CardTitle>
          <CardDescription>
            Gestiona las ausencias desde Proyección y ritmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay ausencias registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Días hábiles</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absences.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.start_date} → {a.end_date}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TYPE_LABEL[a.type] ?? a.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.working_days}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
