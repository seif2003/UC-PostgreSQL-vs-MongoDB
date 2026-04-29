import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function PostgresProducts({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  const { data, ms } = await measure("products.findMany", async () => {
    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { id: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count(),
    ]);
    return { rows, total };
  });

  const lastPage = Math.ceil(data.total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={t("products.title")}
        subtitle={`${data.total.toLocaleString()} lignes · page ${page} / ${lastPage}`}
        ms={ms}
        engine="Postgres"
        label="findMany + count"
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.product")}</TableHead>
                <TableHead>{t("products.category")}</TableHead>
                <TableHead className="text-right">{t("products.price")}</TableHead>
                <TableHead className="text-right">{t("products.stock")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(p.price.toString())}
                  </TableCell>
                  <TableCell className="text-right font-mono">{p.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-4 justify-end">
        {page > 1 && <a className="underline text-sm" href={`?page=${page - 1}`}>← previous</a>}
        {page < lastPage && <a className="underline text-sm" href={`?page=${page + 1}`}>next →</a>}
      </div>
    </>
  );
}
