import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MongoEmpty } from "@/components/MongoEmpty";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function MongoClients() {
  const { data, ms } = await measure("clients + invoice count aggregation", async () => {
    const { clients, invoices } = await collections();
    const total = await clients.estimatedDocumentCount();
    if (total === 0) return { total: 0, rows: [] as any[] };

    const rows = await clients.find({}, { sort: { _id: 1 }, limit: 100 }).toArray();
    const ids = rows.map((r) => r._id);
    const counts = await invoices
      .aggregate([
        { $match: { "client._id": { $in: ids } } },
        { $group: { _id: "$client._id", count: { $sum: 1 } } },
      ])
      .toArray();
    const countMap = new Map(counts.map((c: any) => [c._id, c.count]));
    return {
      total,
      rows: rows.map((r) => ({ ...r, invoiceCount: countMap.get(r._id) ?? 0 })),
    };
  });

  if (data.total === 0) return (<><PageHeader title={t("clients.title")} ms={ms} engine="MongoDB" /><MongoEmpty /></>);

  return (
    <>
      <PageHeader
        title={t("clients.title")}
        subtitle="Top 100 clients with invoice count (aggregation on embedded client._id)"
        ms={ms}
        engine="MongoDB"
        label="find + aggregate"
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
              {data.rows.map((c: any) => (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                  <TableCell className="text-right font-mono">{c.invoiceCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
