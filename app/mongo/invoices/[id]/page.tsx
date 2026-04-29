import { collections } from "@/lib/mongo";
import { measure } from "@/lib/timing";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/translations";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MongoInvoiceDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data: invoice, ms } = await measure(
    "invoice detail (single doc, no lookup)",
    async () => {
      const { invoices } = await collections();
      const inv = await invoices.findOne({ _id: id });
      return inv;
    },
  );

  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`${t("invoice.title")} ${invoice.invoiceNumber}`}
        subtitle={`${formatDate(invoice.issuedAt)} — items and client snapshot embedded in one document`}
        ms={ms}
        engine="MongoDB"
        label={t("invoice.mongo.label")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.client")}</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div>{invoice.client.name}</div>
            <div className="text-muted-foreground">{invoice.client.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.status")}</CardTitle></CardHeader>
          <CardContent><StatusBadge status={invoice.status} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("invoice.total")}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-mono">{formatCurrency(invoice.total)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("invoice.items")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.product")}</TableHead>
                <TableHead className="text-right">{t("table.quantity")}</TableHead>
                <TableHead className="text-right">{t("table.unit_price")}</TableHead>
                <TableHead className="text-right">{t("table.subtotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell>{it.productName}</TableCell>
                  <TableCell className="text-right font-mono">{it.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(it.unitPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(it.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
