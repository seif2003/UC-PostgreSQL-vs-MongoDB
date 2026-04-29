import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function PostgresInvoices({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  const { data, ms } = await measure("invoices list + JOIN client + items", async () => {
    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          client: true,
          items: true,
        },
      }),
      prisma.invoice.count(),
    ]);
    return { rows, total };
  });

  const lastPage = Math.ceil(data.total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={t("invoices.title")}
        subtitle={`${data.total.toLocaleString()} lignes · page ${page} / ${lastPage} — each row JOINs clients and items`}
        ms={ms}
        engine="Postgres"
        label="findMany + JOIN × 2"
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.number")}</TableHead>
                <TableHead>{t("table.client")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead className="text-right">{t("table.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link href={`/postgres/invoices/${inv.id}`} className="underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client.name}</TableCell>
                  <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                  <TableCell className="font-mono">{inv.items.length}</TableCell>
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

      <div className="flex gap-2 mt-4 justify-end">
        {page > 1 && <a className="underline text-sm" href={`?page=${page - 1}`}>← previous</a>}
        {page < lastPage && <a className="underline text-sm" href={`?page=${page + 1}`}>next →</a>}
      </div>
    </>
  );
}
