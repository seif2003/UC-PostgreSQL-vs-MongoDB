import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function PostgresClients() {
  const { data, ms } = await measure("clients + invoice counts", async () => {
    return prisma.client.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { invoices: true } } },
      take: 100,
    });
  });

  return (
    <>
      <PageHeader
        title={t("clients.title")}
        subtitle={t("clients.label")}
        ms={ms}
        engine="Postgres"
        label="findMany + _count"
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.client")}</TableHead>
                <TableHead>{t("clients.email")}</TableHead>
                <TableHead>{t("clients.phone")}</TableHead>
                <TableHead className="text-right">{t("clients.invoices_count")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                  <TableCell className="text-right font-mono">{c._count.invoices}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
