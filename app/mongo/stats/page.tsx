import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MongoEmpty } from "@/components/MongoEmpty";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function MongoStats() {
  const { data, ms } = await measure("stats — 1 aggregation pipeline", async () => {
    const { invoices } = await collections();
    const total = await invoices.estimatedDocumentCount();
    if (total === 0) return { empty: true, revenueByMonth: [] as any[], topProducts: [] as any[] };

    const [result] = await invoices
      .aggregate([
        { $match: { status: "paid" } },
        {
          $facet: {
            revenueByMonth: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m",
                      date: { $toDate: "$issuedAt" },
                    },
                  },
                  revenue: { $sum: "$total" },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 12 },
            ],
            topProducts: [
              { $unwind: "$items" },
              {
                $group: {
                  _id: "$items.productId",
                  name: { $first: "$items.productName" },
                  units_sold: { $sum: "$items.quantity" },
                  revenue: { $sum: "$items.subtotal" },
                },
              },
              { $sort: { revenue: -1 } },
              { $limit: 10 },
            ],
          },
        },
      ])
      .toArray();

    return {
      empty: false,
      revenueByMonth: result?.revenueByMonth ?? [],
      topProducts: result?.topProducts ?? [],
    };
  });

  if (data.empty) return (<><PageHeader title={t("stats.title")} ms={ms} engine="MongoDB" /><MongoEmpty /></>);

  return (
    <>
      <PageHeader
        title={t("stats.title")}
        subtitle={t("stats.mongo.subtitle")}
        ms={ms}
        engine="MongoDB"
        label={t("stats.mongo.label")}
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
                {data.revenueByMonth.map((r: any) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono">{r._id}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(r.revenue)}</TableCell>
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
                {data.topProducts.map((p: any) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-right font-mono">{p.units_sold}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.revenue)}</TableCell>
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