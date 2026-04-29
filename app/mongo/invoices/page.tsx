import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { MongoEmpty } from "@/components/MongoEmpty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function MongoInvoices({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  const { data, ms } = await measure("invoices find (no JOIN, items embedded)", async () => {
    const { invoices } = await collections();
    const [rows, total] = await Promise.all([
      invoices
        .find({}, { sort: { issuedAt: -1 }, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE })
        .toArray(),
      invoices.estimatedDocumentCount(),
    ]);
    return { rows, total };
  });

  if (data.total === 0) return (<><PageHeader title={t("invoices.title")} ms={ms} engine="MongoDB" /><MongoEmpty /></>);

  const lastPage = Math.ceil(data.total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={t("invoices.title")}
        subtitle={`${data.total.toLocaleString()} docs · page ${page} / ${lastPage} — client + items already embedded`}
        ms={ms}
        engine="MongoDB"
        label="find + count"
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
                <TableRow key={inv._id}>
                  <TableCell>
                    <Link href={`/mongo/invoices/${inv._id}`} className="underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client.name}</TableCell>
                  <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                  <TableCell className="font-mono">{inv.items.length}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(inv.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-4 justify-end">
        {page > 1 && <a className="underline text-sm" href={`?page=${page - 1}`}>← précédent</a>}
        {page < lastPage && <a className="underline text-sm" href={`?page=${page + 1}`}>suivant →</a>}
      </div>
    </>
  );
}
