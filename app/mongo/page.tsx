import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { MongoEmpty } from "@/components/MongoEmpty";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MongoDashboard() {
  const { data, ms } = await measure("dashboard", async () => {
    const { invoices, clients, products } = await collections();
    const [invoiceCount, clientCount, productCount, recent] = await Promise.all([
      invoices.estimatedDocumentCount(),
      clients.estimatedDocumentCount(),
      products.estimatedDocumentCount(),
      invoices.find({}, { sort: { issuedAt: -1 }, limit: 5 }).toArray(),
    ]);
    return { invoiceCount, clientCount, productCount, recent };
  });

  if (data.invoiceCount === 0 && data.clientCount === 0 && data.productCount === 0) {
    return (
      <>
        <PageHeader title={t("dashboard.title")} ms={ms} engine="MongoDB" label={t("dashboard.label.mongo")} />
        <MongoEmpty />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.mongo.subtitle")}
        ms={ms}
        engine="MongoDB"
        label={t("dashboard.label.mongo")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader><CardTitle>{data.invoiceCount.toLocaleString()}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("dashboard.invoices")}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{data.clientCount.toLocaleString()}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("dashboard.clients")}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{data.productCount.toLocaleString()}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("dashboard.products")}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("dashboard.recent")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.number")}</TableHead>
                <TableHead>{t("table.client")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead className="text-right">{t("table.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent.map((inv) => (
                <TableRow key={inv._id}>
                  <TableCell>
                    <Link href={`/mongo/invoices/${inv._id}`} className="underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client.name}</TableCell>
                  <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(inv.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
