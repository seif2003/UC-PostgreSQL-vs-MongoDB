import { prisma } from "@/lib/prisma";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PostgresInvoiceDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data: invoice, ms } = await measure(
    "invoice detail (4-way JOIN)",
    async () =>
      prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          items: { include: { product: true } },
        },
      }),
  );

  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`${t("invoice.title")} ${invoice.invoiceNumber}`}
        subtitle={`${formatDate(invoice.issuedAt)} — 4-way JOIN: invoice × client × items × products`}
        ms={ms}
        engine="Postgres"
        label={t("invoice.label")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.client")}</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div>{invoice.client.name}</div>
            <div className="text-muted-foreground">{invoice.client.email}</div>
            {invoice.client.phone && <div className="text-muted-foreground">{invoice.client.phone}</div>}
            {invoice.client.address && <div className="text-muted-foreground">{invoice.client.address}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.status")}</CardTitle></CardHeader>
          <CardContent><StatusBadge status={invoice.status} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.total")}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-mono">
            {formatCurrency(invoice.total.toString())}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("invoice.items")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.product")}</TableHead>
                <TableHead>{t("products.category")}</TableHead>
                <TableHead className="text-right">{t("table.quantity")}</TableHead>
                <TableHead className="text-right">{t("table.unit_price")}</TableHead>
                <TableHead className="text-right">{t("table.subtotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{it.product.category}</TableCell>
                  <TableCell className="text-right font-mono">{it.quantity}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(it.unitPrice.toString())}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(it.subtotal.toString())}
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
