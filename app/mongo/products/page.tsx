import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MongoEmpty } from "@/components/MongoEmpty";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/translations";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function MongoProducts({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  const { data, ms } = await measure("products find + count", async () => {
    const { products } = await collections();
    const [rows, total] = await Promise.all([
      products
        .find({}, { sort: { _id: 1 }, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE })
        .toArray(),
      products.estimatedDocumentCount(),
    ]);
    return { rows, total };
  });

  if (data.total === 0) return (<><PageHeader title={t("products.title")} ms={ms} engine="MongoDB" /><MongoEmpty /></>);

  const lastPage = Math.ceil(data.total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={t("products.title")}
        subtitle={`${data.total.toLocaleString()} docs · page ${page} / ${lastPage}`}
        ms={ms}
        engine="MongoDB"
        label="find + count"
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
                <TableRow key={p._id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(p.price)}</TableCell>
                  <TableCell className="text-right font-mono">{p.stock}</TableCell>
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
