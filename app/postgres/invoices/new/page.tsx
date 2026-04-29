import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { measure } from "@/lib/timing";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

async function createInvoice(formData: FormData) {
  "use server";
  const clientId = Number(formData.get("clientId"));
  const productIds = formData.getAll("productId").map((v) => Number(v));
  const quantities = formData.getAll("quantity").map((v) => Number(v));

  const products = await prisma.product.findMany({
    where: { id: { in: productIds.filter((n) => Number.isFinite(n) && n > 0) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = productIds
    .map((pid, i) => ({ pid, qty: quantities[i] }))
    .filter((it) => productMap.has(it.pid) && it.qty > 0);

  if (items.length === 0) return;

  let total = new Prisma.Decimal(0);
  for (const it of items) {
    const p = productMap.get(it.pid)!;
    total = total.add((p.price as Prisma.Decimal).mul(it.qty));
  }

  const last = await prisma.invoice.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  const number = `INV-${String((last?.id ?? 0) + 1).padStart(6, "0")}`;

  await prisma.invoice.create({
    data: {
      invoiceNumber: number,
      clientId,
      status: "pending",
      total,
      items: {
        create: items.map((it) => {
          const p = productMap.get(it.pid)!;
          return {
            productId: p.id,
            quantity: it.qty,
            unitPrice: p.price,
            subtotal: (p.price as Prisma.Decimal).mul(it.qty),
          };
        }),
      },
    },
  });

  revalidatePath("/postgres/invoices");
  redirect("/postgres/invoices");
}

export default async function NewInvoicePage() {
  const { data, ms } = await measure("load clients + products", async () => {
    const [clients, products] = await Promise.all([
      prisma.client.findMany({ orderBy: { name: "asc" }, take: 200 }),
      prisma.product.findMany({ orderBy: { name: "asc" }, take: 200 }),
    ]);
    return { clients, products };
  });

  return (
    <>
      <PageHeader
        title="New invoice"
        subtitle="Insert 1 invoice + N items inside a transaction"
        ms={ms}
        engine="Postgres"
        label="loaded form data"
      />
      <Card>
        <CardHeader><CardTitle>Create</CardTitle></CardHeader>
        <CardContent>
          <form action={createInvoice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <select id="clientId" name="clientId" className="w-full border rounded-md h-9 px-3 text-sm">
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Line items</Label>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-[1fr_120px] gap-2">
                  <select name="productId" className="border rounded-md h-9 px-3 text-sm">
                    <option value="0">— no product —</option>
                    {data.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price.toString()} €)
                      </option>
                    ))}
                  </select>
                  <Input name="quantity" type="number" min={0} defaultValue={i === 0 ? 1 : 0} />
                </div>
              ))}
            </div>

            <Button type="submit">Create invoice</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
