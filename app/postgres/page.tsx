import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostgresDashboard() {
  const { data, ms } = await measure("dashboard", async () => {
    const [invoiceCount, clientCount, productCount, recent] = await Promise.all([
      prisma.invoice.count(),
      prisma.client.count(),
      prisma.product.count(),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { issuedAt: "desc" },
        include: { client: true },
      }),
    ]);
    return { invoiceCount, clientCount, productCount, recent };
  });

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.postgres.subtitle")}
        ms={ms}
        engine="Postgres"
        label={t("dashboard.label.postgres")}
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
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link href={`/postgres/invoices/${inv.id}`} className="underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client.name}</TableCell>
                  <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(inv.total.toString())}
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
