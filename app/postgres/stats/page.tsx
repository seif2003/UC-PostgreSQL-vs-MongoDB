import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

type RevenueRow = { month: string; revenue: string | number };
type TopProductRow = {
  product_id: number;
  name: string;
  units_sold: string | number;
  revenue: string | number;
};

export default async function PostgresStats() {
  const { data, ms } = await measure("stats — 2 GROUP BY queries with JOINs", async () => {
    const revenueByMonth = await prisma.$queryRaw<RevenueRow[]>`
      SELECT
        to_char(date_trunc('month', issued_at), 'YYYY-MM') AS month,
        SUM(total)::text AS revenue
      FROM invoices
      WHERE status = 'paid'
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `;

    const topProducts = await prisma.$queryRaw<TopProductRow[]>`
      SELECT
        p.id AS product_id,
        p.name,
        SUM(ii.quantity)::text AS units_sold,
        SUM(ii.subtotal)::text AS revenue
      FROM invoice_items ii
      JOIN products p ON p.id = ii.product_id
      JOIN invoices i ON i.id = ii.invoice_id
      WHERE i.status = 'paid'
      GROUP BY p.id, p.name
      ORDER BY SUM(ii.subtotal) DESC
      LIMIT 10
    `;

    return { revenueByMonth, topProducts };
  });

  return (
    <>
      <PageHeader
        title={t("stats.title")}
        subtitle={t("stats.postgres.subtitle")}
        ms={ms}
        engine="Postgres"
        label={t("stats.postgres.label")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>{t("stats.revenue_by_month")} ({t("status.paid")})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.month")}</TableHead>
                  <TableHead className="text-right">{t("table.revenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueByMonth.map((r) => (
                  <TableRow key={r.month}>
                    <TableCell className="font-mono">{r.month}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(r.revenue.toString())}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("stats.top_products")}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.product")}</TableHead>
                  <TableHead className="text-right">{t("table.units")}</TableHead>
                  <TableHead className="text-right">{t("table.revenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((p) => (
                  <TableRow key={p.product_id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-right font-mono">{p.units_sold}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(p.revenue.toString())}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
